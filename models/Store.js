import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    tier: {
      type: String,
      enum: ["silver", "gold", "platinum"],
      default: "silver",
    },
    rewardConfig: {
      type: {
        type: String,
        enum: ["visit", "spend", "hybrid"],
        required: true,
      },
      pointsPerPound: {
        type: Number,
        default: 0,
        min: 0,
      },
      pointsPerVisit: {
        type: Number,
        default: 0,
        min: 0,
      },
      conversionRate: {
        type: Number,
        required: true,
        default: 100,
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      unique: true,
    },
    rewardQRCode: {
      type: String, // URL or data URI of the generated QR code image
    },
    rewardQREmail: {
      type: String, // Email used when generating reward QR
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ slug: 1 });
storeSchema.index({ ownerId: 1 });
storeSchema.index({ qrCode: 1 });

export default mongoose.models.Store || mongoose.model("Store", storeSchema);
