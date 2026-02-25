import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import RewardClaim from "@/models/RewardClaim";
import Store from "@/models/Store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== "StoreAdmin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();


    const store = await Store.findOne({ ownerId: session.user.id });
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const { status } = req.query;

    const filter = { storeId: store._id };

    if (status) {
      filter.status = status;
    }

    const claims = await RewardClaim.find(filter).
    populate("userId", "name email").
    sort({ createdAt: -1 }).
    limit(200);

    return res.status(200).json({
      claims: claims.map((claim) => ({
        id: claim._id,
        userName: claim.userName,
        userEmail: claim.userEmail,
        message: claim.message,
        status: claim.status,
        createdAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        rejectionReason: claim.rejectionReason
      }))
    });
  } catch (error) {
    console.error("Error fetching reward claims:", error);
    return res.status(500).json({ error: "Failed to fetch reward claims" });
  }
}