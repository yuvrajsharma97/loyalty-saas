import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import { storeTierChangeSchema } from "../../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../../lib/validations";
import Store from "../../../../../models/Store";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { storeId } = req.query;
      const validatedStoreId = mongoIdSchema.parse(storeId);
      const { newTier, reason } = storeTierChangeSchema.parse(req.body);

      await connectDB();

      const store = await Store.findById(validatedStoreId);
      if (!store) {
        return res.status(404).json({
          success: false,
          error: "Store not found",
        });
      }

      const oldTier = store.tier;
      store.tier = newTier;
      await store.save();

      console.log(
        `Tier changed for store ${
          store.name
        }: ${oldTier} -> ${newTier}. Reason: ${reason || "Not provided"}`
      );

      return res.status(200).json({
        success: true,
        data: {
          storeId: store._id,
          name: store.name,
          oldTier,
          newTier,
          updatedAt: new Date(),
        },
        message: `Store tier updated to ${newTier}`,
      });
    } catch (error) {
      console.error("Tier change error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to change store tier",
      });
    }
  });
}
