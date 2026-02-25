import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Redemption from "../../../../models/Redemption";
import { requireUser } from "../../../../middleware/auth";
import { redeemPointsSchema } from "../../../../lib/validations";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "POST") {
      try {
        const { storeId, points } = redeemPointsSchema.parse(req.body);

        const [user, store] = await Promise.all([
        User.findById(req.user.id),
        Store.findById(storeId)]
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (!store || !store.isActive) {
          return res.status(404).json({ error: "Store not found or inactive" });
        }


        if (!user.connectedStores.includes(storeId)) {
          return res.status(400).json({ error: "Not connected to this store" });
        }


        const userStorePoints = user.pointsByStore.find(
          (p) => p.storeId.toString() === storeId
        );

        if (!userStorePoints || userStorePoints.points < points) {
          return res.status(400).json({ error: "Insufficient points" });
        }


        if (points % store.rewardConfig.conversionRate !== 0) {
          return res.status(400).json({
            error: `Points must be multiple of ${store.rewardConfig.conversionRate}`
          });
        }

        const value = points / store.rewardConfig.conversionRate;


        const redemption = new Redemption({
          userId: user._id,
          storeId: storeId,
          pointsUsed: points,
          value: value,
          autoTriggered: false,
          appliedBy: user._id
        });


        userStorePoints.points -= points;


        await Promise.all([redemption.save(), user.save()]);

        await redemption.populate("storeId", "name");

        res.json({
          message: "Redemption successful",
          redemption: {
            id: redemption._id,
            storeId: redemption.storeId._id,
            storeName: redemption.storeId.name,
            pointsUsed: redemption.pointsUsed,
            value: redemption.value,
            date: redemption.createdAt
          },
          remainingPoints: userStorePoints.points
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        console.error("Redemption error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}