import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Visit from "../../../../models/Visit";
import Store from "../../../../models/Store";
import { requireUser } from "../../../../middleware/auth";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "GET") {
      try {
        const { storeId } = req.query;

        const user = await User.findById(req.user.id).
        populate("connectedStores").
        lean();

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let currentPoints = 0;
        let redeemableValue = 0;
        let visitsMTD = 0;
        let visitsLifetime = 0;

        if (storeId) {

          const storePoints = user.pointsByStore.find(
            (p) => p.storeId.toString() === storeId
          );
          currentPoints = storePoints?.points || 0;

          const store = user.connectedStores.find(
            (s) => s._id.toString() === storeId
          );
          if (store) {
            redeemableValue = currentPoints / store.rewardConfig.conversionRate;
          }

          [visitsMTD, visitsLifetime] = await Promise.all([
          Visit.countDocuments({
            userId: user._id,
            storeId: storeId,
            status: "approved",
            createdAt: { $gte: startOfMonth }
          }),
          Visit.countDocuments({
            userId: user._id,
            storeId: storeId,
            status: "approved"
          })]
          );
        } else {

          currentPoints = user.pointsByStore.reduce(
            (sum, store) => sum + store.points,
            0
          );


          const avgConversionRate =
          user.connectedStores.length > 0 ?
          user.connectedStores.reduce(
            (sum, store) => sum + store.rewardConfig.conversionRate,
            0
          ) / user.connectedStores.length :
          100;

          redeemableValue = currentPoints / avgConversionRate;

          [visitsMTD, visitsLifetime] = await Promise.all([
          Visit.countDocuments({
            userId: user._id,
            status: "approved",
            createdAt: { $gte: startOfMonth }
          }),
          Visit.countDocuments({
            userId: user._id,
            status: "approved"
          })]
          );
        }


        const recentVisits = await Visit.find({
          userId: user._id,
          ...(storeId && { storeId }),
          status: "approved"
        }).
        populate("storeId", "name").
        sort({ createdAt: -1 }).
        limit(5).
        lean();

        const formattedRecentVisits = recentVisits.map((visit) => ({
          id: visit._id,
          storeId: visit.storeId._id,
          storeName: visit.storeId.name,
          date: visit.createdAt.toISOString().split("T")[0],
          points: visit.points,
          spend: visit.spend
        }));


        const storeBreakdown = await Promise.all(
          user.pointsByStore.
          filter((storePoints) => {
            if (storeId) return storePoints.storeId.toString() === storeId;
            return user.connectedStores.some(
              (store) =>
              store._id.toString() === storePoints.storeId.toString()
            );
          }).
          map(async (storePoints) => {
            const store = user.connectedStores.find(
              (s) => s._id.toString() === storePoints.storeId.toString()
            );
            const visits = await Visit.countDocuments({
              userId: user._id,
              storeId: storePoints.storeId,
              status: "approved"
            });

            return {
              storeId: storePoints.storeId,
              storeName: store?.name || "Unknown Store",
              points: storePoints.points,
              visits
            };
          })
        );

        res.json({
          currentPoints,
          redeemableValue,
          visitsMTD,
          visitsLifetime,
          recentVisits: formattedRecentVisits,
          storeBreakdown
        });
      } catch (error) {
        console.error("Get dashboard metrics error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}