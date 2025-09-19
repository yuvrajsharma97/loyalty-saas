import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { userInviteSchema } from "../../../../lib/validations/store";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const validatedData = userInviteSchema.parse(req.body);
        const { name, email } = validatedData;

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Check if user already exists
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
          // Check if already connected to this store
          if (
            existingUser.connectedStores.some(
              (id) => id.toString() === storeId.toString()
            )
          ) {
            return res.status(400).json({
              error: "User is already connected to this store",
            });
          }

          // Connect existing user to store
          await User.findByIdAndUpdate(existingUser._id, {
            $addToSet: { connectedStores: storeId },
          });

          return res.json({
            message: "Existing user connected to store successfully",
            user: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              isNewUser: false,
            },
          });
        }

        // Get store details for the invitation
        const store = await Store.findById(storeId).lean();
        if (!store) {
          return res.status(404).json({ error: "Store not found" });
        }

        // For now, create the user directly (in production, you'd send an email)
        // You can modify this to send an invitation email instead
        const tempPassword = Math.random().toString(36).slice(-8);
        const bcrypt = require("bcryptjs");
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        const newUser = await User.create({
          email,
          name,
          passwordHash,
          role: "User",
          connectedStores: [storeId],
          pointsByStore: [
            {
              storeId,
              points: 0,
            },
          ],
        });

        res.status(201).json({
          message: "User invited successfully",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isNewUser: true,
          },
          // In production, don't return the temp password
          // This is just for demo purposes
          tempPassword,
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        if (error.code === 11000) {
          return res.status(400).json({ error: "Email already exists" });
        }
        console.error("Invite user error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
