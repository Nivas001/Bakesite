import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { getPublicOfferCodes } from "@/lib/offers.functions";
import { ProductCard } from "@/components/product-card";
import { hasDiscount } from "@/lib/pricing";
import { Tag, Copy, Check, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function Offers() {
  const { data } = useSuspenseQuery(catalogQuery);
  const fetchCodesFn = useServerFn(getPublicOfferCodes);
  const { data: promoCodes } = useQuery({
    queryKey: ["public-promo-codes"],
    queryFn: () => fetchCodesFn(),
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const offers = data.products.filter((p) => hasDiscount(p.discount_type, p.discount_value));

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied! Apply it at checkout.`);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      
      {/* 1. Offers Hero Header */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-cocoa leading-tight">
          Special offers & coupons
        </h1>
        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          A rotating handful of fresh morning bakes at a friendlier price, plus exclusive checkout coupon codes.
        </p>
      </div>

      {/* 2. Collectible Bakery Ticket Coupons (Swipeable on Mobile, 3-Cols on Desktop) */}
      {promoCodes && promoCodes.length > 0 && (
        <section className="mt-6 sm:mt-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Tag className="size-4 text-berry" />
            <h2 className="font-display text-sm sm:text-lg font-bold text-cocoa">Active Bakery Coupons</h2>
          </div>

          {/* Ticket Vouchers Track */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {promoCodes.map((promo) => {
              const isCopied = copiedCode === promo.code;
              return (
                <div
                  key={promo.id ?? promo.code}
                  className="w-[82%] xs:w-[72%] shrink-0 snap-start sm:w-auto relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-berry/40 bg-card/95 p-3.5 sm:p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-berry hover:shadow-lift"
                >
                  {/* Voucher Ticket Notches */}
                  <div
                    aria-hidden
                    className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border-r border-berry/40"
                  />
                  <div
                    aria-hidden
                    className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border-l border-berry/40"
                  />

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
                      Exp: {new Date(promo.expires_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Discounted Products Grid (Proportional 2 cols on mobile, 3 on tablet, 4 on desktop) */}
      <section className="mt-8 sm:mt-12">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-cocoa">
            This week&apos;s bakes on discount
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-berry hover:text-berry/80">
            <Link to="/shop">
              Full counter <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>

        {offers.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-8 text-center border border-border/70">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-berry mb-3">
              <ShoppingBag className="size-6" />
            </div>
            <p className="font-display text-base font-semibold text-cocoa">All bakes currently at regular price</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Use any of the active coupons above at checkout to save on your fresh order!
            </p>
            <Button asChild size="sm" className="mt-4 rounded-xl bg-berry text-berry-foreground">
              <Link to="/shop">Browse the Bakery Counter</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}