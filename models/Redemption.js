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
    rewardValueGBP: {
      type: Number,
      required: true,
      min: 0,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{8}$/,
    },
    redemptionDate: {
      type: Date,
      default: Date.now,
    },
    autoTriggered: {
      type: Boolean,
      default: false,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Legacy field for backward compatibility
    value: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for backward compatibility
redemptionSchema.virtual('value_computed').get(function() {
  return this.rewardValueGBP || this.value || 0;
});

redemptionSchema.index({ userId: 1, createdAt: -1 });
redemptionSchema.index({ storeId: 1, redemptionDate: -1 });
redemptionSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Redemption || mongoose.model("Redemption", redemptionSchema);
