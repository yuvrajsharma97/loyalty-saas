import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import { rewardConfigOverrideSchema } from "../../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../../lib/validations";
import Store from "../../../../../models/Store";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { storeId } = req.query;
      const validatedStoreId = mongoIdSchema.parse(storeId);
      const { type, pointsPerPound, pointsPerVisit, conversionRate, reason } =
      rewardConfigOverrideSchema.parse(req.body);

      await connectDB();

      const store = await Store.findById(validatedStoreId);
      if (!store) {
        return res.status(404).json({
          success: false,
          error: "Store not found"
        });
      }

      const oldConfig = { ...store.rewardConfig };

      store.rewardConfig = {
        type,
        pointsPerPound,
        pointsPerVisit,
        conversionRate
      };

      await store.save();

      console.log(
        `Reward config overridden for store ${store.name}. Reason: ${
        reason || "Not provided"}`

      );

      return res.status(200).json({
        success: true,
        data: {
          storeId: store._id,
          name: store.name,
          oldConfig,
          newConfig: store.rewardConfig,
          updatedAt: new Date()
        },
        message: "Reward configuration updated successfully"
      });
    } catch (error) {
      console.error("Reward config override error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to override reward configuration"
      });
    }
  });
}