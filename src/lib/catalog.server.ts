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

const SEED_CATEGORIES: CategoryDoc[] = [
  { name: "Breads", slug: "breads", description: "Slow-fermented sourdough and soft loaves", sort_order: 1 },
  { name: "Cakes", slug: "cakes", description: "Celebration cakes and tea-time slices", sort_order: 2 },
  { name: "Pastries", slug: "pastries", description: "Buttery, laminated and flaky", sort_order: 3 },
  { name: "Cookies", slug: "cookies", description: "Crisp edges, chewy centres", sort_order: 4 },
];

const SEED_PRODUCTS: Array<ProductDoc & { id: string; category_slug: string }> = [
  {
    id: "prod_almond_danish",
    name: "Almond Danish",
    slug: "almond-danish",
    price: 150,
    discount_type: "percent",
    discount_value: 20,
    category_id: "cat_pastries",
    category_slug: "pastries",
    stock: 25,
    description: "Frangipane filled, toasted almond top with 27 golden flaky layers.",
    image_url: "/products/almond-danish.jpg",
    is_active: true,
  },
  {
    id: "prod_butter_croissant",
    name: "Butter Croissant",
    slug: "butter-croissant",
    price: 120,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_pastries",
    category_slug: "pastries",
    stock: 40,
    description: "72 layers of French butter laminated to golden, shatteringly crisp perfection.",
    image_url: "/products/artisan-croissant.jpg",
    is_active: true,
  },
  {
    id: "prod_dark_chocolate_cake",
    name: "Dark Chocolate Truffle Cake",
    slug: "dark-chocolate-cake",
    price: 850,
    discount_type: "flat",
    discount_value: 100,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 8,
    description: "Single-origin 70% Belgian cocoa sponge with silky dark ganache and velvet glaze.",
    image_url: "/hero/hero-3d-dark-truffle.jpg",
    is_active: true,
  },
  {
    id: "prod_strawberry_cream_cake",
    name: "Strawberry Cream Cake",
    slug: "strawberry-cream-cake",
    price: 920,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 6,
    description: "Fresh cream, airy vanilla sponge, and slow-simmered farm fresh berries.",
    image_url: "/hero/hero-3d-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_country_sourdough",
    name: "Country Sourdough",
    slug: "country-sourdough",
    price: 260,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_breads",
    category_slug: "breads",
    stock: 20,
    description: "36-hour wild-fermented boule with a crackling blistered crust and open airy crumb.",
    image_url: "/products/artisan-sourdough.jpg",
    is_active: true,
  },
  {
    id: "prod_choc_chip_cookies",
    name: "Chunky Choc Chip Cookies",
    slug: "choc-chip-cookies",
    price: 180,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cookies",
    category_slug: "cookies",
    stock: 30,
    description: "Box of six chewy brown-butter cookies with hand-chopped chocolate and sea-salt flakes.",
    image_url: "/products/artisan-cookies.jpg",
    is_active: true,
  },
];

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
  try {
    if (isAppwriteConfigured()) {
      const [products, categories] = await Promise.all([
        listDocs<ProductDoc>(COLLECTIONS.products, [
          Q.equal("is_active", true),
          Q.orderAsc("name"),
          Q.limit(200),
        ]),
        listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.orderAsc("sort_order"), Q.limit(50)]),
      ]);
      if (products.length > 0) {
        return {
          products: products.map((p) => mapProduct(p, categories)),
          categories: categories.map(mapCategory),
        };
      }
    }
  } catch {
    // Fall back to seed catalog
  }

  // Seamless fallback
  return {
    products: SEED_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      image_url: p.image_url,
      stock: p.stock,
      category_id: p.category_id,
      category_name: SEED_CATEGORIES.find((c) => c.slug === p.category_slug)?.name ?? "Bakery",
      category_slug: p.category_slug,
    })),
    categories: SEED_CATEGORIES.map((c, i) => ({
      id: `cat_${c.slug}`,
      name: c.name,
      slug: c.slug,
      description: c.description,
    })),
  };
}

export async function loadProductBySlug(slug: string) {
  try {
    if (isAppwriteConfigured()) {
      const doc = await findDoc<ProductDoc>(COLLECTIONS.products, [
        Q.equal("slug", slug),
        Q.equal("is_active", true),
      ]);
      if (doc) {
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
          related: related
            .filter((r) => r.slug !== slug)
            .slice(0, 3)
            .map((r) => mapProduct(r, categories)),
        };
      }
    }
  } catch {
    // Fall back to seed product
  }

  const found = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!found) {
    // If exact slug not matched, pick first seed product as fallback
    const fallback = SEED_PRODUCTS[0]!;
    const related = SEED_PRODUCTS.filter((p) => p.slug !== fallback.slug).slice(0, 3);
    return {
      product: {
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        price: fallback.price,
        discount_type: fallback.discount_type,
        discount_value: fallback.discount_value,
        image_url: fallback.image_url,
        stock: fallback.stock,
        category_id: fallback.category_id,
        category_name: SEED_CATEGORIES.find((c) => c.slug === fallback.category_slug)?.name ?? "Bakery",
        category_slug: fallback.category_slug,
      },
      related: related.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discount_type: p.discount_type,
        discount_value: p.discount_value,
        image_url: p.image_url,
        stock: p.stock,
        category_id: p.category_id,
        category_name: SEED_CATEGORIES.find((c) => c.slug === p.category_slug)?.name ?? "Bakery",
        category_slug: p.category_slug,
      })),
    };
  }

  const related = SEED_PRODUCTS.filter((p) => p.slug !== found.slug && p.category_slug === found.category_slug);
  const otherRelated = SEED_PRODUCTS.filter((p) => p.slug !== found.slug && p.category_slug !== found.category_slug);
  const combinedRelated = [...related, ...otherRelated].slice(0, 3);

  return {
    product: {
      id: found.id,
      name: found.name,
      slug: found.slug,
      description: found.description,
      price: found.price,
      discount_type: found.discount_type,
      discount_value: found.discount_value,
      image_url: found.image_url,
      stock: found.stock,
      category_id: found.category_id,
      category_name: SEED_CATEGORIES.find((c) => c.slug === found.category_slug)?.name ?? "Bakery",
      category_slug: found.category_slug,
    },
    related: combinedRelated.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      image_url: p.image_url,
      stock: p.stock,
      category_id: p.category_id,
      category_name: SEED_CATEGORIES.find((c) => c.slug === p.category_slug)?.name ?? "Bakery",
      category_slug: p.category_slug,
    })),
  };
}

export type BlackoutDoc = { blackout_date: string; reason: string | null };

export async function loadBlackouts() {
  if (!isAppwriteConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  try {
    const docs = await listDocs<BlackoutDoc>(COLLECTIONS.blackoutDates, [
      Q.greaterEqual("blackout_date", today),
      Q.orderAsc("blackout_date"),
      Q.limit(200),
    ]);
    return docs.map((d) => ({ blackout_date: d.blackout_date, reason: d.reason ?? null }));
  } catch {
    return [];
  }
}