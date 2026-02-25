import { connectDB } from "../../../lib/db";
import { requireStoreAdmin } from "../../../middleware/auth";
import { requireStoreOwnership } from "../../../lib/utils/storeAuth";
import { storeStatusSchema } from "../../../lib/validations/store";
import Store from "../../../models/Store";
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
        const validatedData = storeStatusSchema.parse(req.body);
        const { isActive } = validatedData;

        const storeId = new mongoose.Types.ObjectId(req.storeId);

        const store = await Store.findByIdAndUpdate(
          storeId,
          { isActive },
          { new: true }
        );

        if (!store) {
          return res.status(404).json({ error: "Store not found" });
        }

        res.json({
          message: `Loyalty program ${
          isActive ? "activated" : "paused"} successfully`,

          store: {
            id: store._id,
            name: store.name,
            isActive: store.isActive
          }
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        console.error("Update store status error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}