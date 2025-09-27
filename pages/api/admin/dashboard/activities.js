import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { paginationSchema } from "../../../../lib/validations/admin";
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
      const { page = 1, limit = 20 } = paginationSchema.parse(req.query);

      await connectDB();

      // Get recent activities from different collections
      const [recentUsers, recentStores, recentVisits, recentRedemptions] =
        await Promise.all([
          User.find({}, "name email role createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

          Store.find({}, "name tier createdAt ownerId")
            .populate("ownerId", "name email")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

          Visit.find(
            { status: "pending" },
            "userId storeId method spend createdAt"
          )
            .populate("userId", "name email")
            .populate("storeId", "name")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

          Redemption.find({}, "userId storeId pointsUsed value createdAt")
            .populate("userId", "name email")
            .populate("storeId", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

      // Combine and format activities
      const activities = [];

      // Add user registrations
      recentUsers.forEach((user) => {
        activities.push({
          type: "user_registered",
          timestamp: user.createdAt,
          user: { name: user.name, email: user.email },
          description: `New ${user.role} registered`,
          metadata: { role: user.role },
        });
      });

      // Add store creations
      recentStores.forEach((store) => {
        activities.push({
          type: "store_created",
          timestamp: store.createdAt,
          store: { name: store.name },
          user: store.ownerId
            ? {
                name: store.ownerId.name,
                email: store.ownerId.email,
              }
            : null,
          description: `New ${store.tier} store created`,
          metadata: { tier: store.tier },
        });
      });

      // Add pending visits
      recentVisits.forEach((visit) => {
        activities.push({
          type: "visit_pending",
          timestamp: visit.createdAt,
          user: visit.userId
            ? {
                name: visit.userId.name,
                email: visit.userId.email,
              }
            : null,
          store: visit.storeId
            ? {
                name: visit.storeId.name,
              }
            : null,
          description: `Visit pending approval`,
          metadata: {
            method: visit.method,
            spend: visit.spend,
          },
        });
      });

      // Add recent redemptions
      recentRedemptions.forEach((redemption) => {
        activities.push({
          type: "points_redeemed",
          timestamp: redemption.createdAt,
          user: redemption.userId
            ? {
                name: redemption.userId.name,
                email: redemption.userId.email,
              }
            : null,
          store: redemption.storeId
            ? {
                name: redemption.storeId.name,
              }
            : null,
          description: `${redemption.pointsUsed} points redeemed for £${redemption.value}`,
          metadata: {
            pointsUsed: redemption.pointsUsed,
            value: redemption.value,
          },
        });
      });

      // Sort by timestamp and apply pagination
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const skip = (page - 1) * limit;
      const paginatedActivities = activities.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        data: paginatedActivities,
        meta: {
          total: activities.length,
          page,
          limit,
          totalPages: Math.ceil(activities.length / limit),
          hasMore: activities.length > skip + limit,
        },
      });
    } catch (error) {
      console.error("Activities fetch error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activities",
      });
    }
  });
}
