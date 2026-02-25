import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
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
      await connectDB();


      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);


      const [
      totalStores,
      storesLastMonth,
      totalUsers,
      usersLastMonth,
      approvedVisits,
      visitsLastMonth,
      totalRedemptions,
      totalPointsDistributed] =
      await Promise.all([
      Store.countDocuments(),
      Store.countDocuments({ createdAt: { $lt: lastMonth } }),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $lt: lastMonth } }),
      Visit.countDocuments({ status: "approved" }),
      Visit.countDocuments({
        status: "approved",
        createdAt: { $lt: lastMonth }
      }),
      Redemption.countDocuments(),
      Visit.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$points" } } }]
      )]
      );


      const storeGrowth =
      storesLastMonth > 0 ?
      Math.round(
        (totalStores - storesLastMonth) / storesLastMonth * 100
      ) :
      100;

      const userGrowth =
      usersLastMonth > 0 ?
      Math.round((totalUsers - usersLastMonth) / usersLastMonth * 100) :
      100;

      const visitGrowth =
      visitsLastMonth > 0 ?
      Math.round(
        (approvedVisits - visitsLastMonth) / visitsLastMonth * 100
      ) :
      100;

      return res.status(200).json({
        success: true,
        data: {
          totalStores: totalStores.toLocaleString(),
          storeGrowth: `+${storeGrowth}% from last month`,
          totalUsers: totalUsers.toLocaleString(),
          userGrowth: `+${userGrowth}% from last month`,
          approvedVisits: approvedVisits.toLocaleString(),
          visitGrowth: `+${visitGrowth}% from last month`,
          pointsDistributed: (
          totalPointsDistributed[0]?.total || 0).
          toLocaleString(),
          pointsGrowth: "+22% from last month"
        }
      });
    } catch (error) {
      console.error("Platform stats error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch platform statistics"
      });
    }
  });
}