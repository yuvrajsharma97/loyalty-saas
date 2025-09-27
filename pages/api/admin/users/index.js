import { connectDB } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../middleware/auth";
import { adminUserFiltersSchema } from "../../../../lib/validations/admin";
import User from "../../../../models/User";
import Store from "../../../../models/Store";

export default async function handler(req, res) {
  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      await connectDB();

      if (req.method === "GET") {
        return await getUsersList(req, res);
      } else if (req.method === "POST") {
        return await createUser(req, res);
      } else {
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
        });
      }
    } catch (error) {
      console.error("Users API error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });
}

async function getUsersList(req, res) {
  try {
    const filters = adminUserFiltersSchema.parse(req.query);
    const { page, limit, role, status, search, dateFrom, dateTo } = filters;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Status filter (we'll determine active/suspended from the data)
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query, "-passwordHash")
        .populate("connectedStores", "name tier")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Add computed fields
    const usersWithMetadata = await Promise.all(
      users.map(async (user) => {
        // Get stores owned by this user
        const ownedStores = await Store.find(
          { ownerId: user._id },
          "name tier"
        ).lean();

        // Calculate total points across all stores
        const totalPoints =
          user.pointsByStore?.reduce((sum, ps) => sum + ps.points, 0) || 0;

        return {
          ...user,
          ownedStores,
          totalPoints,
          isActive: user.isActive !== false, // Default to active if not set
          storeCount: user.connectedStores?.length || 0,
          ownedStoreCount: ownedStores.length,
        };
      })
    );

    // Apply status filter after computation if needed
    let filteredUsers = usersWithMetadata;
    if (status) {
      filteredUsers = usersWithMetadata.filter((user) =>
        status === "active" ? user.isActive : !user.isActive
      );
    }

    return res.status(200).json({
      success: true,
      data: filteredUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: total > skip + limit,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function createUser(req, res) {
  // Implementation for creating users (invite functionality)
  try {
    const { name, email, role = "User" } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create user with temporary password
    const bcrypt = require("bcryptjs");
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = new User({
      name,
      email,
      passwordHash,
      role,
    });

    await user.save();

    // TODO: Send invitation email with temporary password
    console.log(`User created: ${email} with temp password: ${tempPassword}`);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    throw error;
  }
}
