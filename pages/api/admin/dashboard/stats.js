import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
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
      await connectDB();

      // Get date range for comparison (last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Parallel queries for better performance
      const [
        totalUsers,
        previousTotalUsers,
        totalStores,
        previousTotalStores,
        totalVisits,
        previousTotalVisits,
        pendingVisits,
        totalRedemptions,
        usersByRole,
        storesByTier,
        recentUsers,
        recentStores,
      ] = await Promise.all([
        // Current totals
        User.countDocuments(),
        User.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
        Store.countDocuments(),
        Store.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
        Visit.countDocuments(),
        Visit.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
        Visit.countDocuments({ status: "pending" }),
        Redemption.countDocuments(),

        // Breakdowns
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        Store.aggregate([{ $group: { _id: "$tier", count: { $sum: 1 } } }]),

        // Recent activity
        User.find({}, "name email role createdAt")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Store.find({}, "name tier createdAt")
          .populate("ownerId", "name email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      // Calculate changes
      const newUsers = totalUsers - previousTotalUsers;
      const newStores = totalStores - previousTotalStores;
      const newVisits = totalVisits - previousTotalVisits;

      // Format role breakdown
      const roleBreakdown = usersByRole.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        { User: 0, StoreAdmin: 0, SuperAdmin: 0 }
      );

      // Format tier breakdown
      const tierBreakdown = storesByTier.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        { silver: 0, gold: 0, platinum: 0 }
      );

      // Calculate total points distributed
      const pointsDistributed = await Visit.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]);

      const totalPointsDistributed = pointsDistributed[0]?.total || 0;

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalStores,
            totalVisits,
            pendingVisits,
            totalRedemptions,
            totalPointsDistributed,
            changes: {
              users: newUsers,
              stores: newStores,
              visits: newVisits,
            },
          },
          breakdowns: {
            usersByRole: roleBreakdown,
            storesByTier: tierBreakdown,
          },
          recent: {
            users: recentUsers,
            stores: recentStores,
          },
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard statistics",
      });
    }
  });
}
