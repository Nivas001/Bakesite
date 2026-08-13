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