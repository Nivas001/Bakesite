import { COLLECTIONS, Q, createDoc, findDoc } from '@/integrations/appwrite/admin.server';

export type AppRole = 'admin' | 'customer';

function bootstrapAdminEmails(): string[] {
  return (process.env['APPWRITE_ADMIN_EMAILS'] ?? 'nivassri183@gmail.com')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const doc = await findDoc(COLLECTIONS.userRoles, [Q.equal('user_id', userId), Q.equal('role', role)]);
  return Boolean(doc);
}

export async function grantRole(userId: string, role: AppRole): Promise<void> {
  if (await hasRole(userId, role)) return;
  await createDoc(COLLECTIONS.userRoles, { user_id: userId, role });
}

/** Grants the admin role to the configured bootstrap email(s) on first sign-in. */
export async function ensureBootstrapAdmin(userId: string, email: string): Promise<void> {
  if (!bootstrapAdminEmails().includes(email.toLowerCase())) return;
  try {
    await grantRole(userId, 'admin');
  } catch (error) {
    console.error('[roles] bootstrap admin grant failed', error);
  }
}

export async function assertAdmin(userId: string): Promise<void> {
  if (!(await hasRole(userId, 'admin'))) throw new Error('Forbidden: admin access required');
}