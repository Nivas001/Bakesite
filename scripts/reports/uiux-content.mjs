/**
 * Findings for the UI/UX audit report.
 *
 * Everything here was observed directly against the running app (desktop 1440px
 * and mobile 390px captures) or read out of the source, not inferred.
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
    scores: [88, 84, 86, 76, 90, 82],
    verdict:
      "The strongest page on the site. The flavour-switching hero is genuinely distinctive and the band rhythm now reads as one designed sequence rather than a stack of unrelated blocks.",
    strengths: [
      "The hero's flavour pills re-theme the headline, the 3D word, the ribbon and the navbar together — one control changing five things at once is a real idea, not decoration.",
      "Typographic range is wide but disciplined: Blogh for display, TAN NIMBUS for section heads, Recurso for body.",
      "Every band now has its own surface and border, so the page never flattens into an undifferentiated scroll.",
    ],
    fixed: [
      "Each band rises into view on scroll instead of appearing all at once.",
      "A reading-progress hairline sits under the header across the whole site.",
      "Label text moved off the 1.99:1 berry onto a token that clears WCAG AA.",
    ],
    open: [
      {
        title: "Hero reserves a full viewport even when the content is short",
        detail:
          "min-h-[calc(100vh-4.5rem)] leaves a large dead band above and below the pastry on tall displays.",
        fix: "Switch to a content-driven min-height with a clamp() cap (for example min(88svh, 780px)) so the hero never grows past what it needs.",
        effort: "S",
      },
      {
        title: "Section order buries the shop",
        detail:
          "Six editorial bands sit between the hero and the category carousel; the first actual browse affordance below the fold is far down the page.",
        fix: "Promote the category carousel above the Baker's Laboratory band, and keep the storytelling sections after it.",
        effort: "M",
      },
      {
        title: "FAQ filter pills have no empty state",
        detail:
          "Choosing a category with no matching questions renders an empty accordion shell.",
        fix: "Render a short 'nothing here yet' row, or hide categories with a zero count.",
        effort: "S",
      },
    ],
  },
  {
    name: "Design Your Cake",
    route: "/ (Cake Studio)",
    scores: [92, 90, 88, 84, 90, 94],
    verdict:
      "Rebuilt this pass. The preview is now an actual drawing of the configured order, which is what turns the section from a form into a toy.",
    strengths: [
      "Every control changes the drawing: tier count from size, colours from flavour, base trim from sponge, a distinct garnish per add-on, and the inscription piped live in the script face.",
      "Ganache drips are generated from two out-of-phase sine terms, so a few long runs fall between many short ones — it reads hand-poured rather than machine-scalloped.",
      "Desktop pins the preview; mobile pins the running total and CTA.",
    ],
    fixed: [
      "Replaced a stock photograph that ignored every control.",
      "9–10px labels replaced with real type sizes; all targets now clear 44px.",
      "Options grouped in fieldsets with aria-pressed, so the state is announced.",
      "The total prints directly instead of counting up from ₹0.",
    ],
    open: [
      {
        title: "The design cannot be saved or shared",
        detail:
          "The only exit is a WhatsApp deep link. A customer who closes the tab loses the configuration.",
        fix: "Encode the configuration in the URL query string so the page restores from it, which also makes the link shareable and gives the WhatsApp message a permalink back to the exact design.",
        effort: "M",
      },
      {
        title: "Estimates are not wired to the catalogue",
        detail:
          "Sizes and add-on prices are hard-coded in the component, so they drift from whatever the admin sets in Appwrite.",
        fix: "Move the size and add-on tables into the products/offer collections and load them with the catalogue query.",
        effort: "M",
      },
      {
        title: "No photographic anchor",
        detail:
          "The preview is illustrative; a first-time buyer never sees a real bake in this section.",
        fix: "Add a small 'real bakes in this style' strip beneath the preview, pulling three matching products from the catalogue.",
        effort: "S",
      },
    ],
  },
  {
    name: "Shop",
    route: "/shop",
    scores: [82, 78, 84, 74, 78, 80],
    verdict:
      "Solid catalogue mechanics. The weakness is discovery: filters are icon-only and sparse categories look broken.",
    strengths: [
      "Per-category lanes with their own counts and view-all actions scale well as the catalogue grows.",
      "Weight variants are surfaced on the card, so shoppers see the range before opening a product.",
    ],
    fixed: [
      "Both prices now sit in one backdrop; the struck-through price used to float bare on the photograph and collide with the price pill.",
      "Category counts pluralise correctly ('1 item', not '1 items').",
      "Carousel arrows only appear when the lane actually overflows, and each disables at its end.",
    ],
    open: [
      {
        title: "Category filter is icon-only",
        detail:
          "The filter row shows seven unlabelled glyphs. A croissant and a wheat sheaf are not reliably distinguishable at 20px.",
        fix: "Show the category name beside each icon, letting the row scroll horizontally on mobile as the FAQ pills already do.",
        effort: "S",
      },
      {
        title: "A one-product lane leaves three empty columns",
        detail:
          "Sparse categories render a single card against a wide gap, which reads as a loading failure.",
        fix: "Below a threshold of three products, fall back to a centred grid rather than a scroll lane.",
        effort: "S",
      },
      {
        title: "Placeholder copy is shipping to customers",
        detail: "At least one product description reads 'Will update later'.",
        fix: "Treat an empty or placeholder description as absent and hide the slot, and flag it in the admin product list.",
        effort: "S",
      },
      {
        title: "Search has no empty state or result count",
        detail: "A query with no matches gives no guidance on what to try next.",
        fix: "Show the matched count beside the field and offer the nearest category when a search returns nothing.",
        effort: "S",
      },
    ],
  },
  {
    name: "About",
    route: "/about",
    scores: [90, 80, 86, 78, 94, 74],
    verdict:
      "Now opens with the strongest single moment on the site. The rest of the page is still very long and repeats the 3D idea twice.",
    strengths: [
      "The pinned build sequence earns its scroll: five chapters, each driving a different part of the cake, ending with the candles lit.",
      "The scene is built from primitives, so the showpiece costs nothing to download.",
      "Reduced-motion visitors get the same five chapters as a plain card grid, with no canvas created at all.",
    ],
    fixed: [
      "overflow-x-hidden on the page wrapper was silently breaking position:sticky — switched to overflow-x-clip.",
      "The readability scrim had no explicit stops and was draining the colour out of the cake.",
      "The copy offset was being cancelled out because the camera moved with the cake.",
      "Ambient light dropped from 1.5 to 0.55 so the cocoa reads as chocolate rather than grey.",
      "On narrow screens the copy now sits in its own panel and the cake lifts clear of it.",
    ],
    open: [
      {
        title: "The page is 1,400 lines and two separate 3D features",
        detail:
          "The scroll story is followed by a photographic turntable and then a 30MB GLB viewer. Three takes on the same idea.",
        fix: "Keep the scroll story, retire the photographic turntable, and move the GLB viewer behind an explicit 'open the 3D studio' action on a route of its own.",
        effort: "L",
      },
      {
        title: "Health claims are specific and unsourced",
        detail:
          "'14g protein', '0g refined sugar' and '84% French butterfat' are presented as facts throughout.",
        fix: "Either attach them to named products with real nutrition data, or soften to descriptive language. Specific nutrition claims carry regulatory weight.",
        effort: "S",
      },
      {
        title: "Dual view toggle is easy to miss",
        detail: "The collage/story switch is a small control that changes the entire page.",
        fix: "Make it a full-width segmented control directly under the page title.",
        effort: "S",
      },
    ],
  },
  {
    name: "Offers",
    route: "/offers",
    scores: [80, 76, 82, 76, 76, 84],
    verdict:
      "Clear and functional. The hero wastes a lot of vertical space and coupons do not explain themselves.",
    strengths: [
      "Copy-code interaction is immediate and obvious.",
      "Discounted products reuse the catalogue card, so the page stays consistent with /shop.",
    ],
    fixed: [
      "The coupon illustration rendered as a solid black box; the clip had lost its alpha channel and the empty video element painted black before its sources attached.",
    ],
    open: [
      {
        title: "Hero leaves a large empty band",
        detail:
          "The illustration column is far taller than the two lines of copy beside it, so the row stretches and leaves dead space above the coupon list.",
        fix: "Align the two columns to the top and cap the illustration at the height of the copy block.",
        effort: "S",
      },
      {
        title: "Coupon cards omit their own terms",
        detail:
          "Minimum order value is in the description string, but usage limits and validity windows are not shown.",
        fix: "Render minimum spend, remaining uses and expiry as explicit rows on each coupon.",
        effort: "S",
      },
      {
        title: "No indication a code is already in the cart",
        detail: "Copying a code gives no feedback about whether it currently applies to the basket.",
        fix: "Show the resulting saving against the live cart subtotal, and disable codes below their minimum.",
        effort: "M",
      },
    ],
  },
  {
    name: "Cart & Checkout",
    route: "/cart, /checkout",
    scores: [78, 80, 78, 72, 72, 86],
    verdict:
      "The conversion path is the least designed part of the site, and it is the part that carries the money.",
    strengths: [
      "Slot picking makes the 24-hour baking constraint concrete rather than an error after the fact.",
      "Map-pin delivery addressing is a genuine advantage for the last mile.",
    ],
    fixed: [
      "Decorative clips on both pages now load only when scrolled into view.",
    ],
    open: [
      {
        title: "No progress indication through checkout",
        detail:
          "Checkout is one long form with no sense of how many steps remain.",
        fix: "Add a three-step indicator (details, slot, confirm) pinned above the form.",
        effort: "M",
      },
      {
        title: "Cart does not show what happens next",
        detail:
          "Nothing on the cart explains that the order is approved before payment, so the missing 'pay now' button reads as broken.",
        fix: "Put the three-stage explanation (request, approval, payment link) directly in the cart summary.",
        effort: "S",
      },
      {
        title: "Errors surface only as toasts",
        detail:
          "A failed field validation appears as a transient toast rather than against the field.",
        fix: "Bind messages to their inputs with aria-describedby and move focus to the first invalid field.",
        effort: "M",
      },
      {
        title: "No saved addresses",
        detail: "Returning customers re-enter and re-pin their address every order.",
        fix: "Offer the stored profile address as a one-tap option at the top of the delivery step.",
        effort: "M",
      },
    ],
  },
  {
    name: "Auth",
    route: "/auth",
    scores: [82, 84, 84, 70, 74, 90],
    verdict: "Retinted this pass; structurally sound, still generic in its illustration.",
    strengths: ["Sign-in and sign-up share one card, so the switch costs no navigation."],
    fixed: [
      "The page was hard-coded to an orange (#E86033) that appears nowhere else on the site; it now uses cocoa and berry like the rest.",
      "'Lets' became 'Welcome Back' / 'Join Us' — the display face has no apostrophe glyph, since its unicode-range covers letters and space only.",
    ],
    open: [
      {
        title: "Inputs are placeholder-only",
        detail:
          "There are no persistent labels, so the field's purpose disappears as soon as the customer types.",
        fix: "Add visible labels above each field, or a floating label that survives input.",
        effort: "S",
      },
      {
        title: "Stock illustration is off-topic",
        detail:
          "A figure sitting on a bar chart has nothing to do with a bakery and undercuts an otherwise strongly art-directed site.",
        fix: "Replace with one of the existing product photographs, or the SVG cake already built for the studio.",
        effort: "S",
      },
      {
        title: "No password requirements shown",
        detail: "Requirements are only revealed by a failed submit.",
        fix: "Show the rules under the field and validate them live.",
        effort: "S",
      },
    ],
  },
  {
    name: "Play & Win",
    route: "/play-coupons",
    scores: [80, 78, 80, 72, 84, 78],
    verdict: "A genuinely fun detour that now has a defensible reward mechanic behind it.",
    strengths: ["Three different game types keep the section worth revisiting."],
    fixed: [
      "Three memory-game cards pointed at image files that no longer existed; the two art-less cards were also given images.",
      "Claiming now requires an account, explained up front by a banner rather than failing silently at the end.",
      "Claim failures surface as a toast instead of being swallowed by an empty catch.",
    ],
    open: [
      {
        title: "Games are not keyboard operable",
        detail: "Memory cards and the wheel respond to pointer events only.",
        fix: "Make cards real buttons in tab order and give the wheel a focusable spin control.",
        effort: "M",
      },
      {
        title: "Winning is close to guaranteed",
        detail: "The quiz passes at 4 of 6 and the wheel always lands on a prize, so the reward carries little weight.",
        fix: "Either make the discount tiered by performance, or be explicit that everyone wins and treat it as a welcome offer.",
        effort: "S",
      },
    ],
  },
  {
    name: "Orders & Profile",
    route: "/orders, /profile",
    scores: [76, 78, 80, 74, 70, 88],
    verdict: "Informative but static; these are the pages a returning customer sees most.",
    strengths: [
      "Order status vocabulary is honest and specific, and the support flow captures a real category and desired resolution.",
    ],
    fixed: ["Empty-state illustrations now load lazily."],
    open: [
      {
        title: "No reorder action",
        detail: "Repeat purchase means rebuilding the basket by hand.",
        fix: "Add 'order this again' on every completed order, pre-filling the cart and jumping to slot selection.",
        effort: "M",
      },
      {
        title: "Status is a label, not a timeline",
        detail: "Customers cannot see which stage they are at or what happens next.",
        fix: "Render the five states as a horizontal timeline with the current step marked.",
        effort: "M",
      },
    ],
  },
  {
    name: "Admin",
    route: "/admin",
    scores: [70, 68, 62, 62, 66, 70],
    verdict:
      "Functionally complete and the least designed surface. 4,400 lines in a single route file.",
    strengths: ["Covers orders, catalogue, content, gallery, newsletter and offers in one place."],
    fixed: [],
    open: [
      {
        title: "One 4,400-line route",
        detail:
          "Every admin tab lives in a single file, which makes the chunk large and the code hard to change safely.",
        fix: "Split each tab into its own lazily-loaded route so the admin bundle is not paid for up front.",
        effort: "L",
      },
      {
        title: "Dense tables do not adapt to narrow screens",
        detail: "Order and product tables overflow horizontally on a phone, which is where approvals often happen.",
        fix: "Below md, render each row as a card with the same actions.",
        effort: "M",
      },
      {
        title: "Destructive actions lack confirmation",
        detail: "Product and blackout deletion apply immediately.",
        fix: "Route them through the existing AlertDialog, and offer an undo toast.",
        effort: "S",
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
    title: "Type scale bottoms out far too small",
    body: "Labels at 9px, 9.5px and 10.5px appear throughout. The studio was rebuilt onto a proper scale, but the same sizes remain on the shop cards, order rows and admin tables. Set a 11px floor for any text a customer must read, and reserve smaller sizes for decoration only.",
    status: "open",
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
    title: "Three.js still ships in the shared entry chunk",
    body: "The entry chunk is 1.2MB and contains Three.js, so pages that never render 3D still pay for it. Import the scene modules dynamically inside their components so the bundler can split them into a chunk that only /about fetches.",
    status: "open",
  },
  {
    title: "Focus states are inherited, not designed",
    body: "Custom buttons rely on the browser default ring, which is nearly invisible against the warm palette. Define one focus-visible treatment on the berry-deep tone and apply it through the button and card primitives.",
    status: "open",
  },
];

export const ROADMAP = {
  now: [
    "Split Three.js out of the entry chunk with dynamic imports (largest remaining performance win).",
    "Set an 11px minimum type size for customer-facing text and sweep the shop, orders and admin surfaces.",
    "Label the shop category filters and give search a result count and empty state.",
    "Design one focus-visible style and apply it through the primitives.",
    "Replace or remove the placeholder product copy currently visible to customers.",
  ],
  next: [
    "Make the cake design shareable and restorable via the URL, and drive its prices from the catalogue.",
    "Add a checkout progress indicator, field-level validation and saved addresses.",
    "Add reorder and an order-status timeline.",
    "Make the arcade games keyboard operable.",
    "Give the admin tables a card layout below md, and confirm destructive actions.",
  ],
  later: [
    "Split the admin route into lazily-loaded per-tab routes.",
    "Reduce /about to one 3D feature and move the GLB studio to its own route.",
    "Substantiate or soften the specific nutrition claims.",
    "Re-order the homepage so browsing appears before the long editorial run.",
  ],
};
