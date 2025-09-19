import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { manualVisitSchema } from "../../../../lib/validations/store";
import { calculatePoints } from "../../../../lib/utils/pointsCalculation";
import Visit from "../../../../models/Visit";
import Store from "../../../../models/Store";
import User from "../../../../models/User";
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
      const session = await mongoose.startSession();

      try {
        const result = await session.withTransaction(async () => {
          const validatedData = manualVisitSchema.parse(req.body);
          const { userId, spend, notes } = validatedData;

          const storeId = new mongoose.Types.ObjectId(req.storeId);

          // Verify user exists and is connected to store
          const user = await User.findOne({
            _id: userId,
            connectedStores: storeId,
          }).session(session);

          if (!user) {
            throw new Error("User not found or not connected to this store");
          }

          // Get store configuration
          const store = await Store.findById(storeId).session(session);
          if (!store) {
            throw new Error("Store not found");
          }

          // Calculate points
          const points = calculatePoints({ spend }, store);

          // Create visit
          const visit = await Visit.create(
            [
              {
                userId,
                storeId,
                method: "manual",
                status: "approved", // Manual visits are auto-approved
                points,
                spend,
                approvedBy: req.user.id,
                approvedAt: new Date(),
                metadata: {
                  notes,
                  createdBy: req.user.id,
                },
              },
            ],
            { session }
          );

          // Update user points
          const userPointsUpdate = await User.findOneAndUpdate(
            {
              _id: userId,
              "pointsByStore.storeId": storeId,
            },
            {
              $inc: { "pointsByStore.$.points": points },
            },
            { session, new: true }
          );

          // If user doesn't have points entry for this store, create it
          if (!userPointsUpdate) {
            await User.findByIdAndUpdate(
              userId,
              {
                $push: {
                  pointsByStore: {
                    storeId: storeId,
                    points: points,
                  },
                },
              },
              { session }
            );
          }

          return visit[0];
        });

        res.status(201).json({
          message: "Manual visit created successfully",
          visit: {
            id: result._id,
            userId: result.userId,
            spend: result.spend,
            points: result.points,
            createdAt: result.createdAt,
          },
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        console.error("Manual visit error:", error);
        res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      } finally {
        await session.endSession();
      }
    })
  );
}
