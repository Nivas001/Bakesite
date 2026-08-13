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
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;