import {
  COLLECTIONS,
  Q,
  createDoc,
  deleteDoc,
  listDocs,
  updateDoc,
} from "@/integrations/appwrite/admin.server";
import type { OfferCodeInput, ValidateOfferCodeInput } from "./offers.schema";

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
  },
];

let memoryCodes: OfferCodeDoc[] = [...SEED_OFFER_CODES];

export async function fetchOfferCodes(): Promise<OfferCodeDoc[]> {
  try {
    const docs = await listDocs<OfferCodeDoc>(COLLECTIONS.offerCodes, [
      Q.orderDesc("$createdAt"),
      Q.limit(100),
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
        is_active: Boolean(d.is_active),
      }));
    }
  } catch {
    // If Appwrite collection doesn't exist yet, fall back seamlessly
  }
  return memoryCodes;
}

export async function fetchActiveOfferCodes(): Promise<OfferCodeDoc[]> {
  const codes = await fetchOfferCodes();
  const now = Date.now();
  return codes.filter((c) => c.is_active && new Date(c.expires_at).getTime() > now);
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
    throw new Error(`Promo code "${code.code}" is currently inactive.`);
  }

  const expiryTime = new Date(code.expires_at).getTime();
  if (expiryTime <= Date.now()) {
    const formattedDate = new Date(code.expires_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    throw new Error(`Promo code "${code.code}" has expired on ${formattedDate}.`);
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
