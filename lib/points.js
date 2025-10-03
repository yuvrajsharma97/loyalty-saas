// /lib/points.js
import { connectDB } from "./db";
import User from "../models/User";
import Store from "../models/Store";
import Redemption from "../models/Redemption";

/**
 * Generate a unique 8-digit redemption code
 * @returns {Promise<string>} 8-digit numeric string
 */
export async function generateRedemptionCode() {
  const maxRetries = 10;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate random 8-digit code
    const code = String(Math.floor(Math.random() * 1e8)).padStart(8, '0');

    // Check if code already exists
    const existingRedemption = await Redemption.findOne({ code });
    if (!existingRedemption) {
      return code;
    }
  }

  throw new Error('Unable to generate unique redemption code after multiple attempts');
}

/**
 * Redeem points for a user at a specific store
 * @param {Object} params
 * @param {string} params.userId - User's ObjectId
 * @param {string} params.storeId - Store's ObjectId
 * @param {number} params.conversionRate - Points per GBP (e.g., 100 points = £1)
 * @param {boolean} params.autoTriggered - Whether redemption was automatic
 * @returns {Promise<Object>} { rewardValueGBP, pointsUsed, code }
 */
export async function redeemPoints({ userId, storeId, conversionRate, autoTriggered = false }) {
  await connectDB();

  // Load user with points data
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Find user's points balance for this store
  const storePoints = user.pointsByStore?.find(
    ps => ps.storeId.toString() === storeId.toString()
  );

  if (!storePoints || storePoints.points <= 0) {
    throw new Error('No points available for this store');
  }

  const points = storePoints.points;

  // Compute reward value (integer pounds only)
  const rewardValueGBP = Math.floor(points / conversionRate);
  const pointsUsed = rewardValueGBP * conversionRate;

  if (rewardValueGBP <= 0) {
    throw new Error('Insufficient points to redeem');
  }

  // Generate unique code
  const code = await generateRedemptionCode();

  // Create redemption record
  const redemption = new Redemption({
    userId,
    storeId,
    pointsUsed,
    rewardValueGBP,
    code,
    redemptionDate: new Date(),
    autoTriggered,
  });

  await redemption.save();

  // Update user's points balance
  if (!user.pointsByStore || !Array.isArray(user.pointsByStore)) {
    throw new Error("User points data is invalid");
  }

  const updatedPointsByStore = user.pointsByStore.map(ps => {
    if (ps.storeId.toString() === storeId.toString()) {
      return {
        ...ps,
        points: ps.points - pointsUsed
      };
    }
    return ps;
  });

  user.pointsByStore = updatedPointsByStore;
  await user.save();

  return {
    rewardValueGBP,
    pointsUsed,
    code
  };
}