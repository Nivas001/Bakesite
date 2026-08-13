import {
  COLLECTIONS,
  Q,
  type Doc,
  findDoc,
  isAppwriteConfigured,
  listDocs,
} from "@/integrations/appwrite/admin.server";
import type { CatalogProduct, DiscountType } from "./pricing";

export type ProductDoc = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_type: DiscountType;
  discount_value: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  category_id: string | null;
};

export type CategoryDoc = {
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export function mapProduct(
  doc: Doc<ProductDoc>,
  categories: Doc<CategoryDoc>[] = [],
): CatalogProduct {
  const category = categories.find((c) => c.$id === doc.category_id) ?? null;
  return {
    id: doc.$id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
    price: Number(doc.price),
    discount_type: doc.discount_type,
    discount_value: Number(doc.discount_value),
    image_url: doc.image_url ?? null,
    stock: Number(doc.stock),
    category_id: doc.category_id ?? null,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
  };
}

export function mapCategory(doc: Doc<CategoryDoc>) {
  return {
    id: doc.$id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
  };
}

export async function loadCatalog() {
  if (!isAppwriteConfigured()) return { products: [], categories: [] };
  const [products, categories] = await Promise.all([
    listDocs<ProductDoc>(COLLECTIONS.products, [
      Q.equal("is_active", true),
      Q.orderAsc("name"),
      Q.limit(200),
    ]),
    listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.orderAsc("sort_order"), Q.limit(50)]),
  ]);
  return {
    products: products.map((p) => mapProduct(p, categories)),
    categories: categories.map(mapCategory),
  };
}

export async function loadProductBySlug(slug: string) {
  if (!isAppwriteConfigured()) return null;
  const doc = await findDoc<ProductDoc>(COLLECTIONS.products, [
    Q.equal("slug", slug),
    Q.equal("is_active", true),
  ]);
  if (!doc) return null;

  const categories = await listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.limit(50)]);
  const product = mapProduct(doc, categories);

  const related = doc.category_id
    ? await listDocs<ProductDoc>(COLLECTIONS.products, [
        Q.equal("category_id", doc.category_id),
        Q.equal("is_active", true),
        Q.limit(4),
      ])
    : [];

  return {
    product,
    related: related.filter((r) => r.slug !== slug).slice(0, 3).map((r) => mapProduct(r, categories)),
  };
}

export type BlackoutDoc = { blackout_date: string; reason: string | null };

export async function loadBlackouts() {
  if (!isAppwriteConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  const docs = await listDocs<BlackoutDoc>(COLLECTIONS.blackoutDates, [
    Q.greaterEqual("blackout_date", today),
    Q.orderAsc("blackout_date"),
    Q.limit(200),
  ]);
  return docs.map((d) => ({ blackout_date: d.blackout_date, reason: d.reason ?? null }));
}