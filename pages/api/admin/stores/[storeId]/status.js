import { connectDB } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../middleware/auth";
import { storeStatusChangeSchema } from "../../../../../lib/validations/admin";
import { mongoIdSchema } from "../../../../../lib/validations";
import Store from "../../../../../models/Store";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.
    status(405).
    json({ success: false, error: "Method not allowed" });
  }

  return requireSuperAdmin(req, res, async (req, res) => {
    try {
      const { storeId } = req.query;
      const validatedStoreId = mongoIdSchema.parse(storeId);
      const { status, reason } = storeStatusChangeSchema.parse(req.body);

      await connectDB();

      const store = await Store.findById(validatedStoreId);
      if (!store) {
        return res.status(404).json({
          success: false,
          error: "Store not found"
        });
      }

      const oldStatus = store.isActive ? "active" : "suspended";
      const newStatus = status;

      store.isActive = status === "active";
      await store.save();

      console.log(
        `Status changed for store ${
        store.name}: ${
        oldStatus} -> ${newStatus}. Reason: ${reason || "Not provided"}`
      );

      return res.status(200).json({
        success: true,
        data: {
          storeId: store._id,
          name: store.name,
          oldStatus,
          newStatus,
          updatedAt: new Date()
        },
        message: `Store ${
        newStatus === "active" ? "activated" : "suspended"} successfully`

      });
    } catch (error) {
      console.error("Store status change error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to change store status"
      });
    }
  });
}