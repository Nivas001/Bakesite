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

export const DEFAULT_CATEGORIES: { id: string; name: string; slug: string; description: string; sort_order: number }[] = [
  {
    id: "cat-cakes",
    name: "Celebration Cakes",
    slug: "cakes",
    description: "Handcrafted 3-tier celebration cakes and bento bakes",
    sort_order: 1,
  },
  {
    id: "cat-breads",
    name: "Wild Sourdough & Loaves",
    slug: "breads",
    description: "36-hour cold fermented sourdoughs with stone-milled grains",
    sort_order: 2,
  },
  {
    id: "cat-pastries",
    name: "French Pastries & Donuts",
    slug: "pastries",
    description: "84% French butter croissants, danishes & brioche donuts",
    sort_order: 3,
  },
  {
    id: "cat-cookies-brownies",
    name: "Cookies & Brownies",
    slug: "cookies-brownies",
    description: "Fudge couverture brownies, sea salt cookies & cupcakes",
    sort_order: 4,
  },
  {
    id: "cat-cheesecakes",
    name: "Artisan Cheesecakes",
    slug: "cheesecakes",
    description: "Velvety cold-set Philadelphia cream cheese & fruit glazes",
    sort_order: 5,
  },
];

export const DEFAULT_PRODUCTS: CatalogProduct[] = [
  // ==========================================
  // 1. CAKES
  // ==========================================
  {
    id: "prod-belgian-truffle",
    name: "Belgian Truffle Opera Cake",
    slug: "belgian-truffle-cake",
    description: "70% dark Belgian couverture truffle cake layered with dark chocolate ganache and Bourbon vanilla sponge.",
    price: 1250,
    discount_type: "percent",
    discount_value: 10,
    image_url: "/cakes/belgian-truffle-cake.jpg",
    stock: 12,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-biscoff-herringbone",
    name: "Biscoff Herringbone Layer Cake",
    slug: "biscoff-herringbone-cake",
    description: "Lotus Biscoff spread infused cake with cinnamon spice crumb, caramel crunch and cookie butter frosting.",
    price: 1350,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/biscoff-herringbone-cake.jpg",
    stock: 8,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-lavender-pearl",
    name: "Lavender Pearl Buttercream Cake",
    slug: "lavender-pearl-cake",
    description: "French culinary lavender infused sponge with wild blueberry compote and silky pearl buttercream.",
    price: 1150,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/lavender-pearl-cake.jpg",
    stock: 10,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-coral-heart",
    name: "Coral Heart Strawberry Cake",
    slug: "coral-heart-cake",
    description: "Heart-shaped fresh strawberry celebration cake with Madagascar vanilla cream and edible rose petals.",
    price: 980,
    discount_type: "flat",
    discount_value: 80,
    image_url: "/cakes/coral-heart-cake.jpg",
    stock: 14,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-butterfly-lilac",
    name: "Lilac Butterfly Velvet Cake",
    slug: "butterfly-lilac-cake",
    description: "Velvety lilac berry cake with handcrafted wafer butterflies and whipped mascarpone frosting.",
    price: 1200,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/butterfly-lilac-cake.jpg",
    stock: 6,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-pink-bento",
    name: "Korean Aesthetic Bento Cake",
    slug: "pink-bento-cake",
    description: "Cute lunchbox bento cake with pastel piping and moist Belgian chocolate center for 1-2 people.",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/pink-bento-cake.jpg",
    stock: 20,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-3d-caramel-cake",
    name: "Dark Chocolate & Caramel 3-Tier Cake",
    slug: "dark-chocolate-caramel-cake",
    description: "Our signature 3D atelier centerpiece with dripping couverture ganache, salted caramel swirls, and 24K gold truffles.",
    price: 1450,
    discount_type: "percent",
    discount_value: 15,
    image_url: "/about/hero-3d-caramel-cake.jpg",
    stock: 5,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-blueberry-dream",
    name: "Blueberry Dream Chiffon Cake",
    slug: "blueberry-dream-cake",
    description: "Fresh organic blueberries folded into light chiffon sponge with cream cheese glaze and lemon curd.",
    price: 1100,
    discount_type: "none",
    discount_value: 0,
    image_url: "/hero/hero-3d-blueberry-cake.jpg",
    stock: 9,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-strawberry-rose",
    name: "Strawberry Rose Bliss Cake",
    slug: "strawberry-rose-cake",
    description: "Layers of real strawberry reduction, whipped dairy cream, and moist almond sponge cake.",
    price: 850,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/strawberry-cake.jpg",
    stock: 15,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-classic-vanilla",
    name: "Classic French Vanilla Bean Cake",
    slug: "classic-vanilla-cake",
    description: "Tahitian vanilla bean sponge topped with smooth buttercream and white chocolate curls.",
    price: 780,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/vanilla-cake.jpg",
    stock: 12,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },
  {
    id: "prod-triple-chocolate",
    name: "Triple Dark Chocolate Fudge Cake",
    slug: "triple-dark-chocolate-cake",
    description: "Decadent Dutch cocoa sponge soaked in dark espresso syrup with dense fudge frosting.",
    price: 950,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/chocolate-cake.jpg",
    stock: 14,
    category_id: "cat-cakes",
    category_name: "Celebration Cakes",
    category_slug: "cakes",
  },

  // ==========================================
  // 2. BREADS & SOURDOUGHS
  // ==========================================
  {
    id: "prod-artisan-sourdough",
    name: "36-Hour Wild Country Sourdough",
    slug: "artisan-sourdough",
    description: "Organic stone-milled sourdough fermented 36 hours. Blistered blister-ear crust and open custard-like wild crumb.",
    price: 320,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/artisan-sourdough.jpg",
    stock: 25,
    category_id: "cat-breads",
    category_name: "Wild Sourdough & Loaves",
    category_slug: "breads",
  },
  {
    id: "prod-trio-snack-loaves",
    name: "Artisan Trio Snack Loaves",
    slug: "artisan-trio-snack-loaves",
    description: "Trio of mini artisan snack loaves: Multigrain Seeded, Sun-Dried Tomato Olive, and Cranberry Walnut.",
    price: 450,
    discount_type: "flat",
    discount_value: 50,
    image_url: "/cakes/trio-snack-loaves.jpg",
    stock: 16,
    category_id: "cat-breads",
    category_name: "Wild Sourdough & Loaves",
    category_slug: "breads",
  },
  {
    id: "prod-cinnamon-bun",
    name: "Cinnamon Swirl Brioche Loaf",
    slug: "cinnamon-swirl-brioche",
    description: "Rich French brioche rolled with Ceylon cinnamon, dark muscovado sugar, and cream cheese glaze.",
    price: 380,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/cinnamon-bun.jpg",
    stock: 18,
    category_id: "cat-breads",
    category_name: "Wild Sourdough & Loaves",
    category_slug: "breads",
  },

  // ==========================================
  // 3. PASTRIES & DONUTS
  // ==========================================
  {
    id: "prod-artisan-croissant",
    name: "84% French Butter Croissant",
    slug: "artisan-croissant",
    description: "Layered with 84% butterfat French Normandy butter for 27 flaky, golden honeycomb layers.",
    price: 180,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/artisan-croissant.jpg",
    stock: 30,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },
  {
    id: "prod-pistachio-danish",
    name: "Pistachio Cream Danish",
    slug: "pistachio-danish",
    description: "Flaky laminated pastry shell filled with roasted Bronte pistachio praline and diplomat cream.",
    price: 260,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/pistachio-danish.jpg",
    stock: 20,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },
  {
    id: "prod-pink-donut",
    name: "Pink Glazed Brioche Donut",
    slug: "pink-glazed-donut",
    description: "Slow-proofed brioche donut fried in coconut oil with real strawberry puree glaze and crunch sprinkles.",
    price: 190,
    discount_type: "none",
    discount_value: 0,
    image_url: "/hero/hero-3d-donut-sprinkles.jpg",
    stock: 24,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },
  {
    id: "prod-blueberry-donut",
    name: "Blueberry Glazed Artisan Donut",
    slug: "blueberry-glazed-donut",
    description: "Brioche donut coated in wild blueberry hibiscus glaze with edible crystal flower sugar.",
    price: 190,
    discount_type: "none",
    discount_value: 0,
    image_url: "/hero/hero-3d-blueberry-donut.jpg",
    stock: 22,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },
  {
    id: "prod-caramel-donut",
    name: "Salted Caramel Ganache Donut",
    slug: "salted-caramel-donut",
    description: "Filled with liquid Fleur de Sel caramel and dipped in Belgian milk chocolate glaze.",
    price: 210,
    discount_type: "none",
    discount_value: 0,
    image_url: "/hero/hero-3d-caramel-donut.jpg",
    stock: 20,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },
  {
    id: "prod-croissant",
    name: "Traditional Golden Croissant",
    slug: "croissant",
    description: "Classic golden crescent pastry baked crisp on the outside and soft and buttery inside.",
    price: 150,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/croissant.jpg",
    stock: 28,
    category_id: "cat-pastries",
    category_name: "French Pastries & Donuts",
    category_slug: "pastries",
  },

  // ==========================================
  // 4. COOKIES & BROWNIES
  // ==========================================
  {
    id: "prod-royal-gold-brownie",
    name: "Royal 24K Gold Fudge Brownie",
    slug: "royal-gold-brownie",
    description: "Dense fudgy dark chocolate brownie square finished with Fleur de Sel and 24K edible gold leaf.",
    price: 280,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/royal-gold-brownie.jpg",
    stock: 18,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-biscoff-nut-brownie",
    name: "Lotus Biscoff Crunch Brownie",
    slug: "biscoff-nut-brownie",
    description: "Gooey chocolate fudge brownie marbled with Lotus Biscoff cookie butter and roasted hazelnuts.",
    price: 260,
    discount_type: "none",
    discount_value: 0,
    image_url: "/cakes/biscoff-nut-brownie.jpg",
    stock: 16,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-choc-chip-cookies",
    name: "Dark Choc-Chip Sea Salt Cookies (Box of 4)",
    slug: "choc-chip-cookies",
    description: "Crispy edges, gooey centers packed with 70% dark chocolate chunks and Maldon sea salt flakes.",
    price: 340,
    discount_type: "flat",
    discount_value: 40,
    image_url: "/products/choc-chip-cookies.jpg",
    stock: 25,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-artisan-cookies",
    name: "Gourmet Artisan Choc-Chip Cookies",
    slug: "artisan-cookies",
    description: "Handcrafted small-batch cookies made with brown butter and premium Belgian chocolate puddles.",
    price: 350,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/artisan-cookies.jpg",
    stock: 20,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-matcha-cookies",
    name: "Kyoto Matcha White Choc Cookies (Box of 4)",
    slug: "matcha-cookies",
    description: "Ceremonial grade Uji matcha infused dough with sweet Belgian white chocolate chips.",
    price: 360,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/matcha-cookies.jpg",
    stock: 15,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-cocoa-cookies",
    name: "Double Dutch Cocoa Crinkle Cookies (Box of 4)",
    slug: "cocoa-cookies",
    description: "Fudge brownie-like cookies rolled in powdered sugar with a cracked snow-top crust.",
    price: 320,
    discount_type: "none",
    discount_value: 0,
    image_url: "/products/cocoa-cookies.jpg",
    stock: 18,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-salted-caramel-cupcake",
    name: "Salted Caramel Buttercream Cupcakes (Box of 2)",
    slug: "salted-caramel-cupcake",
    description: "Moist chocolate sponge filled with gooey caramel and topped with whipped salted caramel buttercream.",
    price: 290,
    discount_type: "none",
    discount_value: 0,
    image_url: "/about/salted-caramel-cupcake.jpg",
    stock: 16,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-walnut-cupcake",
    name: "Walnut Spiced Morning Cupcakes (Box of 2)",
    slug: "walnut-cupcake-trio",
    description: "Spiced cinnamon carrot sponge studded with California walnuts and cream cheese frosting.",
    price: 310,
    discount_type: "none",
    discount_value: 0,
    image_url: "/about/walnut-cupcake-trio.jpg",
    stock: 14,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },
  {
    id: "prod-wellness-muffin",
    name: "Wellness Dark Cocoa Muffin (Sugar-Free)",
    slug: "wellness-chocolate-muffin",
    description: "High protein, monkfruit sweetened dark cocoa muffin. 100% dairy-free, clean pantry architecture.",
    price: 220,
    discount_type: "none",
    discount_value: 0,
    image_url: "/about/wellness-chocolate-muffin.jpg",
    stock: 20,
    category_id: "cat-cookies-brownies",
    category_name: "Cookies & Brownies",
    category_slug: "cookies-brownies",
  },

  // ==========================================
  // 5. CHEESECAKES
  // ==========================================
  {
    id: "prod-mango-cheesecake",
    name: "Alphonso Mango Glaze Cheesecake",
    slug: "mango-cheesecake",
    description: "Cold-set New York style Philadelphia cream cheese cake topped with fresh Ratnagiri Alphonso mango reduction.",
    price: 1290,
    discount_type: "percent",
    discount_value: 10,
    image_url: "/hero/hero-3d-mango-cheesecake.jpg",
    stock: 8,
    category_id: "cat-cheesecakes",
    category_name: "Artisan Cheesecakes",
    category_slug: "cheesecakes",
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
  if (!isAppwriteConfigured()) {
    return {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      })),
    };
  }

  try {
    const [products, categories] = await Promise.all([
      listDocs<ProductDoc>(COLLECTIONS.products, [
        Q.equal("is_active", true),
        Q.orderAsc("name"),
        Q.limit(200),
      ]),
      listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.orderAsc("sort_order"), Q.limit(50)]),
    ]);

    if (!products || products.length === 0) {
      return {
        products: DEFAULT_PRODUCTS,
        categories: DEFAULT_CATEGORIES.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
        })),
      };
    }

    return {
      products: products.map((p) => mapProduct(p, categories)),
      categories: categories.map(mapCategory),
    };
  } catch {
    return {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      })),
    };
  }
}

export async function loadProductBySlug(slug: string) {
  // Check default products first
  const fallbackMatch = DEFAULT_PRODUCTS.find((p) => p.slug === slug);

  if (!isAppwriteConfigured()) {
    if (!fallbackMatch) return null;
    const related = DEFAULT_PRODUCTS.filter(
      (p) => p.category_slug === fallbackMatch.category_slug && p.slug !== slug
    ).slice(0, 3);
    return {
      product: fallbackMatch,
      related,
    };
  }

  try {
    const doc = await findDoc<ProductDoc>(COLLECTIONS.products, [
      Q.equal("slug", slug),
      Q.equal("is_active", true),
    ]);

    if (!doc) {
      if (fallbackMatch) {
        const related = DEFAULT_PRODUCTS.filter(
          (p) => p.category_slug === fallbackMatch.category_slug && p.slug !== slug
        ).slice(0, 3);
        return {
          product: fallbackMatch,
          related,
        };
      }
      return null;
    }

    const categories = await listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.limit(50)]);
    const product = mapProduct(doc, categories);

    const relatedDocs = doc.category_id
      ? await listDocs<ProductDoc>(COLLECTIONS.products, [
          Q.equal("category_id", doc.category_id),
          Q.equal("is_active", true),
          Q.limit(4),
        ])
      : [];

    return {
      product,
      related: relatedDocs.filter((r) => r.slug !== slug).slice(0, 3).map((r) => mapProduct(r, categories)),
    };
  } catch {
    if (fallbackMatch) {
      const related = DEFAULT_PRODUCTS.filter(
        (p) => p.category_slug === fallbackMatch.category_slug && p.slug !== slug
      ).slice(0, 3);
      return {
        product: fallbackMatch,
        related,
      };
    }
    return null;
  }
}

export type BlackoutDoc = { blackout_date: string; reason: string | null };

export async function loadBlackouts() {
  if (!isAppwriteConfigured()) return [];
  try {
    const today = new Date().toISOString().slice(0, 10);
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