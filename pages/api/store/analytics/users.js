import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { analyticsQuerySchema } from "../../../../lib/validations/store";
import User from "../../../../models/User";
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


        const now = new Date();
        let matchDate;

        switch (period) {
          case "7d":
            matchDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            matchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            matchDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case "1y":
            matchDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            matchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }


        const userGrowth = await User.aggregate([
        {
          $match: {
            connectedStores: storeId,
            createdAt: { $gte: matchDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format:
                groupBy === "day" ?
                "%Y-%m-%d" :
                groupBy === "week" ?
                "%Y-%U" :
                "%Y-%m",
                date: "$createdAt"
              }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }]
        );


        const engagementMetrics = await Visit.aggregate([
        {
          $match: {
            storeId,
            status: "approved",
            createdAt: { $gte: matchDate }
          }
        },
        {
          $group: {
            _id: "$userId",
            visitCount: { $sum: 1 },
            totalSpend: { $sum: "$spend" },
            totalPoints: { $sum: "$points" },
            firstVisit: { $min: "$createdAt" },
            lastVisit: { $max: "$createdAt" }
          }
        },
        {
          $group: {
            _id: null,
            activeUsers: { $sum: 1 },
            avgVisitsPerUser: { $avg: "$visitCount" },
            avgSpendPerUser: { $avg: "$totalSpend" },
            avgPointsPerUser: { $avg: "$totalPoints" }
          }
        }]
        );


        const pointsDistribution = await User.aggregate([
        { $match: { connectedStores: storeId } },
        { $unwind: "$pointsByStore" },
        { $match: { "pointsByStore.storeId": storeId } },
        {
          $bucket: {
            groupBy: "$pointsByStore.points",
            boundaries: [0, 50, 100, 250, 500, 1000, Infinity],
            default: "1000+",
            output: {
              count: { $sum: 1 },
              users: { $push: "$name" }
            }
          }
        }]
        );

        res.json({
          userGrowth,
          engagement: engagementMetrics[0] || {
            activeUsers: 0,
            avgVisitsPerUser: 0,
            avgSpendPerUser: 0,
            avgPointsPerUser: 0
          },
          pointsDistribution,
          period,
          groupBy
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid query parameters",
            details: error.errors
          });
        }
        console.error("User analytics error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}