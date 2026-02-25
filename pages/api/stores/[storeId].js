import { connectDB } from "@/lib/db";
import Store from "@/models/Store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { storeId } = req.query;

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const store = await Store.findById(storeId).select(
      "name slug tier isActive rewardConfig"
    );

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (!store.isActive) {
      return res.status(400).json({ error: "Store is currently inactive" });
    }

    return res.status(200).json({
      store: {
        id: store._id,
        _id: store._id,
        name: store.name,
        slug: store.slug,
        tier: store.tier,
        isActive: store.isActive,
        rewardConfig: store.rewardConfig
      }
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({ error: "Failed to fetch store" });
  }
}