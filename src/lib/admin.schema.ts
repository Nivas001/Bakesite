import { z } from "zod";

const id = z.string().trim().min(1).max(64);

export const ORDER_STATUSES = [
  "pending_approval",
  "awaiting_payment",
  "confirmed",
  "rescheduled",
  "completed",
  "rejected",
] as const;

export const orderStatusSchema = z.object({
  orderId: id,
  status: z.enum(ORDER_STATUSES),
});

export const rescheduleOrderSchema = z.object({
  orderId: id,
  newSlotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newSlotId: z.string().min(1),
  reason: z.string().trim().max(300).optional(),
});

export const productSchema = z.object({
  id: id.optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "URL slug must be at least 2 characters")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  description: z.string().trim().max(600, "Description must be under 600 characters").optional().nullable(),
  price: z.number().min(0, "Price must be greater than or equal to 0").max(100000),
  discount_type: z.enum(["none", "percent", "flat"]),
  discount_value: z.number().min(0).max(100000),
  image_url: z.string().trim().max(1500).nullable().optional(),
  stock: z.number().int().min(0).max(10000),
  is_active: z.boolean(),
  category_id: id.nullable().optional(),
  item_type: z.enum(["weight", "unit", "pack"]).optional().nullable(),
  unit_weight_grams: z.number().min(0).max(50000).optional().nullable(),
  serving_yield: z.string().trim().max(200).optional().nullable(),
  weight_variants: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        label: z.string().trim().min(1),
        weight_grams: z.number().min(0),
        price: z.number().min(0),
        serves: z.string().trim().optional().nullable(),
        savings_label: z.string().trim().optional().nullable(),
      }),
    )
    .optional()
    .nullable(),
});

export const blackoutSchema = z.object({
  blackout_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(200).optional(),
});

export const CAMPAIGN_TYPES = ["announcement", "weekly_special", "promotion"] as const;

export const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject").max(160),
  body: z.string().trim().min(10, "Write a little more").max(5000),
  campaign_type: z.enum(CAMPAIGN_TYPES).default("announcement").optional(),
  cta_label: z.string().trim().max(60).optional().nullable(),
  cta_url: z.string().trim().max(300).optional().nullable(),
  attachment_b64: z.string().optional().nullable(),
  attachment_name: z.string().trim().max(120).optional().nullable(),
  attachment_mime: z.string().trim().max(80).optional().nullable(),

  // Featured Bake / Cake Showcase
  showcase_enabled: z.boolean().default(false).optional(),
  showcase_image: z.string().trim().max(800).optional().nullable(),
  showcase_title: z.string().trim().max(160).optional().nullable(),
  showcase_tag: z.string().trim().max(60).optional().nullable(),
  showcase_description: z.string().trim().max(600).optional().nullable(),
  showcase_layout: z.enum(["side_by_side", "stacked"]).default("side_by_side").optional(),
  showcase_link: z.string().trim().max(300).optional().nullable(),
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

export const categoryOrderSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().trim().min(1),
      sort_order: z.number().int().min(0),
      layout_rows: z.number().int().min(1).max(4).optional(),
    }),
  ),
});

export const categoryLayoutSchema = z.object({
  categoryId: z.string().trim().min(1),
  layout_rows: z.number().int().min(1).max(4),
});

export const productSequenceSchema = z.object({
  products: z.array(
    z.object({
      id: z.string().trim().min(1),
      sort_order: z.number().int().min(0),
    }),
  ),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryOrderInput = z.infer<typeof categoryOrderSchema>;
export type ProductSequenceInput = z.infer<typeof productSequenceSchema>;