import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import Store from "../../../../models/Store";
import User from "../../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { limit = 5 } = req.query;

      await connectDB();


      const recentStores = await Store.find({}, "name tier createdAt ownerId").
      populate("ownerId", "name email").
      sort({ createdAt: -1 }).
      limit(parseInt(limit)).
      lean();


      const storesWithMetadata = await Promise.all(
        recentStores.map(async (store) => {
          const userCount = await User.countDocuments({
            connectedStores: store._id
          });

          return {
            _id: store._id.toString(),
            name: store.name,
            ownerId: store.ownerId,
            tier: store.tier,
            userCount: userCount,
            createdAt: store.createdAt
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: storesWithMetadata
      });
    } catch (error) {
      console.error("Recent stores error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch recent stores"
      });
    }
  });
}