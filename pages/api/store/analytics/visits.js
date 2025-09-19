import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { analyticsQuerySchema } from "../../../../lib/validations/store";
import { getVisitTrendsAggregation } from "../../../../lib/utils/aggregations";
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
        const validatedQuery = analyticsQuerySchema.parse(req.query);
        const { period, groupBy } = validatedQuery;

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Get visit trends
        const trendsAggregation = getVisitTrendsAggregation(
          storeId,
          period,
          groupBy
        );
        const trends = await Visit.aggregate(trendsAggregation);

        // Get method breakdown
        const methodBreakdown = await Visit.aggregate([
          { $match: { storeId, status: "approved" } },
          {
            $group: {
              _id: "$method",
              count: { $sum: 1 },
              totalSpend: { $sum: "$spend" },
              totalPoints: { $sum: "$points" },
            },
          },
        ]);

        // Get status breakdown
        const statusBreakdown = await Visit.aggregate([
          { $match: { storeId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]);

        res.json({
          trends,
          breakdowns: {
            method: methodBreakdown,
            status: statusBreakdown,
          },
          period,
          groupBy,
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid query parameters",
            details: error.errors,
          });
        }
        console.error("Visit analytics error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
