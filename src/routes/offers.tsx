import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { getPublicOfferCodes } from "@/lib/offers.functions";
import { ProductCard } from "@/components/product-card";
import { formatCurrency, hasDiscount } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import {
  Tag,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers,
  Gamepad2,
  TicketPercent,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlag } from "@/lib/feature-flags";
import { DriftWall } from "@/components/ui/drift-wall";
import { LazyVideo } from "@/components/motion/lazy-video";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bakery offers & coupons — Aniii Bakes Bakery" },
      {
        name: "description",
        content:
          "Discounted cakes, cookies, pastries and promo codes at Aniii Bakes, updated every week.",
      },
      { property: "og:title", content: "Bakery offers & coupons — Aniii Bakes Bakery" },
      {
        property: "og:description",
        content: "This week's discounted bakes and promo codes at Aniii Bakes.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Offers,
});

const CONFETTI_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 30, 150];
const CONFETTI_COLORS = [
  "text-berry-deep",
  "text-amber-500",
  "text-emerald-500",
  "text-purple-500",
  "text-orange-400",
];

function Offers() {
  const { data } = useSuspenseQuery(catalogQuery);
  const fetchCodesFn = useServerFn(getPublicOfferCodes);
  const {
    data: promoCodes,
    isPending: codesPending,
    isError: codesFailed,
  } = useQuery({
    queryKey: ["public-promo-codes"],
    queryFn: () => fetchCodesFn(),
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confettiCode, setConfettiCode] = useState<string | null>(null);

  const showShimmer = useFlag("ff_offers_shimmer");
  const showConfetti = useFlag("ff_offers_confetti");

  const offers = data.products.filter((p) => hasDiscount(p.discount_type, p.discount_value));
  // Live basket total, so each coupon can say what it would actually save.
  const { total: cartSubtotal } = useCart();

  /** The biggest saving on the page, for the headline number. */
  const bestDeal = useMemo(() => {
    const percents = data.products
      .filter((p) => p.discount_type === "percent")
      .map((p) => p.discount_value);
    return percents.length ? Math.max(...percents) : 0;
  }, [data.products]);

  // Dynamic products array feeding into DriftWall (updates automatically when products are added)
  const driftItems = useMemo(
    () =>
      data.products.map((p) => ({
        image: p.image_url || "/hero/hero-3d-cookie.jpg",
        title: p.name,
        href: `/shop/${p.slug}`,
        price: p.price,
      })),
    [data.products],
  );

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied! Apply it at checkout.`);
    setTimeout(() => setCopiedCode(null), 2500);
    if (showConfetti) {
      setConfettiCode(code);
      setTimeout(() => setConfettiCode(null), 650);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-6 sm:space-y-16 sm:py-10">
      {/* ── 1. Header ──────────────────────────────────────────────── */}
      {/* One band with the three numbers that matter along the bottom,
          rather than a title beside a floating illustration that left a dead
          strip across the top of the page. */}
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 shadow-soft sm:rounded-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-berry/12 blur-3xl"
        />
        <div
          aria-hidden
          className="worktop-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(110%_80%_at_50%_0%,black,transparent_72%)]"
        />

        <div className="relative z-10 flex flex-col items-start gap-5 p-5 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/30 bg-berry/10 px-3.5 py-1 text-[10.5px] font-black tracking-[0.18em] text-berry-deep uppercase sm:text-xs">
              <TicketPercent className="size-3.5" />
              This week at the counter
            </span>
            <h1 className="mt-2 font-blogh text-[clamp(1.75rem,6vw,3.5rem)] leading-[1.03] font-bold tracking-wide text-cocoa uppercase">
              Special offers &amp; coupons
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-base">
              A rotating handful of fresh morning bakes at a friendlier price, plus exclusive
              checkout coupon codes.
            </p>
          </div>

          <div className="mx-auto flex shrink-0 items-center justify-center md:mx-0">
            <LazyVideo
              src="/illustration/3d-blueprint-blue-coupons-with-percent-symbol-retail-discount-marketing"
              formats={["webm"]}
              // Sized to the copy beside it rather than to the artwork, so the
              // row does not stretch into a dead band.
              className="pointer-events-none size-32 animate-bob object-contain drop-shadow-xl sm:size-40 md:size-44"
            />
          </div>
        </div>

        <dl className="relative z-10 grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 bg-card/60 backdrop-blur-sm">
          {[
            { label: "Bakes on discount", value: String(offers.length) },
            { label: "Coupon codes", value: codesPending ? "—" : String(promoCodes?.length ?? 0) },
            { label: "Biggest saving", value: bestDeal > 0 ? `${bestDeal}%` : "—" },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-3 text-center">
              <dt className="font-mono text-[9.5px] font-bold tracking-[0.16em] text-muted-foreground uppercase sm:text-[10px]">
                {stat.label}
              </dt>
              <dd className="mt-0.5 font-blogh text-lg font-bold text-cocoa tabular-nums sm:text-2xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ── 2. Coupon tickets ──────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex flex-col justify-between gap-3 sm:mb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-berry-deep" />
            <h2 className="font-blogh text-base font-bold tracking-wide text-cocoa uppercase sm:text-xl">
              Active bakery coupons
            </h2>
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 w-fit rounded-full bg-linear-to-r from-berry via-rose-500 to-amber-500 px-3.5 text-xs font-bold text-white shadow-soft transition-all hover:scale-[1.02] hover:shadow-lift active:scale-[0.98] sm:px-4"
          >
            <Link to="/play-coupons">
              <Gamepad2 className="mr-1.5 size-3.5" />
              <span>Play &amp; get bakery coupons</span>
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Every branch of the fetch now says something. The heading used to
            render over empty space while the codes were loading, and over
            nothing at all when there were none or the request failed. */}
        {codesPending ? (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <li
                key={key}
                className="h-44 animate-pulse rounded-2xl border border-dashed border-border/70 bg-card/60"
              />
            ))}
          </ul>
        ) : codesFailed ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center">
            <TriangleAlert className="size-6 text-amber-600 dark:text-amber-400" />
            <p className="font-blogh text-base font-bold tracking-wide text-cocoa uppercase">
              Could not load coupons
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              The codes below the fold are still fine — try refreshing, or ask us on WhatsApp for
              today&apos;s code.
            </p>
          </div>
        ) : !promoCodes || promoCodes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-card/55 p-8 text-center">
            <span className="text-4xl" aria-hidden>
              🎟️
            </span>
            <p className="font-blogh text-base font-bold tracking-wide text-cocoa uppercase">
              No coupon codes running today
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              New codes go up most weeks. In the meantime the discounted bakes below need no code at
              all — or win one on the arcade.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-1 rounded-full text-xs">
              <Link to="/play-coupons">Play for a coupon</Link>
            </Button>
          </div>
        ) : (
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 lg:grid-cols-3">
            {promoCodes.map((promo) => {
              const isCopied = copiedCode === promo.code;
              const isConfetti = confettiCode === promo.code;
              const usesLeft =
                typeof promo.usage_limit === "number" && promo.usage_limit < 1000
                  ? Math.max(0, promo.usage_limit - (promo.used_count ?? 0))
                  : null;
              const qualifies = cartSubtotal >= promo.min_order_amount;

              return (
                <li key={promo.id ?? promo.code} className="w-[82%] shrink-0 snap-start sm:w-auto">
                  <div
                    className={`ticket-notch relative flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-berry/40 bg-card/95 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-berry hover:shadow-lift ${
                      showShimmer ? "bento-shine" : ""
                    }`}
                  >
                    {/* Stub: the code and what it is worth */}
                    <div className="flex items-center justify-between gap-2 border-b border-dashed border-border/70 bg-secondary/40 px-3.5 py-2.5">
                      <span className="rounded-lg border border-border/60 bg-card px-2.5 py-1 font-mono text-xs font-black tracking-wider text-cocoa sm:text-sm">
                        {promo.code}
                      </span>
                      <span className="rounded-full bg-berry px-2.5 py-0.5 text-[11px] font-bold text-berry-foreground shadow-2xs sm:text-xs">
                        {promo.discount_type === "percent"
                          ? `${promo.discount_value}% OFF`
                          : `₹${promo.discount_value} OFF`}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {promo.description ||
                          (promo.min_order_amount > 0
                            ? `Valid on orders above ${formatCurrency(promo.min_order_amount)}`
                            : "Valid on all bakery orders")}
                      </p>

                      {/* Terms spelled out rather than left inside the
                          description, so minimum spend and remaining uses are
                          always visible. */}
                      <dl className="mt-2.5 space-y-1 text-[11px]">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Minimum order</dt>
                          <dd className="font-semibold text-cocoa dark:text-foreground">
                            {promo.min_order_amount > 0
                              ? formatCurrency(promo.min_order_amount)
                              : "None"}
                          </dd>
                        </div>
                        {usesLeft !== null && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">Uses left</dt>
                            <dd className="font-semibold text-cocoa dark:text-foreground">
                              {usesLeft} of {promo.usage_limit}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Valid until</dt>
                          <dd className="font-semibold text-cocoa dark:text-foreground">
                            {new Date(promo.expires_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-border/70 pt-2.5">
                        {/* Measured against the live basket, so the customer
                            can see whether the code actually applies before
                            copying it. */}
                        <span className="min-w-0 flex-1 text-[11px] font-semibold">
                          {cartSubtotal <= 0 ? (
                            <span className="text-muted-foreground/80">
                              Add bakes to see savings
                            </span>
                          ) : !qualifies ? (
                            <span className="text-amber-700 dark:text-amber-400">
                              {formatCurrency(promo.min_order_amount - cartSubtotal)} more to
                              qualify
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              Saves{" "}
                              {formatCurrency(
                                promo.discount_type === "percent"
                                  ? Math.round((cartSubtotal * promo.discount_value) / 100)
                                  : Math.min(cartSubtotal, promo.discount_value),
                              )}{" "}
                              on your cart
                            </span>
                          )}
                        </span>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(promo.code)}
                            className={`flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                              isCopied
                                ? "bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400"
                                : "bg-berry/10 text-berry-deep shadow-2xs hover:bg-berry hover:text-berry-foreground"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="size-3 text-emerald-500" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy code</span>
                              </>
                            )}
                          </button>

                          {/* Confetti dots */}
                          {isConfetti &&
                            CONFETTI_ANGLES.map((angle, i) => {
                              const rad = (angle * Math.PI) / 180;
                              const dist = 28 + (i % 3) * 10;
                              const x = Math.round(Math.cos(rad) * dist);
                              const y = Math.round(Math.sin(rad) * dist);
                              const colorClass = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
                              return (
                                <span
                                  key={angle}
                                  className={`animate-confetti-fly pointer-events-none absolute top-1/2 left-1/2 size-2 rounded-full bg-current ${colorClass}`}
                                  style={
                                    {
                                      "--confetti-end": `translate(${x}px, ${y}px)`,
                                      "--confetti-spin": `${angle * 2}deg`,
                                    } as React.CSSProperties
                                  }
                                />
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── 3. Discounted bakes ────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-blogh text-lg font-bold tracking-wide text-cocoa uppercase sm:text-2xl">
            This week&apos;s bakes on discount
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs font-semibold text-berry-deep hover:text-berry-deep/80"
          >
            <Link to="/shop">
              Full counter <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>

        {offers.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-border/70 p-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-berry-deep">
              <ShoppingBag className="size-6" />
            </div>
            <p className="font-blogh text-base font-semibold text-cocoa">
              All bakes currently at regular price
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Use any of the active coupons above at checkout to save on your fresh order!
            </p>
            <Button asChild size="sm" className="mt-4 rounded-xl bg-berry text-berry-foreground">
              <Link to="/shop">Browse the bakery counter</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pt-2 pb-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {offers.map((product) => (
              <div key={product.id} className="flex h-full flex-col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. DriftWall showcase ──────────────────────────────────── */}
      <section className="border-t border-border/60 pt-4">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="size-4 text-berry-deep" />
              <span className="text-xs font-bold tracking-wider text-berry-deep uppercase">
                Fresh from the counter
              </span>
            </div>
            <h2 className="font-blogh text-2xl font-bold tracking-wide text-cocoa uppercase sm:text-3xl lg:text-4xl">
              Explore our whole bakery atelier
            </h2>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
              Hover and drift through every small-batch cake, pastry, cookie and seasonal treat in
              our kitchen. Click any tile to inspect or order.
            </p>
          </div>

          <Button
            asChild
            className="w-fit rounded-full bg-berry text-berry-foreground shadow-soft hover:bg-berry/90"
          >
            <Link to="/shop">
              Shop all bakes <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        <div className="relative h-[460px] w-full overflow-hidden rounded-3xl border border-[#2C1810]/15 bg-[#1A0E08] shadow-[0_16px_48px_rgba(44,24,16,0.18)] sm:h-[540px] lg:h-[600px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-berry/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-amber-500/15 blur-3xl"
          />

          <DriftWall
            items={driftItems}
            columns={5}
            tileWidth={220}
            tileHeight={144}
            gap={18}
            radius={16}
            tilt={15}
            turn={-12}
            perspective={1200}
            depth={110}
            speed={36}
            direction="up"
            variance={0.45}
            parallax={0.65}
            lift={68}
            fade={0.65}
            dim={0.62}
            overlayColor="#1A0E08"
          />

          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-[11px] font-medium text-white/90 shadow-lg backdrop-blur-md">
            <Layers className="size-3.5 text-berry" />
            <span>Move cursor to tilt perspective • Click any bake to view details</span>
          </div>
        </div>
      </section>
    </div>
  );
}
