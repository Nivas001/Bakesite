/**
 * Signed unsubscribe links.
 *
 * The unsubscribe endpoint previously removed whatever address it was handed,
 * so anyone could unsubscribe anyone. Links now carry an HMAC of the address,
 * which proves the link came from an email we sent without needing any extra
 * storage.
 *
 * The secret falls back to the Appwrite API key when NEWSLETTER_SECRET is not
 * set, so links keep working in an environment that has not been given a
 * dedicated secret yet; both are server-only values.
 */

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env["NEWSLETTER_SECRET"] ?? process.env["APPWRITE_API_KEY"];
  if (!value) throw new Error("No secret available to sign unsubscribe links");
  return value;
}

/** Base64url, so the token is safe in a query string. */
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(email.trim().toLowerCase()));
  return toBase64Url(new Uint8Array(mac)).slice(0, 32);
}

/** The token to append to an unsubscribe link for `email`. */
export async function createUnsubscribeToken(email: string): Promise<string> {
  return sign(email);
}

/**
 * Whether `token` was issued for `email`.
 *
 * Compares in constant time so the check cannot be used as an oracle to
 * recover a valid token byte by byte.
 */
export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  const expected = await sign(email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
