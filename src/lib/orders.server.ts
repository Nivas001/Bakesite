import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  type Doc,
  createDoc,
  deleteDoc,
  findDoc,
  getDoc,
  updateDoc,
  listDocs,
  upsertDoc,
  updateUserPhone,
  updateUserName,
  getUserById,
} from "@/integrations/appwrite/admin.server";
import { finalPrice } from "./pricing";
import type { ProductDoc } from "./catalog.server";
import { TIME_SLOTS, toISODate, isSlotAvailable } from "./slots";
import {
  notifyAdminNewOrder,
  notifyCustomerOrderPlaced,
  notifyCustomerOrderUpdate,
} from "./notifications.server";
import {
  placeOrderSchema,
  profileSchema,
  cancelRescheduledOrderSchema,
  reportOrderIssueSchema,
  type PlaceOrderInput,
  type CancelRescheduledOrderInput,
  type ReportOrderIssueInput,
} from "./orders.schema";

export {
  placeOrderSchema,
  profileSchema,
  cancelRescheduledOrderSchema,
  reportOrderIssueSchema,
  type PlaceOrderInput,
  type CancelRescheduledOrderInput,
  type ReportOrderIssueInput,
};

export type OrderDoc = {
  user_id: string;
  status:
    | "pending_approval"
    | "awaiting_payment"
    | "confirmed"
    | "rescheduled"
    | "completed"
    | "rejected";
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

  const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
  const products = await listDocs<ProductDoc>(COLLECTIONS.products, [
    Q.equal("$id", productIds),
    Q.limit(100),
  ]);
  const productMap = new Map(products.map((p) => [p.$id, p]));

  let subtotal = 0;
  let total = 0;
  const rows: Array<Omit<OrderItemDoc, "order_id">> = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.is_active) {
      throw new Error(`Product ${product ? product.name : item.productId} is unavailable.`);
    }

    // Stock was previously never consulted, so any quantity of any active
    // product could be ordered regardless of what the kitchen had. Every
    // product carries a deliberate stock number (the admin editor defaults it
    // to 100), so this is safe to enforce.
    const available = Number(product.stock ?? 0);
    if (available <= 0) {
      throw new Error(`${product.name} has sold out for now. Please remove it to continue.`);
    }
    if (item.quantity > available) {
      throw new Error(
        `Only ${available} × ${product.name} left this morning. Please lower the quantity.`,
      );
    }

    const unit = finalPrice(product.price, product.discount_type, product.discount_value);
    const lineSubtotal = product.price * item.quantity;
    const lineTotal = unit * item.quantity;
    subtotal += lineSubtotal;
    total += lineTotal;
    rows.push({
      product_id: product.$id,
      product_name: product.name,
      unit_price: unit,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  // A promo code is reserved before the order is written, not after.
  //
  // Previously the code was validated here and only marked used once the order
  // had been created, so two orders placed at the same moment both passed
  // validation and a single-use voucher could be redeemed twice. Reserving
  // first closes most of that window; if anything below fails, the reservation
  // is released again. (A fully atomic version needs a uniquely-indexed
  // redemption document per code, which is the next step.)
  //
  // Validation failures are also no longer swallowed: a customer who typed an
  // expired code used to be charged full price with no explanation.
  let promoDiscount = 0;
  let promoReserved = false;
  if (input.promoCode) {
    const { validatePromoCode, markOfferCodeUsed } = await import("./offers.server");
    const promoResult = await validatePromoCode({ code: input.promoCode, subtotal: total });
    promoDiscount = promoResult.discountAmount;
    await markOfferCodeUsed(input.promoCode);
    promoReserved = true;
  }

  /** Gives a reserved promo use back when the order does not go through. */
  const releasePromo = async () => {
    if (!promoReserved || !input.promoCode) return;
    const { releaseOfferCodeUse } = await import("./offers.server");
    await releaseOfferCodeUse(input.promoCode).catch(() => {
      console.error("[orders] could not release promo reservation for", input.promoCode);
    });
  };

  const finalOrderTotal = Math.max(0, total - promoDiscount);
  const totalDiscount = subtotal - total + promoDiscount;

  const orderNotes = input.promoCode
    ? `${input.notes ? `${input.notes} | ` : ""}Promo: ${input.promoCode} (-₹${promoDiscount})`
    : (input.notes ?? null);

  let order: Doc<OrderDoc>;
  try {
    order = await createDoc<OrderDoc>(COLLECTIONS.orders, {
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
      // Payment fields stay empty until money actually moves. A new order is
      // `pending_approval`; the admin moves it to `awaiting_payment`, which
      // mints the Razorpay link, and the webhook records payment_ref/paid_at.
      payment_link_url: null,
      payment_ref: null,
      paid_at: null,
    });
  } catch (error) {
    await releasePromo();
    throw error;
  }

  try {
    for (const row of rows) {
      await createDoc(COLLECTIONS.orderItems, { ...row, order_id: order.$id });
    }

    // Take the ordered quantities out of stock. Appwrite has no atomic
    // increment, so this reads and writes; the check above plus small batch
    // sizes make a lost update unlikely, and the admin sees the real count.
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const remaining = Math.max(0, Number(product.stock ?? 0) - item.quantity);
      await updateDoc(COLLECTIONS.products, product.$id, { stock: remaining });
    }
  } catch (error) {
    await deleteDoc(COLLECTIONS.orders, order.$id);
    await releasePromo();
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

/** Customer cancels / rejects an order because it was rescheduled */
export async function cancelRescheduledOrderForUser(
  userId: string,
  input: CancelRescheduledOrderInput,
) {
  const order = await getDoc<OrderDoc>(COLLECTIONS.orders, input.orderId);
  if (!order) throw new Error("Order not found.");
  if (order.user_id !== userId) throw new Error("Unauthorized to modify this order.");
  if (order.status !== "rescheduled") {
    throw new Error("This order is not in a rescheduled state.");
  }

  const updatedNotes = `${order.notes ? `${order.notes} | ` : ""}Cancelled by Customer (Rejected Rescheduled Slot): ${input.reason.trim()}`;

  const updated = await updateDoc<OrderDoc>(COLLECTIONS.orders, input.orderId, {
    status: "rejected",
    notes: updatedNotes,
  });

  let customerEmail: string | undefined = undefined;
  const user = await getUserById(userId).catch(() => null);
  if (user?.email) customerEmail = user.email;

  await notifyCustomerOrderUpdate({
    orderId: updated.$id,
    status: "rejected",
    phone: updated.contact_phone,
    name: updated.contact_name,
    total: Number(updated.total),
    email: customerEmail,
  });

  return {
    ok: true as const,
    message:
      "Rescheduled slot rejected. Your order has been cancelled and full refund has been initiated.",
  };
}

/** Customer reports an issue on a completed/delivered order */
export async function reportOrderIssueForUser(userId: string, input: ReportOrderIssueInput) {
  const order = await getDoc<OrderDoc>(COLLECTIONS.orders, input.orderId);
  if (!order) throw new Error("Order not found.");
  if (order.user_id !== userId) throw new Error("Unauthorized to report issue for this order.");

  const categoryLabels: Record<string, string> = {
    damaged_packaging: "Damaged Packaging",
    missing_items: "Missing Items",
    wrong_items: "Wrong Items Received",
    taste_freshness: "Taste or Freshness Concern",
    delivery_delay: "Delivery Delay / Transit Issue",
    other: "Other Inquiries",
  };

  const catLabel = categoryLabels[input.category] ?? input.category;
  const updatedNotes = `${order.notes ? `${order.notes} | ` : ""}Support Issue Reported [${catLabel}]: ${input.description.trim()} (Resolution: ${input.preferredResolution})`;

  await updateDoc<OrderDoc>(COLLECTIONS.orders, input.orderId, {
    notes: updatedNotes,
  });

  const whatsappMessage = encodeURIComponent(
    `Hi Ani Bakes Studio! 🥐 I am reporting an issue with my completed order #${order.$id.slice(-6).toUpperCase()}.\n\n` +
      `• Issue: ${catLabel}\n` +
      `• Details: ${input.description.trim()}\n` +
      `• Preferred Resolution: ${input.preferredResolution}\n\n` +
      `Please help review and assist.`,
  );

  return {
    ok: true as const,
    orderId: order.$id,
    whatsappUrl: `https://wa.me/917448724920?text=${whatsappMessage}`,
    message: "Your issue has been logged. Our head baker will inspect and resolve this promptly.",
  };
}
