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
          error: "Method not allowed"
        });
      }
    } catch (error) {
      console.error("Users API error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
}

async function getUsersList(req, res) {
  try {
    const filters = adminUserFiltersSchema.parse(req.query);
    const { page, limit, role, status, search, dateFrom, dateTo } = filters;


    const andConditions = [];

    if (role) {
      andConditions.push({ role });
    }

    if (search) {
      andConditions.push({
        $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }]

      });
    }

    if (status === "active") {
      andConditions.push({
        $or: [{ isActive: true }, { isActive: { $exists: false } }]
      });
    } else if (status === "suspended") {
      andConditions.push({ isActive: false });
    }

    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) createdAt.$gte = new Date(dateFrom);
      if (dateTo) createdAt.$lte = new Date(dateTo);
      andConditions.push({ createdAt });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
    User.find(query, "-passwordHash").
    populate("connectedStores", "name tier").
    sort({ createdAt: -1 }).
    skip(skip).
    limit(limit).
    lean(),
    User.countDocuments(query)]
    );


    const usersWithMetadata = await Promise.all(
      users.map(async (user) => {

        const ownedStores = await Store.find(
          { ownerId: user._id },
          "name tier"
        ).lean();


        const totalPoints =
        user.pointsByStore?.reduce((sum, ps) => sum + ps.points, 0) || 0;

        return {
          ...user,
          ownedStores,
          totalPoints,
          isActive: user.isActive === false ? false : true,
          storeCount: user.connectedStores?.length || 0,
          ownedStoreCount: ownedStores.length
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: usersWithMetadata,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    throw error;
  }
}

async function createUser(req, res) {

  try {
    const { name, email, role = "User" } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists"
      });
    }


    const bcrypt = require("bcryptjs");
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = new User({
      name,
      email,
      passwordHash,
      role
    });

    await user.save();


    console.log(`User created: ${email} with temp password: ${tempPassword}`);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    throw error;
  }
}