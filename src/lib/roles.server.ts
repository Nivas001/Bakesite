import { COLLECTIONS, Q, createDoc, findDoc, listDocs } from "@/integrations/appwrite/admin.server";

export type AppRole = "admin" | "customer";

function bootstrapAdminEmails(): string[] {
  return (process.env["APPWRITE_ADMIN_EMAILS"] ?? "nivassri183@gmail.com")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const doc = await findDoc(COLLECTIONS.userRoles, [
    Q.equal("user_id", userId),
    Q.equal("role", role),
  ]);
  return Boolean(doc);
}

export async function grantRole(userId: string, role: AppRole): Promise<void> {
  if (await hasRole(userId, role)) return;
  await createDoc(COLLECTIONS.userRoles, { user_id: userId, role });
}

/**
 * Grants the admin role from APPWRITE_ADMIN_EMAILS, but only until the first
 * admin exists.
 *
 * This used to run on every sign-in forever, so admin permanently followed the
 * listed mailbox: if that address were compromised, or the domain lapsed and
 * the address were re-registered, the new owner would be handed admin on their
 * first sign-in. Once any admin is on record, further promotion has to go
 * through an existing admin instead.
 */
export async function ensureBootstrapAdmin(userId: string, email: string): Promise<void> {
  if (!bootstrapAdminEmails().includes(email.toLowerCase())) return;

  try {
    // Already an admin: nothing to do, and no need to scan the collection.
    if (await hasRole(userId, "admin")) return;

    const existingAdmins = await listDocs(COLLECTIONS.userRoles, [
      Q.equal("role", "admin"),
      Q.limit(1),
    ]);
    if (existingAdmins.length > 0) {
      console.warn(
        "[roles] bootstrap skipped: an admin already exists. Promote this account from the admin panel instead.",
      );
      return;
    }

    await grantRole(userId, "admin");
    console.info("[roles] bootstrap admin granted to the first listed address");
  } catch (error) {
    console.error("[roles] bootstrap admin grant failed", error);
  }
}

export async function assertAdmin(userId: string): Promise<void> {
  if (!(await hasRole(userId, "admin"))) throw new Error("Forbidden: admin access required");
}
