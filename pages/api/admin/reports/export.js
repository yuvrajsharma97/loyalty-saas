import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminExportSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";
import Redemption from "../../../../models/Redemption";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { type, format, dateFrom, dateTo, filters } =
        adminExportSchema.parse(req.body);

      await connectDB();

      // Build date filter
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);

      let data = [];
      let filename = "";
      let headers = [];

      switch (type) {
        case "users":
          data = await exportUsers(dateFilter, filters);
          filename = `users_export_${new Date().toISOString().split("T")[0]}`;
          headers = [
            "ID",
            "Name",
            "Email",
            "Role",
            "Connected Stores",
            "Total Points",
            "Created At",
            "Last Login",
          ];
          break;

        case "stores":
          data = await exportStores(dateFilter, filters);
          filename = `stores_export_${new Date().toISOString().split("T")[0]}`;
          headers = [
            "ID",
            "Name",
            "Tier",
            "Owner Name",
            "Owner Email",
            "User Count",
            "Total Visits",
            "Points Distributed",
            "Created At",
          ];
          break;

        case "visits":
          data = await exportVisits(dateFilter, filters);
          filename = `visits_export_${new Date().toISOString().split("T")[0]}`;
          headers = [
            "ID",
            "User Name",
            "User Email",
            "Store Name",
            "Method",
            "Status",
            "Points",
            "Spend",
            "Created At",
            "Approved At",
          ];
          break;

        case "redemptions":
          data = await exportRedemptions(dateFilter, filters);
          filename = `redemptions_export_${
            new Date().toISOString().split("T")[0]
          }`;
          headers = [
            "ID",
            "User Name",
            "User Email",
            "Store Name",
            "Points Used",
            "Value",
            "Auto Triggered",
            "Created At",
          ];
          break;

        default:
          return res
            .status(400)
            .json({ success: false, error: "Invalid export type" });
      }

      if (format === "csv") {
        const csv = convertToCSV(data, headers);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.csv"`
        );
        return res.status(200).send(csv);
      } else {
        // For Excel format, you would need a library like xlsx
        return res
          .status(400)
          .json({ success: false, error: "Excel format not implemented yet" });
      }
    } catch (error) {
      console.error("Export error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to export data",
      });
    }
  });
}

async function exportUsers(dateFilter, filters) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }
  if (filters?.role) {
    query.role = filters.role;
  }

  const users = await User.find(query, "-passwordHash")
    .populate("connectedStores", "name")
    .lean();

  return users.map((user) => [
    user._id,
    user.name,
    user.email,
    user.role,
    user.connectedStores?.map((s) => s.name).join("; ") || "",
    user.pointsByStore?.reduce((sum, ps) => sum + ps.points, 0) || 0,
    user.createdAt?.toISOString(),
    user.lastLogin?.toISOString() || "",
  ]);
}

async function exportStores(dateFilter, filters) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }
  if (filters?.tier) {
    query.tier = filters.tier;
  }

  const stores = await Store.find(query)
    .populate("ownerId", "name email")
    .lean();

  // Get additional stats for each store
  const storeData = await Promise.all(
    stores.map(async (store) => {
      const [userCount, visitStats] = await Promise.all([
        User.countDocuments({ connectedStores: store._id }),
        Visit.aggregate([
          { $match: { storeId: store._id, status: "approved" } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              points: { $sum: "$points" },
            },
          },
        ]),
      ]);

      const stats = visitStats[0] || { count: 0, points: 0 };

      return [
        store._id,
        store.name,
        store.tier,
        store.ownerId?.name || "",
        store.ownerId?.email || "",
        userCount,
        stats.count,
        stats.points,
        store.createdAt?.toISOString(),
      ];
    })
  );

  return storeData;
}

async function exportVisits(dateFilter, filters) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }
  if (filters?.status) {
    query.status = filters.status;
  }
  if (filters?.storeId) {
    query.storeId = filters.storeId;
  }

  const visits = await Visit.find(query)
    .populate("userId", "name email")
    .populate("storeId", "name")
    .lean();

  return visits.map((visit) => [
    visit._id,
    visit.userId?.name || "",
    visit.userId?.email || "",
    visit.storeId?.name || "",
    visit.method,
    visit.status,
    visit.points,
    visit.spend,
    visit.createdAt?.toISOString(),
    visit.approvedAt?.toISOString() || "",
  ]);
}

async function exportRedemptions(dateFilter, filters) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }
  if (filters?.storeId) {
    query.storeId = filters.storeId;
  }

  const redemptions = await Redemption.find(query)
    .populate("userId", "name email")
    .populate("storeId", "name")
    .lean();

  return redemptions.map((redemption) => [
    redemption._id,
    redemption.userId?.name || "",
    redemption.userId?.email || "",
    redemption.storeId?.name || "",
    redemption.pointsUsed,
    redemption.value,
    redemption.autoTriggered ? "Yes" : "No",
    redemption.createdAt?.toISOString(),
  ]);
}

function convertToCSV(data, headers) {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = row.map((field) => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(field).replace(/"/g, '""');
      return escaped.includes(",") ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
