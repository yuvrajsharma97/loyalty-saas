import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import {
  mongoIdSchema,
  paginationSchema } from
"../../../../../lib/validations";
import User from "../../../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { id: storeId } = req.query;
      const validatedStoreId = mongoIdSchema.parse(storeId);
      const { page = 1, limit = 10 } = paginationSchema.parse(req.query);

      await connectDB();

      const skip = (page - 1) * limit;


      const [users, total] = await Promise.all([
      User.find(
        { connectedStores: validatedStoreId },
        "name email pointsByStore createdAt isActive"
      ).
      skip(skip).
      limit(limit).
      lean(),

      User.countDocuments({ connectedStores: validatedStoreId })]
      );


      const processedUsers = users.map((user) => {
        const storePoints = user.pointsByStore?.find(
          (ps) => ps.storeId.toString() === validatedStoreId.toString()
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          points: storePoints?.points || 0,
          joined: user.createdAt.toISOString().split("T")[0],
          status: user.isActive === false ? "suspended" : "active"
        };
      });

      return res.status(200).json({
        success: true,
        data: processedUsers,
        meta: {
          totalPages: Math.ceil(total / limit),
          hasMore: total > skip + limit
        }
      });
    } catch (error) {
      console.error("Store visits error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch store visits"
      });
    }
  });
}