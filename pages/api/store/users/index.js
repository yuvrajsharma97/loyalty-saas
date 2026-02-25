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

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const {
          search = "",
          status = "",
          hasRewards = "",
          page = 1,
          limit = 10,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;

        const storeId = new mongoose.Types.ObjectId(req.storeId);


        const pipeline = [

        { $match: { connectedStores: storeId } },


        {
          $addFields: {
            storePoints: {
              $let: {
                vars: {
                  storePointsObj: {
                    $arrayElemAt: [
                    {
                      $filter: {
                        input: "$pointsByStore",
                        cond: { $eq: ["$$this.storeId", storeId] }
                      }
                    },
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
            {
              $match: {
                $expr: {
                  $and: [
                  { $eq: ["$userId", "$$userId"] },
                  { $eq: ["$storeId", storeId] }]

                }
              }
            },
            {
              $group: {
                _id: null,
                totalVisits: { $sum: 1 },
                approvedVisits: {
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
                },
                lastVisit: {
                  $max: {
                    $cond: [
                    { $eq: ["$status", "approved"] },
                    "$approvedAt",
                    "$createdAt"]

                  }
                },
                totalSpend: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "approved"] }, "$spend", 0]
                  }
                }
              }
            }],

            as: "visitStats"
          }
        },


        {
          $addFields: {
            visitStats: { $arrayElemAt: ["$visitStats", 0] },
            hasRewards: { $gt: ["$storePoints", 0] }
          }
        },


        {
          $match: {
            ...(search && {
              $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } }]

            }),
            ...(hasRewards && { hasRewards: hasRewards === "true" })
          }
        },


        {
          $project: {
            name: 1,
            email: 1,
            createdAt: 1,
            lastLogin: 1,
            points: "$storePoints",
            visits: { $ifNull: ["$visitStats.totalVisits", 0] },
            approvedVisits: { $ifNull: ["$visitStats.approvedVisits", 0] },
            lastVisit: "$visitStats.lastVisit",
            totalSpend: { $ifNull: ["$visitStats.totalSpend", 0] },
            hasRewards: 1,
            status: { $literal: "active" }
          }
        }];



        const sortStage = {};
        sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
        pipeline.push({ $sort: sortStage });


        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await User.aggregate(countPipeline);
        const totalCount = countResult[0]?.total || 0;


        pipeline.push(
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) }
        );

        const users = await User.aggregate(pipeline);
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        });
      } catch (error) {
        console.error("Get store users error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}