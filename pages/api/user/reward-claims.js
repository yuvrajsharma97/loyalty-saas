import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import RewardClaim from "@/models/RewardClaim";
import User from "@/models/User";
import Store from "@/models/Store";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "User") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  if (req.method === "POST") {
    return handleCreateClaim(req, res, session);
  } else if (req.method === "GET") {
    return handleGetClaims(req, res, session);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleCreateClaim(req, res, session) {
  try {
    const { storeId, message } = req.body;

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }


    const user = await User.findById(session.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (!user.connectedStores.includes(storeId)) {
      return res.
      status(400).
      json({ error: "You must be connected to this store first" });
    }


    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (!store.isActive) {
      return res.status(400).json({ error: "Store is currently inactive" });
    }


    const claim = await RewardClaim.create({
      userId: user._id,
      storeId: store._id,
      userName: user.name,
      userEmail: user.email,
      message: message || "",
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Reward claim submitted successfully",
      claim: {
        id: claim._id,
        status: claim.status,
        createdAt: claim.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating reward claim:", error);
    return res.status(500).json({ error: "Failed to submit claim" });
  }
}

async function handleGetClaims(req, res, session) {
  try {
    const { status, storeId } = req.query;

    const filter = { userId: session.user.id };

    if (status) {
      filter.status = status;
    }

    if (storeId) {
      filter.storeId = storeId;
    }

    const claims = await RewardClaim.find(filter).
    populate("storeId", "name slug").
    sort({ createdAt: -1 }).
    limit(100);

    return res.status(200).json({
      claims: claims.map((claim) => ({
        id: claim._id,
        storeName: claim.storeId?.name,
        storeSlug: claim.storeId?.slug,
        message: claim.message,
        status: claim.status,
        createdAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        rejectionReason: claim.rejectionReason
      }))
    });
  } catch (error) {
    console.error("Error fetching reward claims:", error);
    return res.status(500).json({ error: "Failed to fetch claims" });
  }
}