import mongoose from "mongoose";

const pointsByStoreSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["User", "StoreAdmin", "SuperAdmin"],
      required: true,
      index: true,
    },
    connectedStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    pointsByStore: [pointsByStoreSchema],
    preferences: {
      visitApprovedEmail: {
        type: Boolean,
        default: true,
      },
      rewardEmail: {
        type: Boolean,
        default: true,
      },
      promotionEmail: {
        type: Boolean,
        default: false,
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add additional indexes for performance
userSchema.index({ "pointsByStore.storeId": 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
