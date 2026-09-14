import { getRequest } from "@tanstack/react-start/server";

/**
 * A token bucket for the public, unauthenticated endpoints.
 *
 * Scope and limits, stated plainly: the buckets live in the module scope of a
 * single worker isolate. Cloudflare reuses an isolate across many requests, so
 * this stops the obvious abuse — one client hammering promo-code guesses or
 * flooding the subscribe endpoint — but a distributed attacker, or traffic
 * spread across isolates, gets one bucket per isolate rather than one globally.
 *
 * The durable version is the same logic backed by a Durable Object or KV keyed
 * on the same identifier; `consume` is deliberately shaped so that swapping the
 * store is the only change required.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/** Stops the map growing without bound when many distinct clients appear. */
const MAX_TRACKED = 5_000;

export interface RateLimit {
  /** Bucket capacity, which is also the maximum burst. */
  limit: number;
  /** Seconds for the bucket to refill from empty. */
  windowSeconds: number;
}

export const LIMITS = {
  /** Promo-code guesses. Generous for a person, useless for a dictionary attack. */
  promoCheck: { limit: 10, windowSeconds: 60 },
  /** Newsletter signup. */
  newsletter: { limit: 5, windowSeconds: 300 },
  /** Anything else public and mutating. */
  general: { limit: 30, windowSeconds: 60 },
} as const satisfies Record<string, RateLimit>;

/**
 * Identifies the caller.
 *
 * Prefers Cloudflare's connecting-IP header, which the edge sets and a client
 * cannot forge. `x-forwarded-for` is only consulted as a fallback for other
 * hosts, and only its first entry.
 */
function callerId(): string {
  const request = getRequest();
  const headers = request?.headers;
  if (!headers) return "unknown";

  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();

  return headers.get("x-real-ip") ?? "unknown";
}

/**
 * Takes one token for `bucketName` from the calling client's bucket.
 *
 * @throws when the bucket is empty, with a message safe to show a customer.
 */
export function consume(bucketName: keyof typeof LIMITS): void {
  const { limit, windowSeconds } = LIMITS[bucketName];
  const key = `${bucketName}:${callerId()}`;
  const now = Date.now();

  if (buckets.size > MAX_TRACKED) {
    // Drop the least recently touched half rather than growing forever.
    const entries = [...buckets.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt);
    for (const [k] of entries.slice(0, Math.floor(entries.length / 2))) buckets.delete(k);
  }

  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };

  // Refill continuously rather than in fixed windows, so a client cannot spend
  // a full bucket at the end of one window and another at the start of the next.
  const refill = ((now - bucket.updatedAt) / 1000) * (limit / windowSeconds);
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryIn = Math.ceil(((1 - bucket.tokens) * windowSeconds) / limit);
    throw new Error(
      `Too many attempts. Please try again in ${retryIn} second${retryIn === 1 ? "" : "s"}.`,
    );
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
}
