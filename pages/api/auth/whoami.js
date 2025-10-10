// /pages/api/auth/whoami.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import logger, { loggers } from "../../../lib/logger";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ ok: false, error: "Unauthenticated" });
    }

    return res.status(200).json({
      ok: true,
      data: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        storeId: session.user.storeId,
        storeIdsOwned: session.user.storeIdsOwned,
      },
    });
  } catch (error) {
    loggers.logError(error, { context: "Whoami error" });
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
