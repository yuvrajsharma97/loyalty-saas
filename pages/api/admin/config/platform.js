import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminPlatformConfigSchema } from "../../../../lib/validations/admin";

// In a real app, you'd have a Config model. For now, we'll simulate it.
let platformConfig = {
  siteName: "Loyalty Platform",
  maintenanceMode: false,
  registrationOpen: true,
  maxStoresPerOwner: 5,
  pointsExpiryDays: 365,
  updatedAt: new Date(),
  updatedBy: null,
};

export default async function handler(req, res) {
  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      await connectDB();

      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: platformConfig,
        });
      } else if (req.method === "PUT") {
        const updates = adminPlatformConfigSchema.parse(req.body);

        // Update configuration
        platformConfig = {
          ...platformConfig,
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.user.id,
        };

        // In a real app, save to database
        // await Config.findOneAndUpdate({}, platformConfig, { upsert: true });

        return res.status(200).json({
          success: true,
          data: platformConfig,
          message: "Platform configuration updated successfully",
        });
      } else {
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
        });
      }
    } catch (error) {
      console.error("Platform config error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to manage platform configuration",
      });
    }
  });
}
