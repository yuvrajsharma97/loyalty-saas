import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminAnalyticsSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";
import Redemption from "../../../../models/Redemption";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { period = "30d", groupBy = "day" } = adminAnalyticsSchema.parse(
        req.query
      );

      await connectDB();


      const now = new Date();
      const periodDays =
      period === "7d" ?
      7 :
      period === "30d" ?
      30 :
      period === "90d" ?
      90 :
      365;
      const startDate = new Date(
        now.getTime() - periodDays * 24 * 60 * 60 * 1000
      );


      const [platformStats, growthMetrics, engagementMetrics, revenueMetrics] =
      await Promise.all([

      Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Visit.countDocuments({ status: "approved" }),
      Redemption.countDocuments(),
      Visit.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalPoints: { $sum: "$points" } } }]
      )]
      ),


      Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Store.countDocuments({ createdAt: { $gte: startDate } }),
      Visit.countDocuments({
        createdAt: { $gte: startDate },
        status: "approved"
      })]
      ),


      Promise.all([
      Visit.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }]
      ),
      User.aggregate([
      {
        $match: {
          lastLogin: { $gte: startDate }
        }
      },
      { $count: "activeUsers" }]
      ),

      User.aggregate([
      {
        $lookup: {
          from: "visits",
          localField: "_id",
          foreignField: "userId",
          as: "visits",
          pipeline: [{ $match: { createdAt: { $gte: startDate } } }]
        }
      },
      {
        $group: {
          _id: null,
          avgVisits: { $avg: { $size: "$visits" } }
        }
      }]
      )]
      ),


      Redemption.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$value" },
          totalPointsRedeemed: { $sum: "$pointsUsed" },
          count: { $sum: 1 }
        }
      }]
      )]
      );


      const [
      totalUsers,
      totalStores,
      totalApprovedVisits,
      totalRedemptions,
      pointsData] =
      platformStats;
      const totalPointsDistributed = pointsData[0]?.totalPoints || 0;


      const [newUsers, newStores, newVisits] = growthMetrics;


      const [visitsByStatus, activeUsersData, avgVisitsData] =
      engagementMetrics;
      const visitStatusBreakdown = visitsByStatus.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0 }
      );

      const activeUsers = activeUsersData[0]?.activeUsers || 0;
      const avgVisitsPerUser = avgVisitsData[0]?.avgVisits || 0;


      const revenueData = revenueMetrics[0] || {
        totalValue: 0,
        totalPointsRedeemed: 0,
        count: 0
      };


      const topStores = await Store.aggregate([
      {
        $lookup: {
          from: "visits",
          localField: "_id",
          foreignField: "storeId",
          as: "visits",
          pipeline: [
          {
            $match: {
              createdAt: { $gte: startDate },
              status: "approved"
            }
          }]

        }
      },
      {
        $addFields: {
          visitCount: { $size: "$visits" },
          totalPoints: {
            $sum: {
              $map: {
                input: "$visits",
                as: "visit",
                in: "$visit.points"
              }
            }
          }
        }
      },
      { $sort: { visitCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner"
        }
      },
      {
        $project: {
          name: 1,
          tier: 1,
          visitCount: 1,
          totalPoints: 1,
          "owner.name": 1,
          "owner.email": 1
        }
      }]
      );

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalStores,
            totalApprovedVisits,
            totalRedemptions,
            totalPointsDistributed,
            growth: {
              newUsers,
              newStores,
              newVisits,
              period: `${periodDays} days`
            }
          },
          engagement: {
            activeUsers,
            activeUserRate:
            totalUsers > 0 ?
            (activeUsers / totalUsers * 100).toFixed(1) :
            0,
            avgVisitsPerUser: Number(avgVisitsPerUser.toFixed(1)),
            visitApprovalRate:
            visitStatusBreakdown.approved + visitStatusBreakdown.pending > 0 ?
            (
            visitStatusBreakdown.approved / (
            visitStatusBreakdown.approved +
            visitStatusBreakdown.pending) *
            100).
            toFixed(1) :
            0,
            visitStatusBreakdown
          },
          revenue: {
            totalValue: revenueData.totalValue,
            totalPointsRedeemed: revenueData.totalPointsRedeemed,
            totalRedemptions: revenueData.count,
            avgRedemptionValue:
            revenueData.count > 0 ?
            (revenueData.totalValue / revenueData.count).toFixed(2) :
            0
          },
          topStores: topStores.map((store) => ({
            ...store,
            owner: store.owner[0] || null
          }))
        }
      });
    } catch (error) {
      console.error("Analytics overview error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch analytics data"
      });
    }
  });
}