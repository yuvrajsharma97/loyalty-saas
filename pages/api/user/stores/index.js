import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";
import { requireUser } from "../../../../middleware/auth";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "GET") {
      try {
        const user = await User.findById(req.user.id).
        populate("connectedStores").
        lean();

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }


        const storesWithStats = await Promise.all(
          user.connectedStores.map(async (store) => {
            const userStorePoints = user.pointsByStore.find(
              (p) => p.storeId.toString() === store._id.toString()
            );

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [visitsMTD, visitsLifetime] = await Promise.all([
            Visit.countDocuments({
              userId: user._id,
              storeId: store._id,
              status: "approved",
              createdAt: { $gte: startOfMonth }
            }),
            Visit.countDocuments({
              userId: user._id,
              storeId: store._id,
              status: "approved"
            })]
            );


            const firstVisit = await Visit.findOne({
              userId: user._id,
              storeId: store._id
            }).sort({ createdAt: 1 });

            return {
              id: store._id,
              name: store.name,
              slug: store.slug,
              tier: store.tier,
              points: userStorePoints?.points || 0,
              visitsMTD,
              visitsLifetime,
              joinedAt: firstVisit?.createdAt || user.createdAt,
              conversionRate: store.rewardConfig.conversionRate,
              rewardConfig: store.rewardConfig
            };
          })
        );

        res.json({ stores: storesWithStats });
      } catch (error) {
        console.error("Get stores error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}