import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Store from "@/models/Store";
import QRCode from "qrcode";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== "StoreAdmin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    const { storeName, storeEmail } = req.body;

    if (!storeName || !storeEmail) {
      return res.status(400).json({ error: "Store name and email are required" });
    }

    // Get store from database
    const store = await Store.findOne({ ownerId: session.user.id });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Generate QR code URL - use current request host for dynamic URL
    const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    const qrCodeUrl = `${baseUrl}/store/${store._id}/claim-reward`;

    // Generate QR code as data URL (base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 2,
      width: 400,
      color: {
        dark: "#014421", // QR code color (brand green)
        light: "#FFFFFF", // Background color
      },
    });

    // Save QR code to store
    store.rewardQRCode = qrCodeDataUrl;
    store.rewardQREmail = storeEmail;
    await store.save();

    return res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl,
      qrUrl: qrCodeUrl,
      message: "Reward QR code generated successfully",
    });
  } catch (error) {
    console.error("Error generating reward QR code:", error);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
}
