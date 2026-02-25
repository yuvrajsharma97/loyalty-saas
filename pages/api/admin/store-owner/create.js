import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { storeOwnerCreateSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    let createdUser = null;

    try {
      const validatedData = storeOwnerCreateSchema.parse(req.body);
      const { ownerName, ownerEmail, storeName, storeSlug, storeLocation } =
      validatedData;

      await connectDB();


      const existingUser = await User.findOne({ email: ownerEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists"
        });
      }


      const existingStore = await Store.findOne({ slug: storeSlug });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          error: "Store slug already exists"
        });
      }


      const tempPassword = nanoid(12);
      const passwordHash = await bcrypt.hash(tempPassword, 12);


      const user = new User({
        name: ownerName,
        email: ownerEmail,
        passwordHash,
        role: "StoreAdmin",
        isActive: true
      });

      createdUser = await user.save();


      const qrCode = `QR_${Date.now()}_${nanoid(8)}`;


      const store = new Store({
        name: storeName,
        slug: storeSlug,
        tier: "silver",
        ownerId: createdUser._id,
        location: storeLocation || "",
        rewardConfig: {
          type: "hybrid",
          pointsPerPound: 1,
          pointsPerVisit: 10,
          conversionRate: 100
        },
        qrCode,
        isActive: true
      });

      await store.save();


      console.log(
        `Store owner created: ${ownerEmail} with temp password: ${tempPassword}`
      );

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role
          },
          store: {
            id: store._id,
            name: store.name,
            slug: store.slug,
            tier: store.tier,
            location: store.location,
            qrCode: store.qrCode
          },
          tempPassword
        },
        message: "Store owner and store created successfully"
      });
    } catch (error) {
      console.error("Store owner creation error:", error);


      if (createdUser && error.message.includes("Store")) {
        try {
          await User.findByIdAndDelete(createdUser._id);
          console.log("Cleaned up created user due to store creation failure");
        } catch (cleanupError) {
          console.error("Failed to cleanup user:", cleanupError);
        }
      }

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "Duplicate key error - user or store already exists"
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create store owner and store"
      });
    }
  });
}