import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import {
  adminStoreUpdateSchema,
  adminTierChangeSchema,
} from "../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../lib/validations";
import Store from "../../../../models/Store";
import User from "../../../../models/User";
import Visit from "../../../../models/Visit";
import Redemption from "../../../../models/Redemption";
import mongoose from "mongoose";

export default async function handler(req, res) {
  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { storeId } = req.query;
      const validatedStoreId = mongoIdSchema.parse(storeId);

      await connectDB();

      if (req.method === "GET") {
        return await getStoreDetails(req, res, validatedStoreId);
      } else if (req.method === "PUT") {
        return await updateStore(req, res, validatedStoreId);
      } else if (req.method === "DELETE") {
        return await deleteStore(req, res, validatedStoreId);
      } else {
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
        });
      }
    } catch (error) {
      console.error("Store API error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });
}

async function getStoreDetails(req, res, storeId) {
  try {
    const store = await Store.findById(storeId)
      .populate("ownerId", "name email role")
      .lean();

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // Get detailed analytics
    const [
      userCount,
      connectedUsers,
      visitStats,
      recentVisits,
      recentRedemptions,
      monthlyStats,
    ] = await Promise.all([
      User.countDocuments({ connectedStores: storeId }),

      User.find({ connectedStores: storeId }, "name email pointsByStore")
        .limit(20)
        .lean(),

      Visit.aggregate([
        { $match: { storeId: mongoose.Types.ObjectId(storeId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalPoints: { $sum: "$points" },
            totalSpend: { $sum: "$spend" },
          },
        },
      ]),

      Visit.find({ storeId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Redemption.find({ storeId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Visit.aggregate([
        {
          $match: {
            storeId: mongoose.Types.ObjectId(storeId),
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            visits: { $sum: 1 },
            points: { $sum: "$points" },
            spend: { $sum: "$spend" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Process visit stats
    const visitStatsObj = visitStats.reduce(
      (acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalPoints: stat.totalPoints,
          totalSpend: stat.totalSpend,
        };
        return acc;
      },
      { pending: {}, approved: {}, rejected: {} }
    );

    // Get user points for this store
    const usersWithPoints = connectedUsers.map((user) => {
      const storePoints = user.pointsByStore?.find(
        (ps) => ps.storeId.toString() === storeId.toString()
      );
      return {
        ...user,
        points: storePoints?.points || 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        store,
        stats: {
          userCount,
          visitStats: visitStatsObj,
          totalVisits: visitStats.reduce((sum, stat) => sum + stat.count, 0),
          totalPointsDistributed: visitStats
            .filter((stat) => stat._id === "approved")
            .reduce((sum, stat) => sum + stat.totalPoints, 0),
          totalSpend: visitStats.reduce(
            (sum, stat) => sum + stat.totalSpend,
            0
          ),
        },
        connectedUsers: usersWithPoints,
        recentVisits,
        recentRedemptions,
        monthlyStats,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function updateStore(req, res, storeId) {
  try {
    const updateData = adminStoreUpdateSchema.parse(req.body);

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // If name is being changed, update slug
    if (updateData.name && updateData.name !== store.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingStore = await Store.findOne({
        slug: newSlug,
        _id: { $ne: storeId },
      });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          error: "Store name already in use",
        });
      }

      updateData.slug = newSlug;
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, {
      new: true,
    }).populate("ownerId", "name email");

    return res.status(200).json({
      success: true,
      data: updatedStore,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteStore(req, res, storeId) {
  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // Check if store has connected users or recent activity
    const [userCount, visitCount] = await Promise.all([
      User.countDocuments({ connectedStores: storeId }),
      Visit.countDocuments({ storeId }),
    ]);

    if (userCount > 0 || visitCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete store with connected users or visit history",
        details: { userCount, visitCount },
      });
    }

    // Delete store and clean up references
    await Promise.all([
      Store.findByIdAndDelete(storeId),
      User.updateMany(
        { connectedStores: storeId },
        { $pull: { connectedStores: storeId } }
      ),
      User.updateMany(
        { "pointsByStore.storeId": storeId },
        { $pull: { pointsByStore: { storeId } } }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    throw error;
  }
}
