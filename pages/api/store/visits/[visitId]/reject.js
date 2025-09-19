import { connectDB } from "../../../../../lib/db";
import { requireStoreAdmin } from "../../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../../lib/utils/storeAuth";
import { visitRejectionSchema } from "../../../../../lib/validations/store";
import Visit from "../../../../../models/Visit";
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
        const { visitId } = req.query;
        const validatedData = visitRejectionSchema.parse(req.body);
        const { reason } = validatedData;

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Find and update the visit
        const visit = await Visit.findOneAndUpdate(
          {
            _id: visitId,
            storeId,
            status: "pending",
          },
          {
            status: "rejected",
            approvedBy: req.user.id,
            approvedAt: new Date(),
            metadata: {
              ...visit.metadata,
              rejectionReason: reason,
            },
          },
          { new: true }
        ).populate("userId", "name email");

        if (!visit) {
          return res.status(404).json({
            error: "Visit not found or already processed",
          });
        }

        res.json({
          message: "Visit rejected successfully",
          visit: {
            id: visit._id,
            status: "rejected",
            rejectedAt: visit.approvedAt,
            reason,
          },
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        console.error("Reject visit error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
