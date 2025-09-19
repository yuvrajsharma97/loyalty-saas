import { connectDB } from "../../../lib/db";
import { requireStoreAdmin } from "../../../middleware/auth";
import { requireStoreOwnership } from "../../../lib/utils/storeAuth";
import Store from "../../../models/Store";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  return requireStoreAdmin(
    req,
    res,
    requireStoreOwnership(req, res, async (req, res) => {
      try {
        const storeId = new mongoose.Types.ObjectId(req.storeId);

        // Generate new QR code
        const newQrCode = uuidv4();

        const store = await Store.findByIdAndUpdate(
          storeId,
          { qrCode: newQrCode },
          { new: true }
        );

        if (!store) {
          return res.status(404).json({ error: "Store not found" });
        }

        res.json({
          message: "QR code generated successfully",
          qrCode: newQrCode,
          qrUrl: `${process.env.NEXTAUTH_URL}/visit/${store.slug}?qr=${newQrCode}`,
        });
      } catch (error) {
        console.error("Generate QR code error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })
  );
}
