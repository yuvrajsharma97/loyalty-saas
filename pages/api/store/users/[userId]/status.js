import { connectDB } from "../../../../../lib/db";
import { requireStoreAdmin } from "../../../../../middleware/auth";
import { requireStoreOwnership } from "../../../../../lib/utils/storeAuth";
import User from "../../../../../models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const { userId } = req.query;
        const { action } = req.body; // "suspend" or "activate"

        if (!["suspend", "activate"].includes(action)) {
          return res.status(400).json({
            error: "Invalid action. Use 'suspend' or 'activate'",
          });
        }

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // For suspension, remove user from connected stores
        // For activation, add user back to connected stores
        const updateOperation =
          action === "suspend"
            ? { $pull: { connectedStores: storeId } }
            : { $addToSet: { connectedStores: storeId } };

        const user = await User.findByIdAndUpdate(userId, updateOperation, {
          new: true,
        }).select("name email connectedStores");

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          message: `User ${action}d successfully`,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            status: action === "suspend" ? "suspended" : "active",
          },
        });
      } catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
