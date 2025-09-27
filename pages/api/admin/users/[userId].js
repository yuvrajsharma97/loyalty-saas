import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminUserUpdateSchema, adminRoleChangeSchema } from "../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../lib/validations";
import User from "../../../../models/User";
import Store from "../../../../models/Store";
import Visit from "../../../../models/Visit";

export default async function handler(req, res) {
  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { userId } = req.query;
      
      // Validate userId
      const validatedUserId = mongoIdSchema.parse(userId);
      
      await connectDB();

      if (req.method === "GET") {
        return await getUserDetails(req, res, validatedUserId);
      } else if (req.method === "PUT") {
        return await updateUser(req, res, validatedUserId);
      } else if (req.method === "DELETE") {
        return await deleteUser(req, res, validatedUserId);
      } else {
        return res.status(405).json({ 
          success: false, 
          error: "Method not allowed" 
        });
      }
    } catch (error) {
      console.error("User API error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
}

async function getUserDetails(req, res, userId) {
  try {
    const user = await User.findById(userId, "-passwordHash")
      .populate("connectedStores", "name tier slug")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get owned stores
    const ownedStores = await Store.find({ ownerId: userId })
      .populate("ownerId", "name email")
      .lean();

    // Get visit history
    const visitHistory = await Visit.find({ userId })
      .populate("storeId", "name tier")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Calculate totals
    const totalPoints = user.pointsByStore?.reduce((sum, ps) => sum + ps.points, 0) || 0;
    const totalVisits = visitHistory.length;
    const approvedVisits = visitHistory.filter(v => v.status === "approved").length;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          totalPoints,
          totalVisits,
          approvedVisits
        },
        ownedStores,
        visitHistory,
        stats: {
          totalPoints,
          totalVisits,
          approvedVisits,
          connectedStores: user.connectedStores?.length || 0,
          ownedStores: ownedStores.length
        }
      }
    });

  } catch (error) {
    throw error;
  }
}

async function updateUser(req, res, userId) {
  try {
    const updateData = adminUserUpdateSchema.parse(req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if email is being changed and if it's unique
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already in use",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: "-passwordHash",
    }).populate("connectedStores", "name tier");

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteUser(req, res, userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user owns any stores
    const ownedStores = await Store.find({ ownerId: userId });
    if (ownedStores.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete user who owns stores. Transfer ownership first.",
        details: { ownedStores: ownedStores.length },
      });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Visit.deleteMany({ userId }),
      // Remove user from store connections
      Store.updateMany(
        { connectedStores: userId },
        { $pull: { connectedStores: userId } }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    throw error;
  }
}