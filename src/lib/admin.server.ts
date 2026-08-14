import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  createDoc,
  deleteDoc,
  getDoc,
  listDocs,
  updateDoc,
} from "@/integrations/appwrite/admin.server";
import { notifyCustomerOrderUpdate, sendReviewRequest } from "./notifications.server";
import { createPaymentLink } from "./payments.server";
import { toISODate } from "./slots";
import type { CategoryDoc, ProductDoc } from "./catalog.server";
import { loadOrderItems, serializeOrder, type OrderDoc } from "./orders.server";
import {
  ORDER_STATUSES,
  blackoutSchema,
  orderStatusSchema,
  productSchema,
  type ProductInput,
} from "./admin.schema";

export { ORDER_STATUSES, blackoutSchema, orderStatusSchema, productSchema, type ProductInput };
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
    await notifyCustomerOrderUpdate({
      orderId: data.$id,
      status: data.status,
      phone: data.contact_phone,
      name: data.contact_name,
      total: Number(data.total),
      paymentLink,
    });
  }
  if (input.status === "completed") {
    await sendReviewRequest({ orderId: data.$id, name: data.contact_name });
  }
  return { ok: true as const, paymentLink };
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
  const [products, categories] = await Promise.all([
    listDocs<ProductDoc>(COLLECTIONS.products, [Q.orderAsc("name"), Q.limit(300)]),
    listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.orderAsc("sort_order"), Q.limit(50)]),
  ]);
  return {
    products: products.map((p) => ({
      id: p.$id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      price: Number(p.price),
      discount_type: p.discount_type,
      discount_value: Number(p.discount_value),
      image_url: p.image_url ?? null,
      stock: Number(p.stock),
      is_active: Boolean(p.is_active),
      category_id: p.category_id ?? null,
    })),
    categories: categories.map((c) => ({ id: c.$id, name: c.name })),
  };
}

export async function upsertProduct(input: ProductInput) {
  const row = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    price: input.price,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    image_url: input.image_url || null,
    stock: input.stock,
    is_active: input.is_active,
    category_id: input.category_id ?? null,
  };
  if (input.id) await updateDoc(COLLECTIONS.products, input.id, row);
  else await createDoc(COLLECTIONS.products, row);
  return { ok: true as const };
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