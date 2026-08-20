import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  createDoc,
  deleteDoc,
  getDoc,
  listDocs,
  updateDoc,
  listAppwriteUsers,
  getUserById,
} from "@/integrations/appwrite/admin.server";
import {
  notifyCustomerOrderUpdate,
  notifyCustomerOrderRescheduled,
  sendReviewRequest,
} from "./notifications.server";
import { createPaymentLink } from "./payments.server";
import { TIME_SLOTS, toISODate } from "./slots";
import type { CategoryDoc, ProductDoc } from "./catalog.server";
import { loadOrderItems, serializeOrder, type OrderDoc } from "./orders.server";
import {
  ORDER_STATUSES,
  blackoutSchema,
  orderStatusSchema,
  rescheduleOrderSchema,
  productSchema,
  type ProductInput,
} from "./admin.schema";

export {
  ORDER_STATUSES,
  blackoutSchema,
  orderStatusSchema,
  rescheduleOrderSchema,
  productSchema,
  type ProductInput,
};
export { assertAdmin } from "./roles.server";

export async function fetchAdminOrders() {
  const orders = await listDocs<OrderDoc>(COLLECTIONS.orders, [
    Q.orderDesc("$createdAt"),
    Q.limit(200),
  ]);
  const items = await loadOrderItems(orders.map((o) => o.$id));
  return orders.map((order) => serializeOrder(order, items));
}

export async function changeOrderStatus(input: z.infer<typeof orderStatusSchema>) {
  if (input.status === "completed") {
    const existing = await getDoc<OrderDoc>(COLLECTIONS.orders, input.orderId);
    if (existing) {
      const today = toISODate(new Date());
      if (existing.slot_date > today) {
        throw new Error(
          `Order can only be marked completed on or after its scheduled delivery date (${existing.slot_date}).`,
        );
      }
    }
  }

  const data = await updateDoc<OrderDoc>(COLLECTIONS.orders, input.orderId, {
    status: input.status,
  });

  let paymentLink = data.payment_link_url;
  if (input.status === "awaiting_payment" && !paymentLink) {
    const link = await createPaymentLink({
      orderId: data.$id,
      amount: Number(data.total),
      name: data.contact_name,
      phone: data.contact_phone,
    });
    if (link) {
      paymentLink = link.url;
      await updateDoc(COLLECTIONS.orders, data.$id, {
        payment_link_url: link.url,
        payment_ref: link.reference,
      });
    }
  }

  if (input.status === "awaiting_payment" || input.status === "confirmed" || input.status === "rejected") {
    let customerEmail: string | undefined = undefined;
    if (data.user_id) {
      const user = await getUserById(data.user_id).catch(() => null);
      if (user?.email) customerEmail = user.email;
    }

    await notifyCustomerOrderUpdate({
      orderId: data.$id,
      status: data.status,
      phone: data.contact_phone,
      name: data.contact_name,
      total: Number(data.total),
      paymentLink,
      email: customerEmail,
    });
  }
  if (input.status === "completed") {
    let customerEmail: string | undefined = undefined;
    if (data.user_id) {
      const user = await getUserById(data.user_id).catch(() => null);
      if (user?.email) customerEmail = user.email;
    }
    await sendReviewRequest({ orderId: data.$id, name: data.contact_name, email: customerEmail });
  }
  return { ok: true as const, paymentLink };
}

export async function rescheduleOrder(input: z.infer<typeof rescheduleOrderSchema>) {
  const slot = TIME_SLOTS.find((s) => s.id === input.newSlotId);
  if (!slot) throw new Error("Invalid time slot selected.");

  const currentOrder = await getDoc<OrderDoc>(COLLECTIONS.orders, input.orderId);
  if (!currentOrder) throw new Error("Order not found.");

  const updatedNotes = input.reason?.trim()
    ? `${currentOrder.notes ? `${currentOrder.notes} | ` : ""}Baker Note: ${input.reason.trim()}`
    : currentOrder.notes;

  const data = await updateDoc<OrderDoc>(COLLECTIONS.orders, input.orderId, {
    slot_date: input.newSlotDate,
    slot_start: slot.start,
    slot_end: slot.end,
    status: "rescheduled",
    notes: updatedNotes,
  });

  let customerEmail: string | undefined = undefined;
  if (data.user_id) {
    const user = await getUserById(data.user_id).catch(() => null);
    if (user?.email) customerEmail = user.email;
  }

  await notifyCustomerOrderRescheduled({
    orderId: data.$id,
    name: data.contact_name,
    email: customerEmail,
    phone: data.contact_phone,
    newSlot: `${input.newSlotDate} (${slot.start.slice(0, 5)}–${slot.end.slice(0, 5)})`,
    reason: input.reason,
  });

  return { ok: true as const };
}

export async function fetchStats() {
  const docs = await listDocs<OrderDoc>(COLLECTIONS.orders, [
    Q.orderDesc("$createdAt"),
    Q.limit(500),
  ]);
  const items = await loadOrderItems(docs.map((o) => o.$id));
  const orders = docs.map((order) => serializeOrder(order, items));

  const paidStatuses = new Set(["confirmed", "completed"]);
  const revenue = orders
    .filter((o) => paidStatuses.has(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const byStatus: Record<string, number> = {};
  for (const order of orders) byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;

  const productTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.order_items) {
      const entry = productTotals.get(item.product_name) ?? {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.line_total);
      productTotals.set(item.product_name, entry);
    }
  }
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = orders.filter((o) => new Date(o.created_at).getTime() >= since).length;

  return {
    totalOrders: orders.length,
    ordersLast30Days: last30,
    revenue,
    averageOrder: orders.length ? revenue / Math.max(1, orders.filter((o) => paidStatuses.has(o.status)).length) : 0,
    byStatus,
    topProducts,
  };
}

export async function fetchAdminProducts() {
  const { loadCatalog } = await import("./catalog.server");
  const catalog = await loadCatalog();
  return {
    products: catalog.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      price: Number(p.price),
      discount_type: p.discount_type,
      discount_value: Number(p.discount_value),
      image_url: p.image_url ?? null,
      images: p.images ?? (p.image_url ? [p.image_url] : []),
      pinned_image_url: p.pinned_image_url || p.image_url || null,
      stock: Number(p.stock),
      is_active: Boolean(p.stock > 0 || true),
      category_id: p.category_id ?? null,
      category_name: p.category_name ?? null,
      category_slug: p.category_slug ?? null,
      sort_order: p.sort_order ?? 0,
      item_type: p.item_type ?? null,
      unit_weight_grams: p.unit_weight_grams ?? null,
      serving_yield: p.serving_yield ?? null,
      weight_variants: p.weight_variants ?? null,
    })),
    categories: catalog.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      sort_order: c.sort_order ?? 0,
      layout_rows: c.layout_rows ?? 1,
    })),
  };
}

export async function saveCategoryOrderingAdmin(input: {
  categories: Array<{ id: string; sort_order: number; layout_rows?: number }>;
}) {
  const { updateCategoryConfigOverrides } = await import("./catalog.server");
  updateCategoryConfigOverrides(input.categories);

  for (const cat of input.categories) {
    if (!cat.id.startsWith("cat_")) {
      try {
        const payload: Record<string, unknown> = { sort_order: cat.sort_order };
        if (cat.layout_rows) payload['layout_rows'] = cat.layout_rows;
        await updateDoc(COLLECTIONS.categories, cat.id, payload).catch(() => null);
      } catch {}
    }
  }
  return { ok: true as const };
}

export async function saveProductSequenceAdmin(input: {
  products: Array<{ id: string; sort_order: number }>;
}) {
  const { updateProductSequenceOverrides } = await import("./catalog.server");
  updateProductSequenceOverrides(input.products);

  for (const prod of input.products) {
    if (!prod.id.startsWith("prod_")) {
      try {
        await updateDoc(COLLECTIONS.products, prod.id, { sort_order: prod.sort_order }).catch(() => null);
      } catch {}
    }
  }
  return { ok: true as const };
}

export async function upsertProduct(input: ProductInput) {
  const { updateProductWeightOverrides } = await import("./catalog.server");

  const primaryCoverImage =
    input.image_url?.trim() ||
    (input.images && input.images.length > 0 ? input.images[0]?.trim() : "") ||
    "";

  // Base attributes supported by standard Appwrite products collection
  const baseRow: Record<string, unknown> = {
    name: input.name.trim().slice(0, 120),
    slug: input.slug.trim().slice(0, 120),
    price: Math.max(0, Number(input.price) || 0),
    discount_type: input.discount_type || "none",
    discount_value: Math.max(0, Number(input.discount_value) || 0),
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    is_active: Boolean(input.is_active),
  };

  if (input.description?.trim()) {
    baseRow["description"] = input.description.trim().slice(0, 600);
  } else {
    baseRow["description"] = "";
  }

  if (primaryCoverImage) {
    baseRow["image_url"] = primaryCoverImage.slice(0, 500);
  }

  if (input.category_id?.trim()) {
    baseRow["category_id"] = input.category_id.trim().slice(0, 64);
  }

  // Extended attributes if collection has them provisioned
  const extendedRow: Record<string, unknown> = { ...baseRow };
  if (input.item_type) extendedRow["item_type"] = input.item_type;
  if (input.unit_weight_grams !== undefined && input.unit_weight_grams !== null) {
    extendedRow["unit_weight_grams"] = Number(input.unit_weight_grams);
  }
  if (input.serving_yield?.trim()) extendedRow["serving_yield"] = input.serving_yield.trim().slice(0, 200);
  if (input.weight_variants && input.weight_variants.length > 0) {
    extendedRow["weight_variants_json"] = JSON.stringify(input.weight_variants);
  }
  if (input.images && input.images.length > 0) {
    extendedRow["images_json"] = JSON.stringify(input.images.filter(Boolean));
  }

  let savedId = input.id;

  try {
    if (input.id) {
      try {
        await updateDoc(COLLECTIONS.products, input.id, extendedRow);
      } catch (innerErr: any) {
        console.warn("Retrying update with base attributes only:", innerErr?.message);
        await updateDoc(COLLECTIONS.products, input.id, baseRow);
      }
    } else {
      try {
        const created = await createDoc(COLLECTIONS.products, extendedRow);
        savedId = created.$id;
      } catch (innerErr: any) {
        console.warn("Retrying create with base attributes only:", innerErr?.message);
        const created = await createDoc(COLLECTIONS.products, baseRow);
        savedId = created.$id;
      }
    }

    if (savedId) {
      updateProductWeightOverrides(savedId, {
        item_type: input.item_type ?? null,
        unit_weight_grams: input.unit_weight_grams ?? null,
        serving_yield: input.serving_yield ?? null,
        weight_variants: (input.weight_variants as any) ?? null,
        images: input.images ? input.images.filter(Boolean) : (primaryCoverImage ? [primaryCoverImage] : []),
      });
    }

    return { ok: true as const, id: savedId };
  } catch (err: any) {
    console.error("Appwrite upsertProduct failed:", err);
    const msg = err?.message || String(err);
    if (msg.includes("409") || msg.toLowerCase().includes("already exists") || msg.includes("duplicate")) {
      throw new Error(`A product with the slug "${input.slug}" already exists. Please choose a different URL slug.`);
    }
    throw new Error(msg || "Failed to save product to database.");
  }
}

export async function removeProduct(id: string) {
  await deleteDoc(COLLECTIONS.products, id);
  return { ok: true as const };
}

export async function fetchBlackouts() {
  const docs = await listDocs<{ blackout_date: string; reason: string | null }>(
    COLLECTIONS.blackoutDates,
    [Q.orderAsc("blackout_date"), Q.limit(200)],
  );
  return docs.map((d) => ({ id: d.$id, blackout_date: d.blackout_date, reason: d.reason ?? null }));
}

export async function addBlackout(input: z.infer<typeof blackoutSchema>) {
  await createDoc(COLLECTIONS.blackoutDates, {
    blackout_date: input.blackout_date,
    reason: input.reason ?? null,
  });
  return { ok: true as const };
}

export async function removeBlackout(id: string) {
  await deleteDoc(COLLECTIONS.blackoutDates, id);
  return { ok: true as const };
}

export type AdminUserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  accessedAt: string;
  emailVerification: boolean;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  totalOrders: number;
};

export async function fetchAdminUsers(): Promise<AdminUserData[]> {
  const [authUsers, profileDocs, orderDocs] = await Promise.all([
    listAppwriteUsers(),
    listDocs<{ user_id: string; full_name?: string; phone?: string; address?: string; latitude?: number; longitude?: number }>(
      COLLECTIONS.profiles,
      [Q.limit(500)],
    ).catch(() => []),
    listDocs<{ user_id: string }>(COLLECTIONS.orders, [Q.limit(1000)]).catch(() => []),
  ]);

  const profileMap = new Map<string, (typeof profileDocs)[0]>();
  for (const p of profileDocs) {
    profileMap.set(p.user_id || p.$id, p);
  }

  const orderCountMap = new Map<string, number>();
  for (const o of orderDocs) {
    orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
  }

  return authUsers.map((u) => {
    const profile = profileMap.get(u.$id);
    return {
      id: u.$id,
      name: u.name || profile?.full_name || "Unnamed Customer",
      email: u.email || "No email",
      phone: u.phone || profile?.phone || "",
      createdAt: u.registration || u.$createdAt,
      accessedAt: u.accessedAt || u.$createdAt,
      emailVerification: Boolean(u.emailVerification),
      address: profile?.address ?? null,
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
      totalOrders: orderCountMap.get(u.$id) ?? 0,
    };
  });
}