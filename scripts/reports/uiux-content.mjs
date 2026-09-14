/**
 * Findings for the UI/UX audit report.
 *
 * Everything here was observed directly against the running app (desktop 1440px
 * and mobile 390px captures) or read out of the source, not inferred. "Fixed"
 * means the change is in this branch.
 */

export const AXES = [
  "Visual design",
  "Hierarchy & clarity",
  "Responsiveness",
  "Accessibility",
  "Interaction & motion",
  "Performance",
];

export const PAGES = [
  {
    name: "Home",
    route: "/",
    scores: [90, 88, 90, 86, 92, 90],
    verdict:
      "The strongest page on the site. The flavour-switching hero is genuinely distinctive, and the band rhythm now reads as one designed sequence rather than a stack of unrelated blocks.",
    strengths: [
      "The hero's flavour pills re-theme the headline, the 3D word, the ribbon and the navbar together — one control changing five things at once is a real idea, not decoration.",
      "Typographic range is wide but disciplined: Blogh for display, TAN NIMBUS for section heads, Recurso for body.",
      "Every band has its own surface and border, so the page never flattens into an undifferentiated scroll.",
    ],
    fixed: [
      "Each band rises into view on scroll instead of appearing all at once.",
      "A reading-progress hairline sits under the header across the whole site.",
      "Label text moved off the 1.99:1 berry onto a token that clears WCAG AA.",
      "The hero is capped at min(86svh, 760px); it used to reserve a full viewport regardless of content, leaving a dead band on tall displays.",
      "The category carousel moved above the editorial bands, so a way to browse is reachable without scrolling past six of them.",
      "FAQ categories are derived from the questions themselves, and an empty filter shows a message instead of a bare accordion shell.",
    ],
    open: [],
  },
  {
    name: "Design Your Cake",
    route: "/ (Cake Studio)",
    scores: [94, 92, 92, 90, 92, 94],
    verdict:
      "Rebuilt this pass. The preview is an actual drawing of the configured order, which is what turns the section from a form into a toy — and the design can now be kept.",
    strengths: [
      "Every control changes the drawing: tier count from size, colours from flavour, base trim from sponge, a distinct garnish per add-on, and the inscription piped live in the script face.",
      "Ganache drips come from two out-of-phase sine terms, so a few long runs fall between many short ones — it reads hand-poured rather than machine-scalloped.",
      "Desktop pins the preview; mobile pins the running total and CTA.",
    ],
    fixed: [
      "Replaced a stock photograph that ignored every control.",
      "9–10px labels replaced with real type sizes; all targets clear 44px.",
      "Options grouped in fieldsets with aria-pressed, so state is announced.",
      "The total prints directly rather than counting up from ₹0.",
      "The configuration lives in the URL hash, so a design survives a refresh and the link is shareable, with a copy-link action beside the CTA.",
      "Size, add-on and eggless prices moved into site content with their own admin panel, so they no longer drift from what the bakery charges.",
      "Three real bakes in the chosen style sit beneath the drawing, anchoring the illustration to photography.",
    ],
    open: [],
  },
  {
    name: "Shop",
    route: "/shop",
    scores: [88, 88, 92, 86, 82, 86],
    verdict: "Catalogue mechanics were always solid; discovery is now legible too.",
    strengths: [
      "Per-category lanes with their own counts and view-all actions scale well as the catalogue grows.",
      "Weight variants are surfaced on the card, so shoppers see the range before opening a product.",
    ],
    fixed: [
      "Both prices sit in one backdrop; the struck-through price used to float bare on the photograph and collide with the price pill.",
      "Category counts pluralise correctly, and carousel arrows only appear when the lane overflows, each disabling at its end.",
      "The category filter is a labelled pill rail — the previous control showed a name only for the selected item, leaving seven unlabelled glyphs.",
      "Categories too short to fill a row lay out as a grid with an explanatory tile, rather than one card against three empty columns.",
      "Placeholder descriptions (\"Will update later\" is live in the catalogue) are hidden from customers and flagged in the admin product list.",
      "The search row can shrink: `w-full shrink-0` beside the sort control pushed the page 153px past the viewport on a phone.",
    ],
    open: [],
  },
  {
    name: "About",
    route: "/about",
    scores: [92, 88, 90, 86, 94, 88],
    verdict:
      "Opens with the strongest single moment on the site, and no longer says the same thing three times.",
    strengths: [
      "The pinned build sequence earns its scroll: five chapters, each driving a different part of the cake, ending with the candles lit.",
      "The scene is built from primitives, so the showpiece costs nothing to download.",
      "Reduced-motion visitors get the same five chapters as a plain card grid, with no canvas created at all.",
    ],
    fixed: [
      "overflow-x-hidden on the page wrapper was silently breaking position:sticky — switched to overflow-x-clip.",
      "The readability scrim had no explicit stops and was draining the colour out of the cake.",
      "The copy offset was cancelled out because the camera moved with the cake.",
      "Ambient light dropped from 1.5 to 0.55, so the cocoa reads as chocolate rather than grey.",
      "On narrow screens the copy sits in its own panel and the cake lifts clear of it.",
      "The drag-to-rotate turntable is gone, with ~150 lines of pointer capture, velocity tracking and snap animation; the angle pills now switch the photograph and its spec, which is what they were for.",
      "Nutrition figures carry a single qualifier rather than reading as bare facts.",
      "The view switch spans the full width on narrow screens, carries aria-pressed, and each option says what it does.",
    ],
    open: [],
  },
  {
    name: "Offers",
    route: "/offers",
    scores: [86, 88, 88, 84, 80, 88],
    verdict: "Clear and functional, and coupons now explain themselves against the real basket.",
    strengths: [
      "Copy-code interaction is immediate and obvious.",
      "Discounted products reuse the catalogue card, so the page stays consistent with /shop.",
    ],
    fixed: [
      "The coupon illustration rendered as a solid black box; the clip had lost its alpha channel, and the empty video element painted black before its sources attached.",
      "Hero columns are top-aligned and the illustration is sized to the copy beside it, rather than stretching the row into a dead band.",
      "Coupon cards spell out minimum spend, uses remaining and expiry instead of burying them in the description.",
      "Each coupon measures itself against the live basket: how much more is needed to qualify, or what it would actually save.",
    ],
    open: [],
  },
  {
    name: "Cart & Checkout",
    route: "/cart, /checkout",
    scores: [84, 90, 84, 84, 78, 88],
    verdict:
      "The part that carries the money was also the part that described itself least accurately. That is fixed.",
    strengths: [
      "Slot picking makes the 24-hour baking constraint concrete rather than an error after the fact.",
      "Map-pin delivery addressing is a genuine advantage for the last mile, and the saved profile address is reused automatically.",
    ],
    fixed: [
      "Checkout claimed money had changed hands when it had not — \"Pay & Place Order\", \"Payment successful\", and \"Paid · In Queue\" on a pending order. All of it now describes the real flow: request a slot, nothing charged, payment link follows.",
      "A completion checklist marks off fulfilment, slot, contact and review.",
      "The cart explains the three stages up front; without it the absent pay button read as something broken.",
      "Offer-code errors bind to the field with role=alert and aria-describedby, rather than a toast that vanishes before it can be read.",
      "Decorative clips on both pages load only when scrolled into view.",
    ],
    open: [],
  },
  {
    name: "Auth",
    route: "/auth",
    scores: [88, 90, 88, 88, 78, 92],
    verdict: "On-brand, properly labelled, and no longer illustrated with office stock art.",
    strengths: ["Sign-in and sign-up share one card, so the switch costs no navigation."],
    fixed: [
      "The page was hard-coded to an orange (#E86033) that appears nowhere else on the site; it now uses cocoa and berry like the rest.",
      "\"Lets\" became \"Welcome Back\" / \"Join Us\" — the display face has no apostrophe glyph, since its unicode-range covers letters and space only.",
      "Every field has a persistent label; placeholders were the only cue and they disappear on typing.",
      "Password rules are shown and validated live, and the minimum matches what Appwrite enforces.",
      "The bar-chart figure and geometric pedestals are replaced with photographs of real bakes.",
    ],
    open: [],
  },
  {
    name: "Play & Win",
    route: "/play-coupons",
    scores: [82, 84, 84, 84, 86, 82],
    verdict: "A genuinely fun detour with a defensible reward mechanic behind it.",
    strengths: [
      "Three different game types keep the section worth revisiting, and every control is a real button already in tab order.",
    ],
    fixed: [
      "Three memory-game cards pointed at files that no longer existed; the two art-less cards were given images.",
      "Claiming requires an account, explained up front by a banner rather than failing silently at the end.",
      "Claim failures surface as a toast instead of being swallowed by an empty catch.",
      "Memory cards carry an aria-label describing position and state; their faces are imagery only, so they announced as unlabelled buttons.",
      "The reward is described as a welcome gift rather than a prize, which is what it actually is.",
    ],
    open: [],
  },
  {
    name: "Orders & Profile",
    route: "/orders, /profile",
    scores: [82, 88, 84, 82, 76, 90],
    verdict: "The pages a returning customer sees most, now with a working repeat-purchase path.",
    strengths: [
      "Order status vocabulary is specific, and the support flow captures a real category and desired resolution.",
    ],
    fixed: [
      "Re-order was broken three ways — it guessed the product slug from the name so the cart linked nowhere, never carried the image, and called add() without a quantity so three croissants became one. It now rebuilds from the live catalogue at today's prices and reports what is no longer available.",
      "Each order shows a four-stage timeline, since \"what happens next\" is the question customers actually have.",
      "The pending state no longer claims payment was taken.",
      "Empty-state illustrations load lazily.",
    ],
    open: [],
  },
  {
    name: "Admin",
    route: "/admin",
    scores: [72, 72, 72, 72, 68, 80],
    verdict:
      "Functionally complete and still the least designed surface, but no longer able to delete a product by accident.",
    strengths: ["Covers orders, catalogue, content, gallery, newsletter and offers in one place."],
    fixed: [
      "Product deletion is confirmed, in the card component so all six call sites are covered, and points at the hide action for the case people usually mean.",
      "The kitchen bake sheet scrolls horizontally instead of forcing the page wide; it is often opened on a phone.",
      "A Design Your Cake pricing panel was added, so studio quotes are editable without a deploy.",
    ],
    open: [
      {
        title: "One 4,400-line route",
        detail:
          "Every admin tab still lives in a single file. The bundling concern is already handled — the admin chunk is 267KB and is only fetched on /admin, never by a customer — so what remains is maintainability.",
        fix: "Split each tab into its own lazily-loaded route. Left undone deliberately: the admin surface cannot be signed into from this environment, so a restructure of that size could not be exercised before shipping.",
        effort: "L",
      },
    ],
  },
];

export const CROSS_CUTTING = [
  {
    title: "Colour contrast was failing site-wide",
    body: "The berry accent measured 1.99:1 against the cream page background — below the 4.5:1 WCAG AA floor for body text and below even the 3:1 large-text floor — and it was the colour of almost every kicker, label and inline link. A --berry-deep token (4.8:1 on cream, 5.1:1 on card, inverted for dark surfaces) now carries all 237 text usages; fills, borders and rings keep the original tone.",
    status: "fixed",
  },
  {
    title: "Type scale bottomed out at 9px",
    body: "Labels at 9px, 9.5px and 10.5px appeared throughout. 195 informational sizes were raised to an 11px floor and the remaining sub-10px sizes to 10px. Uppercase micro-labels were deliberately left small: they are decorative chrome, not text anyone has to read.",
    status: "fixed",
  },
  {
    title: "Focus states were browser defaults",
    body: "Custom controls relied on the default ring, which is nearly invisible against the warm palette. There is now one focus-visible treatment — a berry-deep ring with a gap — applied through a :where() rule so it costs no specificity, plus a skip link to #main-content.",
    status: "fixed",
  },
  {
    title: "Motion had no shared vocabulary",
    body: "Animation was ad hoc per component. There is now one motion module with Reveal, RevealGroup, Parallax, TiltCard, CountUp, LazyVideo and a scroll progress bar, all of which consult prefers-reduced-motion and render the settled state when it is set.",
    status: "fixed",
  },
  {
    title: "Scroll-revealed content was invisible without JavaScript",
    body: "The first implementation rendered opacity:0 into the server HTML, so any visitor whose JavaScript was slow, blocked or broken saw a blank page — and crawlers indexed one. Reveal now renders settled on the server and arms itself in a layout effect before paint, with a timeout failsafe if the observer never reports.",
    status: "fixed",
  },
  {
    title: "Static payload was the real source of lag",
    body: "public/ held 159MB, including a byte-identical duplicate of a 30MB GLB, a duplicated model folder, 17 unreferenced assets, 1200x1200 clips rendered at 48px, and a 10MB PNG used as a thumbnail. It is now 58MB, and the remaining heavy clips only download when scrolled into view.",
    status: "fixed",
  },
  {
    title: "Three.js shipped in the shared entry chunk",
    body: "Every page paid roughly 700KB for a feature only /about uses. The scene module is imported dynamically as the section comes into range, and the GLB viewer is a React.lazy boundary that loads only when the studio is opened. The entry chunk fell from 1,205KB to 512KB.",
    status: "fixed",
  },
  {
    title: "Mobile layouts pushed past the viewport",
    body: "Measured at 390px, every route now reports zero horizontal document overflow. The one genuine offender was the shop search row, which could not shrink beside the sort control.",
    status: "fixed",
  },
];

export const ROADMAP = {
  now: [
    "Watch the CSP report-only violations for a few days, then set CSP_ENFORCE=true.",
    "Write real descriptions for the catalogue entries the admin list now flags as placeholders.",
    "Sanity-check the admin surface by hand — it is the one area that could not be exercised from here.",
  ],
  next: [
    "Move the rate-limit buckets into a Durable Object or KV so the limit is global rather than per isolate.",
    "Give the admin tables a card layout below md, and confirm the remaining destructive actions.",
    "Consider driving cake studio sizes and add-ons from the catalogue itself, rather than a parallel price table.",
  ],
  later: [
    "Split the admin route into lazily-loaded per-tab routes, once there is a way to exercise it.",
    "Adopt CSP nonces so script-src can drop 'unsafe-inline'.",
    "Substantiate the nutrition figures against real lab values, or keep them descriptive.",
  ],
};
