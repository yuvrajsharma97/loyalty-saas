import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminAnalyticsSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";
import Redemption from "../../../../models/Redemption";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { period = "30d", groupBy = "day" } = adminAnalyticsSchema.parse(
        req.query
      );

      await connectDB();

      // Calculate date range
      const now = new Date();
      const periodDays =
        period === "7d"
          ? 7
          : period === "30d"
          ? 30
          : period === "90d"
          ? 90
          : 365;
      const startDate = new Date(
        now.getTime() - periodDays * 24 * 60 * 60 * 1000
      );

      // Determine grouping format
      let dateFormat;
      switch (groupBy) {
        case "day":
          dateFormat = "%Y-%m-%d";
          break;
        case "week":
          dateFormat = "%Y-%U";
          break;
        case "month":
          dateFormat = "%Y-%m";
          break;
        default:
          dateFormat = "%Y-%m-%d";
      }

      // Parallel queries for chart data
      const [
        userGrowth,
        storeGrowth,
        visitTrends,
        redemptionTrends,
        pointsDistribution,
      ] = await Promise.all([
        // User registration trends
        User.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Store creation trends
        Store.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Visit trends by status
        Visit.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: dateFormat, date: "$createdAt" },
                },
                status: "$status",
              },
              count: { $sum: 1 },
              points: { $sum: "$points" },
            },
          },
          { $sort: { "_id.date": 1 } },
        ]),

        // Redemption trends
        Redemption.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: "$createdAt" },
              },
              count: { $sum: 1 },
              pointsUsed: { $sum: "$pointsUsed" },
              value: { $sum: "$value" },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Points distribution by store tier
        Store.aggregate([
          {
            $lookup: {
              from: "visits",
              localField: "_id",
              foreignField: "storeId",
              as: "visits",
            },
          },
          {
            $project: {
              tier: 1,
              totalPoints: {
                $sum: {
                  $map: {
                    input: "$visits",
                    as: "visit",
                    in: "$$visit.points",
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: "$tier",
              totalPoints: { $sum: "$totalPoints" },
              storeCount: { $sum: 1 },
            },
          },
        ]),
      ]);

      // Format visit trends data
      const visitTrendsFormatted = visitTrends.reduce((acc, item) => {
        const date = item._id.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            pending: 0,
            approved: 0,
            rejected: 0,
            totalPoints: 0,
          };
        }
        acc[date][item._id.status] = item.count;
        if (item._id.status === "approved") {
          acc[date].totalPoints = item.points;
        }
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        data: {
          userGrowth: userGrowth.map((item) => ({
            date: item._id,
            count: item.count,
          })),
          storeGrowth: storeGrowth.map((item) => ({
            date: item._id,
            count: item.count,
          })),
          visitTrends: Object.values(visitTrendsFormatted),
          redemptionTrends: redemptionTrends.map((item) => ({
            date: item._id,
            count: item.count,
            pointsUsed: item.pointsUsed,
            value: item.value,
          })),
          pointsDistribution: pointsDistribution.map((item) => ({
            tier: item._id,
            totalPoints: item.totalPoints,
            storeCount: item.storeCount,
            avgPointsPerStore: Math.round(item.totalPoints / item.storeCount),
          })),
        },
      });
    } catch (error) {
      console.error("Dashboard charts error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch chart data",
      });
    }
  });
}
