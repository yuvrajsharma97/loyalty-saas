import Store from "../../models/Store";

export async function validateStoreOwnership(userId, storeId = null) {
  if (!storeId) {
    // For StoreAdmin, find their owned store
    const store = await Store.findOne({ ownerId: userId }).lean();
    if (!store) {
      throw new Error("No store found for this user");
    }
    return store._id.toString();
  }

  // Validate ownership of specific store
  const store = await Store.findOne({ _id: storeId, ownerId: userId }).lean();
  if (!store) {
    throw new Error("Store not found or access denied");
  }
  return store._id.toString();
}

export function requireStoreOwnership(req, res, handler) {
  return async (req, res) => {
    try {
      // For StoreAdmin role, validate they own a store
      if (req.user.role === "StoreAdmin") {
        req.storeId = await validateStoreOwnership(req.user.id);
      } else if (req.user.role === "SuperAdmin") {
        // SuperAdmin can access any store, but need to specify which one
        const storeId = req.query.storeId || req.body.storeId;
        if (storeId) {
          req.storeId = storeId;
        } else {
          return res.status(400).json({
            error: "Store ID required for SuperAdmin access",
            code: "STORE_ID_REQUIRED",
          });
        }
      } else {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "FORBIDDEN",
        });
      }

      return handler(req, res);
    } catch (error) {
      return res.status(403).json({
        error: error.message,
        code: "STORE_ACCESS_DENIED",
      });
    }
  };
}
