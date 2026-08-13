# Sweet Crumb — Bakery Storefront (Phase 1)

Phase 1 covers the customer-facing side: browsing, accounts with a map-pinned delivery address, cart, and the time-slot checkout that puts orders into "Pending approval". The admin dashboard, reviews, newsletter and analytics come in Phase 2.

## Look and feel

Warm artisanal bakery: cream background (#FDFBF7), dark cocoa text (#3E2723), matcha green accents, soft berry red buttons. Playfair Display headings with Inter body text, rounded cards, soft shadows, generous whitespace. All colors go in the design system as tokens so the theme stays consistent.

## Pages

- **Home** — hero, featured products, category shortcuts, current offers strip.
- **Shop** — product grid with category filter (cookies, cakes, pastries) and search.
- **Product detail** — photos, description, price with discount badge, add to cart.
- **Offers** — auto-aggregates every product with an active discount.
- **Cart** — quantities, line totals, order total, checkout CTA.
- **Checkout** (sign-in required) — delivery address + map pin, then next-day time-slot picker with admin holidays and past slots disabled; placing the order creates a "Pending approval" order. No payment collected here.
- **Auth** — email/password + Google sign-in.
- **Profile / My orders** (sign-in required) — full name, phone, address, saved map pin; order list with status timeline.

## Data and backend (Lovable Cloud)

Tables: `profiles` (name, phone, address text, lat/lng), `categories`, `products` (price, discount type/value, category, image, stock, active), `orders` (user, slot date/time, status, totals, delivery lat/lng, address snapshot), `order_items`, `blackout_dates` (admin holidays), `user_roles` (separate table, admin/customer, no roles on profiles).

Access rules: products and categories readable by everyone; profiles and orders readable and writable only by their owner; admins can read everything. Order totals are computed server-side at placement so prices can't be tampered with. The catalog ships with seeded demo products, categories and one blackout date so the storefront is populated immediately.

## Order status flow

`pending_approval` → `awaiting_payment` → `confirmed` → `completed`, plus `rejected`. Phase 1 creates orders in `pending_approval` and shows the customer their status. Twilio (admin SMS/WhatsApp), Razorpay (payment link) and Mailgun (review emails) are stubbed as clearly-marked no-op notification hooks in server code, ready to be swapped for real keys later.

## Technical notes

- TanStack Start routes; auth-required pages under the `_authenticated` layout, storefront pages public and SSR-friendly with per-route SEO metadata.
- Leaflet + OpenStreetMap for the delivery pin, loaded client-side only so SSR doesn't break; mobile-optimized map with a draggable marker and "use my location".
- Cart persists in local storage for guests and merges into the account on sign-in.
- Slot availability and order creation run through server functions that re-validate the slot against blackout dates and the next-day rule.
- Microsoft Clarity script slot added in Phase 2 with the analytics page.

## Phase 2 (after this)

Admin dashboard (product CRUD, discounts, order approval with map pins, blackout-date calendar), review flow after completion, newsletter composer, Clarity analytics, and wiring real Razorpay/Twilio/Mailgun credentials.
