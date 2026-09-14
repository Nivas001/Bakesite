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

/**
 * Whether write failures may fall back to the in-process list.
 *
 * That fallback is useful locally, where the Appwrite collection may not exist
 * yet. In production it is actively harmful: the array is per-isolate and lost
 * on recycle, so a failed write reported success and the code later did not
 * exist — and a genuine outage looked like everything was fine.
 */
const allowMemoryFallback = process.env["NODE_ENV"] !== "production";

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
  } catch (error) {
    if (!allowMemoryFallback) throw error;
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
  } catch (error) {
    if (!allowMemoryFallback) throw error;
    memoryCodes = memoryCodes.filter((c) => c.id !== id && c.$id !== id);
  }
  return { ok: true as const };
}

export async function validatePromoCode(input: ValidateOfferCodeInput) {
  const codes = await fetchOfferCodes();
  const code = codes.find((c) => c.code.toUpperCase() === input.code.toUpperCase().trim());

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
    throw new Error(`Minimum order of ₹${code.min_order_amount} required to use "${code.code}".`);
  }

  let discountAmount = 0;
  if (code.discount_type === "percent") {
    discountAmount = Math.round(input.subtotal * (code.discount_value / 100) * 100) / 100;
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

/**
 * Reserves one use of a code.
 *
 * Re-reads the current count immediately before writing and refuses if the
 * limit has been reached in the meantime, so the gap between validating a code
 * at checkout and consuming it is as small as it can be without a transaction.
 * Failures now propagate: swallowing them meant a single-use voucher could be
 * spent repeatedly without the count ever moving.
 */
export async function markOfferCodeUsed(codeString: string) {
  if (!codeString) return;
  const codes = await fetchOfferCodes();
  const code = codes.find((c) => c.code.toUpperCase() === codeString.toUpperCase().trim());
  if (!code) throw new Error(`Promo code "${codeString}" is no longer available.`);

  const usedCount = code.used_count ?? 0;
  if (code.usage_limit && usedCount >= code.usage_limit) {
    throw new Error(`Voucher code "${code.code}" has already been redeemed.`);
  }

  const newUsedCount = usedCount + 1;
  const updatePayload = {
    used_count: newUsedCount,
    is_active: code.usage_limit ? newUsedCount < code.usage_limit : true,
  };

  const docId = code.id || code.$id;
  if (!docId) return;

  try {
    await updateDoc(COLLECTIONS.offerCodes, docId, updatePayload);
  } catch (error) {
    if (!allowMemoryFallback) throw error;
    memoryCodes = memoryCodes.map((c) =>
      c.id === docId || c.$id === docId ? { ...c, ...updatePayload } : c,
    );
  }
}

/**
 * Gives a reserved use back, for when the order it was reserved for failed.
 * Never lets the count fall below zero, and re-opens a code the reservation
 * had closed.
 */
export async function releaseOfferCodeUse(codeString: string) {
  if (!codeString) return;
  const codes = await fetchOfferCodes();
  const code = codes.find((c) => c.code.toUpperCase() === codeString.toUpperCase().trim());
  if (!code) return;

  const newUsedCount = Math.max(0, (code.used_count ?? 1) - 1);
  const updatePayload = {
    used_count: newUsedCount,
    is_active: code.usage_limit ? newUsedCount < code.usage_limit : true,
  };

  const docId = code.id || code.$id;
  if (!docId) return;

  try {
    await updateDoc(COLLECTIONS.offerCodes, docId, updatePayload);
  } catch (error) {
    if (!allowMemoryFallback) throw error;
    memoryCodes = memoryCodes.map((c) =>
      c.id === docId || c.$id === docId ? { ...c, ...updatePayload } : c,
    );
  }
}

const VOUCHER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Derives the voucher suffix from the player and the game rather than from
 * `Math.random`.
 *
 * A random suffix meant every replay minted another live discount code, so a
 * script could mint them without limit. Deriving it deterministically caps each
 * account at one voucher per game: replaying returns the code they already hold
 * instead of issuing a new one.
 */
async function voucherSuffix(userId: string, gameId: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${userId}:${gameId}:ani-bakes-arcade`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += VOUCHER_ALPHABET.charAt(digest[i]! % VOUCHER_ALPHABET.length);
  }
  return suffix;
}

/** Issues (or re-returns) the single-use 15% voucher this player won. */
export async function generateGameWinnerVoucher(userId: string, input: ClaimGameCouponInput) {
  const prefix =
    input.gameId === "quiz" ? "QUIZ15" : input.gameId === "memory" ? "MATCH15" : "SPIN15";
  const voucherCode = `${prefix}-${await voucherSuffix(userId, input.gameId)}`;
  const description = `15% off winner voucher from ${input.gameName} (single use)`;

  // Already won this game before: hand back the same code untouched, so a
  // replay cannot reset a voucher that has already been redeemed.
  const existing = (await fetchOfferCodes()).find((c) => c.code === voucherCode);
  if (existing) {
    return {
      ok: true as const,
      code: existing.code,
      discountPercent: Number(existing.discount_value),
      expiresAt: existing.expires_at,
      description: existing.description,
      gameName: input.gameName,
      alreadyClaimed: true as const,
    };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const voucherData: OfferCodeInput = {
    code: voucherCode,
    discount_type: "percent",
    discount_value: 15,
    min_order_amount: 200,
    expires_at: expiresAt,
    description,
    is_active: true,
    is_visible: false, // never listed publicly
    usage_limit: 1,
    used_count: 0,
  };

  await upsertOfferCode(voucherData);

  return {
    ok: true as const,
    code: voucherCode,
    discountPercent: 15,
    expiresAt,
    description,
    gameName: input.gameName,
    alreadyClaimed: false as const,
  };
}
