import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { requireUser } from "../../../../middleware/auth";
import { profileUpdateSchema } from "../../../../lib/validations";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    if (req.method === "GET") {
      try {
        const user = await User.findById(req.user.id).
        select("-passwordHash").
        lean();

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        });
      } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else if (req.method === "PUT") {
      try {
        const updateData = profileUpdateSchema.parse(req.body);

        const user = await User.findByIdAndUpdate(
          req.user.id,
          { $set: updateData },
          { new: true, runValidators: true }
        ).select("-passwordHash");

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          message: "Profile updated successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            preferences: user.preferences
          }
        });
      } catch (error) {
        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}