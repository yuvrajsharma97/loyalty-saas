import { connectDB } from "../../../../lib/db";
import { requireStoreAdmin } from "../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../lib/utils/storeAuth";
import Visit from "../../../../models/Visit";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const {
          format = "json",
          dateFrom,
          dateTo,
          status = "approved"
        } = req.query;

        const storeId = new mongoose.Types.ObjectId(req.storeId);


        const matchConditions = { storeId, status };

        if (dateFrom || dateTo) {
          matchConditions.createdAt = {};
          if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom);
          if (dateTo) matchConditions.createdAt.$lte = new Date(dateTo);
        }

        const visits = await Visit.find(matchConditions).
        populate("userId", "name email").
        populate("approvedBy", "name").
        sort({ createdAt: -1 }).
        lean();

        if (format === "csv") {

          const csvHeaders =
          "Date,User Name,Email,Method,Status,Spend,Points,Approved By,Notes";
          const csvRows = visits.
          map((visit) => {
            const date = visit.createdAt.toISOString().split("T")[0];
            const userName = visit.userId?.name || "Unknown";
            const email = visit.userId?.email || "";
            const approvedBy = visit.approvedBy?.name || "";
            const notes = visit.metadata?.notes || "";

            return `${date},"${userName}","${email}",${visit.method},${visit.status},${visit.spend},${visit.points},"${approvedBy}","${notes}"`;
          }).
          join("\n");

          const csvContent = `${csvHeaders}\n${csvRows}`;

          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="visits-report.csv"'
          );
          return res.send(csvContent);
        }


        const formattedVisits = visits.map((visit) => ({
          id: visit._id,
          date: visit.createdAt,
          user: {
            name: visit.userId?.name || "Unknown",
            email: visit.userId?.email
          },
          method: visit.method,
          status: visit.status,
          spend: visit.spend,
          points: visit.points,
          approvedBy: visit.approvedBy?.name,
          approvedAt: visit.approvedAt,
          notes: visit.metadata?.notes
        }));

        res.json({
          visits: formattedVisits,
          summary: {
            totalVisits: visits.length,
            totalSpend: visits.reduce((sum, v) => sum + v.spend, 0),
            totalPoints: visits.reduce((sum, v) => sum + v.points, 0)
          }
        });
      } catch (error) {
        console.error("Visits report error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}