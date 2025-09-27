import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminExportSchema } from "../../../../lib/validations/admin";
import Store from "../../../../models/Store";
import User from "../../../../models/User";
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
      // Validate request body
      const validatedData = adminExportSchema.parse(req.body);
      const { type, filters = {}, dateFrom, dateTo } = validatedData;

      await connectDB();

      let csvData = [];
      let filename = "";
      let headers = "";

      // Build date filter if provided
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
      }

      switch (type) {
        case "stores":
          const storeQuery = { ...dateFilter };
          if (filters.tier) storeQuery.tier = filters.tier;
          if (filters.status) storeQuery.isActive = filters.status === "active";

          const stores = await Store.find(storeQuery)
            .populate("ownerId", "name email")
            .lean();

          const storesWithUserCounts = await Promise.all(
            stores.map(async (store) => {
              const userCount = await User.countDocuments({
                connectedStores: store._id,
              });
              return { ...store, userCount };
            })
          );

          headers = "Store,Owner,Owner Email,Tier,Users,Created,Status\n";
          csvData = storesWithUserCounts.map(
            (store) =>
              `"${store.name}","${store.ownerId?.name || "No Owner"}","${
                store.ownerId?.email || ""
              }","${store.tier}",${store.userCount},"${
                store.createdAt.toISOString().split("T")[0]
              }","${store.isActive ? "active" : "suspended"}"`
          );
          filename = `stores-export-${new Date().toISOString().split("T")[0]}.csv`;
          break;

        case "users":
          const userQuery = { ...dateFilter };
          if (filters.role) userQuery.role = filters.role;

          const users = await User.find(userQuery, "-passwordHash").lean();

          const usersWithStoreCounts = await Promise.all(
            users.map(async (user) => {
              const storeCount = user.connectedStores?.length || 0;
              const totalPoints =
                user.pointsByStore?.reduce((sum, ps) => sum + ps.points, 0) ||
                0;
              return { ...user, storeCount, totalPoints };
            })
          );

          headers =
            "Name,Email,Role,Connected Stores,Total Points,Created,Status\n";
          csvData = usersWithStoreCounts.map(
            (user) =>
              `"${user.name}","${user.email}","${user.role}",${
                user.storeCount
              },${user.totalPoints},"${
                user.createdAt.toISOString().split("T")[0]
              }","${user.isActive !== false ? "active" : "suspended"}"`
          );
          filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
          break;

        case "visits":
          const visitQuery = { ...dateFilter };
          if (filters.status) visitQuery.status = filters.status;

          const visits = await Visit.find(visitQuery)
            .populate("userId", "name email")
            .populate("storeId", "name")
            .lean();

          headers =
            "User Name,User Email,Store,Method,Status,Points,Spend,Date\n";
          csvData = visits.map(
            (visit) =>
              `"${visit.userId?.name || "Unknown"}","${
                visit.userId?.email || ""
              }","${visit.storeId?.name || "Unknown"}","${visit.method}","${
                visit.status
              }",${visit.points},${visit.spend},"${
                visit.createdAt.toISOString().split("T")[0]
              }"`
          );
          filename = `visits-export-${new Date().toISOString().split("T")[0]}.csv`;
          break;

        case "redemptions":
          const redemptionQuery = { ...dateFilter };

          const redemptions = await Redemption.find(redemptionQuery)
            .populate("userId", "name email")
            .populate("storeId", "name")
            .lean();

          headers = "User Name,User Email,Store,Points,Date\n";
          csvData = redemptions.map(
            (redemption) =>
              `"${redemption.userId?.name || "Unknown"}","${
                redemption.userId?.email || ""
              }","${redemption.storeId?.name || "Unknown"}",${redemption.points},"${
                redemption.createdAt.toISOString().split("T")[0]
              }"`
          );
          filename = `redemptions-export-${new Date().toISOString().split("T")[0]}.csv`;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "Invalid export type",
          });
      }

      // Combine headers and data
      const csvContent = headers + csvData.join("\n");

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", Buffer.byteLength(csvContent));

      return res.status(200).send(csvContent);
    } catch (error) {
      console.error("CSV export error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to export data",
      });
    }
  });
}
