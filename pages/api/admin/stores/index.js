import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminStoreFiltersSchema } from "../../../../lib/validations/admin";
import Store from "../../../../models/Store";
import User from "../../../../models/User";
import Visit from "../../../../models/Visit";

export default async function handler(req, res) {
  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      await connectDB();

      if (req.method === "GET") {
        return await getStoresList(req, res);
      } else if (req.method === "POST") {
        return await createStore(req, res);
      } else {
        return res.status(405).json({
          success: false,
          error: "Method not allowed"
        });
      }
    } catch (error) {
      console.error("Stores API error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
}

async function getStoresList(req, res) {
  try {
    const filters = adminStoreFiltersSchema.parse(req.query);
    const { page, limit, tier, status, search, dateFrom, dateTo } = filters;


    const query = {};

    if (tier) {
      query.tier = tier;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "suspended") {
      query.isActive = false;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
    Store.find(query).
    populate("ownerId", "name email").
    sort({ createdAt: -1 }).
    skip(skip).
    limit(limit).
    lean(),
    Store.countDocuments(query)]
    );


    const storesWithMetadata = await Promise.all(
      stores.map(async (store) => {
        const [userCount, visitStats, totalPoints] = await Promise.all([
        User.countDocuments({ connectedStores: store._id }),
        Visit.aggregate([
        { $match: { storeId: store._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }]
        ),
        Visit.aggregate([
        { $match: { storeId: store._id, status: "approved" } },
        { $group: { _id: null, total: { $sum: "$points" } } }]
        )]
        );

        const visitStatsObj = visitStats.reduce(
          (acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          { pending: 0, approved: 0, rejected: 0 }
        );

        return {
          ...store,
          userCount,
          visitStats: visitStatsObj,
          totalPointsDistributed: totalPoints[0]?.total || 0,
          totalVisits: Object.values(visitStatsObj).reduce((a, b) => a + b, 0)
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: storesWithMetadata,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    throw error;
  }
}

async function createStore(req, res) {
  try {
    const { name, ownerId, tier = "silver", rewardConfig } = req.body;


    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(400).json({
        success: false,
        error: "Owner not found"
      });
    }


    const slug = name.
    toLowerCase().
    replace(/[^a-z0-9]+/g, "-").
    replace(/(^-|-$)/g, "");


    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        error: "Store name already in use"
      });
    }


    const qrCode = `QR_${Date.now()}_${Math.random().
    toString(36).
    substr(2, 9)}`;

    const store = new Store({
      name,
      slug,
      tier,
      ownerId,
      rewardConfig: rewardConfig || {
        type: "visit",
        pointsPerVisit: 10,
        pointsPerPound: 0,
        conversionRate: 100
      },
      qrCode
    });

    await store.save();


    if (owner.role === "User") {
      owner.role = "StoreAdmin";
      await owner.save();
    }

    const populatedStore = await Store.findById(store._id).
    populate("ownerId", "name email").
    lean();

    return res.status(201).json({
      success: true,
      data: populatedStore
    });
  } catch (error) {
    throw error;
  }
}