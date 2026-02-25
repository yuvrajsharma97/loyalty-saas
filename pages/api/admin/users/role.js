import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminRoleChangeSchema } from "../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../lib/validations";
import User from "../../../../models/User";
import Store from "../../../../models/Store";

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
      const { newRole, reason } = adminRoleChangeSchema.parse(req.body);

      await connectDB();

      const user = await User.findById(validatedUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }


      if (newRole === "StoreAdmin" && user.role !== "StoreAdmin") {


      } else if (user.role === "StoreAdmin" && newRole !== "StoreAdmin") {

        const ownedStores = await Store.find({ ownerId: validatedUserId });
        if (ownedStores.length > 0) {
          return res.status(400).json({
            success: false,
            error:
            "Cannot change role while user owns stores. Transfer ownership first.",
            details: { ownedStores: ownedStores.length }
          });
        }
      }

      const oldRole = user.role;


      user.role = newRole;
      await user.save();


      console.log(
        `Role changed for user ${user.email}: ${oldRole} -> ${newRole}. Reason: ${reason || "Not provided"}`
      );

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        },
        message: `Role changed to ${newRole}`
      });
    } catch (error) {
      console.error("Role change error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to change user role"
      });
    }
  });
}