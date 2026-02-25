import { connectDB } from "../../../../../lib/db";
import { requireStoreAdmin } from "../../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../../lib/utils/storeAuth";
import { pointsAdjustmentSchema } from "../../../../../lib/validations/store";
import User from "../../../../../models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const { userId } = req.query;
        const validatedData = pointsAdjustmentSchema.parse(req.body);
        const { points, reason } = validatedData;

        const storeId = new mongoose.Types.ObjectId(req.storeId);


        const user = await User.findOne({
          _id: userId,
          connectedStores: storeId
        });

        if (!user) {
          return res.status(404).json({
            error: "User not found or not connected to this store"
          });
        }


        const result = await User.findOneAndUpdate(
          {
            _id: userId,
            "pointsByStore.storeId": storeId
          },
          {
            $inc: { "pointsByStore.$.points": points }
          },
          { new: true }
        );


        if (!result) {
          await User.findByIdAndUpdate(userId, {
            $push: {
              pointsByStore: {
                storeId: storeId,
                points: Math.max(0, points)
              }
            }
          });
        }


        const updatedUser = await User.findById(userId);
        const userStorePoints = updatedUser.pointsByStore.find(
          (p) => p.storeId.toString() === storeId.toString()
        );

        res.json({
          message: "Points adjusted successfully",
          adjustment: {
            points,
            reason,
            newBalance: userStorePoints?.points || 0
          }
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        console.error("Adjust points error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}