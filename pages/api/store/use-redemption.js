// /pages/api/store/use-redemption.js
import { connectDB } from "../../../lib/db";
import { requireStoreAdmin } from "../../../middleware/auth";
import Redemption from "../../../models/Redemption";
import Store from "../../../models/Store";
import { mongoIdSchema } from "../../../lib/validations";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  return requireStoreAdmin(req, res, async (req, res) => {
    try {
      await connectDB();

      const { storeId, code } = req.body;

      // Validate inputs
      if (!storeId || !code) {
        return res.status(400).json({
          ok: false,
          error: "Store ID and code are required"
        });
      }

      const validatedStoreId = mongoIdSchema.parse(storeId);

      // Validate code format (8 digits)
      if (!/^\d{8}$/.test(code)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid code format. Code must be 8 digits."
        });
      }

      // Ensure the admin owns this store (tenancy check)
      const store = await Store.findById(validatedStoreId);
      if (!store) {
        return res.status(404).json({
          ok: false,
          error: "Store not found"
        });
      }

      if (store.ownerId.toString() !== req.user.id) {
        return res.status(403).json({
          ok: false,
          error: "You are not authorized to mark redemptions for this store"
        });
      }

      // Find redemption by code and store
      const redemption = await Redemption.findOne({
        code,
        storeId: validatedStoreId
      }).populate('userId', 'name email');

      if (!redemption) {
        return res.status(404).json({
          ok: false,
          error: "Invalid code"
        });
      }

      // Check if code has already been used
      if (redemption.used) {
        return res.status(400).json({
          ok: false,
          error: "This redemption code has already been used",
          usedAt: redemption.usedAt
        });
      }

      // Mark redemption as used
      redemption.used = true;
      redemption.usedAt = new Date();
      redemption.appliedBy = req.user.id;
      await redemption.save();

      // Return success confirmation
      return res.status(200).json({
        ok: true,
        message: "Redemption code successfully marked as used",
        data: {
          redemption: {
            id: redemption._id,
            userId: redemption.userId._id,
            userName: redemption.userId.name,
            userEmail: redemption.userId.email,
            storeId: redemption.storeId,
            pointsUsed: redemption.pointsUsed,
            rewardValueGBP: redemption.rewardValueGBP,
            code: redemption.code,
            redemptionDate: redemption.redemptionDate,
            autoTriggered: redemption.autoTriggered,
            used: redemption.used,
            usedAt: redemption.usedAt,
            createdAt: redemption.createdAt
          }
        }
      });

    } catch (error) {
      console.error("Redemption use error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          ok: false,
          error: "Invalid store ID format"
        });
      }

      return res.status(500).json({
        ok: false,
        error: "Failed to mark redemption code as used"
      });
    }
  });
}