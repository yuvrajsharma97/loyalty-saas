import { z } from "zod";

export const storeVisitsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  method: z.enum(["qr", "manual"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "spend", "points"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const visitApprovalSchema = z.object({
  reason: z.string().optional(),
  manualPoints: z.number().min(0).optional(),
});

export const visitRejectionSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export const manualVisitSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  spend: z.number().min(0, "Spend must be non-negative"),
  method: z.literal("manual"),
  notes: z.string().optional(),
});

export const userInviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
});

export const pointsAdjustmentSchema = z.object({
  points: z.number().int("Points must be an integer"),
  reason: z.string().min(1, "Reason is required"),
});

export const storeProfileUpdateSchema = z.object({
  name: z.string().min(1, "Store name is required").optional(),
  rewardConfig: z
    .object({
      type: z.enum(["visit", "spend", "hybrid"]),
      pointsPerPound: z.number().min(0),
      pointsPerVisit: z.number().min(0),
      conversionRate: z.number().min(1),
    })
    .optional(),
});

export const storeStatusSchema = z.object({
  isActive: z.boolean(),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});
