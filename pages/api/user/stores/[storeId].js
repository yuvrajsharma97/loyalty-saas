import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { requireUser } from "../../../../middleware/auth";

export default async function handler(req, res) {
  await connectDB();

  return requireUser(req, res, async (req, res) => {
    const { storeId } = req.query;

    if (req.method === "DELETE") {
      try {
        const user = await User.findById(req.user.id);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Remove from connected stores
        user.connectedStores = user.connectedStores.filter(
          (id) => id.toString() !== storeId
        );

        // Keep points for historical purposes - don't remove from pointsByStore

        await user.save();

        res.json({ message: "Successfully left store" });
      } catch (error) {
        console.error("Leave store error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
