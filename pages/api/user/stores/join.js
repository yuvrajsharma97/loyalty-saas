import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import { requireUser } from "../../../../middleware/auth";
import { joinStoreSchema } from "../../../../lib/validations";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "POST") {
      try {
        const { storeId } = joinStoreSchema.parse(req.body);

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


        if (user.connectedStores.includes(storeId)) {
          return res.
          status(400).
          json({ error: "Already connected to this store" });
        }


        user.connectedStores.push(storeId);


        user.pointsByStore.push({
          storeId: storeId,
          points: 0
        });

        await user.save();

        res.json({
          message: "Successfully joined store",
          store: {
            id: store._id,
            name: store.name,
            slug: store.slug
          }
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        console.error("Join store error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}