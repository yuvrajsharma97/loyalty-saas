import { connectDB } from "../../../../lib/db";
import Visit from "../../../../models/Visit";
import { requireUser } from "../../../../middleware/auth";
import { visitFilterSchema } from "../../../../lib/validations";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "GET") {
      try {
        const validatedQuery = visitFilterSchema.parse(req.query);
        const { page, limit, storeId, method, status, dateFrom, dateTo } =
        validatedQuery;


        const filter = { userId: req.user.id };

        if (storeId) filter.storeId = storeId;
        if (method) filter.method = method;
        if (status) filter.status = status;

        if (dateFrom || dateTo) {
          filter.createdAt = {};
          if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
          if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const [visits, total] = await Promise.all([
        Visit.find(filter).
        populate("storeId", "name").
        sort({ createdAt: -1 }).
        skip(skip).
        limit(limit).
        lean(),
        Visit.countDocuments(filter)]
        );

        const formattedVisits = visits.map((visit) => ({
          id: visit._id,
          storeId: visit.storeId._id,
          storeName: visit.storeId.name,
          date: visit.createdAt.toISOString().split("T")[0],
          method: visit.method,
          status: visit.status,
          points: visit.points,
          spend: visit.spend
        }));

        res.json({
          visits: formattedVisits,
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
        console.error("Get visits error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}