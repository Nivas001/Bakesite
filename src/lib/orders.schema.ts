import { z } from "zod";

const id = z.string().trim().min(1).max(64);

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  address: z.string().trim().min(8, "Please enter your full address").max(500),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: id,
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, "Your cart is empty")
    .max(30),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: z.string().min(1),
  fulfilmentType: z.enum(["delivery", "pickup"]),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(20),
  address: z.string().trim().max(500),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  notes: z.string().trim().max(500).optional(),
  promoCode: z.string().trim().max(30).optional(),
  promoDiscount: z.number().min(0).optional(),
});

export const cancelRescheduledOrderSchema = z.object({
  orderId: id,
  reason: z.string().trim().min(2, "Please provide a reason for cancelling").max(300),
});

export const reportOrderIssueSchema = z.object({
  orderId: id,
  category: z.enum([
    "damaged_packaging",
    "missing_items",
    "wrong_items",
    "taste_freshness",
    "delivery_delay",
    "other",
  ]),
  description: z.string().trim().min(5, "Please provide more details regarding the issue").max(600),
  preferredResolution: z.enum(["refund", "replacement_batch", "callback_support"]),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type CancelRescheduledOrderInput = z.infer<typeof cancelRescheduledOrderSchema>;
export type ReportOrderIssueInput = z.infer<typeof reportOrderIssueSchema>;