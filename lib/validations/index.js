import { z } from "zod";

// MongoDB ObjectId validation
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Visit request schema
export const visitRequestSchema = z.object({
  storeId: mongoIdSchema,
  method: z.enum(["qr", "manual"]),
  spend: z.number().min(0).optional(),
});

// Store creation schema
export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Store slug is required").toLowerCase(),
  tier: z.enum(["silver", "gold", "platinum"]).default("silver"),
  rewardConfig: z.object({
    type: z.enum(["visit", "spend", "hybrid"]),
    pointsPerPound: z.number().min(0).default(0),
    pointsPerVisit: z.number().min(0).default(0),
    conversionRate: z.number().default(100),
  }),
});
