import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Redemption from "../../../../models/Redemption";
import { requireUser } from "../../../../middleware/auth";
import { rewardsFilterSchema } from "../../../../lib/validations";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "GET") {
      try {
        const validatedQuery = rewardsFilterSchema.parse(req.query);
        const { page, limit, storeId, type, dateFrom, dateTo } = validatedQuery;

        const user = await User.findById(req.user.id).
        populate("connectedStores").
        lean();

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }


        let totalPoints = 0;
        let avgConversionRate = 0;

        if (storeId) {
          const storePoints = user.pointsByStore.find(
            (p) => p.storeId.toString() === storeId
          );
          totalPoints = storePoints?.points || 0;

          const store = user.connectedStores.find(
            (s) => s._id.toString() === storeId
          );
          avgConversionRate = store?.rewardConfig.conversionRate || 100;
        } else {
          totalPoints = user.pointsByStore.reduce(
            (sum, store) => sum + store.points,
            0
          );
          avgConversionRate =
          user.connectedStores.length > 0 ?
          user.connectedStores.reduce(
            (sum, store) => sum + store.rewardConfig.conversionRate,
            0
          ) / user.connectedStores.length :
          100;
        }

        const totalValue = totalPoints / avgConversionRate;
        const availableRedemptions = Math.floor(
          totalPoints / avgConversionRate
        );


        const filter = { userId: req.user.id };
        if (storeId) filter.storeId = storeId;

        if (dateFrom || dateTo) {
          filter.createdAt = {};
          if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
          if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const [redemptions, total] = await Promise.all([
        Redemption.find(filter).
        populate("storeId", "name").
        sort({ createdAt: -1 }).
        skip(skip).
        limit(limit).
        lean(),
        Redemption.countDocuments(filter)]
        );

        const formattedRedemptions = redemptions.map((redemption) => ({
          id: redemption._id,
          storeId: redemption.storeId._id,
          storeName: redemption.storeId.name,
          date: redemption.createdAt.toISOString().split("T")[0],
          pointsUsed: redemption.pointsUsed,
          value: redemption.value,
          autoTriggered: redemption.autoTriggered
        }));

        res.json({
          summary: {
            totalPoints,
            totalValue,
            availableRedemptions
          },
          redemptions: formattedRedemptions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid query parameters",
            details: error.errors
          });
        }
        console.error("Get rewards error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}