import { z } from "zod";

export const offerCodeSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(25, "Code must be at most 25 characters")
    .transform((val) => val.trim().toUpperCase()),
  discount_type: z.enum(["percent", "flat"]),
  discount_value: z.number().min(1, "Discount value must be greater than 0"),
  min_order_amount: z.number().min(0).default(0),
  expires_at: z.string().min(1, "Expiry date/time is required"),
  description: z.string().max(200).optional(),
  is_active: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  usage_limit: z.number().min(1).optional(),
  used_count: z.number().default(0).optional(),
});

export const validateOfferCodeSchema = z.object({
  code: z.string().transform((val) => val.trim().toUpperCase()),
  subtotal: z.number().min(0),
});

export const claimGameCouponSchema = z.object({
  gameId: z.string().min(1),
  gameName: z.string().min(1),
});

export type OfferCodeInput = z.infer<typeof offerCodeSchema>;
export type ValidateOfferCodeInput = z.infer<typeof validateOfferCodeSchema>;
export type ClaimGameCouponInput = z.infer<typeof claimGameCouponSchema>;
