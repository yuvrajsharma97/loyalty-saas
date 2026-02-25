import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import RewardClaim from "@/models/RewardClaim";
import Store from "@/models/Store";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== "StoreAdmin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    const { claimId } = req.query;
    const { status, rejectionReason } = req.body;

    if (!claimId) {
      return res.status(400).json({ error: "Claim ID is required" });
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required (approved/rejected)" });
    }


    const store = await Store.findOne({ ownerId: session.user.id });
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }


    const claim = await RewardClaim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    if (claim.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ error: "This claim does not belong to your store" });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({ error: "This claim has already been reviewed" });
    }


    claim.status = status;
    claim.reviewedBy = session.user.id;
    claim.reviewedAt = new Date();

    if (status === "rejected" && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    await claim.save();

    return res.status(200).json({
      success: true,
      message: `Claim ${status} successfully`,
      claim: {
        id: claim._id,
        status: claim.status,
        reviewedAt: claim.reviewedAt
      }
    });
  } catch (error) {
    console.error("Error updating reward claim:", error);
    return res.status(500).json({ error: "Failed to update claim" });
  }
}