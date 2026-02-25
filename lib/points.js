
import { connectDB } from "./db";
import User from "../models/User";
import Store from "../models/Store";
import Redemption from "../models/Redemption";





export async function generateRedemptionCode() {
  const maxRetries = 10;

  for (let attempt = 0; attempt < maxRetries; attempt++) {

    const code = String(Math.floor(Math.random() * 1e8)).padStart(8, '0');


    const existingRedemption = await Redemption.findOne({ code });
    if (!existingRedemption) {
      return code;
    }
  }

  throw new Error('Unable to generate unique redemption code after multiple attempts');
}










export async function redeemPoints({ userId, storeId, conversionRate, autoTriggered = false }) {
  await connectDB();


  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }


  const storePoints = user.pointsByStore?.find(
    (ps) => ps.storeId.toString() === storeId.toString()
  );

  if (!storePoints || storePoints.points <= 0) {
    throw new Error('No points available for this store');
  }

  const points = storePoints.points;


  const rewardValueGBP = Math.floor(points / conversionRate);
  const pointsUsed = rewardValueGBP * conversionRate;

  if (rewardValueGBP <= 0) {
    throw new Error('Insufficient points to redeem');
  }


  const code = await generateRedemptionCode();


  const redemption = new Redemption({
    userId,
    storeId,
    pointsUsed,
    rewardValueGBP,
    code,
    redemptionDate: new Date(),
    autoTriggered
  });

  await redemption.save();


  if (!user.pointsByStore || !Array.isArray(user.pointsByStore)) {
    throw new Error("User points data is invalid");
  }

  const updatedPointsByStore = user.pointsByStore.map((ps) => {
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