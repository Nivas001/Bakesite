/**
 * scripts/seed-categories.ts
 * One-time script to create all missing seed categories in Appwrite.
 * Run with: npx tsx scripts/seed-categories.ts
 */

import "dotenv/config";

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "bakery";
const COLLECTION = "categories";

if (!PROJECT_ID || !API_KEY) {
  console.error("APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in .env");
  process.exit(1);
}

const SEED_CATEGORIES = [
  { id: "cat_brownies",   name: "Brownies",    slug: "brownies",    description: "Rich chocolate in every fudgy bite",                            sort_order: 1 },
  { id: "cat_cheesecakes", name: "Cheesecakes", slug: "cheesecakes", description: "A perfect harmony of cream cheese and sweetness",              sort_order: 2 },
  { id: "cat_cakes",      name: "Cakes",        slug: "cakes",       description: "Celebration cakes, bento boxes, and artisan layered specials", sort_order: 3 },
  { id: "cat_tea_cakes",  name: "Tea-Cakes",    slug: "tea-cakes",   description: "A slice of comfort with every cup of tea (16-18 Pieces / 300g)", sort_order: 4 },
  { id: "cat_pastries",   name: "Pastries",     slug: "pastries",    description: "72-layer French butter laminated croissants and danishes",     sort_order: 5 },
  { id: "cat_breads",     name: "Breads",       slug: "breads",      description: "36-hour wild-fermented crusty sourdough loaves",               sort_order: 6 },
  { id: "cat_cookies",    name: "Cookies",      slug: "cookies",     description: "Crisp golden edges, chewy brown-butter centres",               sort_order: 7 },
];

async function appwriteRequest(path, method = "GET", body) {
  const url = ${ENDPOINT.replace(/\/$/, "")}/databases//collections/;
  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      "X-Appwrite-Response-Format": "1.6.0",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) return { error: text, status: res.status };
  return res.status === 204 ? { ok: true } : { ok: true, data: JSON.parse(text) };
}

async function getDoc(id) {
  return appwriteRequest(/documents/);
}

async function createDoc(id, data) {
  return appwriteRequest("/documents", "POST", { documentId: id, data });
}

async function updateDoc(id, data) {
  return appwriteRequest(/documents/, "PATCH", { data });
}

async function seedCategory(cat) {
  const { id, name, slug, description, sort_order } = cat;
  const data = { name, slug, description, sort_order, layout_rows: 1 };
  const existing = await getDoc(id);
  if (existing.error) {
    const result = await createDoc(id, data);
    if (result.error) {
      console.log(  FAIL  : );
    } else {
      console.log(  OK    Created "" ());
    }
  } else {
    const result = await updateDoc(id, data);
    if (result.error) {
      console.log(  WARN   exists but update failed: );
    } else {
      console.log(  UPDATE "" () - already existed, refreshed);
    }
  }
}

async function main() {
  console.log("Seeding categories into Appwrite...");
  for (const cat of SEED_CATEGORIES) {
    await seedCategory(cat);
  }
  console.log("Done!");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
