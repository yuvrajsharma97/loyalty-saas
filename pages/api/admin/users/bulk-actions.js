import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminBulkUserActionSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { action, userIds, params } = adminBulkUserActionSchema.parse(
        req.body
      );

      await connectDB();

      let results = { successful: 0, failed: 0, errors: [] };

      switch (action) {
        case "suspend":
          results = await bulkUpdateUsers(userIds, { isActive: false });
          break;

        case "activate":
          results = await bulkUpdateUsers(userIds, { isActive: true });
          break;

        case "delete":
          results = await bulkDeleteUsers(userIds);
          break;

        case "changeRole":
          if (!params?.newRole) {
            return res.status(400).json({
              success: false,
              error: "newRole parameter required for role change"
            });
          }
          results = await bulkUpdateUsers(userIds, { role: params.newRole });
          break;

        default:
          return res.status(400).json({
            success: false,
            error: "Invalid bulk action"
          });
      }

      return res.status(200).json({
        success: true,
        data: results,
        message: `Bulk ${action} completed. ${results.successful} successful, ${results.failed} failed.`
      });
    } catch (error) {
      console.error("Bulk action error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to perform bulk action"
      });
    }
  });
}

async function bulkUpdateUsers(userIds, updateData) {
  let successful = 0;
  let failed = 0;
  let errors = [];

  for (const userId of userIds) {
    try {
      await User.findByIdAndUpdate(userId, updateData);
      successful++;
    } catch (error) {
      failed++;
      errors.push({ userId, error: error.message });
    }
  }

  return { successful, failed, errors };
}

async function bulkDeleteUsers(userIds) {
  let successful = 0;
  let failed = 0;
  let errors = [];

  for (const userId of userIds) {
    try {

      const ownedStores = await Store.find({ ownerId: userId });
      if (ownedStores.length > 0) {
        failed++;
        errors.push({ userId, error: "User owns stores - cannot delete" });
        continue;
      }

      await User.findByIdAndDelete(userId);
      successful++;
    } catch (error) {
      failed++;
      errors.push({ userId, error: error.message });
    }
  }

  return { successful, failed, errors };
}