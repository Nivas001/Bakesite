import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  createDoc,
  findDoc,
  isAppwriteConfigured,
  listDocs,
  updateDoc,
} from "@/integrations/appwrite/admin.server";
import { reviewSchema } from "./admin.schema";
import type { OrderDoc, OrderItemDoc } from "./orders.server";

export { reviewSchema };

type ReviewDoc = {
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
};

export async function fetchProductReviews(productId: string) {
  if (!isAppwriteConfigured()) return { reviews: [], average: null, count: 0 };
  const docs = await listDocs<ReviewDoc>(COLLECTIONS.reviews, [
    Q.equal("product_id", productId),
    Q.orderDesc("$createdAt"),
    Q.limit(50),
  ]);
  const reviews = docs.map((d) => ({
    id: d.$id,
    rating: Number(d.rating),
    comment: d.comment ?? null,
    created_at: d.$createdAt,
  }));
  const average =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;
  return { reviews, average, count: reviews.length };
}

export async function fetchMyReviewState(userId: string, productId: string) {
  const [mine, completedOrders] = await Promise.all([
    findDoc<ReviewDoc>(COLLECTIONS.reviews, [
      Q.equal("product_id", productId),
      Q.equal("user_id", userId),
    ]),
    listDocs<OrderDoc>(COLLECTIONS.orders, [
      Q.equal("user_id", userId),
      Q.equal("status", "completed"),
      Q.limit(100),
    ]),
  ]);

  let canReview = false;
  if (completedOrders.length > 0) {
    const items = await listDocs<OrderItemDoc>(COLLECTIONS.orderItems, [
      Q.equal("order_id", completedOrders.map((o) => o.$id)),
      Q.equal("product_id", productId),
      Q.limit(1),
    ]);
    canReview = items.length > 0;
  }

  return {
    mine: mine
      ? { id: mine.$id, rating: Number(mine.rating), comment: mine.comment ?? null }
      : null,
    canReview,
  };
}

export async function saveReview(userId: string, input: z.infer<typeof reviewSchema>) {
  const existing = await findDoc<ReviewDoc>(COLLECTIONS.reviews, [
    Q.equal("product_id", input.productId),
    Q.equal("user_id", userId),
  ]);
  const payload = {
    product_id: input.productId,
    user_id: userId,
    rating: input.rating,
    comment: input.comment ?? null,
  };
  if (existing) await updateDoc(COLLECTIONS.reviews, existing.$id, payload);
  else await createDoc(COLLECTIONS.reviews, payload);
  return { ok: true as const };
}