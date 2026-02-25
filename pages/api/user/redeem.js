
import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../middleware/auth";
import { redeemPoints } from "../../../lib/points";
import User from "../../../models/User";
import Store from "../../../models/Store";
import { mongoIdSchema } from "../../../lib/validations";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  return requireUser(req, res, async (req, res) => {
    try {
      await connectDB();

      const { storeId } = req.body;


      const validatedStoreId = mongoIdSchema.parse(storeId);


      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          ok: false,
          error: "User not found"
        });
      }


      const isConnected = user.connectedStores?.some(
        (storeObjId) => storeObjId.toString() === validatedStoreId
      );

      if (!isConnected) {
        return res.status(403).json({
          ok: false,
          error: "You are not connected to this store"
        });
      }


      const storePoints = user.pointsByStore?.find(
        (ps) => ps.storeId.toString() === validatedStoreId
      );

      if (!storePoints || storePoints.points <= 0) {
        return res.status(400).json({
          ok: false,
          error: "No points available for redemption at this store"
        });
      }


      const store = await Store.findById(validatedStoreId);
      if (!store) {
        return res.status(404).json({
          ok: false,
          error: "Store not found"
        });
      }

      const conversionRate = store.rewardConfig?.conversionRate || 100;


      const redemptionResult = await redeemPoints({
        userId: req.user.id,
        storeId: validatedStoreId,
        conversionRate,
        autoTriggered: false
      });

      return res.status(200).json({
        ok: true,
        data: redemptionResult
      });

    } catch (error) {
      console.error("Redemption error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error.name === "ZodError") {
        return res.status(400).json({
          ok: false,
          error: "Invalid store ID format"
        });
      }

      if (error.message.includes("not found") ||
      error.message.includes("No points") ||
      error.message.includes("Insufficient points") ||
      error.message.includes("invalid")) {
        return res.status(400).json({
          ok: false,
          error: error.message
        });
      }

      return res.status(500).json({
        ok: false,
        error: `Failed to process redemption: ${error.message}`
      });
    }
  });
}