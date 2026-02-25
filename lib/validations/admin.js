import { z } from "zod";

const mongoIdSchema = z.
string().
regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1).default(1)),
  limit: z.
  string().
  transform(Number).
  pipe(z.number().min(1).max(100).default(10))
});

const dateRangeSchema = z.
object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
}).
refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: "dateFrom must be before dateTo"
  }
);


export const adminUserFiltersSchema = z.object({
  role: z.enum(["User", "StoreAdmin", "SuperAdmin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  search: z.string().optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Valid email required").optional(),
  role: z.enum(["User", "StoreAdmin", "SuperAdmin"]).optional(),
  isActive: z.boolean().optional()
});

export const adminRoleChangeSchema = z.object({
  newRole: z.enum(["User", "StoreAdmin", "SuperAdmin"]),
  reason: z.string().optional()
});


export const adminStoreFiltersSchema = z.object({
  tier: z.enum(["silver", "gold", "platinum"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  search: z.string().optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
});

export const adminStoreUpdateSchema = z.object({
  name: z.string().min(1, "Store name required").optional(),
  tier: z.enum(["silver", "gold", "platinum"]).optional(),
  isActive: z.boolean().optional(),
  rewardConfig: z.
  object({
    type: z.enum(["visit", "spend", "hybrid"]),
    pointsPerPound: z.number().min(0),
    pointsPerVisit: z.number().min(0),
    conversionRate: z.number().min(1)
  }).
  optional()
});

export const adminTierChangeSchema = z.object({
  newTier: z.enum(["silver", "gold", "platinum"]),
  reason: z.string().optional()
});


export const adminAnalyticsSchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
  storeIds: z.array(mongoIdSchema).optional()
});

export const adminExportSchema = z.object({
  type: z.enum(["users", "stores", "visits", "redemptions"]),
  format: z.enum(["csv", "excel"]).default("csv"),
  ...dateRangeSchema.shape,
  filters: z.record(z.any()).optional()
});


export const adminBulkUserActionSchema = z.object({
  action: z.enum(["suspend", "activate", "delete", "changeRole"]),
  userIds: z.array(mongoIdSchema).min(1),
  params: z.record(z.any()).optional()
});

export const adminBulkStoreActionSchema = z.object({
  action: z.enum(["suspend", "activate", "delete", "changeTier"]),
  storeIds: z.array(mongoIdSchema).min(1),
  params: z.record(z.any()).optional()
});


export const adminPlatformConfigSchema = z.object({
  siteName: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
  maxStoresPerOwner: z.number().min(1).optional(),
  pointsExpiryDays: z.number().min(0).optional()
});

export const adminTierConfigSchema = z.object({
  silver: z.
  object({
    maxUsers: z.number().min(1),
    features: z.array(z.string()),
    price: z.number().min(0)
  }).
  optional(),
  gold: z.
  object({
    maxUsers: z.number().min(1),
    features: z.array(z.string()),
    price: z.number().min(0)
  }).
  optional(),
  platinum: z.
  object({
    maxUsers: z.number().min(1),
    features: z.array(z.string()),
    price: z.number().min(0)
  }).
  optional()
});


export const storeOwnerCreateSchema = z.object({
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Valid email required"),
  storeName: z.string().min(1, "Store name is required"),
  storeSlug: z.
  string().
  min(1, "Store slug is required").
  regex(
    /^[a-z0-9-]+$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  ),
  storeLocation: z.string().optional()
});


export const storeTierChangeSchema = z.object({
  newTier: z.enum(["silver", "gold", "platinum"]),
  reason: z.string().optional()
});


export const rewardConfigOverrideSchema = z.object({
  type: z.enum(["spend", "visit", "hybrid"]),
  pointsPerPound: z.number().min(0),
  pointsPerVisit: z.number().min(0),
  conversionRate: z.number().min(0.01),
  reason: z.string().optional()
});


export const userStatusChangeSchema = z.object({
  status: z.enum(["active", "suspended"]),
  reason: z.string().optional()
});


export const storeStatusChangeSchema = z.object({
  status: z.enum(["active", "suspended"]),
  reason: z.string().optional()
});