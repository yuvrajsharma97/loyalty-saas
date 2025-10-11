// /pages/api/auth/password/reset.js
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { withPresetRateLimit } from "../../../../lib/rate-limit-redis";
import { resetPasswordSchema } from "../../../../lib/validators";
import User from "../../../../models/User";
import PasswordReset from "../../../../models/PasswordReset";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, newPassword } = validatedData;

    // Connect to database
    await connectDB();

    // Find valid reset token
    const resetRecord = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid or expired token" });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(resetRecord.userId, {
      passwordHash,
    });

    // Delete the used token
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error.message || error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }

    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

// Use auth rate limiting (5 requests per minute)
export default withPresetRateLimit('auth')(null, null, handler);
