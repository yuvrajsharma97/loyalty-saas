import { connectDB } from "../../../../../lib/db";
import { requireStoreAdmin } from "../../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../../lib/utils/storeAuth";
import { visitApprovalSchema } from "../../../../../lib/validations/store";
import { calculatePoints } from "../../../../../lib/utils/pointsCalculation";
import Visit from "../../../../../models/Visit";
import Store from "../../../../../models/Store";
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
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const { visitId } = req.query;
          const validatedData = visitApprovalSchema.parse(req.body);
          const { manualPoints } = validatedData;

          const storeId = new mongoose.Types.ObjectId(req.storeId);

          // Find the visit
          const visit = await Visit.findOne({
            _id: visitId,
            storeId,
            status: "pending",
          }).session(session);

          if (!visit) {
            throw new Error("Visit not found or already processed");
          }

          // Get store configuration
          const store = await Store.findById(storeId).session(session);
          if (!store) {
            throw new Error("Store not found");
          }

          // Calculate points (use manual override if provided)
          const calculatedPoints =
            manualPoints !== undefined
              ? manualPoints
              : calculatePoints(visit, store);

          // Update visit
          const updatedVisit = await Visit.findByIdAndUpdate(
            visitId,
            {
              status: "approved",
              points: calculatedPoints,
              approvedBy: req.user.id,
              approvedAt: new Date(),
            },
            { new: true, session }
          ).populate("userId", "name email");

          // Update user points
          await User.findOneAndUpdate(
            {
              _id: visit.userId,
              "pointsByStore.storeId": storeId,
            },
            {
              $inc: { "pointsByStore.$.points": calculatedPoints },
            },
            { session }
          );

          // If user doesn't have points entry for this store, create it
          const userPointsCheck = await User.findOne({
            _id: visit.userId,
            "pointsByStore.storeId": storeId,
          }).session(session);

          if (!userPointsCheck) {
            await User.findByIdAndUpdate(
              visit.userId,
              {
                $push: {
                  pointsByStore: {
                    storeId: storeId,
                    points: calculatedPoints,
                  },
                },
              },
              { session }
            );
          }

          return updatedVisit;
        });

        res.json({
          message: "Visit approved successfully",
          visit: {
            id: visit._id,
            status: "approved",
            points: visit.points,
            approvedAt: visit.approvedAt,
          },
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        console.error("Approve visit error:", error);
        res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      } finally {
        await session.endSession();
      }
    })
  );
}
