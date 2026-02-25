
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { withRateLimit } from "../../../../lib/rate-limit";
import { resetPasswordSchema } from "../../../../lib/validators";
import User from "../../../../models/User";
import PasswordReset from "../../../../models/PasswordReset";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {

    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, newPassword } = validatedData;


    await connectDB();


    const resetRecord = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.
      status(400).
      json({ ok: false, error: "Invalid or expired token" });
    }


    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);


    await User.findByIdAndUpdate(resetRecord.userId, {
      passwordHash
    });


    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        error: "Invalid input data",
        details: error.errors
      });
    }

    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

export default withRateLimit(handler, { max: 5, windowMs: 60_000 });