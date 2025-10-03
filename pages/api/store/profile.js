import { connectDB } from "../../../lib/db";
import { requireStoreAdmin } from "../../../middleware/auth";
import { requireStoreOwnership } from "../../../lib/utils/storeAuth";
import { storeProfileUpdateSchema } from "../../../lib/validations/store";
import { calculateTierFromUserCount } from "../../../lib/utils/pointsCalculation";
import Store from "../../../models/Store";
import User from "../../../models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const storeId = new mongoose.Types.ObjectId(req.storeId);

        if (req.method === "GET") {
          // Get store profile with owner details
          const store = await Store.findById(storeId)
            .populate("ownerId", "name email")
            .lean();

          if (!store) {
            return res.status(404).json({ error: "Store not found" });
          }

          // Get user count for tier calculation
          const userCount = await User.countDocuments({
            connectedStores: storeId,
          });
          const calculatedTier = calculateTierFromUserCount(userCount);

          res.json({
            store: {
              id: store._id,
              _id: store._id,
              name: store.name,
              slug: store.slug,
              tier: calculatedTier,
              userCount,
              isActive: store.isActive,
              rewardConfig: store.rewardConfig,
              qrCode: store.qrCode,
              rewardQRCode: store.rewardQRCode,
              rewardQREmail: store.rewardQREmail,
              owner: store.ownerId,
              createdAt: store.createdAt,
              updatedAt: store.updatedAt,
            }
          });
        } else if (req.method === "PUT") {
          // Update store profile
          const validatedData = storeProfileUpdateSchema.parse(req.body);

          const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { $set: validatedData },
            { new: true, runValidators: true }
          ).populate("ownerId", "name email");

          if (!updatedStore) {
            return res.status(404).json({ error: "Store not found" });
          }

          // Update tier if user count changed
          const userCount = await User.countDocuments({
            connectedStores: storeId,
          });
          const newTier = calculateTierFromUserCount(userCount);

          if (newTier !== updatedStore.tier) {
            updatedStore.tier = newTier;
            await updatedStore.save();
          }

          res.json({
            message: "Store profile updated successfully",
            store: {
              id: updatedStore._id,
              name: updatedStore.name,
              tier: newTier,
              rewardConfig: updatedStore.rewardConfig,
              isActive: updatedStore.isActive,
              updatedAt: updatedStore.updatedAt,
            },
          });
        } else {
          res.setHeader("Allow", ["GET", "PUT"]);
          res.status(405).json({ error: "Method not allowed" });
        }
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        console.error("Store profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
