// /pages/api/user/redemptions.js
import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../middleware/auth";
import Redemption from "../../../models/Redemption";
import { paginationSchema } from "../../../lib/validations";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  return requireUser(req, res, async (req, res) => {
    try {
      await connectDB();

      const filters = paginationSchema.parse(req.query);
      const { page, limit } = filters;

      const skip = (page - 1) * limit;

      const [redemptions, total] = await Promise.all([
        Redemption.find({ userId: req.user.id })
          .populate('storeId', 'name tier')
          .sort({ redemptionDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Redemption.countDocuments({ userId: req.user.id })
      ]);

      const formattedRedemptions = redemptions.map(redemption => ({
        id: redemption._id,
        storeId: redemption.storeId._id,
        storeName: redemption.storeId.name,
        storeTier: redemption.storeId.tier,
        pointsUsed: redemption.pointsUsed,
        rewardValueGBP: redemption.rewardValueGBP,
        code: redemption.code,
        redemptionDate: redemption.redemptionDate,
        autoTriggered: redemption.autoTriggered,
        used: redemption.used || false,
        usedAt: redemption.usedAt,
        createdAt: redemption.createdAt
      }));

      return res.status(200).json({
        success: true,
        data: formattedRedemptions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: total > skip + limit,
        },
      });

    } catch (error) {
      console.error("Redemptions fetch error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Invalid pagination parameters",
          details: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to fetch redemption history"
      });
    }
  });
}