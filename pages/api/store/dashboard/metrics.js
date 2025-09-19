import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import { calculateTierFromUserCount } from "../../../../lib/utils/pointsCalculation";
import Store from "../../../../models/Store";
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
        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Get store details
        const store = await Store.findById(storeId).lean();
        if (!store) {
          return res.status(404).json({ error: "Store not found" });
        }

        // Parallel aggregations for better performance
        const [userStats, visitStats, monthlyStats, pointsStats] =
          await Promise.all([
            // User count and recent joins
            User.aggregate([
              { $match: { connectedStores: storeId } },
              {
                $group: {
                  _id: null,
                  totalUsers: { $sum: 1 },
                  recentJoins: {
                    $sum: {
                      $cond: [
                        {
                          $gte: [
                            "$createdAt",
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ]),

            // Visit statistics
            Visit.aggregate([
              { $match: { storeId } },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                  totalSpend: { $sum: "$spend" },
                  totalPoints: { $sum: "$points" },
                },
              },
            ]),

            // Monthly statistics
            Visit.aggregate([
              {
                $match: {
                  storeId,
                  status: "approved",
                  createdAt: {
                    $gte: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  monthlyVisits: { $sum: 1 },
                  monthlySpend: { $sum: "$spend" },
                  monthlyPoints: { $sum: "$points" },
                },
              },
            ]),

            // Points distributed and redeemed (mock redeemed for now)
            Visit.aggregate([
              { $match: { storeId, status: "approved" } },
              {
                $group: {
                  _id: null,
                  totalPointsDistributed: { $sum: "$points" },
                },
              },
            ]),
          ]);

        // Process results
        const totalUsers = userStats[0]?.totalUsers || 0;
        const recentJoins = userStats[0]?.recentJoins || 0;

        const visitSummary = visitStats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalSpend: stat.totalSpend,
            totalPoints: stat.totalPoints,
          };
          return acc;
        }, {});

        const monthly = monthlyStats[0] || {
          monthlyVisits: 0,
          monthlySpend: 0,
          monthlyPoints: 0,
        };
        const totalPointsDistributed =
          pointsStats[0]?.totalPointsDistributed || 0;

        // Calculate tier progress
        const currentTier = calculateTierFromUserCount(totalUsers);
        const tierLimits = { silver: 100, gold: 500, platinum: 1000 };
        const nextTierLimit =
          currentTier === "silver" ? 101 : currentTier === "gold" ? 501 : null;

        // Recent activity (last 10 approved visits)
        const recentActivity = await Visit.find({ storeId, status: "approved" })
          .populate("userId", "name email")
          .sort({ approvedAt: -1 })
          .limit(10)
          .lean();

        const metrics = {
          store: {
            id: store._id,
            name: store.name,
            tier: currentTier,
            isActive: store.isActive,
          },
          users: {
            total: totalUsers,
            recentJoins,
            tierProgress: {
              current: totalUsers,
              nextLimit: nextTierLimit,
              percentage: nextTierLimit
                ? Math.min((totalUsers / nextTierLimit) * 100, 100)
                : 100,
            },
          },
          visits: {
            pending: visitSummary.pending?.count || 0,
            approved: visitSummary.approved?.count || 0,
            rejected: visitSummary.rejected?.count || 0,
            monthlyApproved: monthly.monthlyVisits,
          },
          points: {
            totalDistributed: totalPointsDistributed,
            monthlyDistributed: monthly.monthlyPoints,
            // Mock redemption data - replace with actual redemption model when available
            totalRedeemed: Math.floor(totalPointsDistributed * 0.15),
            monthlyRedeemed: Math.floor(monthly.monthlyPoints * 0.1),
          },
          revenue: {
            totalSpend: visitSummary.approved?.totalSpend || 0,
            monthlySpend: monthly.monthlySpend,
          },
          recentActivity: recentActivity.map((visit) => ({
            id: visit._id,
            user: visit.userId?.name || "Unknown User",
            points: visit.points,
            spend: visit.spend,
            date: visit.approvedAt || visit.createdAt,
          })),
        };

        res.json(metrics);
      } catch (error) {
        console.error("Dashboard metrics error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
