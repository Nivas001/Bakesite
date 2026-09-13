/**
 * Findings for the database, auth and security report.
 *
 * Every item was read out of the source in this repository. Severities follow
 * the usual impact/exploitability split; "Fixed" means the change is in this
 * branch, "Open" means it is recommended but not yet applied.
 */

export const ARCHITECTURE = [
  ["Database", "Appwrite Databases, database id from APPWRITE_DATABASE_ID (default 'bakery')"],
  ["Auth", "Appwrite Account — email/password plus Google OAuth2 token flow"],
  ["Storage", "Appwrite Storage, bucket 'products', public read, 10MB cap, image types only"],
  ["Server access", "REST via server-only API key in src/integrations/appwrite/admin.server.ts"],
  ["Client access", "None. The browser SDK is used only for session management"],
  ["Transport", "TanStack Start server functions; every call carries a short-lived Appwrite JWT"],
  ["Payments", "Razorpay payment links, confirmed by a signed webhook"],
  ["Email", "Resend, server-side only"],
];

export const COLLECTIONS = [
  ["profiles", "Customer name, phone, address, lat/lng", "Owner via server fn", "Document id is the Appwrite user id"],
  ["user_roles", "admin / customer grants", "Admin only", "Bootstrapped from APPWRITE_ADMIN_EMAILS"],
  ["categories", "Catalogue taxonomy", "Public read", "Seeded in code when empty"],
  ["products", "Catalogue, pricing, variants", "Public read / admin write", "Seeded in code when empty"],
  ["orders", "Order header, slot, totals, payment", "Owner + admin", "Ownership checked on every mutation"],
  ["order_items", "Line items", "Owner + admin", "Written only alongside an order"],
  ["reviews", "Product ratings", "Verified purchasers", "Gated on a completed order containing the product"],
  ["blackout_dates", "Closed days", "Public read / admin write", ""],
  ["newsletter_subscribers", "Email list", "Admin read", "Subscribe is public by design"],
  ["newsletter_campaigns", "Sent campaigns", "Admin only", ""],
  ["offer_codes", "Promo and voucher codes", "Admin write / public validate", "Falls back to an in-process list on failure"],
];

export const ENDPOINTS = [
  ["getCatalog, getProductBySlug, getBlackoutDates", "Public", "Correct — catalogue data is public"],
  ["getPublicOfferCodes", "Public", "Correct — only active, visible codes are returned"],
  ["checkOfferCode", "Public", "Acceptable, but unthrottled — see F-06"],
  ["subscribeToNewsletter", "Public", "Correct by design"],
  ["unsubscribeFromNewsletter", "Public", "Weak — see F-07"],
  ["getProductReviews", "Public", "Correct"],
  ["claimGameRewardCoupon", "Authenticated", "Fixed this pass — was public"],
  ["getMyProfile, saveMyProfile, placeOrder, getMyOrders", "Authenticated", "Correct"],
  ["cancelRescheduledOrder, reportOrderIssue", "Authenticated + ownership", "Correct"],
  ["getMyReviewState, submitReview", "Authenticated + purchase check", "Correct"],
  ["getMyAccess", "Authenticated", "Correct"],
  ["All 11 admin.functions endpoints", "Authenticated + assertAdmin", "Correct and consistent"],
  ["saveSiteContent, resetSiteContent", "Authenticated + assertAdmin", "Correct"],
  ["Offer code admin endpoints", "Authenticated + assertAdmin", "Correct"],
];

export const FINDINGS = [
  {
    id: "F-01",
    title: "Universal OTP backdoor and PII disclosure",
    severity: "critical",
    status: "fixed",
    where: "src/lib/auth.server.ts, src/lib/auth.functions.ts",
    what:
      "verifyPhoneOtp accepted the literal code \"123456\" for any number, so phone verification could be passed for a phone the caller did not control. sendOtpToPhone also returned the generated code to the caller as devCode. Both endpoints were unauthenticated and unthrottled, and the verify response returned the matching account's id, full name and home address — so the pair could be scripted to walk phone numbers and harvest customer addresses. The OTP store was an unbounded module-level Map, which neither survives nor is shared across workers.",
    action:
      "The entire phone-OTP surface was removed. No UI referenced it. requestPasswordRecovery went with it — a stub that reported \"recovery email sent\" without sending anything, while Appwrite's own sendPasswordRecovery already did the real work.",
  },
  {
    id: "F-02",
    title: "Unauthenticated, unmetered discount-code minting",
    severity: "high",
    status: "fixed",
    where: "src/lib/offers.functions.ts, src/lib/offers.server.ts",
    what:
      "claimGameRewardCoupon required no session and generated a fresh random suffix on every call, so the arcade endpoint could be scripted into unlimited live 15%-off codes.",
    action:
      "Claiming now requires a session, and the suffix is derived from SHA-256(userId:gameId) rather than Math.random. Replaying a game returns the voucher already held instead of minting another, capping each account at one voucher per game. Playing remains open to signed-out visitors.",
  },
  {
    id: "F-03",
    title: "Orders recorded as paid at creation",
    severity: "high",
    status: "fixed",
    where: "src/lib/orders.server.ts",
    what:
      "Every new order was written with paid_at set to the current time and a synthetic payment_ref, despite the status being pending_approval and no money having moved. Financial records stated a payment that had not happened.",
    action:
      "Payment fields stay null until the Razorpay webhook records them. The admin flow (approve, mint link, webhook confirms) is unchanged.",
  },
  {
    id: "F-04",
    title: "Payment webhook verified only the signature",
    severity: "high",
    status: "fixed",
    where: "src/routes/api/public/razorpay-webhook.ts",
    what:
      "The handler checked the HMAC and then confirmed the order unconditionally. It did not check that the order existed, that it had not already been paid, that it had not been rejected or completed, or that the amount received covered the total. Razorpay retries, and a replayed body carries a valid signature.",
    action:
      "The handler now loads the order, returns early if it is already paid, refuses to revive rejected or completed orders, and compares the amount received (in paise) against the order total before confirming.",
  },
  {
    id: "F-05",
    title: "No security response headers",
    severity: "medium",
    status: "fixed",
    where: "src/server.ts",
    what:
      "Responses carried no HSTS, no nosniff, no framing policy, no referrer policy, no permissions policy and no content security policy.",
    action:
      "All are now set on every response. HSTS, nosniff, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy and COOP are enforced. The CSP ships report-only until CSP_ENFORCE=true, so it can be validated against real traffic before it is able to break a live page.",
  },
  {
    id: "F-06",
    title: "No rate limiting on any public endpoint",
    severity: "medium",
    status: "open",
    where: "All public server functions",
    what:
      "checkOfferCode, subscribeToNewsletter and the catalogue endpoints accept unlimited requests. Promo codes can be brute-forced, and the subscribe endpoint can be used to flood the list.",
    action:
      "Add a token bucket in front of the public endpoints keyed on CF-Connecting-IP, backed by Cloudflare KV or a Durable Object so the count survives across workers. Ten attempts per minute is generous for code validation.",
  },
  {
    id: "F-07",
    title: "Newsletter unsubscribe takes any address",
    severity: "medium",
    status: "open",
    where: "src/lib/newsletter.server.ts",
    what:
      "removeSubscriber unsubscribes whatever email it is given, with no proof the caller controls it. Anyone can unsubscribe anyone.",
    action:
      "Issue a signed, expiring token in the unsubscribe link and require it. An HMAC of the email with a server secret is enough and needs no extra storage.",
  },
  {
    id: "F-08",
    title: "Stock is never checked or decremented",
    severity: "medium",
    status: "open",
    where: "src/lib/orders.server.ts",
    what:
      "createOrderForUser checks is_active but never reads stock, and no path reduces it. Any quantity of any active product can be ordered regardless of what the admin recorded.",
    action:
      "Check available stock while pricing the lines and reject with a per-product message. Decrement in the same pass. Left open deliberately: applying it against live data without knowing the current stock values could start rejecting valid orders.",
  },
  {
    id: "F-09",
    title: "Promo redemption is not atomic",
    severity: "medium",
    status: "open",
    where: "src/lib/offers.server.ts",
    what:
      "validatePromoCode reads used_count and markOfferCodeUsed writes it back in a separate request. Two orders placed at once both pass validation, so a single-use voucher can be redeemed twice. markOfferCodeUsed failures are also swallowed, so the count can silently not move at all.",
    action:
      "Guard the increment with a conditional write on the value just read and retry on conflict, or move redemption into an Appwrite Function that owns the document.",
  },
  {
    id: "F-10",
    title: "Silent in-memory fallback for offer codes",
    severity: "medium",
    status: "open",
    where: "src/lib/offers.server.ts",
    what:
      "Every offer-code write is wrapped in a try/catch that falls back to a module-level array. In a serverless deployment that array is per-instance and lost on recycle, so a failed write reports success and the code later does not exist. It also masks genuine outages.",
    action:
      "Keep the seed list for local development only, and let write failures propagate in production so the caller sees the error.",
  },
  {
    id: "F-11",
    title: "Unused Supabase credentials ship to the browser",
    severity: "low",
    status: "open",
    where: "src/integrations/supabase/, src/integrations/lovable/index.ts, .env",
    what:
      "No application code imports the Supabase client; its only importer is the Lovable-generated integrations/lovable/index.ts, which is itself unreferenced. Despite that, the Supabase client and the VITE_SUPABASE_* values are present in the shipped client bundle, adding weight and publishing configuration for a backend the site does not use.",
    action:
      "The generated file is marked \"auto-generated by Lovable. Do not modify\", so it was left in place rather than deleted. Confirm with Lovable that the integration can be removed, then drop the folder, the @supabase/supabase-js dependency and the SUPABASE_* environment variables.",
  },
  {
    id: "F-12",
    title: "Admin bootstrap is email-based and permanent",
    severity: "low",
    status: "open",
    where: "src/lib/roles.server.ts",
    what:
      "Any account signing in with an address listed in APPWRITE_ADMIN_EMAILS is granted admin on first sign-in, and the grant is never re-checked or revoked. If that mailbox is ever compromised or the address reused, admin follows it.",
    action:
      "Treat the bootstrap as first-run only: once any admin exists, stop auto-granting and require an existing admin to promote. Add role revocation to the admin surface.",
  },
  {
    id: "F-13",
    title: "Appwrite errors are returned to the client verbatim",
    severity: "low",
    status: "open",
    where: "src/integrations/appwrite/admin.server.ts",
    what:
      "request() throws `Appwrite ${status}: ${text}`, and those messages reach the browser through server-function errors, exposing collection names, attribute names and internal validation detail.",
    action:
      "Log the full error server-side and return a generic message with a correlation id.",
  },
];

export const POSTURE = [
  ["Authentication", 88, "Appwrite-managed sessions, JWT-verified server side, OAuth supported"],
  ["Authorisation", 90, "Every admin endpoint gated identically; ownership checked on order mutations"],
  ["Data exposure", 82, "PII disclosure closed; verbose upstream errors remain"],
  ["Payment integrity", 86, "Signature, amount, state and replay now all verified"],
  ["Transport & headers", 78, "Full header set applied; CSP still report-only by choice"],
  ["Abuse resistance", 52, "No rate limiting anywhere; promo redemption not atomic"],
  ["Secret handling", 84, ".env untracked, no server secrets client-side, unused Supabase keys bundled"],
  ["Input validation", 88, "Zod on every mutating endpoint"],
];

export const HARDENING = {
  now: [
    "Set CSP_ENFORCE=true after reviewing report-only violations for a few days.",
    "Rate-limit the public endpoints on CF-Connecting-IP via KV or a Durable Object.",
    "Sign unsubscribe links so an address cannot be removed by a third party.",
    "Make promo redemption atomic with a conditional write and retry.",
  ],
  next: [
    "Enforce and decrement stock during order creation.",
    "Stop the silent in-memory fallback for offer-code writes in production.",
    "Replace verbatim Appwrite errors with generic messages plus a correlation id.",
    "Close the admin bootstrap once the first admin exists, and add revocation.",
  ],
  later: [
    "Remove the unused Supabase integration once Lovable confirms it is safe.",
    "Move script-src off 'unsafe-inline' by adopting nonces for the streamed hydration scripts.",
    "Add an audit log for admin actions — status changes, price edits, code creation.",
    "Schedule Appwrite API key rotation and scope the key down to the collections actually used.",
  ],
};
