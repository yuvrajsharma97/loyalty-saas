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


const visitRequestSchema = z.object({
  storeId: mongoIdSchema,
  method: z.enum(["qr", "manual"]),
  spend: z.number().min(0).max(10000).optional()
});

const profileUpdateSchema = z.object({
  name: z.
  string().
  min(1, "Name is required").
  max(100, "Name too long").
  optional(),
  preferences: z.
  object({
    visitApprovedEmail: z.boolean().optional(),
    rewardEmail: z.boolean().optional(),
    promotionEmail: z.boolean().optional()
  }).
  optional()
});

const joinStoreSchema = z.object({
  storeId: mongoIdSchema
});

const redeemPointsSchema = z.object({
  storeId: mongoIdSchema,
  points: z.
  number().
  min(1, "Points must be at least 1").
  max(100000, "Points limit exceeded")
});


const visitFilterSchema = z.object({
  storeId: mongoIdSchema.optional(),
  method: z.enum(["qr", "manual"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
});


const rewardsFilterSchema = z.object({
  storeId: mongoIdSchema.optional(),
  type: z.enum(["available", "history"]).optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
});


const analyticsSchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  storeId: mongoIdSchema.optional()
});

export {
  mongoIdSchema,
  paginationSchema,
  dateRangeSchema,
  visitRequestSchema,
  profileUpdateSchema,
  joinStoreSchema,
  redeemPointsSchema,
  visitFilterSchema,
  rewardsFilterSchema,
  analyticsSchema };