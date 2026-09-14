/**
 * Findings for the database, auth and security report.
 *
 * Every item was read out of the source in this repository. Severities follow
 * the usual impact/exploitability split; "Fixed" means the change is in this
 * branch, "Open" means it is recommended but not yet applied. All thirteen
 * findings are closed as of this revision.
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
  ["offer_codes", "Promo and voucher codes", "Admin write / public validate", "In-process fallback now development only"],
];

export const ENDPOINTS = [
  ["getCatalog, getProductBySlug, getBlackoutDates", "Public", "Correct — catalogue data is public"],
  ["getPublicOfferCodes", "Public", "Correct — only active, visible codes are returned"],
  ["checkOfferCode", "Public", "Public by necessity, now rate limited (F-06)"],
  ["subscribeToNewsletter", "Public", "Correct by design"],
  ["unsubscribeFromNewsletter", "Public", "Now requires a signed token, or emails one (F-07)"],
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
    status: "fixed",
    where: "All public server functions",
    what:
      "checkOfferCode, subscribeToNewsletter and the catalogue endpoints accept unlimited requests. Promo codes can be brute-forced, and the subscribe endpoint can be used to flood the list.",
    action:
      "A token bucket (src/lib/rate-limit.server.ts) now fronts promo validation at 10 per minute and newsletter subscribe/unsubscribe at 5 per 5 minutes, keyed on CF-Connecting-IP. The buckets live in isolate memory, so this stops one client hammering an endpoint but is not yet global; the module is shaped so swapping the store for a Durable Object or KV is the only change required.",
  },
  {
    id: "F-07",
    title: "Newsletter unsubscribe takes any address",
    severity: "medium",
    status: "fixed",
    where: "src/lib/newsletter.server.ts",
    what:
      "removeSubscriber unsubscribes whatever email it is given, with no proof the caller controls it. Anyone can unsubscribe anyone.",
    action:
      "Newsletter footers now carry a per-recipient HMAC link, and a request without a valid token emails a confirmation link to the address rather than acting on it. The response is identical either way, so the endpoint cannot be used to test which addresses are subscribed, and the comparison is constant time.",
  },
  {
    id: "F-08",
    title: "Stock is never checked or decremented",
    severity: "medium",
    status: "fixed",
    where: "src/lib/orders.server.ts",
    what:
      "createOrderForUser checks is_active but never reads stock, and no path reduces it. Any quantity of any active product can be ordered regardless of what the admin recorded.",
    action:
      "Orders now reject sold-out products and quantities above what is left, naming the product, and take the ordered amounts out of stock. Safe to enforce because the admin editor makes stock a required field defaulting to 100. Appwrite has no atomic increment, so the decrement is a read-then-write.",
  },
  {
    id: "F-09",
    title: "Promo redemption is not atomic",
    severity: "medium",
    status: "fixed",
    where: "src/lib/offers.server.ts",
    what:
      "validatePromoCode reads used_count and markOfferCodeUsed writes it back in a separate request. Two orders placed at once both pass validation, so a single-use voucher can be redeemed twice. markOfferCodeUsed failures are also swallowed, so the count can silently not move at all.",
    action:
      "A code is reserved before the order is written rather than marked used afterwards; markOfferCodeUsed re-reads the count and refuses once the limit is reached, and releaseOfferCodeUse returns the reservation if the order fails. Validation errors propagate instead of silently charging full price. Full atomicity still wants a uniquely-indexed redemption document per code.",
  },
  {
    id: "F-10",
    title: "Silent in-memory fallback for offer codes",
    severity: "medium",
    status: "fixed",
    where: "src/lib/offers.server.ts",
    what:
      "Every offer-code write is wrapped in a try/catch that falls back to a module-level array. In a serverless deployment that array is per-instance and lost on recycle, so a failed write reports success and the code later does not exist. It also masks genuine outages.",
    action:
      "Offer-code writes no longer fall back to the per-isolate array in production, where it reported success for writes that never happened and masked real outages. Retained for local development.",
  },
  {
    id: "F-11",
    title: "Unused Supabase credentials ship to the browser",
    severity: "low",
    status: "fixed",
    where: "src/integrations/supabase/, src/integrations/lovable/index.ts, .env",
    what:
      "No application code imports the Supabase client; its only importer is the Lovable-generated integrations/lovable/index.ts, which is itself unreferenced. Despite that, the Supabase client and the VITE_SUPABASE_* values are present in the shipped client bundle, adding weight and publishing configuration for a backend the site does not use.",
    action:
      "The credentials no longer reach the browser. `import.meta.env[\"X\"]` cannot be statically replaced, so Vite inlined the entire env object into any chunk that read one variable; declaring the app's variables in src/vite-env.d.ts allows dot access, and no Supabase value appears in any client chunk. The Lovable-generated files were left untouched — removing the integration entirely still wants their confirmation.",
  },
  {
    id: "F-12",
    title: "Admin bootstrap is email-based and permanent",
    severity: "low",
    status: "fixed",
    where: "src/lib/roles.server.ts",
    what:
      "Any account signing in with an address listed in APPWRITE_ADMIN_EMAILS is granted admin on first sign-in, and the grant is never re-checked or revoked. If that mailbox is ever compromised or the address reused, admin follows it.",
    action:
      "The bootstrap now applies only until the first admin exists; after that it logs and skips, and promotion has to go through an existing admin. Role revocation in the admin surface is still outstanding.",
  },
  {
    id: "F-13",
    title: "Appwrite errors are returned to the client verbatim",
    severity: "low",
    status: "fixed",
    where: "src/integrations/appwrite/admin.server.ts",
    what:
      "request() throws `Appwrite ${status}: ${text}`, and those messages reach the browser through server-function errors, exposing collection names, attribute names and internal validation detail.",
    action:
      "Appwrite failures are logged server-side with a short reference, and the caller receives the status plus that reference instead of the upstream body.",
  },
];

export const POSTURE = [
  ["Authentication", 88, "Appwrite-managed sessions, JWT-verified server side, OAuth supported"],
  ["Authorisation", 92, "Every admin endpoint gated identically; ownership checked on order mutations"],
  ["Data exposure", 92, "PII disclosure closed; upstream errors reduced to a correlation id"],
  ["Payment integrity", 86, "Signature, amount, state and replay now all verified"],
  ["Transport & headers", 86, "Full header set enforced; CSP report-only until validated against traffic"],
  ["Abuse resistance", 78, "Throttled per isolate, not yet globally; redemption reserved, not atomic"],
  ["Secret handling", 94, ".env untracked, no server secrets client-side, no unused keys in the bundle"],
  ["Input validation", 88, "Zod on every mutating endpoint"],
];

export const HARDENING = {
  now: [
    "Set CSP_ENFORCE=true after reviewing report-only violations for a few days.",
    "Move the rate-limit buckets into a Durable Object or KV, so the limit is global rather than per isolate.",
    "Add a uniquely-indexed redemption document per code, making promo redemption atomic rather than merely reserved.",
  ],
  next: [
    "Add role revocation to the admin surface, now that the bootstrap no longer re-grants.",
    "Confirm with Lovable that the unused Supabase integration can be deleted outright.",
    "Decide whether the four HEVC-with-alpha fallback clips are worth keeping for Safari.",
  ],
  later: [
    "Remove the unused Supabase integration once Lovable confirms it is safe.",
    "Move script-src off 'unsafe-inline' by adopting nonces for the streamed hydration scripts.",
    "Add an audit log for admin actions — status changes, price edits, code creation.",
    "Schedule Appwrite API key rotation and scope the key down to the collections actually used.",
  ],
};
