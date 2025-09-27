import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import { userStatusChangeSchema } from "../../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../../lib/validations";
import User from "../../../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { userId } = req.query;
      const validatedUserId = mongoIdSchema.parse(userId);
      const { status, reason } = userStatusChangeSchema.parse(req.body);

      await connectDB();

      const user = await User.findById(validatedUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const oldStatus = user.isActive !== false ? "active" : "suspended";
      const newStatus = status;

      await User.findByIdAndUpdate(validatedUserId, {
        isActive: status === "active",
        lastStatusChange: new Date(),
      });

      console.log(
        `Status changed for user ${user.name} (${
          user.email
        }): ${oldStatus} -> ${newStatus}. Reason: ${reason || "Not provided"}`
      );

      return res.status(200).json({
        success: true,
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          oldStatus,
          newStatus,
          updatedAt: new Date(),
        },
        message: `User ${
          newStatus === "active" ? "activated" : "suspended"
        } successfully`,
      });
    } catch (error) {
      console.error("User status change error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to change user status",
      });
    }
  });
}