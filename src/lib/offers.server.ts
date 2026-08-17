import {
  COLLECTIONS,
  Q,
  createDoc,
  deleteDoc,
  listDocs,
  updateDoc,
} from "@/integrations/appwrite/admin.server";
import type { ClaimGameCouponInput, OfferCodeInput, ValidateOfferCodeInput } from "./offers.schema";

export type OfferCodeDoc = {
  $id?: string | undefined;
  id?: string | undefined;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order_amount: number;
  expires_at: string;
  description: string | null;
  is_active: boolean;
  is_visible: boolean;
  usage_limit?: number | undefined;
  used_count?: number | undefined;
  $createdAt?: string | undefined;
};

// Default seed codes if database is freshly started
const SEED_OFFER_CODES: OfferCodeDoc[] = [
  {
    id: "promo_welcome10",
    code: "WELCOME10",
    discount_type: "percent",
    discount_value: 10,
    min_order_amount: 200,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: "10% off on orders above ₹200",
    is_active: true,
    is_visible: true,
    usage_limit: 10000,
    used_count: 0,
  },
  {
    id: "promo_sweet50",
    code: "SWEET50",
    discount_type: "flat",
    discount_value: 50,
    min_order_amount: 350,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Flat ₹50 off on artisan bakes above ₹350",
    is_active: true,
    is_visible: true,
    usage_limit: 10000,
    used_count: 0,
  },
];

let memoryCodes: OfferCodeDoc[] = [...SEED_OFFER_CODES];

export async function fetchOfferCodes(): Promise<OfferCodeDoc[]> {
  try {
    const docs = await listDocs<OfferCodeDoc>(COLLECTIONS.offerCodes, [
      Q.orderDesc("$createdAt"),
      Q.limit(200),
    ]);
    if (docs.length > 0) {
      return docs.map((d) => ({
        id: d.$id,
        code: d.code,
        discount_type: d.discount_type,
        discount_value: Number(d.discount_value),
        min_order_amount: Number(d.min_order_amount ?? 0),
        expires_at: d.expires_at,
        description: d.description ?? null,
        is_active: d.is_active !== undefined ? Boolean(d.is_active) : true,
        is_visible: d.is_visible !== undefined ? Boolean(d.is_visible) : true,
        usage_limit: d.usage_limit ? Number(d.usage_limit) : undefined,
        used_count: d.used_count ? Number(d.used_count) : 0,
      }));
    }
  } catch {
    // If Appwrite collection doesn't exist yet, fall back seamlessly
  }
  return memoryCodes;
}

/** Publicly visible active promo codes for the /offers page */
export async function fetchActiveOfferCodes(): Promise<OfferCodeDoc[]> {
  const codes = await fetchOfferCodes();
  const now = Date.now();
  return codes.filter(
    (c) => c.is_active && c.is_visible !== false && new Date(c.expires_at).getTime() > now,
  );
}

export async function upsertOfferCode(input: OfferCodeInput) {
  const payload = {
    code: input.code.toUpperCase().trim(),
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    min_order_amount: input.min_order_amount ?? 0,
    expires_at: input.expires_at,
    description: input.description ?? null,
    is_active: input.is_active ?? true,
    is_visible: input.is_visible ?? true,
    usage_limit: input.usage_limit ?? 10000,
    used_count: input.used_count ?? 0,
  };

  try {
    if (input.id) {
      await updateDoc(COLLECTIONS.offerCodes, input.id, payload);
    } else {
      await createDoc(COLLECTIONS.offerCodes, payload);
    }
  } catch {
    // Memory fallback
    if (input.id) {
      memoryCodes = memoryCodes.map((c) =>
        c.id === input.id ? { ...c, ...payload, id: input.id } : c,
      );
    } else {
      memoryCodes = [{ id: `code_${Date.now()}`, ...payload }, ...memoryCodes];
    }
  }

  return { ok: true as const };
}

export async function removeOfferCode(id: string) {
  try {
    await deleteDoc(COLLECTIONS.offerCodes, id);
  } catch {
    memoryCodes = memoryCodes.filter((c) => c.id !== id && c.$id !== id);
  }
  return { ok: true as const };
}

export async function validatePromoCode(input: ValidateOfferCodeInput) {
  const codes = await fetchOfferCodes();
  const code = codes.find(
    (c) => c.code.toUpperCase() === input.code.toUpperCase().trim(),
  );

  if (!code) {
    throw new Error(`Promo code "${input.code}" not found.`);
  }

  if (!code.is_active) {
    throw new Error(`Promo code "${code.code}" has already been used or is inactive.`);
  }

  // Single-use enforcement
  if (code.usage_limit && (code.used_count ?? 0) >= code.usage_limit) {
    throw new Error(`Voucher code "${code.code}" has already reached its 1-time redemption limit.`);
  }

  const expiryTime = new Date(code.expires_at).getTime();
  if (expiryTime <= Date.now()) {
    const formattedDate = new Date(code.expires_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    throw new Error(`Promo code "${code.code}" expired on ${formattedDate}.`);
  }

  if (code.min_order_amount > 0 && input.subtotal < code.min_order_amount) {
    throw new Error(
      `Minimum order of ₹${code.min_order_amount} required to use "${code.code}".`,
    );
  }

  let discountAmount = 0;
  if (code.discount_type === "percent") {
    discountAmount = Math.round((input.subtotal * (code.discount_value / 100)) * 100) / 100;
  } else if (code.discount_type === "flat") {
    discountAmount = Math.min(input.subtotal, code.discount_value);
  }

  return {
    valid: true as const,
    code: code.code,
    discountType: code.discount_type,
    discountValue: code.discount_value,
    discountAmount,
    description: code.description,
  };
}

/** Increments used_count and closes single-use voucher codes upon completed order placement */
export async function markOfferCodeUsed(codeString: string) {
  if (!codeString) return;
  const codes = await fetchOfferCodes();
  const code = codes.find((c) => c.code.toUpperCase() === codeString.toUpperCase().trim());
  if (!code) return;

  const newUsedCount = (code.used_count ?? 0) + 1;
  const isNowInactive = code.usage_limit ? newUsedCount >= code.usage_limit : false;

  const updatePayload = {
    used_count: newUsedCount,
    is_active: !isNowInactive,
  };

  const docId = code.id || code.$id;
  if (docId) {
    try {
      await updateDoc(COLLECTIONS.offerCodes, docId, updatePayload);
    } catch {
      // Memory fallback
      memoryCodes = memoryCodes.map((c) =>
        (c.id === docId || c.$id === docId) ? { ...c, ...updatePayload } : c,
      );
    }
  }
}

/** Generates a unique, single-use 15% discount voucher for arcade game winners */
export async function generateGameWinnerVoucher(input: ClaimGameCouponInput) {
  // Generate a random 4-letter alphanumeric suffix
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomSuffix = "";
  for (let i = 0; i < 4; i++) {
    randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const prefix = input.gameId === "quiz" ? "QUIZ15" : input.gameId === "memory" ? "MATCH15" : "SPIN15";
  const voucherCode = `${prefix}-${randomSuffix}`;
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7-day validity

  const voucherData: OfferCodeInput = {
    code: voucherCode,
    discount_type: "percent",
    discount_value: 15,
    min_order_amount: 200,
    expires_at: expiryDate,
    description: `15% off Winner Voucher from ${input.gameName} (1-time use only)`,
    is_active: true,
    is_visible: false, // Hidden from public coupon list
    usage_limit: 1, // Strictly single-use!
    used_count: 0,
  };

  await upsertOfferCode(voucherData);

  return {
    ok: true as const,
    code: voucherCode,
    discountPercent: 15,
    expiresAt: expiryDate,
    description: voucherData.description,
    gameName: input.gameName,
  };
}
