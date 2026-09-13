import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Origins the app genuinely talks to. Anything not listed here is refused by
 * the content security policy.
 */
const APPWRITE_ORIGINS =
  "https://auth.anibakes.app https://*.appwrite.io https://cloud.appwrite.io";
const CLARITY_ORIGINS = "https://www.clarity.ms https://*.clarity.ms";
const RAZORPAY_ORIGINS = "https://api.razorpay.com https://checkout.razorpay.com";

/**
 * `script-src` still needs `unsafe-inline`: TanStack Start streams inline
 * hydration scripts and Clarity injects an inline bootstrap. Moving to nonces
 * would let this drop, and is the natural next tightening step.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${CLARITY_ORIGINS} ${RAZORPAY_ORIGINS}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Product imagery is admin-supplied and may be hosted anywhere.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  `connect-src 'self' ${APPWRITE_ORIGINS} ${CLARITY_ORIGINS} ${RAZORPAY_ORIGINS} https://tile.openstreetmap.org https://*.tile.openstreetmap.org`,
  `frame-src ${RAZORPAY_ORIGINS}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Applies the security headers to every response.
 *
 * The policy ships in report-only mode unless `CSP_ENFORCE` is set, so it can
 * be validated against real traffic before it is able to break a live page.
 * Every other header here is safe to enforce immediately.
 */
function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), payment=(self), geolocation=(self), interest-cohort=()",
  );
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set(
    process.env["CSP_ENFORCE"] === "true"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only",
    CSP,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
