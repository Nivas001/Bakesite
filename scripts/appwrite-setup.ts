/**
 * Provisions the Appwrite database, collections, attributes and indexes used by
 * the bakery app, then seeds starter categories and products.
 *
 * Usage:
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
 *   APPWRITE_DATABASE_ID=bakery bun run scripts/appwrite-setup.ts
 */
const ENDPOINT = (process.env['APPWRITE_ENDPOINT'] ?? 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const PROJECT = process.env['APPWRITE_PROJECT_ID'];
const KEY = process.env['APPWRITE_API_KEY'];
const DB = process.env['APPWRITE_DATABASE_ID'] ?? 'bakery';

if (!PROJECT || !KEY) {
  console.error('Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY before running this script.');
  process.exit(1);
}

async function api(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'X-Appwrite-Project': PROJECT!,
      'X-Appwrite-Key': KEY!,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok && response.status !== 409) {
    throw new Error(`${method} ${path} -> ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

type Attr =
  | { key: string; type: 'string'; size: number; required?: boolean; array?: boolean }
  | { key: string; type: 'integer' | 'double'; required?: boolean; default?: number }
  | { key: string; type: 'boolean'; required?: boolean; default?: boolean }
  | { key: string; type: 'datetime'; required?: boolean }
  | { key: string; type: 'email'; required?: boolean };

async function createAttribute(collection: string, attr: Attr) {
  const base = `/databases/${DB}/collections/${collection}/attributes`;
  const required = attr.required ?? false;
  switch (attr.type) {
    case 'string':
      return api(`${base}/string`, 'POST', { key: attr.key, size: attr.size, required });
    case 'integer':
      return api(`${base}/integer`, 'POST', { key: attr.key, required, default: attr.default ?? null });
    case 'double':
      return api(`${base}/float`, 'POST', { key: attr.key, required, default: attr.default ?? null });
    case 'boolean':
      return api(`${base}/boolean`, 'POST', { key: attr.key, required, default: attr.default ?? null });
    case 'datetime':
      return api(`${base}/datetime`, 'POST', { key: attr.key, required });
    case 'email':
      return api(`${base}/email`, 'POST', { key: attr.key, required });
  }
}

async function collection(id: string, name: string, attrs: Attr[], indexes: string[][] = []) {
  await api(`/databases/${DB}/collections`, 'POST', {
    collectionId: id,
    name,
    permissions: [],
    documentSecurity: false,
    enabled: true,
  });
  for (const attr of attrs) {
    await createAttribute(id, attr);
  }
  // attributes need a moment to become available before indexing
  await new Promise((resolve) => setTimeout(resolve, 1500));
  for (const attributes of indexes) {
    await api(`/databases/${DB}/collections/${id}/indexes`, 'POST', {
      key: `idx_${attributes.join('_')}`,
      type: 'key',
      attributes,
      orders: attributes.map(() => 'ASC'),
    });
  }
  console.log(`✓ ${id}`);
}

async function main() {
  await api('/databases', 'POST', { databaseId: DB, name: 'Bakery' });

  await collection('profiles', 'Profiles', [
    { key: 'user_id', type: 'string', size: 64, required: true },
    { key: 'full_name', type: 'string', size: 120 },
    { key: 'phone', type: 'string', size: 20 },
    { key: 'address', type: 'string', size: 500 },
    { key: 'latitude', type: 'double' },
    { key: 'longitude', type: 'double' },
  ], [['user_id']]);

  await collection('user_roles', 'User roles', [
    { key: 'user_id', type: 'string', size: 64, required: true },
    { key: 'role', type: 'string', size: 20, required: true },
  ], [['user_id', 'role']]);

  await collection('categories', 'Categories', [
    { key: 'name', type: 'string', size: 120, required: true },
    { key: 'slug', type: 'string', size: 120, required: true },
    { key: 'description', type: 'string', size: 500 },
    { key: 'sort_order', type: 'integer', default: 0 },
  ], [['slug'], ['sort_order']]);

  await collection('products', 'Products', [
    { key: 'name', type: 'string', size: 120, required: true },
    { key: 'slug', type: 'string', size: 120, required: true },
    { key: 'description', type: 'string', size: 600 },
    { key: 'price', type: 'double', required: true },
    { key: 'discount_type', type: 'string', size: 20, required: true },
    { key: 'discount_value', type: 'double', default: 0 },
    { key: 'image_url', type: 'string', size: 500 },
    { key: 'stock', type: 'integer', default: 0 },
    { key: 'is_active', type: 'boolean', default: true },
    { key: 'category_id', type: 'string', size: 64 },
  ], [['slug'], ['is_active'], ['category_id'], ['name']]);

  await collection('orders', 'Orders', [
    { key: 'user_id', type: 'string', size: 64, required: true },
    { key: 'status', type: 'string', size: 30, required: true },
    { key: 'fulfilment_type', type: 'string', size: 20, required: true },
    { key: 'slot_date', type: 'string', size: 10, required: true },
    { key: 'slot_start', type: 'string', size: 8, required: true },
    { key: 'slot_end', type: 'string', size: 8, required: true },
    { key: 'subtotal', type: 'double', default: 0 },
    { key: 'discount_total', type: 'double', default: 0 },
    { key: 'total', type: 'double', default: 0 },
    { key: 'contact_name', type: 'string', size: 120 },
    { key: 'contact_phone', type: 'string', size: 20 },
    { key: 'delivery_address', type: 'string', size: 500 },
    { key: 'delivery_lat', type: 'double' },
    { key: 'delivery_lng', type: 'double' },
    { key: 'notes', type: 'string', size: 500 },
    { key: 'payment_link_url', type: 'string', size: 500 },
    { key: 'payment_ref', type: 'string', size: 120 },
    { key: 'paid_at', type: 'datetime' },
  ], [['user_id'], ['status'], ['slot_date']]);

  await collection('order_items', 'Order items', [
    { key: 'order_id', type: 'string', size: 64, required: true },
    { key: 'product_id', type: 'string', size: 64 },
    { key: 'product_name', type: 'string', size: 120, required: true },
    { key: 'unit_price', type: 'double', required: true },
    { key: 'quantity', type: 'integer', required: true },
    { key: 'line_total', type: 'double', required: true },
  ], [['order_id'], ['product_id']]);

  await collection('reviews', 'Reviews', [
    { key: 'product_id', type: 'string', size: 64, required: true },
    { key: 'user_id', type: 'string', size: 64, required: true },
    { key: 'rating', type: 'integer', required: true },
    { key: 'comment', type: 'string', size: 600 },
  ], [['product_id'], ['user_id']]);

  await collection('blackout_dates', 'Blackout dates', [
    { key: 'blackout_date', type: 'string', size: 10, required: true },
    { key: 'reason', type: 'string', size: 200 },
  ], [['blackout_date']]);

  await collection('newsletter_subscribers', 'Newsletter subscribers', [
    { key: 'email', type: 'email', required: true },
    { key: 'name', type: 'string', size: 120 },
    { key: 'is_subscribed', type: 'boolean', default: true },
  ], [['email']]);

  await collection('newsletter_campaigns', 'Newsletter campaigns', [
    { key: 'subject', type: 'string', size: 160, required: true },
    { key: 'body', type: 'string', size: 5000, required: true },
    { key: 'recipients', type: 'integer', default: 0 },
    { key: 'created_by', type: 'string', size: 64 },
  ]);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await seed();
  console.log('\nAppwrite setup complete.');
}

async function seed() {
  const categories = [
    { name: 'Breads', slug: 'breads', description: 'Slow-fermented sourdough and soft loaves', sort_order: 1 },
    { name: 'Cakes', slug: 'cakes', description: 'Celebration cakes and tea-time slices', sort_order: 2 },
    { name: 'Pastries', slug: 'pastries', description: 'Buttery, laminated and flaky', sort_order: 3 },
    { name: 'Cookies', slug: 'cookies', description: 'Crisp edges, chewy centres', sort_order: 4 },
  ];

  const created: Record<string, string> = {};
  for (const category of categories) {
    const doc = await api(`/databases/${DB}/collections/categories/documents`, 'POST', {
      documentId: 'unique()',
      data: category,
    });
    if (doc?.$id) created[category.slug] = doc.$id;
  }

  const products = [
    { name: 'Country Sourdough', slug: 'country-sourdough', price: 260, category: 'breads', stock: 20, description: '24-hour fermented loaf with a crackling crust.' },
    { name: 'Brioche Loaf', slug: 'brioche-loaf', price: 320, category: 'breads', stock: 15, description: 'Rich, buttery and pillowy soft.' },
    { name: 'Dark Chocolate Cake', slug: 'dark-chocolate-cake', price: 850, category: 'cakes', stock: 8, description: 'Single-origin cocoa sponge with silky ganache.' },
    { name: 'Strawberry Cream Cake', slug: 'strawberry-cream-cake', price: 920, category: 'cakes', stock: 6, description: 'Fresh cream, vanilla sponge, seasonal berries.' },
    { name: 'Butter Croissant', slug: 'butter-croissant', price: 120, category: 'pastries', stock: 40, description: '72 layers of French butter.' },
    { name: 'Almond Danish', slug: 'almond-danish', price: 150, category: 'pastries', stock: 25, description: 'Frangipane filled, toasted almond top.' },
    { name: 'Choc Chip Cookies', slug: 'choc-chip-cookies', price: 180, category: 'cookies', stock: 30, description: 'Box of six, sea-salt finished.' },
    { name: 'Oat Raisin Cookies', slug: 'oat-raisin-cookies', price: 160, category: 'cookies', stock: 30, description: 'Chewy oats with plump raisins.' },
  ];

  for (const product of products) {
    await api(`/databases/${DB}/collections/products/documents`, 'POST', {
      documentId: 'unique()',
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discount_type: 'none',
        discount_value: 0,
        image_url: null,
        stock: product.stock,
        is_active: true,
        category_id: created[product.category] ?? null,
      },
    });
  }
  console.log('✓ seeded categories and products');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});