import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import { userStatusChangeSchema } from "../../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../../lib/validations";
import User from "../../../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
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
          error: "User not found"
        });
      }

      const oldStatus = user.isActive !== false ? "active" : "suspended";
      const newStatus = status;

      const updatedUser = await User.findByIdAndUpdate(
        validatedUserId,
        {
          isActive: status === "active",
          lastStatusChange: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: "User not found after update"
        });
      }

      await User.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            isActive: status === "active",
            lastStatusChange: new Date()
          }
        }
      );

      const persistedUser = await User.findById(validatedUserId).lean();

      console.log(
        `Status changed for user ${user.name} (${
        user.email}): ${
        oldStatus} -> ${newStatus}. Reason: ${reason || "Not provided"}`
      );

      return res.status(200).json({
        success: true,
        data: {
          userId: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          oldStatus,
          newStatus,
          persistedIsActive: persistedUser?.isActive,
          updatedAt: new Date()
        },
        message: `User ${
        newStatus === "active" ? "activated" : "suspended"} successfully`

      });
    } catch (error) {
      console.error("User status change error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to change user status"
      });
    }
  });
}