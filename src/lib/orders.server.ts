import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  type Doc,
  createDoc,
  deleteDoc,
  findDoc,
  getDoc,
  listDocs,
  upsertDoc,
  updateUserPhone,
  updateUserName,
  getUserById,
} from "@/integrations/appwrite/admin.server";
import { finalPrice } from "./pricing";
import type { ProductDoc } from "./catalog.server";
import { TIME_SLOTS, toISODate, isSlotAvailable } from "./slots";
import { notifyAdminNewOrder, notifyCustomerOrderPlaced } from "./notifications.server";
import { placeOrderSchema, profileSchema, type PlaceOrderInput } from "./orders.schema";

export { placeOrderSchema, profileSchema, type PlaceOrderInput };

export type OrderDoc = {
  user_id: string;
  status: "pending_approval" | "awaiting_payment" | "confirmed" | "rescheduled" | "completed" | "rejected";
  fulfilment_type: string;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  subtotal: number;
  discount_total: number;
  total: number;
  contact_name: string | null;
  contact_phone: string | null;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  notes: string | null;
  payment_link_url: string | null;
  payment_ref: string | null;
  paid_at: string | null;
};

export type OrderItemDoc = {
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type ProfileDoc = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function serializeOrder(order: Doc<OrderDoc>, items: Doc<OrderItemDoc>[]) {
  return {
    id: order.$id,
    status: order.status,
    slot_date: order.slot_date,
    slot_start: order.slot_start,
    slot_end: order.slot_end,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    discount_total: Number(order.discount_total),
    fulfilment_type: order.fulfilment_type,
    contact_name: order.contact_name ?? null,
    contact_phone: order.contact_phone ?? null,
    delivery_address: order.delivery_address ?? null,
    delivery_lat: order.delivery_lat ?? null,
    delivery_lng: order.delivery_lng ?? null,
    notes: order.notes ?? null,
    payment_link_url: order.payment_link_url ?? null,
    paid_at: order.paid_at ?? null,
    created_at: order.$createdAt,
    order_items: items
      .filter((item) => item.order_id === order.$id)
      .map((item) => ({
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        quantity: Number(item.quantity),
        line_total: Number(item.line_total),
      })),
  };
}

export async function loadOrderItems(orderIds: string[]) {
  if (orderIds.length === 0) return [];
  return listDocs<OrderItemDoc>(COLLECTIONS.orderItems, [
    Q.equal("order_id", orderIds),
    Q.limit(1000),
  ]);
}

export async function getProfile(userId: string) {
  const doc = await getDoc<ProfileDoc>(COLLECTIONS.profiles, userId);
  if (!doc) return null;
  return {
    id: doc.$id,
    full_name: doc.full_name ?? null,
    phone: doc.phone ?? null,
    address: doc.address ?? null,
    latitude: doc.latitude ?? null,
    longitude: doc.longitude ?? null,
  };
}

export async function saveProfile(userId: string, input: z.infer<typeof profileSchema>) {
  // 1. Save to Database profiles collection
  await upsertDoc(COLLECTIONS.profiles, userId, {
    user_id: userId,
    full_name: input.full_name,
    phone: input.phone,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  // 2. Also sync to Appwrite Auth User record so it appears in Auth Users table
  if (input.phone && input.phone.startsWith("+")) {
    await updateUserPhone(userId, input.phone);
  }
  if (input.full_name) {
    await updateUserName(userId, input.full_name);
  }

  return { ok: true as const, phone: input.phone };
}

export async function listOrdersForUser(userId: string) {
  const orders = await listDocs<OrderDoc>(COLLECTIONS.orders, [
    Q.equal("user_id", userId),
    Q.orderDesc("$createdAt"),
    Q.limit(100),
  ]);
  const items = await loadOrderItems(orders.map((o) => o.$id));
  return orders.map((order) => serializeOrder(order, items));
}

export async function createOrderForUser(userId: string, input: PlaceOrderInput) {
  if (!input.contactPhone || input.contactPhone.trim().length < 7) {
    throw new Error("A verified contact phone number is required to place an order.");
  }
  if (!input.contactName || input.contactName.trim().length < 2) {
    throw new Error("Full contact name is required to place an order.");
  }

  const slot = TIME_SLOTS.find((s) => s.id === input.slotId);
  if (!slot) throw new Error("Please pick a valid time slot.");

  if (!isSlotAvailable(input.slotDate, slot.start, 24)) {
    throw new Error(
      "Small-batch baking requires at least 24 hours advance notice. Please choose an available time slot.",
    );
  }

  const blackout = await findDoc(COLLECTIONS.blackoutDates, [
    Q.equal("blackout_date", input.slotDate),
  ]);
  if (blackout) throw new Error("The bakery is closed on that date. Please pick another day.");

  const ids = input.items.map((i) => i.productId);
  const products = await listDocs<ProductDoc>(COLLECTIONS.products, [
    Q.equal("$id", ids),
    Q.limit(50),
  ]);

  let subtotal = 0;
  let total = 0;
  const rows = input.items.map((item) => {
    const product = products.find((p) => p.$id === item.productId);
    if (!product || !product.is_active) {
      throw new Error("One of the items is no longer available.");
    }
    const base = Number(product.price);
    const unit = finalPrice(base, product.discount_type, Number(product.discount_value));
    subtotal += base * item.quantity;
    total += unit * item.quantity;
    return {
      product_id: product.$id,
      product_name: product.name,
      unit_price: unit,
      quantity: item.quantity,
      line_total: Math.round(unit * item.quantity * 100) / 100,
    };
  });

  let promoDiscount = 0;
  if (input.promoCode) {
    try {
      const { validatePromoCode } = await import("./offers.server");
      const promoResult = await validatePromoCode({
        code: input.promoCode,
        subtotal: total,
      });
      promoDiscount = promoResult.discountAmount;
    } catch {
      // Continue if promo validation fails on edge cases
    }
  }

  const finalOrderTotal = Math.max(0, total - promoDiscount);
  const totalDiscount = (subtotal - total) + promoDiscount;

  const orderNotes = input.promoCode
    ? `${input.notes ? `${input.notes} | ` : ""}Promo: ${input.promoCode} (-₹${promoDiscount})`
    : input.notes ?? null;

  const order = await createDoc<OrderDoc>(COLLECTIONS.orders, {
    user_id: userId,
    status: "pending_approval",
    fulfilment_type: input.fulfilmentType,
    slot_date: input.slotDate,
    slot_start: slot.start,
    slot_end: slot.end,
    subtotal: Math.round(subtotal * 100) / 100,
    discount_total: Math.round(totalDiscount * 100) / 100,
    total: Math.round(finalOrderTotal * 100) / 100,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    delivery_address: input.fulfilmentType === "delivery" ? input.address : null,
    delivery_lat: input.fulfilmentType === "delivery" ? input.latitude : null,
    delivery_lng: input.fulfilmentType === "delivery" ? input.longitude : null,
    notes: orderNotes,
    payment_link_url: null,
    payment_ref: `PAY_${Date.now()}`,
    paid_at: new Date().toISOString(),
  });

  try {
    for (const row of rows) {
      await createDoc(COLLECTIONS.orderItems, { ...row, order_id: order.$id });
    }
  } catch (error) {
    await deleteDoc(COLLECTIONS.orders, order.$id);
    throw error;
  }

  // Fetch customer account to send instant paid confirmation email via Resend
  let customerEmail: string | undefined = undefined;
  if (userId) {
    const userAccount = await getUserById(userId).catch(() => null);
    if (userAccount?.email) customerEmail = userAccount.email;
  }

  await notifyCustomerOrderPlaced({
    orderId: order.$id,
    name: input.contactName,
    email: customerEmail,
    phone: input.contactPhone,
    slot: `${input.slotDate} (${slot.start.slice(0, 5)}–${slot.end.slice(0, 5)})`,
    total: Number(order.total),
  });

  await notifyAdminNewOrder({
    orderId: order.$id,
    customerName: input.contactName,
    slot: `${input.slotDate} ${slot.label}`,
    total: Number(order.total),
  });

  return { orderId: order.$id };
}