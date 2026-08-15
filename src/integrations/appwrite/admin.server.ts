// Server-only Appwrite REST client (API key). Never import from client code.
import { COLLECTIONS } from './config';

export { COLLECTIONS };

export type Doc<T> = T & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

function endpoint(): string {
  return env('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
}

function databaseId(): string {
  return env('APPWRITE_DATABASE_ID', 'bakery');
}

/** True once the Appwrite server credentials are present. */
export function isAppwriteConfigured(): boolean {
  return Boolean(process.env['APPWRITE_PROJECT_ID'] && process.env['APPWRITE_API_KEY']);
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const response = await fetch(`${endpoint()}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      'X-Appwrite-Project': env('APPWRITE_PROJECT_ID'),
      'X-Appwrite-Key': env('APPWRITE_API_KEY'),
      'X-Appwrite-Response-Format': '1.6.0',
      ...init.headers,
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Appwrite ${response.status}: ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Appwrite query builders (JSON string form used by Appwrite 1.5+). */
export const Q = {
  equal: (attribute: string, values: unknown | unknown[]) =>
    JSON.stringify({ method: 'equal', attribute, values: toArray(values) }),
  notEqual: (attribute: string, value: unknown) =>
    JSON.stringify({ method: 'notEqual', attribute, values: [value] }),
  greaterEqual: (attribute: string, value: unknown) =>
    JSON.stringify({ method: 'greaterThanEqual', attribute, values: [value] }),
  lessEqual: (attribute: string, value: unknown) =>
    JSON.stringify({ method: 'lessThanEqual', attribute, values: [value] }),
  orderAsc: (attribute: string) => JSON.stringify({ method: 'orderAsc', attribute }),
  orderDesc: (attribute: string) => JSON.stringify({ method: 'orderDesc', attribute }),
  limit: (value: number) => JSON.stringify({ method: 'limit', values: [value] }),
  offset: (value: number) => JSON.stringify({ method: 'offset', values: [value] }),
};

function toArray(value: unknown | unknown[]): unknown[] {
  return Array.isArray(value) ? value : [value];
}

function docPath(collection: string, id?: string): string {
  const base = `/databases/${databaseId()}/collections/${collection}/documents`;
  return id ? `${base}/${id}` : base;
}

export async function listDocs<T>(collection: string, queries: string[] = []): Promise<Doc<T>[]> {
  const search = queries.map((q) => `queries[]=${encodeURIComponent(q)}`).join('&');
  const result = await request<{ documents: Doc<T>[] }>(
    `${docPath(collection)}${search ? `?${search}` : ''}`,
  );
  return result.documents;
}

export async function findDoc<T>(collection: string, queries: string[]): Promise<Doc<T> | null> {
  const docs = await listDocs<T>(collection, [...queries, Q.limit(1)]);
  return docs[0] ?? null;
}

export async function getDoc<T>(collection: string, id: string): Promise<Doc<T> | null> {
  try {
    return await request<Doc<T>>(docPath(collection, id));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Appwrite 404')) return null;
    throw error;
  }
}

export async function createDoc<T>(
  collection: string,
  data: Record<string, unknown>,
  documentId = 'unique()',
): Promise<Doc<T>> {
  return request<Doc<T>>(docPath(collection), {
    method: 'POST',
    body: { documentId, data },
  });
}

export async function updateDoc<T>(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Doc<T>> {
  return request<Doc<T>>(docPath(collection, id), { method: 'PATCH', body: { data } });
}

export async function upsertDoc<T>(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Doc<T>> {
  const existing = await getDoc<T>(collection, id);
  return existing ? updateDoc<T>(collection, id, data) : createDoc<T>(collection, data, id);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  await request(docPath(collection, id), { method: 'DELETE' });
}

export type AppwriteAccount = { $id: string; email: string; name: string };

/** Verifies a client JWT and returns the account it belongs to. */
export async function getAccountFromJwt(jwt: string): Promise<AppwriteAccount> {
  const response = await fetch(`${endpoint()}/account`, {
    headers: {
      'content-type': 'application/json',
      'X-Appwrite-Project': env('APPWRITE_PROJECT_ID'),
      'X-Appwrite-JWT': jwt,
    },
  });
  if (!response.ok) throw new Error('Unauthorized: invalid or expired session');
  return (await response.json()) as AppwriteAccount;
}

export async function getUserById(userId: string): Promise<AppwriteAccount | null> {
  try {
    return await request<AppwriteAccount>(`/users/${userId}`);
  } catch {
    return null;
  }
}

export type AppwriteAuthUser = {
  $id: string;
  $createdAt: string;
  name: string;
  registration: string;
  status: boolean;
  email: string;
  phone: string;
  emailVerification: boolean;
  accessedAt: string;
};

/** Fetches users from Appwrite Auth users table */
export async function listAppwriteUsers(): Promise<AppwriteAuthUser[]> {
  try {
    const res = await request<{ total: number; users: AppwriteAuthUser[] }>(
      '/users?queries[]=limit(100)&queries[]=orderDesc("$createdAt")',
    );
    return res.users || [];
  } catch (err) {
    console.warn("Failed to list Appwrite auth users:", err);
    return [];
  }
}

/** Updates user's phone number in Appwrite Auth */
export async function updateUserPhone(userId: string, phone: string): Promise<void> {
  try {
    await request(`/users/${userId}/phone`, {
      method: 'PATCH',
      body: { phone },
    });
  } catch (err) {
    console.warn(`Could not sync phone to Appwrite Auth for user ${userId}:`, err);
  }
}

/** Updates user's name in Appwrite Auth */
export async function updateUserName(userId: string, name: string): Promise<void> {
  try {
    await request(`/users/${userId}/name`, {
      method: 'PATCH',
      body: { name },
    });
  } catch (err) {
    console.warn(`Could not sync name to Appwrite Auth for user ${userId}:`, err);
  }
}

const STORAGE_BUCKET_ID = 'products';

/** Ensures the storage bucket exists with public read permissions */
export async function ensureStorageBucket(): Promise<string> {
  try {
    await request(`/storage/buckets/${STORAGE_BUCKET_ID}`);
    return STORAGE_BUCKET_ID;
  } catch {
    try {
      await request('/storage/buckets', {
        method: 'POST',
        body: {
          bucketId: STORAGE_BUCKET_ID,
          name: 'Bakery Products & Media',
          permissions: ['read("any")'],
          fileSecurity: false,
          enabled: true,
          maximumFileSize: 10 * 1024 * 1024,
          allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'],
        },
      });
      return STORAGE_BUCKET_ID;
    } catch {
      return STORAGE_BUCKET_ID;
    }
  }
}

/** Uploads binary file to Appwrite Storage and returns public view URL */
export async function uploadProductImage(input: {
  filename: string;
  base64: string;
  mimeType: string;
}): Promise<string> {
  const bucket = await ensureStorageBucket();

  const buffer = Buffer.from(input.base64, 'base64');
  const blob = new Blob([buffer], { type: input.mimeType || 'image/jpeg' });

  const formData = new FormData();
  formData.append('fileId', 'unique()');
  formData.append('file', blob, input.filename || 'product.jpg');
  formData.append('permissions', JSON.stringify(['read("any")']));

  const response = await fetch(`${endpoint()}/storage/buckets/${bucket}/files`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': env('APPWRITE_PROJECT_ID'),
      'X-Appwrite-Key': env('APPWRITE_API_KEY'),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload image to Appwrite Storage: ${errorText}`);
  }

  const file = (await response.json()) as { $id: string };
  return `${endpoint()}/storage/buckets/${bucket}/files/${file.$id}/view?project=${env('APPWRITE_PROJECT_ID')}`;
}