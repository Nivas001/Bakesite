

const ENDPOINT = (process.env['APPWRITE_ENDPOINT'] ?? 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const PROJECT = process.env['APPWRITE_PROJECT_ID'];
const KEY = process.env['APPWRITE_API_KEY'];
const DB = process.env['APPWRITE_DATABASE_ID'] ?? 'bakery';

if (!PROJECT || !KEY) {
  console.error('Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY in .env before running this script.');
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

async function main() {
  const productsResponse = await api(`/databases/${DB}/collections/products/documents`);
  const products = productsResponse.documents;

  const imageMap: Record<string, string> = {
    'dark-chocolate-cake': '/products/chocolate-cake.jpg',
    'strawberry-cream-cake': '/products/strawberry-cake.jpg',
    'butter-croissant': '/products/croissant.jpg',
    'almond-danish': '/products/pistachio-danish.jpg',
    'choc-chip-cookies': '/products/choc-chip-cookies.jpg',
    'oat-raisin-cookies': '/products/cocoa-cookies.jpg',
    'country-sourdough': '/products/cinnamon-bun.jpg', // No bread image, use bun
    'brioche-loaf': '/products/vanilla-cake.jpg', // Fallback
  };

  for (const product of products) {
    const imageUrl = imageMap[product.slug];
    if (imageUrl) {
      console.log(`Updating ${product.name} with image ${imageUrl}`);
      await api(`/databases/${DB}/collections/products/documents/${product.$id}`, 'PATCH', {
        data: { image_url: imageUrl },
      });
    }
  }

  console.log('Finished updating product images!');
}

main().catch(console.error);
