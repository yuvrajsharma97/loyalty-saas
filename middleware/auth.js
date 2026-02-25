import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

const getAuthenticatedUser = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return null;
  }

  return session.user;
};

const requireAuth = async (req, res, handler) => {
  const user = await getAuthenticatedUser(req, res);

  if (!user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "UNAUTHORIZED"
    });
  }

  req.user = user;
  return handler(req, res);
};

const requireRole = (allowedRoles) => async (req, res, handler) => {
  return requireAuth(req, res, async (req, res) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        required: allowedRoles,
        current: req.user.role
      });
    }
    return handler(req, res);
  });
};


const requireUser = (req, res, handler) =>
requireRole(["User", "StoreAdmin", "SuperAdmin"])(req, res, handler);

const requireStoreAdmin = (req, res, handler) =>
requireRole(["StoreAdmin", "SuperAdmin"])(req, res, handler);

const requireSuperAdmin = (req, res, handler) =>
requireRole(["SuperAdmin"])(req, res, handler);

export {
  requireAuth,
  requireRole,
  requireUser,
  requireStoreAdmin,
  requireSuperAdmin,
  getAuthenticatedUser };