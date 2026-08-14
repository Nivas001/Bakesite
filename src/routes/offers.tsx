import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { getPublicOfferCodes } from "@/lib/offers.functions";
import { ProductCard } from "@/components/product-card";
import { hasDiscount } from "@/lib/pricing";
import { Tag, Copy, Check, Sparkles } from "lucide-react";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bakery offers & coupons — Sweet Crumb Bakery" },
      {
        name: "description",
        content: "Discounted cakes, cookies, pastries and promo codes at Sweet Crumb, updated every week.",
      },
      { property: "og:title", content: "Bakery offers & coupons — Sweet Crumb Bakery" },
      { property: "og:description", content: "This week's discounted bakes and promo codes at Sweet Crumb." },
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
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-cocoa">Special offers & coupons</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            A rotating handful of bakes at a friendlier price, plus exclusive checkout coupon codes.
          </p>
        </div>
      </div>

      {/* Promo Codes Spotlight Carousel / Cards */}
      {promoCodes && promoCodes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-berry" />
            <h2 className="font-display text-xl font-semibold text-cocoa">Active promo codes</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promoCodes.map((promo) => {
              const isCopied = copiedCode === promo.code;
              return (
                <div
                  key={promo.id ?? promo.code}
                  className="group relative flex flex-col justify-between rounded-3xl border border-berry/30 bg-card p-5 shadow-soft transition-all hover:border-berry/60 hover:shadow-lift"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-berry" />
                        <span className="font-mono text-base font-extrabold text-foreground tracking-wider">
                          {promo.code}
                        </span>
                      </div>
                      <span className="rounded-full bg-berry/10 px-2.5 py-0.5 text-xs font-bold text-berry">
                        {promo.discount_type === "percent"
                          ? `${promo.discount_value}% OFF`
                          : `₹${promo.discount_value} OFF`}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {promo.description ||
                        (promo.min_order_amount > 0
                          ? `Valid on orders above ₹${promo.min_order_amount}`
                          : "Valid on all bakery orders")}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      Expires: {new Date(promo.expires_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(promo.code)}
                      className="flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-all hover:bg-berry hover:text-berry-foreground cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy code
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

      {/* Discounted Product Grid */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-cocoa">This week&apos;s bakes on discount</h2>
        {offers.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            No discounted bakes right now —{" "}
            <Link to="/shop" className="text-berry hover:underline">
              browse the full counter
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}