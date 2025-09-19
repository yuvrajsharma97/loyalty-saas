import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";
import { requireUser } from "../../../../middleware/auth";
import { visitRequestSchema } from "../../../../lib/validations";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "POST") {
      try {
        const { storeId, method, spend } = visitRequestSchema.parse(req.body);

        const [user, store] = await Promise.all([
          User.findById(req.user.id),
          Store.findById(storeId),
        ]);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (!store || !store.isActive) {
          return res.status(404).json({ error: "Store not found or inactive" });
        }

        // Check if user is connected to this store
        if (!user.connectedStores.includes(storeId)) {
          return res.status(400).json({ error: "Not connected to this store" });
        }

        // Check for recent pending visits (prevent spam)
        const recentPending = await Visit.findOne({
          userId: user._id,
          storeId: storeId,
          status: "pending",
          createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes
        });

        if (recentPending) {
          return res.status(429).json({
            error: "Please wait before requesting another visit",
            code: "RATE_LIMITED",
          });
        }

        // Create visit request
        const visit = new Visit({
          userId: user._id,
          storeId: storeId,
          method: method,
          spend: spend || 0,
          status: "pending",
          metadata: {
            ipAddress:
              req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        });

        await visit.save();
        await visit.populate("storeId", "name");

        res.json({
          message: "Visit request submitted",
          visit: {
            id: visit._id,
            storeId: visit.storeId._id,
            storeName: visit.storeId.name,
            status: visit.status,
            method: visit.method,
            spend: visit.spend,
            createdAt: visit.createdAt,
          },
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors,
          });
        }
        console.error("Visit request error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
