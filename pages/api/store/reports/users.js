import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import User from "../../../../models/User";
import Visit from "../../../../models/Visit";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(req, res,
  requireStoreOwnership(req, res, async (req, res) => {
    try {
      const { format = "json" } = req.query;
      const storeId = new mongoose.Types.ObjectId(req.storeId);


      const userReport = await User.aggregate([
      { $match: { connectedStores: storeId } },


      {
        $addFields: {
          storePoints: {
            $let: {
              vars: {
                storePointsObj: {
                  $arrayElemAt: [
                  { $filter: { input: "$pointsByStore", cond: { $eq: ["$$this.storeId", storeId] } } },
                  0]

                }
              },
              in: { $ifNull: ["$$storePointsObj.points", 0] }
            }
          }
        }
      },


      {
        $lookup: {
          from: "visits",
          let: { userId: "$_id" },
          pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$userId", "$$userId"] }, { $eq: ["$storeId", storeId] }] } } },
          {
            $group: {
              _id: null,
              totalVisits: { $sum: 1 },
              approvedVisits: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
              pendingVisits: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
              rejectedVisits: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
              totalSpend: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$spend", 0] } },
              totalPointsEarned: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$points", 0] } },
              firstVisit: { $min: "$createdAt" },
              lastVisit: { $max: { $cond: [{ $eq: ["$status", "approved"] }, "$approvedAt", "$createdAt"] } }
            }
          }],

          as: "visitStats"
        }
      },


      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          joinedAt: "$createdAt",
          lastLogin: 1,
          currentPoints: "$storePoints",
          visitStats: { $arrayElemAt: ["$visitStats", 0] }
        }
      },

      { $sort: { joinedAt: -1 } }]
      );


      const formattedUsers = userReport.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        joinedAt: user.joinedAt,
        lastLogin: user.lastLogin,
        currentPoints: user.currentPoints || 0,
        totalVisits: user.visitStats?.totalVisits || 0,
        approvedVisits: user.visitStats?.approvedVisits || 0,
        pendingVisits: user.visitStats?.pendingVisits || 0,
        rejectedVisits: user.visitStats?.rejectedVisits || 0,
        totalSpend: user.visitStats?.totalSpend || 0,
        totalPointsEarned: user.visitStats?.totalPointsEarned || 0,
        firstVisit: user.visitStats?.firstVisit || null,
        lastVisit: user.visitStats?.lastVisit || null
      }));

      if (format === "csv") {
        const csvData = formattedUsers.map((user) => ({
          "User ID": user.id,
          "Name": user.name,
          "Email": user.email,
          "Joined Date": user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "",
          "Last Login": user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "",
          "Current Points": user.currentPoints,
          "Total Visits": user.totalVisits,
          "Approved Visits": user.approvedVisits,
          "Pending Visits": user.pendingVisits,
          "Rejected Visits": user.rejectedVisits,
          "Total Spend": user.totalSpend.toFixed(2),
          "Points Earned": user.totalPointsEarned,
          "First Visit": user.firstVisit ? new Date(user.firstVisit).toLocaleDateString() : "",
          "Last Visit": user.lastVisit ? new Date(user.lastVisit).toLocaleDateString() : ""
        }));

        const csvHeader = Object.keys(csvData[0] || {}).join(",");
        const csvRows = csvData.map((row) =>
        Object.values(row).map((value) =>
        typeof value === "string" && value.includes(",") ?
        `"${value}"` :
        value
        ).join(",")
        );
        const csvContent = [csvHeader, ...csvRows].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=user-report.csv");
        return res.status(200).send(csvContent);
      }

      res.json({
        users: formattedUsers,
        totalUsers: formattedUsers.length,
        summary: {
          totalUsers: formattedUsers.length,
          totalPoints: formattedUsers.reduce((sum, user) => sum + user.currentPoints, 0),
          totalSpend: formattedUsers.reduce((sum, user) => sum + user.totalSpend, 0),
          totalVisits: formattedUsers.reduce((sum, user) => sum + user.totalVisits, 0)
        }
      });

    } catch (error) {
      console.error("Store user report error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  })
  );
}