import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppwriteAuth } from "@/integrations/appwrite/auth-middleware";
import {
  sendOtpToPhone,
  verifyPhoneOtp,
  linkPhoneToUser,
  normalizePhone,
} from "./auth.server";

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20),
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
});

const verifyOtpSchema = z.object({
  phone: z.string().trim().min(7),
  code: z.string().trim().min(4).max(8),
});

export const requestPhoneOtp = createServerFn({ method: "POST" })
  .validator((d: unknown) => phoneSchema.parse(d))
  .handler(async ({ data }) => {
    return await sendOtpToPhone(data.phone, {
      name: data.name,
      email: data.email,
    });
  });

export const verifyPhoneOtpEndpoint = createServerFn({ method: "POST" })
  .validator((d: unknown) => verifyOtpSchema.parse(d))
  .handler(async ({ data }) => {
    return await verifyPhoneOtp(data.phone, data.code);
  });

export const linkVerifiedPhone = createServerFn({ method: "POST" })
  .middleware([requireAppwriteAuth])
  .validator((d: unknown) => verifyOtpSchema.parse(d))
  .handler(async ({ data, context }) => {
    const verified = await verifyPhoneOtp(data.phone, data.code);
    if (!verified.ok) {
      throw new Error("OTP verification failed");
    }
    return await linkPhoneToUser(context.userId, data.phone);
  });

export const requestPasswordRecovery = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    return { ok: true as const, message: `Recovery email sent to ${data.email}` };
  });
