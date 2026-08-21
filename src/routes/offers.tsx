import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { getPublicOfferCodes } from "@/lib/offers.functions";
import { ProductCard } from "@/components/product-card";
import { hasDiscount } from "@/lib/pricing";
import { Tag, Copy, Check, ShoppingBag, ArrowRight, Sparkles, Layers, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlag } from "@/lib/feature-flags";
import { DriftWall } from "@/components/ui/drift-wall";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bakery offers & coupons — Ani Bakes Bakery" },
      {
        name: "description",
        content: "Discounted cakes, cookies, pastries and promo codes at Ani Bakes, updated every week.",
      },
      { property: "og:title", content: "Bakery offers & coupons — Ani Bakes Bakery" },
      { property: "og:description", content: "This week's discounted bakes and promo codes at Ani Bakes." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Offers,
});

const CONFETTI_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 30, 150];
const CONFETTI_COLORS = ["text-berry", "text-amber-500", "text-emerald-500", "text-purple-500", "text-orange-400"];

function Offers() {
  const { data } = useSuspenseQuery(catalogQuery);
  const fetchCodesFn = useServerFn(getPublicOfferCodes);
  const { data: promoCodes } = useQuery({
    queryKey: ["public-promo-codes"],
    queryFn: () => fetchCodesFn(),
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confettiCode, setConfettiCode] = useState<string | null>(null);

  const showShimmer = useFlag("ff_offers_shimmer");
  const showConfetti = useFlag("ff_offers_confetti");

  const offers = data.products.filter((p) => hasDiscount(p.discount_type, p.discount_value));

  // Dynamic products array feeding into DriftWall (updates automatically when products are added)
  const driftItems = useMemo(() => {
    return data.products.map((p) => ({
      image: p.image_url || "/hero/hero-3d-cookie.jpg",
      title: p.name,
      href: `/shop/${p.slug}`,
      price: p.price,
    }));
  }, [data.products]);

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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 space-y-10 sm:space-y-16">
      
      {/* 1. Offers Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
        <div className="flex flex-col gap-1.5 sm:gap-2 flex-1">
          <h1 className="font-blogh text-3xl sm:text-5xl font-bold text-cocoa leading-tight uppercase tracking-wide">
            Special offers & coupons
          </h1>
          <p className="max-w-xl text-xs sm:text-base text-muted-foreground leading-relaxed">
            A rotating handful of fresh morning bakes at a friendlier price, plus exclusive checkout coupon codes.
          </p>
        </div>

        {/* 3D Animated Coupons Blueprint (Unboxed & Generously Sized) */}
        <div className="flex items-center justify-center shrink-0 self-center md:self-auto">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="size-36 sm:size-48 md:size-56 lg:size-60 object-contain pointer-events-none drop-shadow-xl"
          >
            <source
              src="/illustration/3d-blueprint-blue-coupons-with-percent-symbol-retail-discount-marketing.webm"
              type="video/webm"
            />
            <source
              src="/illustration/3d-blueprint-blue-coupons-with-percent-symbol-retail-discount-marketing.mov"
              type="video/quicktime"
            />
          </video>
        </div>
      </div>

      {/* 2. Collectible Bakery Ticket Coupons */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-berry" />
            <h2 className="font-blogh text-base sm:text-xl font-bold text-cocoa uppercase tracking-wide">
              Active Bakery Coupons
            </h2>
          </div>

          {/* Play & Get Bakery Coupons Button */}
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gradient-to-r from-berry via-rose-500 to-amber-500 text-white font-bold text-xs shadow-soft hover:shadow-lift hover:scale-[1.02] active:scale-[0.98] transition-all h-8 px-3.5 sm:px-4 w-fit"
          >
            <Link to="/play-coupons">
              <Gamepad2 className="size-3.5 mr-1.5" />
              <span>Play & Get Bakery Coupons</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {promoCodes && promoCodes.length > 0 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {promoCodes.map((promo) => {
              const isCopied = copiedCode === promo.code;
              const isConfetti = confettiCode === promo.code;
              return (
                <div
                  key={promo.id ?? promo.code}
                  className={`w-[82%] xs:w-[72%] shrink-0 snap-start sm:w-auto relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-berry/40 bg-card/95 p-3.5 sm:p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-berry hover:shadow-lift ${showShimmer ? "bento-shine" : ""}`}
                >
                  <div aria-hidden className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border-r border-berry/40" />
                  <div aria-hidden className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border-l border-berry/40" />

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs sm:text-sm font-black text-cocoa tracking-wider bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/60">
                        {promo.code}
                      </span>
                      <span className="rounded-full bg-berry px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-berry-foreground shadow-2xs">
                        {promo.discount_type === "percent"
                          ? `${promo.discount_value}% OFF`
                          : `₹${promo.discount_value} OFF`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {promo.description ||
                        (promo.min_order_amount > 0
                          ? `Valid on orders above ₹${promo.min_order_amount}`
                          : "Valid on all bakery orders")}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-border/70 pt-2.5">
                    <span className="text-[10px] font-medium text-muted-foreground/80">
                      Exp: {new Date(promo.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleCopy(promo.code)}
                        className={`flex items-center gap-1 h-7 rounded-full px-3 text-[11px] font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                          isCopied
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                            : "bg-berry/10 text-berry hover:bg-berry hover:text-berry-foreground shadow-2xs"
                        }`}
                      >
                        {isCopied ? (
                          <><Check className="size-3 text-emerald-500" /><span>Copied!</span></>
                        ) : (
                          <><Copy className="size-3" /><span>Copy code</span></>
                        )}
                      </button>

                      {/* Confetti dots */}
                      {isConfetti && CONFETTI_ANGLES.map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const dist = 28 + (i % 3) * 10;
                        const x = Math.round(Math.cos(rad) * dist);
                        const y = Math.round(Math.sin(rad) * dist);
                        const colorClass = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
                        return (
                          <span
                            key={angle}
                            className={`absolute top-1/2 left-1/2 size-2 rounded-full animate-confetti-fly ${colorClass} bg-current pointer-events-none`}
                            style={{
                              "--confetti-end": `translate(${x}px, ${y}px)`,
                              "--confetti-spin": `${angle * 2}deg`,
                            } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Discounted Products Grid */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-blogh text-lg sm:text-2xl font-bold text-cocoa uppercase tracking-wide">
            This week&apos;s bakes on discount
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-berry hover:text-berry/80">
            <Link to="/shop">Full counter <ArrowRight className="ml-1 size-3" /></Link>
          </Button>
        </div>

        {offers.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-8 text-center border border-border/70">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-berry mb-3">
              <ShoppingBag className="size-6" />
            </div>
            <p className="font-blogh text-base font-semibold text-cocoa">All bakes currently at regular price</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Use any of the active coupons above at checkout to save on your fresh order!
            </p>
            <Button asChild size="sm" className="mt-4 rounded-xl bg-berry text-berry-foreground">
              <Link to="/shop">Browse the Bakery Counter</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 pt-2 pb-2">
            {offers.map((product) => (
              <div key={product.id} className="h-full flex flex-col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. [NEW]: 3D Perspective DriftWall Product Showcase (All Dynamic Shop Products) */}
      <section className="pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-berry" />
              <span className="text-xs font-bold uppercase tracking-wider text-berry">Fresh from the Counter</span>
            </div>
            <h2 className="font-blogh text-2xl sm:text-3xl lg:text-4xl font-bold text-cocoa uppercase tracking-wide">
              Explore our whole bakery atelier
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Hover and drift through every single small-batch cake, pastry, cookie, and seasonal treat in our kitchen. Click any tile to inspect or order.
            </p>
          </div>

          <Button asChild className="rounded-full bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft w-fit">
            <Link to="/shop">
              Shop All Bakes <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        {/* 3D Interactive DriftWall Container */}
        <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[600px] rounded-3xl overflow-hidden border border-[#2C1810]/15 bg-[#1A0E08] shadow-[0_16px_48px_rgba(44,24,16,0.18)]">
          {/* Ambient Corner Atmosphere */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-berry/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-amber-500/15 blur-3xl"
          />

          {/* Interactive 3D Drifting Tile Wall */}
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

          {/* Bottom Floating Hint Overlay */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/10 shadow-lg">
            <Layers className="size-3.5 text-berry" />
            <span>Move cursor to tilt perspective • Click any bake to view details</span>
          </div>
        </div>
      </section>

    </div>
  );
}