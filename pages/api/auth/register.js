// /pages/api/auth/register.js
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import { withPresetRateLimit } from "../../../lib/rate-limit-redis";
import { registerUserSchema } from "../../../lib/validators";
import User from "../../../models/User";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Validate input
    const validatedData = registerUserSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    return res.status(201).json({
      ok: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
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

// Use strict auth rate limiting (5 requests per minute)
export default withPresetRateLimit('auth')(null, null, handler);
