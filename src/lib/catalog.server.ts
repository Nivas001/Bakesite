import {
  COLLECTIONS,
  Q,
  type Doc,
  findDoc,
  isAppwriteConfigured,
  listDocs,
} from "@/integrations/appwrite/admin.server";
import {
  type CatalogProduct,
  type DiscountType,
  type ProductWeightVariant,
  generateSmartCakeWeightVariants,
} from "./pricing";

export type ProductDoc = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_type: DiscountType;
  discount_value: number;
  image_url: string | null;
  images?: string[] | null;
  images_json?: string | null;
  stock: number;
  is_active: boolean;
  category_id: string | null;
  sort_order?: number | null;
  item_type?: "weight" | "unit" | "pack" | null;
  unit_weight_grams?: number | null;
  serving_yield?: string | null;
  weight_variants_json?: string | null;
};

export type CategoryDoc = {
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  layout_rows?: number | null;
};

const SEED_CATEGORIES: CategoryDoc[] = [
  { name: "Brownies", slug: "brownies", description: "Rich chocolate in every fudgy bite", sort_order: 1 },
  { name: "Cheesecakes", slug: "cheesecakes", description: "A perfect harmony of cream cheese and sweetness", sort_order: 2 },
  { name: "Cakes", slug: "cakes", description: "Celebration cakes, bento boxes, and artisan layered specials", sort_order: 3 },
  { name: "Tea-Cakes", slug: "tea-cakes", description: "A slice of comfort with every cup of tea (16-18 Pieces / 300g)", sort_order: 4 },
  { name: "Pastries", slug: "pastries", description: "72-layer French butter laminated croissants & danishes", sort_order: 5 },
  { name: "Breads", slug: "breads", description: "36-hour wild-fermented crusty sourdough loaves", sort_order: 6 },
  { name: "Cookies", slug: "cookies", description: "Crisp golden edges, chewy brown-butter centres", sort_order: 7 },
];

const SEED_PRODUCTS: Array<ProductDoc & { id: string; category_slug: string }> = [
  // 🍫 Brownies
  {
    id: "prod_signature_belgian_fudge_brownie",
    name: "Signature Belgian Truffle Fudge Brownie",
    slug: "signature-belgian-fudge-brownie",
    price: 95,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 50,
    description: "Rich 70% dark Belgian chocolate fudge brownie topped with silky ganache piping, roasted Iranian pistachio nibs, and artisanal chocolate drizzle. Dense, fudgy centre with crackly paper-thin crust.",
    image_url: "/products/belgian-fudge-brownie-stack.jpg",
    images: [
      "/products/belgian-fudge-brownie-stack.jpg",
      "/products/belgian-fudge-brownie-drizzle.jpg",
      "/products/belgian-fudge-brownie-fork.jpg",
    ],
    item_type: "pack",
    unit_weight_grams: 95,
    serving_yield: "Approx. 95g gourmet fudge square",
    weight_variants_json: JSON.stringify([
      { id: "var_single", label: "Single Square (95g)", price: 95, weight_grams: 95, is_default: true },
      { id: "var_box4", label: "Gourmet Box of 4 (380g)", price: 360, weight_grams: 380, is_default: false },
      { id: "var_box9", label: "Grand Tasting Box of 9 (850g)", price: 790, weight_grams: 850, is_default: false },
    ]),
    is_active: true,
  },
  {
    id: "prod_classic_brownie",
    name: "Classic Fudgy Brownie",
    slug: "classic-brownie",
    price: 65,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 50,
    description: "Rich dark Belgian chocolate brownie with crackly paper-thin top and dense fudgy centre.",
    image_url: "/products/fudge-brownies.jpg",
    is_active: true,
  },
  {
    id: "prod_milk_chocolate_brownie",
    name: "Milk Chocolate Brownie",
    slug: "milk-chocolate-brownie",
    price: 75,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 40,
    description: "Silky Swiss milk chocolate folded with dark cocoa batter for balanced sweetness.",
    image_url: "/products/fudge-brownies.jpg",
    is_active: true,
  },
  {
    id: "prod_white_chocolate_brownie",
    name: "White Chocolate Blondie",
    slug: "white-chocolate-brownie",
    price: 75,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 35,
    description: "Vanilla bean blondie studded with creamy caramelized white chocolate chunks.",
    image_url: "/packaging/insulated-brownie-box.jpg",
    is_active: true,
  },
  {
    id: "prod_biscoff_brownie",
    name: "Lotus Biscoff Fudge Brownie",
    slug: "biscoff-brownie",
    price: 120,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 30,
    description: "Fudgy brownie base swirled with caramelized spiced Biscoff spread and crunchy biscuit crown.",
    image_url: "/cakes/biscoff-nut-brownie.jpg",
    is_active: true,
  },
  {
    id: "prod_nutella_brownie",
    name: "Nutella Hazelnut Brownie",
    slug: "nutella-brownie",
    price: 120,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 30,
    description: "Generously stuffed and marbled with roasted hazelnut Nutella spread and toasted nuts.",
    image_url: "/cakes/royal-gold-brownie.jpg",
    is_active: true,
  },
  {
    id: "prod_pistachio_brownie",
    name: "Pistachio Cream Brownie",
    slug: "pistachio-brownie",
    price: 150,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 25,
    description: "Topped with Iranian pistachio ganache, sea salt flakes, and roasted crushed emerald pistachios.",
    image_url: "/packaging/insulated-brownie-box.jpg",
    is_active: true,
  },
  {
    id: "prod_assorted_brownie_4",
    name: "Assorted Brownie Bites (4 Pcs)",
    slug: "assorted-brownie-bites-4",
    price: 400,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_brownies",
    category_slug: "brownies",
    stock: 20,
    description: "Gourmet tasting box containing 1 Classic, 1 Biscoff, 1 Nutella, and 1 Pistachio brownie bite (250g).",
    image_url: "/packaging/insulated-brownie-box.jpg",
    is_active: true,
  },

  // 🧀 Cheesecakes
  {
    id: "prod_strawberry_cheesecake_bento",
    name: "Strawberry Basque Cheesecake (Bento)",
    slug: "strawberry-cheesecake-bento",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cheesecakes",
    category_slug: "cheesecakes",
    stock: 15,
    description: "Creamy baked Basque cheesecake topped with slow-simmered strawberry compote and mascarpone rosette.",
    image_url: "/products/strawberry-cheesecake.jpg",
    is_active: true,
  },
  {
    id: "prod_blueberry_cheesecake_bento",
    name: "Blueberry Velvet Cheesecake (Bento)",
    slug: "blueberry-cheesecake-bento",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cheesecakes",
    category_slug: "cheesecakes",
    stock: 15,
    description: "Velvety cold-set Philadelphia cream cheese base topped with wild blueberry reduction.",
    image_url: "/hero/hero-3d-mango-cheesecake.jpg",
    is_active: true,
  },
  {
    id: "prod_chocolate_cheesecake_bento",
    name: "Dark Chocolate Truffle Cheesecake (Bento)",
    slug: "chocolate-cheesecake-bento",
    price: 600,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cheesecakes",
    category_slug: "cheesecakes",
    stock: 12,
    description: "70% Belgian chocolate folded into rich cream cheese on an Oreo cookie butter crust.",
    image_url: "/about/cake-3d-front.jpg",
    is_active: true,
  },
  {
    id: "prod_nutella_cheesecake_bento",
    name: "Nutella Hazelnut Cheesecake (Bento)",
    slug: "nutella-cheesecake-bento",
    price: 650,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cheesecakes",
    category_slug: "cheesecakes",
    stock: 10,
    description: "Silky hazelnut cheesecake swirled with Nutella and crowned with whole toasted hazelnuts.",
    image_url: "/cakes/belgian-truffle-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_biscoff_cheesecake_bento",
    name: "Lotus Biscoff Baked Cheesecake (Bento)",
    slug: "biscoff-cheesecake-bento",
    price: 650,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cheesecakes",
    category_slug: "cheesecakes",
    stock: 10,
    description: "Speculoos spiced biscuit crust, caramelized Biscoff ribbon layer, and molten cookie butter drizzle.",
    image_url: "/cakes/biscoff-herringbone-cake.jpg",
    is_active: true,
  },

  // 🎂 Cakes
  {
    id: "prod_simple_vanilla_bento",
    name: "Simple Vanilla Bento Cake",
    slug: "simple-vanilla-bento",
    price: 350,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 20,
    description: "Light Madagascar vanilla sponge layered with fluffy buttercream in an artisan bento lunchbox.",
    image_url: "/products/vanilla-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_simple_chocolate_bento",
    name: "Simple Chocolate Bento Cake",
    slug: "simple-chocolate-bento",
    price: 400,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 20,
    description: "Moist chocolate sponge with silky chocolate cream filling and cocoa rosettes.",
    image_url: "/products/chocolate-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_choco_truffle_cake",
    name: "Choco Truffle Bento Cake",
    slug: "choco-truffle-cake",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 15,
    description: "Single-origin Belgian dark chocolate ganache draped over delicate chocolate sponge.",
    image_url: "/cakes/belgian-truffle-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_vanilla_strawberry_cake",
    name: "Vanilla Strawberry Bento Cake",
    slug: "vanilla-strawberry-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 15,
    description: "Vanilla sponge layered with fresh strawberry crush and pastel pink piped rosettes.",
    image_url: "/cakes/pink-bento-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_vanilla_pineapple_cake",
    name: "Vanilla Pineapple Cake",
    slug: "vanilla-pineapple-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 12,
    description: "Tropical pineapple chunks, vanilla bean sponge, and light whipped dairy cream.",
    image_url: "/products/vanilla-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_vanilla_blueberry_cake",
    name: "Vanilla Blueberry Cake",
    slug: "vanilla-blueberry-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 12,
    description: "Tender vanilla cake infused with simmered wild blueberries and lilac cream frosting.",
    image_url: "/cakes/butterfly-lilac-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_black_forest_cake",
    name: "Black Forest Gateau",
    slug: "black-forest-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 12,
    description: "Classic chocolate sponge layered with sour cherry compote, fresh cream, and chocolate flakes.",
    image_url: "/about/hero-3d-caramel-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_white_forest_cake",
    name: "White Forest Snowflake Cake",
    slug: "white-forest-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "White chocolate curls, vanilla sponge, tart cherry compote, and light whipped frosting.",
    image_url: "/cakes/coral-heart-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_hazelnut_themed_cake",
    name: "Hazelnut Themed Celebration Cake",
    slug: "hazel-nut-themed-cake",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "Roasted hazelnut praline buttercream, chocolate sponge, and Ferrero-style cocoa glaze.",
    image_url: "/cakes/lavender-pearl-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_biscoff_themed_cake",
    name: "Biscoff Themed Celebration Cake",
    slug: "biscoff-themed-cake",
    price: 550,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "Layered with caramelized Lotus spread, biscuit crunch crumb, and gold shimmer accents.",
    image_url: "/cakes/biscoff-herringbone-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_gulkand_cake",
    name: "Royal Gulkand Rose Cake",
    slug: "gulkand-cake",
    price: 500,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "Damask rose petal preserve (Gulkand) infused sponge with cardamom cream and pistachios.",
    image_url: "/cakes/coral-heart-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_paan_cake",
    name: "Banarasi Paan Infused Cake",
    slug: "paan-cake",
    price: 450,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "Betel leaf infused fragrant sponge layered with sweet fennel and rose petal filling.",
    image_url: "/cakes/butterfly-lilac-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_rasamalai_cake",
    name: "Royal Rasamalai Saffron Cake",
    slug: "rasamalai-cake",
    price: 600,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 15,
    description: "Saffron and cardamom infused milk sponge drenched in rabri cream, pistachios, and 24K edible gold.",
    image_url: "/products/rasamalai-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_tropical_delight_cake",
    name: "Tropical Delight Mango Cake",
    slug: "tropical-delight-cake",
    price: 650,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_cakes",
    category_slug: "cakes",
    stock: 10,
    description: "Alphonso mango pulp reduction, passionfruit glaze, and airy vanilla sponge.",
    image_url: "/hero/hero-3d-mango-cheesecake.jpg",
    is_active: true,
  },

  // 🫖 Tea-Cakes (16-18 Pieces / 300g)
  {
    id: "prod_plain_tea_cake",
    name: "Plain Butter Tea Cake (2 Boxes)",
    slug: "plain-tea-cake",
    price: 220,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_tea_cakes",
    category_slug: "tea-cakes",
    stock: 25,
    description: "Classic English buttery tea cake loaf (16-18 bite slices, 300g total in 2 boxes).",
    image_url: "/cakes/trio-snack-loaves.jpg",
    is_active: true,
  },
  {
    id: "prod_rosemilk_tea_cake",
    name: "Rosemilk Cardamom Tea Cake (2 Boxes)",
    slug: "rosemilk-tea-cake",
    price: 230,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_tea_cakes",
    category_slug: "tea-cakes",
    stock: 25,
    description: "Fragrant rose essence and green cardamom infused loaf cake with pistachio dust (16-18 slices).",
    image_url: "/products/rosemilk-tea-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_pistachio_tea_cake",
    name: "Pistachio Crunch Tea Cake (2 Boxes)",
    slug: "pistachio-tea-cake",
    price: 230,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_tea_cakes",
    category_slug: "tea-cakes",
    stock: 25,
    description: "Roasted Iranian pistachios folded into buttery sponge for maximum tea-time comfort (16-18 slices).",
    image_url: "/products/rosemilk-tea-cake.jpg",
    is_active: true,
  },
  {
    id: "prod_rasamalai_tea_cake",
    name: "Rasamalai Saffron Tea Cake (2 Boxes)",
    slug: "rasamalai-tea-cake",
    price: 230,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_tea_cakes",
    category_slug: "tea-cakes",
    stock: 25,
    description: "Kashmiri saffron and cardamom infused snack loaves with slivered almonds (16-18 slices).",
    image_url: "/products/rasamalai-cake.jpg",
    is_active: true,
  },

  // 🥐 Pastries, Breads & Cookies
  {
    id: "prod_butter_croissant",
    name: "French Butter Croissant",
    slug: "butter-croissant",
    price: 120,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_pastries",
    category_slug: "pastries",
    stock: 40,
    description: "72 layers of French butter laminated to golden, shatteringly crisp perfection.",
    image_url: "/products/croissant.jpg",
    is_active: true,
  },
  {
    id: "prod_almond_danish",
    name: "Almond Frangipane Danish",
    slug: "almond-danish",
    price: 150,
    discount_type: "percent",
    discount_value: 20,
    category_id: "cat_pastries",
    category_slug: "pastries",
    stock: 25,
    description: "Frangipane filled, toasted almond top with 27 golden flaky layers.",
    image_url: "/products/pistachio-danish.jpg",
    is_active: true,
  },
  {
    id: "prod_country_sourdough",
    name: "Country Sourdough Boule",
    slug: "country-sourdough",
    price: 260,
    discount_type: "none",
    discount_value: 0,
    category_id: "cat_breads",
    category_slug: "breads",
    stock: 20,
    description: "36-hour wild-fermented boule with a crackling blistered crust and open airy crumb.",
    image_url: "/products/country-sourdough.jpg",
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
    image_url: "/products/choc-chip-cookies.jpg",
    is_active: true,
  },
];

// In-memory / persistent config store for category and product layout overrides
import {
  getCategoryLayoutOverrides,
  saveCategoryLayoutOverrides,
  getProductSequenceOverrides,
  saveProductSequenceOverrides,
  getProductWeightOverrides,
  saveProductWeightOverrides,
  type ProductWeightConfig,
} from "./server-storage.server";

export function updateCategoryConfigOverrides(
  categories: Array<{ id: string; sort_order: number; layout_rows?: number; slug?: string }>,
) {
  saveCategoryLayoutOverrides(categories);
}

export function updateProductSequenceOverrides(
  products: Array<{ id: string; sort_order: number; slug?: string }>,
) {
  saveProductSequenceOverrides(products);
}

export function updateProductWeightOverrides(
  productId: string,
  config: {
    item_type?: "weight" | "unit" | "pack" | null;
    unit_weight_grams?: number | null;
    serving_yield?: string | null;
    weight_variants?: ProductWeightVariant[] | null;
    images?: string[] | null;
  },
  slug?: string,
) {
  saveProductWeightOverrides(productId, config, slug);
}

function findCategoryOverride(id: string, slug?: string | null) {
  const overrides = getCategoryLayoutOverrides();
  if (overrides[id]) return overrides[id];
  if (slug && overrides[slug]) return overrides[slug];
  if (slug && overrides[`cat_${slug}`]) return overrides[`cat_${slug}`];
  if (id.startsWith("cat_") && overrides[id.replace(/^cat_/, "")]) {
    return overrides[id.replace(/^cat_/, "")];
  }
  return undefined;
}

function findProductSequenceOverride(id: string, slug?: string | null) {
  const overrides = getProductSequenceOverrides();
  if (overrides[id] !== undefined) return overrides[id];
  if (slug && overrides[slug] !== undefined) return overrides[slug];
  if (slug && overrides[`prod_${slug.replace(/-/g, "_")}`] !== undefined) {
    return overrides[`prod_${slug.replace(/-/g, "_")}`];
  }
  return undefined;
}

function findProductWeightOverride(id: string, slug?: string | null) {
  const overrides = getProductWeightOverrides();
  if (overrides[id]) return overrides[id];
  if (slug && overrides[slug]) return overrides[slug];
  if (slug && overrides[`prod_${slug.replace(/-/g, "_")}`]) {
    return overrides[`prod_${slug.replace(/-/g, "_")}`];
  }
  return undefined;
}

export function mapProduct(
  doc: Doc<ProductDoc>,
  categories: Doc<CategoryDoc>[] = [],
): CatalogProduct {
  const category = categories.find(
    (c) =>
      c.$id === doc.category_id ||
      (doc as any).category_slug === c.slug ||
      doc.category_id === `cat_${c.slug}` ||
      c.$id === `cat_${(doc as any).category_slug}`
  ) ?? null;
  const customOrder = findProductSequenceOverride(doc.$id, doc.slug);
  const weightOverride = findProductWeightOverride(doc.$id, doc.slug);

  const catSlug = (category?.slug || "").toLowerCase();
  const prodName = (doc.name || "").toLowerCase();
  const isCakeOrCheesecake =
    catSlug === "cakes" ||
    catSlug === "cheesecakes" ||
    prodName.includes("cake") ||
    prodName.includes("cheesecake");

  let itemType: "weight" | "unit" | "pack" = weightOverride?.item_type || doc.item_type || (isCakeOrCheesecake ? "weight" : "unit");
  let unitWeightGrams = weightOverride?.unit_weight_grams ?? doc.unit_weight_grams ?? null;
  let servingYield = weightOverride?.serving_yield ?? doc.serving_yield ?? null;
  let weightVariants: ProductWeightVariant[] | null = weightOverride?.weight_variants ?? null;

  if (!weightVariants && doc.weight_variants_json) {
    try {
      weightVariants = JSON.parse(doc.weight_variants_json);
    } catch {}
  }

  // Parse images gallery
  let images: string[] = [];
  if (weightOverride?.images && Array.isArray(weightOverride.images) && weightOverride.images.length > 0) {
    images = weightOverride.images.filter(Boolean);
  } else if (doc.images && Array.isArray(doc.images) && doc.images.length > 0) {
    images = doc.images.filter(Boolean);
  } else if (doc.images_json) {
    try {
      const parsed = JSON.parse(doc.images_json);
      if (Array.isArray(parsed)) images = parsed.filter(Boolean);
    } catch {}
  }
  if (images.length === 0 && doc.image_url) {
    images = [doc.image_url];
  }

  const primaryCoverImage: string | null = (doc.image_url ?? (images.length > 0 ? images[0] : null)) ?? null;

  // Default portion & weight logic if not custom set
  if (isCakeOrCheesecake) {
    itemType = "weight";
    if (!weightVariants || weightVariants.length === 0) {
      weightVariants = generateSmartCakeWeightVariants(Number(doc.price), 250);
    }
    if (!unitWeightGrams) unitWeightGrams = 500;
    if (!servingYield) servingYield = "500g (Serves 5–7 Guests)";
  } else if (catSlug === "tea-cakes") {
    if (!unitWeightGrams) unitWeightGrams = 300;
    if (!servingYield) servingYield = "300g (16–18 Pieces / Serves 6–8)";
  } else if (catSlug === "breads") {
    if (!unitWeightGrams) unitWeightGrams = 650;
    if (!servingYield) servingYield = "Approx. 650g artisan loaf · 36h ferment";
  } else if (catSlug === "brownies") {
    if (!unitWeightGrams) unitWeightGrams = 90;
    if (!servingYield) servingYield = "Approx. 90g fudgy square";
  } else if (catSlug === "cookies") {
    if (!unitWeightGrams) unitWeightGrams = 270;
    if (!servingYield) servingYield = "Box of 6 (approx. 270g total)";
  } else if (catSlug === "pastries") {
    if (!unitWeightGrams) unitWeightGrams = 95;
    if (!servingYield) servingYield = "Approx. 95g (72 butter layers)";
  }

  return {
    id: doc.$id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
    price: Number(doc.price),
    discount_type: doc.discount_type,
    discount_value: Number(doc.discount_value),
    image_url: primaryCoverImage,
    images: images,
    pinned_image_url: primaryCoverImage,
    stock: Number(doc.stock),
    category_id: doc.category_id ?? null,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    sort_order: customOrder !== undefined ? customOrder : (doc.sort_order ?? 0),
    item_type: itemType,
    unit_weight_grams: unitWeightGrams,
    serving_yield: servingYield,
    weight_variants: weightVariants,
  };
}

export function mapCategory(doc: Doc<CategoryDoc>) {
  const override = findCategoryOverride(doc.$id, doc.slug);
  return {
    id: doc.$id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? null,
    sort_order: override?.sort_order ?? (doc.sort_order || 0),
    layout_rows: override?.layout_rows ?? (doc.layout_rows || 1),
  };
}

export async function loadCatalog() {
  try {
    if (isAppwriteConfigured()) {
      const [products, categories] = await Promise.all([
        listDocs<ProductDoc>(COLLECTIONS.products, [
          Q.equal("is_active", true),
          Q.limit(200),
        ]),
        listDocs<CategoryDoc>(COLLECTIONS.categories, [Q.orderAsc("sort_order"), Q.limit(50)]),
      ]);

      if (products.length > 0 || categories.length > 0) {
        // Merge missing seed categories (e.g. Brownies)
        const existingCatSlugs = new Set(categories.map((c) => (c.slug || "").toLowerCase()));
        const mergedCategories = [...categories];

        for (const seedCat of SEED_CATEGORIES) {
          if (!existingCatSlugs.has(seedCat.slug.toLowerCase())) {
            mergedCategories.push({
              $id: `cat_${seedCat.slug}`,
              $createdAt: new Date().toISOString(),
              $updatedAt: new Date().toISOString(),
              $permissions: [],
              $collectionId: COLLECTIONS.categories,
              $databaseId: "",
              name: seedCat.name,
              slug: seedCat.slug,
              description: seedCat.description,
              sort_order: seedCat.sort_order,
              layout_rows: seedCat.layout_rows ?? 1,
            } as Doc<CategoryDoc>);
          }
        }

        const mappedCats = mergedCategories
          .map(mapCategory)
          .sort((a, b) => a.sort_order - b.sort_order);

        // Merge missing seed products (e.g. Signature Belgian Truffle Fudge Brownie, etc.)
        const existingProdSlugs = new Set(products.map((p) => (p.slug || "").toLowerCase()));
        const mergedProducts = [...products];

        for (const seedProd of SEED_PRODUCTS) {
          if (!existingProdSlugs.has(seedProd.slug.toLowerCase())) {
            mergedProducts.push({
              $id: seedProd.id,
              $createdAt: new Date().toISOString(),
              $updatedAt: new Date().toISOString(),
              $permissions: [],
              $collectionId: COLLECTIONS.products,
              $databaseId: "",
              name: seedProd.name,
              slug: seedProd.slug,
              description: seedProd.description,
              price: seedProd.price,
              discount_type: seedProd.discount_type,
              discount_value: seedProd.discount_value,
              image_url: seedProd.image_url,
              images: seedProd.images,
              stock: seedProd.stock,
              is_active: seedProd.is_active,
              category_id: seedProd.category_id,
              category_slug: seedProd.category_slug,
              sort_order: seedProd.sort_order,
              item_type: seedProd.item_type,
              unit_weight_grams: seedProd.unit_weight_grams,
              serving_yield: seedProd.serving_yield,
              weight_variants_json: seedProd.weight_variants_json,
            } as unknown as Doc<ProductDoc>);
          }
        }

        const mappedProds = mergedProducts
          .map((p) => mapProduct(p, mergedCategories))
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

        return {
          products: mappedProds,
          categories: mappedCats,
        };
      }
    }
  } catch {
    // Fall back to seed catalog
  }

  // Seamless fallback with persistent active overrides
  const mappedSeedCats = SEED_CATEGORIES.map((c, idx) => {
    const id = `cat_${c.slug}`;
    const override = findCategoryOverride(id, c.slug);
    return {
      id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sort_order: override?.sort_order ?? c.sort_order ?? idx + 1,
      layout_rows: override?.layout_rows ?? (c.layout_rows || 1),
    };
  }).sort((a, b) => a.sort_order - b.sort_order);

  const mappedSeedProds = SEED_PRODUCTS.map((p, idx) => {
    const customOrder = findProductSequenceOverride(p.id, p.slug);
    const weightOverride = findProductWeightOverride(p.id, p.slug);
    const isCake = p.category_slug === "cakes" || p.category_slug === "cheesecakes";

    let itemType: "weight" | "unit" | "pack" = weightOverride?.item_type || p.item_type || (isCake ? "weight" : "unit");
    let unitWeightGrams = weightOverride?.unit_weight_grams ?? p.unit_weight_grams ?? null;
    let servingYield = weightOverride?.serving_yield ?? p.serving_yield ?? null;
    let weightVariants: ProductWeightVariant[] | null = weightOverride?.weight_variants ?? null;

    if (!weightVariants && p.weight_variants_json) {
      try {
        weightVariants = JSON.parse(p.weight_variants_json);
      } catch {}
    }

    if (isCake) {
      itemType = "weight";
      if (!weightVariants || weightVariants.length === 0) {
        weightVariants = generateSmartCakeWeightVariants(p.price, 250);
      }
      if (!unitWeightGrams) unitWeightGrams = 500;
      if (!servingYield) servingYield = "500g (Serves 5–7 Guests)";
    } else if (p.category_slug === "tea-cakes") {
      if (!unitWeightGrams) unitWeightGrams = 300;
      if (!servingYield) servingYield = "300g (16–18 Pieces)";
    } else if (p.category_slug === "breads") {
      if (!unitWeightGrams) unitWeightGrams = 650;
      if (!servingYield) servingYield = "Approx. 650g artisan loaf · 36h ferment";
    } else if (p.category_slug === "brownies") {
      if (!unitWeightGrams) unitWeightGrams = 90;
      if (!servingYield) servingYield = "Approx. 90g fudgy square";
    } else if (p.category_slug === "cookies") {
      if (!unitWeightGrams) unitWeightGrams = 270;
      if (!servingYield) servingYield = "Box of 6 (approx. 270g total)";
    } else if (p.category_slug === "pastries") {
      if (!unitWeightGrams) unitWeightGrams = 95;
      if (!servingYield) servingYield = "Approx. 95g (72 butter layers)";
    }

    const seedImages: string[] = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []);
    const primaryImg: string | null = (p.image_url ?? (seedImages.length > 0 ? seedImages[0] : null)) ?? null;

    const mapped: CatalogProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      price: p.price,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      image_url: primaryImg,
      images: weightOverride?.images && weightOverride.images.length > 0 ? weightOverride.images : seedImages,
      pinned_image_url: primaryImg,
      stock: p.stock,
      category_id: p.category_id,
      category_name: SEED_CATEGORIES.find((c) => c.slug === p.category_slug)?.name ?? "Bakery",
      category_slug: p.category_slug,
      sort_order: customOrder !== undefined ? customOrder : idx,
      item_type: itemType,
      unit_weight_grams: unitWeightGrams,
      serving_yield: servingYield,
      weight_variants: weightVariants,
    };
    return mapped;
  }).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

  return {
    products: mappedSeedProds,
    categories: mappedSeedCats,
  };
}

export async function loadProductBySlug(slug: string) {
  const catalog = await loadCatalog();
  const product = catalog.products.find((p) => p.slug === slug) || catalog.products[0]!;
  const sameCat = catalog.products.filter(
    (p) => p.slug !== product.slug && p.category_id === product.category_id,
  );
  const otherCat = catalog.products.filter(
    (p) => p.slug !== product.slug && p.category_id !== product.category_id,
  );
  const related = [...sameCat, ...otherCat].slice(0, 3);

  return {
    product,
    related,
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