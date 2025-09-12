// /pages/api/auth/password/forgot.js
import { nanoid } from "nanoid";
import { connectDB } from "../../../../lib/db";
import { withRateLimit } from "../../../../lib/rate-limit";
import { forgotPasswordSchema } from "../../../../lib/validators";
import { sendEmail, passwordResetTemplate } from "../../../../lib/email";
import User from "../../../../models/User";
import PasswordReset from "../../../../models/PasswordReset";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Validate input
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email });

    if (user) {
      // Delete any existing reset tokens for this user
      await PasswordReset.deleteMany({ userId: user._id });

      // Create new reset token
      const token = nanoid(48);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await PasswordReset.create({
        userId: user._id,
        token,
        expiresAt,
      });

      // Send email
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: passwordResetTemplate({ appUrl, token }),
      });
    }

    // Always return success to prevent email enumeration
    return res.status(200).json({
      ok: true,
      message: "If the account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

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

export default withRateLimit(handler, { max: 3, windowMs: 60_000 });
