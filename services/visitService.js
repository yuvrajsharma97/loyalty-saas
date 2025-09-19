import User from "../models/User.js";
import Store from "../models/Store.js";
import Visit from "../models/Visit.js";
import Redemption from "../models/Redemption.js";
import {
  calculateVisitPoints,
  checkAutoRedemption,
} from "../lib/pointsCalculator.js";
import mongoose from "mongoose";

class VisitService {
  static async approveVisit(visitId, approverId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const visit = await Visit.findById(visitId)
        .populate("storeId")
        .session(session);

      if (!visit) {
        throw new Error("Visit not found");
      }

      if (visit.status !== "pending") {
        throw new Error("Visit is not pending approval");
      }

      // Calculate points based on store config
      const pointsEarned = calculateVisitPoints(visit.storeId, visit.spend);

      // Update visit
      visit.status = "approved";
      visit.points = pointsEarned;
      visit.approvedBy = approverId;
      visit.approvedAt = new Date();

      await visit.save({ session });

      // Update user points
      const user = await User.findById(visit.userId).session(session);
      let userStorePoints = user.pointsByStore.find(
        (p) => p.storeId.toString() === visit.storeId._id.toString()
      );

      if (!userStorePoints) {
        userStorePoints = {
          storeId: visit.storeId._id,
          points: 0,
        };
        user.pointsByStore.push(userStorePoints);
      }

      userStorePoints.points += pointsEarned;

      // Check for auto-redemption
      const redeemableRewards = checkAutoRedemption(
        userStorePoints.points,
        visit.storeId.rewardConfig.conversionRate
      );

      let redemptions = [];

      if (redeemableRewards > 0) {
        const pointsToRedeem =
          redeemableRewards * visit.storeId.rewardConfig.conversionRate;
        const value =
          pointsToRedeem / visit.storeId.rewardConfig.conversionRate;

        // Create auto-redemption
        const redemption = new Redemption({
          userId: user._id,
          storeId: visit.storeId._id,
          pointsUsed: pointsToRedeem,
          value: value,
          autoTriggered: true,
        });

        await redemption.save({ session });

        // Deduct redeemed points
        userStorePoints.points -= pointsToRedeem;

        redemptions.push(redemption);
      }

      await user.save({ session });
      await session.commitTransaction();

      return {
        visit,
        pointsEarned,
        autoRedemptions: redemptions,
        totalPoints: userStorePoints.points,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async rejectVisit(visitId, approverId, reason) {
    const visit = await Visit.findById(visitId);

    if (!visit) {
      throw new Error("Visit not found");
    }

    if (visit.status !== "pending") {
      throw new Error("Visit is not pending approval");
    }

    visit.status = "rejected";
    visit.approvedBy = approverId;
    visit.approvedAt = new Date();
    visit.metadata.rejectionReason = reason;

    await visit.save();
    return visit;
  }
}

export default VisitService;
