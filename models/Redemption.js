import mongoose from "mongoose";

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
      min: 1,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    autoTriggered: {
      type: Boolean,
      default: false,
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

redemptionSchema.index({ userId: 1, createdAt: -1 });
redemptionSchema.index({ storeId: 1, createdAt: -1 });

export default mongoose.models.Redemption || mongoose.model("Redemption", redemptionSchema);
