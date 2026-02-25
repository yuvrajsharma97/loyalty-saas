import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminAnalyticsSchema } from "../../../../lib/validations/admin";
import Store from "../../../../models/Store";
import User from "../../../../models/User";
import Visit from "../../../../models/Visit";
import Redemption from "../../../../models/Redemption";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { period = "30d", storeIds } = adminAnalyticsSchema.parse(req.query);

      await connectDB();

      const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);


      const storeFilter = storeIds && storeIds.length > 0 ?
      { _id: { $in: storeIds.map((id) => new mongoose.Types.ObjectId(id)) } } :
      {};


      const storeAnalytics = await Store.aggregate([
      { $match: storeFilter },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "connectedStores",
          as: "connectedUsers"
        }
      },
      {
        $lookup: {
          from: "visits",
          localField: "_id",
          foreignField: "storeId",
          as: "allVisits"
        }
      },
      {
        $lookup: {
          from: "visits",
          let: { storeId: "$_id" },
          pipeline: [
          {
            $match: {
              $expr: { $eq: ["$storeId", "$$storeId"] },
              createdAt: { $gte: startDate }
            }
          }],

          as: "periodVisits"
        }
      },
      {
        $lookup: {
          from: "redemptions",
          let: { storeId: "$_id" },
          pipeline: [
          {
            $match: {
              $expr: { $eq: ["$storeId", "$$storeId"] },
              createdAt: { $gte: startDate }
            }
          }],

          as: "periodRedemptions"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner"
        }
      },
      {
        $addFields: {
          userCount: { $size: "$connectedUsers" },
          totalVisits: { $size: "$allVisits" },
          periodVisits: { $size: "$periodVisits" },
          periodRedemptions: { $size: "$periodRedemptions" },
          periodApprovedVisits: {
            $size: {
              $filter: {
                input: "$periodVisits",
                cond: { $eq: ["$this.status", "approved"] }
              }
            }
          },
          periodPendingVisits: {
            $size: {
              $filter: {
                input: "$periodVisits",
                cond: { $eq: ["$this.status", "pending"] }
              }
            }
          },
          periodPointsDistributed: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$periodVisits",
                    cond: { $eq: ["$this.status", "approved"] }
                  }
                },
                as: "visit",
                in: "$visit.points"
              }
            }
          },
          periodRedemptionValue: {
            $sum: {
              $map: {
                input: "$periodRedemptions",
                as: "redemption",
                in: "$redemption.value"
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          tier: 1,
          isActive: 1,
          userCount: 1,
          totalVisits: 1,
          periodVisits: 1,
          periodApprovedVisits: 1,
          periodPendingVisits: 1,
          periodRedemptions: 1,
          periodPointsDistributed: 1,
          periodRedemptionValue: 1,
          owner: { $arrayElemAt: ["$owner", 0] },
          avgPointsPerVisit: {
            $cond: {
              if: { $gt: ["$periodApprovedVisits", 0] },
              then: { $divide: ["$periodPointsDistributed", "$periodApprovedVisits"] },
              else: 0
            }
          },
          conversionRate: {
            $cond: {
              if: { $gt: ["$periodVisits", 0] },
              then: { $divide: ["$periodApprovedVisits", "$periodVisits"] },
              else: 0
            }
          }
        }
      },
      { $sort: { periodPointsDistributed: -1 } }]
      );


      const tierComparison = await Store.aggregate([
      { $match: storeFilter },
      {
        $lookup: {
          from: "visits",
          let: { storeId: "$_id" },
          pipeline: [
          {
            $match: {
              $expr: { $eq: ["$storeId", "$$storeId"] },
              createdAt: { $gte: startDate }
            }
          }],

          as: "periodVisits"
        }
      },
      {
        $lookup: {
          from: "redemptions",
          let: { storeId: "$_id" },
          pipeline: [
          {
            $match: {
              $expr: { $eq: ["$storeId", "$$storeId"] },
              createdAt: { $gte: startDate }
            }
          }],

          as: "periodRedemptions"
        }
      },
      {
        $group: {
          _id: "$tier",
          storeCount: { $sum: 1 },
          totalVisits: { $sum: { $size: "$periodVisits" } },
          totalRedemptions: { $sum: { $size: "$periodRedemptions" } },
          totalPointsDistributed: {
            $sum: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$periodVisits",
                      cond: { $eq: ["$$this.status", "approved"] }
                    }
                  },
                  as: "visit",
                  in: "$$visit.points"
                }
              }
            }
          },
          totalRedemptionValue: {
            $sum: {
              $sum: {
                $map: {
                  input: "$periodRedemptions",
                  as: "redemption",
                  in: "$$redemption.value"
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tier: "$_id",
          storeCount: 1,
          totalVisits: 1,
          totalRedemptions: 1,
          totalPointsDistributed: 1,
          totalRedemptionValue: 1,
          avgVisitsPerStore: {
            $cond: {
              if: { $gt: ["$storeCount", 0] },
              then: { $divide: ["$totalVisits", "$storeCount"] },
              else: 0
            }
          },
          avgPointsPerStore: {
            $cond: {
              if: { $gt: ["$storeCount", 0] },
              then: { $divide: ["$totalPointsDistributed", "$storeCount"] },
              else: 0
            }
          }
        }
      },
      { $sort: { tier: 1 } }]
      );


      const engagementTrends = await Visit.aggregate([
      {
        $match: {
          ...(storeIds && storeIds.length > 0 ?
          { storeId: { $in: storeIds.map((id) => new mongoose.Types.ObjectId(id)) } } :
          {}),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          visits: { $sum: 1 },
          approvedVisits: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          pointsDistributed: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$points", 0] }
          }
        }
      },
      { $sort: { _id: 1 } }]
      );

      res.status(200).json({
        success: true,
        data: {
          storeAnalytics,
          tierComparison,
          engagementTrends,
          summary: {
            totalStores: storeAnalytics.length,
            totalVisits: storeAnalytics.reduce((sum, store) => sum + store.periodVisits, 0),
            totalPointsDistributed: storeAnalytics.reduce((sum, store) => sum + store.periodPointsDistributed, 0),
            totalRedemptions: storeAnalytics.reduce((sum, store) => sum + store.periodRedemptions, 0)
          }
        }
      });

    } catch (error) {
      console.error("Store analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch store analytics"
      });
    }
  });
}