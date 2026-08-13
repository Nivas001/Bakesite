import { z } from "zod";

const id = z.string().trim().min(1).max(64);

export const ORDER_STATUSES = [
  "pending_approval",
  "awaiting_payment",
  "confirmed",
  "completed",
  "rejected",
] as const;

export const orderStatusSchema = z.object({
  orderId: id,
  status: z.enum(ORDER_STATUSES),
});

export const productSchema = z.object({
  id: id.optional(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  description: z.string().trim().max(600).optional().nullable(),
  price: z.number().min(0).max(100000),
  discount_type: z.enum(["none", "percent", "flat"]),
  discount_value: z.number().min(0).max(100000),
  image_url: z.string().trim().max(500).nullable().optional(),
  stock: z.number().int().min(0).max(10000),
  is_active: z.boolean(),
  category_id: id.nullable().optional(),
});

export const blackoutSchema = z.object({
  blackout_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(200).optional(),
});

export const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject").max(160),
  body: z.string().trim().min(10, "Write a little more").max(5000),
});

export const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(200),
  name: z.string().trim().max(120).optional(),
});

export const reviewSchema = z.object({
  productId: id,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;