import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
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
    method: {
      type: String,
      enum: ["qr", "manual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    spend: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

visitSchema.index({ userId: 1, createdAt: -1 });
visitSchema.index({ storeId: 1, createdAt: -1 });
visitSchema.index({ status: 1 });

export default mongoose.models.Visit || mongoose.model("Visit", visitSchema);
