import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { storeVisitsQuerySchema } from "../../../../lib/validations/store";
import Visit from "../../../../models/Visit";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const validatedQuery = storeVisitsQuerySchema.parse(req.query);
        const {
          status,
          method,
          dateFrom,
          dateTo,
          page,
          limit,
          sortBy,
          sortOrder,
        } = validatedQuery;

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Build match conditions
        const matchConditions = { storeId };

        if (status) matchConditions.status = status;
        if (method) matchConditions.method = method;

        if (dateFrom || dateTo) {
          matchConditions.createdAt = {};
          if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom);
          if (dateTo) matchConditions.createdAt.$lte = new Date(dateTo);
        }

        // Build sort conditions
        const sortConditions = {};
        sortConditions[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Get total count for pagination
        const totalCount = await Visit.countDocuments(matchConditions);

        // Get paginated results with user details
        const visits = await Visit.find(matchConditions)
          .populate("userId", "name email")
          .populate("approvedBy", "name")
          .sort(sortConditions)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const totalPages = Math.ceil(totalCount / limit);

        // Format response
        const formattedVisits = visits.map((visit) => ({
          id: visit._id,
          user: {
            id: visit.userId?._id,
            name: visit.userId?.name || "Unknown User",
            email: visit.userId?.email,
          },
          method: visit.method,
          status: visit.status,
          points: visit.points,
          spend: visit.spend,
          createdAt: visit.createdAt,
          approvedAt: visit.approvedAt,
          approvedBy: visit.approvedBy?.name,
          metadata: visit.metadata,
        }));

        res.json({
          visits: formattedVisits,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid query parameters",
            details: error.errors,
          });
        }
        console.error("Get visits error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
