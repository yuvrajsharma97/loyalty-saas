import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import {
  mongoIdSchema,
  paginationSchema } from
"../../../../../lib/validations";
import Redemption from "../../../../../models/Redemption";

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

      const [redemptions, total] = await Promise.all([
      Redemption.find({ storeId: validatedStoreId }).
      populate("userId", "name email").
      sort({ createdAt: -1 }).
      skip(skip).
      limit(limit).
      lean(),

      Redemption.countDocuments({ storeId: validatedStoreId })]
      );


      const processedRedemptions = redemptions.map((redemption) => ({
        id: redemption._id.toString(),
        userName: redemption.userId ? redemption.userId.name : "Unknown User",
        date: redemption.createdAt.toISOString().split("T")[0],
        pointsUsed: redemption.pointsUsed,
        value: `£${redemption.value.toFixed(2)}`,
        autoTriggered: redemption.autoTriggered ? "Yes" : "No"
      }));

      return res.status(200).json({
        success: true,
        data: processedRedemptions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: total > skip + limit
        }
      });
    } catch (error) {
      console.error("Store rewards error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch store rewards"
      });
    }
  });
}