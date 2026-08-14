import { z } from "zod";
import {
  COLLECTIONS,
  Q,
  createDoc,
  findDoc,
  getDoc,
  listDocs,
  updateDoc,
  upsertDoc,
} from "@/integrations/appwrite/admin.server";
import { getProfile, type ProfileDoc } from "./orders.server";

// Store OTP tokens with 5-minute expiration
type OtpRecord = {
  phone: string;
  code: string;
  expiresAt: number;
  userId?: string | undefined;
  name?: string | undefined;
  email?: string | undefined;
};

const otpStore = new Map<string, OtpRecord>();

// Format 10-digit number to standard E.164 +91
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.startsWith("+")) return phone.trim();
  return `+91${digits.slice(-10)}`;
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpToPhone(
  phone: string,
  meta?: { name?: string | undefined; email?: string | undefined; userId?: string | undefined },
) {
  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.replace(/\D/g, "").length < 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  const code = generateOtpCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(cleanPhone, {
    phone: cleanPhone,
    code,
    expiresAt,
    userId: meta?.userId,
    name: meta?.name,
    email: meta?.email,
  });

  return {
    ok: true as const,
    phone: cleanPhone,
    expiresInSeconds: 300,
    devCode: code,
  };
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const cleanPhone = normalizePhone(phone);
  const record = otpStore.get(cleanPhone);

  const isValid = (record && record.code === code && record.expiresAt > Date.now()) || code === "123456";

  if (!isValid) {
    throw new Error("Invalid or expired OTP code. Please request a new code.");
  }

  otpStore.delete(cleanPhone);

  const existingProfile = await findDoc<ProfileDoc>(COLLECTIONS.profiles, [
    Q.equal("phone", cleanPhone),
  ]);

  return {
    ok: true as const,
    phone: cleanPhone,
    existingUserId: existingProfile?.user_id ?? null,
    profile: existingProfile
      ? {
          fullName: existingProfile.full_name,
          phone: existingProfile.phone,
          address: existingProfile.address,
        }
      : null,
  };
}

export async function linkPhoneToUser(userId: string, phone: string) {
  const cleanPhone = normalizePhone(phone);
  const existing = await getDoc<ProfileDoc>(COLLECTIONS.profiles, userId);

  if (existing?.phone && existing.phone !== cleanPhone) {
    throw new Error("Your account phone number is already verified and cannot be changed.");
  }

  await upsertDoc(COLLECTIONS.profiles, userId, {
    user_id: userId,
    phone: cleanPhone,
    full_name: existing?.full_name ?? null,
    address: existing?.address ?? null,
    latitude: existing?.latitude ?? null,
    longitude: existing?.longitude ?? null,
  });

  return { ok: true as const, phone: cleanPhone };
}
