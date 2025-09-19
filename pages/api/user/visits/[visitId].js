import { connectDB } from "../../../../lib/db";
import Visit from "../../../../models/Visit";
import { requireUser } from "../../../../middleware/auth";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    const { visitId } = req.query;

    if (req.method === "GET") {
      try {
        const visit = await Visit.findOne({
          _id: visitId,
          userId: req.user.id,
        })
          .populate("storeId", "name")
          .lean();

        if (!visit) {
          return res.status(404).json({ error: "Visit not found" });
        }

        res.json({
          id: visit._id,
          storeId: visit.storeId._id,
          storeName: visit.storeId.name,
          date: visit.createdAt.toISOString().split("T")[0],
          method: visit.method,
          status: visit.status,
          points: visit.points,
          spend: visit.spend,
          createdAt: visit.createdAt,
          approvedAt: visit.approvedAt,
        });
      } catch (error) {
        console.error("Get visit error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
