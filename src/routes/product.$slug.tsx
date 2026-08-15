import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountLabel, finalPrice, formatCurrency, hasDiscount } from "@/lib/pricing";
import { useFlag } from "@/lib/feature-flags";
import { Minus, Plus, ArrowLeft, ShoppingBag, Leaf, Flame, Wheat, Package } from "lucide-react";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: slug }),
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — Ani Bakes" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.product.name} — Ani Bakes Bakery`;
    const description =
      loaderData.product.description ?? "A small-batch bake from Ani Bakes Bakery.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

const TRUST_BADGES = [
  { icon: Leaf, label: "No Preservatives", color: "text-emerald-600" },
  { icon: Flame, label: "Baked Same Day", color: "text-orange-500" },
  { icon: Wheat, label: "Fresh Flour", color: "text-amber-600" },
  { icon: Package, label: "Eco Packaging", color: "text-teal-600" },
];

const HOW_STEPS = [
  { emoji: "🗓️", title: "Choose a slot", desc: "Pick your delivery date & time window" },
  { emoji: "👨‍🍳", title: "Baker prepares", desc: "Fresh-baked the morning of your slot" },
  { emoji: "📦", title: "Delivered or Pickup", desc: "At your door or collect from counter" },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [ripple, setRipple] = useState(false);
  const addBtnRef = useRef<HTMLDivElement | null>(null);

  const showTrustBadges = useFlag("ff_product_trust_badges");
  const showStickyBar = useFlag("ff_product_sticky_bar");
  const showHowItWorks = useFlag("ff_product_how_it_works");

  // Sticky bar visibility — hide when desktop Add to Cart button is in viewport
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    if (!showStickyBar) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry?.isIntersecting),
      { threshold: 0.2 }
    );
    if (addBtnRef.current) observer.observe(addBtnRef.current);
    return () => observer.disconnect();
  }, [showStickyBar]);

  if (!data) return null;
  const { product, related } = data;
  const price = finalPrice(product.price, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  function handleAddToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: price,
        basePrice: product.price,
        imageUrl: product.image_url,
      },
      quantity,
    );
    toast.success(`${product.name} added to cart`);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">

      {/* Back link */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group font-medium"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to the counter
      </Link>

      {/* Hero: Image + Details */}
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        
        {/* Product Image */}
        <div className="relative group">
          <img
            src={product.image_url ?? "/products/croissant.jpg"}
            alt={product.name}
            className="aspect-square w-full rounded-3xl sm:rounded-4xl object-cover shadow-soft transition-transform duration-700 group-hover:scale-[1.015]"
          />
          {discounted && (
            <span className="absolute left-4 top-4 rounded-full bg-berry px-3 py-1 text-xs font-bold text-berry-foreground shadow-soft">
              {discountLabel(product.discount_type, product.discount_value)}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {product.category_name}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-cocoa leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-sans text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(price)}
            </span>
            {discounted && (
              <>
                <span className="text-base text-muted-foreground line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
                <span className="rounded-full bg-berry px-3 py-0.5 text-xs font-bold text-berry-foreground">
                  {discountLabel(product.discount_type, product.discount_value)}
                </span>
              </>
            )}
          </div>

          {/* Trust Badges */}
          {showTrustBadges && (
            <div className="mt-4 flex flex-wrap gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/80"
                >
                  <Icon className={`size-3.5 ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* "How it gets to you" */}
          {showHowItWorks && (
            <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                How it gets to you
              </p>
              <div className="flex items-start gap-0">
                {HOW_STEPS.map((step, i) => (
                  <div key={step.title} className="flex-1 flex flex-col items-center text-center relative">
                    {/* Connector line */}
                    {i < HOW_STEPS.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-px bg-border/60" />
                    )}
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-card border border-border/60 text-base shadow-2xs">
                      {step.emoji}
                    </span>
                    <p className="mt-1.5 text-[11px] font-bold text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="mt-6 flex items-center gap-3" ref={addBtnRef}>
            {/* Pill Quantity Stepper */}
            <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-secondary/50 px-1.5 shadow-2xs">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex size-7 items-center justify-center rounded-full bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer font-bold text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-cocoa tabular-nums px-1">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex size-7 items-center justify-center rounded-full bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Add to Cart with ripple */}
            <div className="relative flex-1">
              <Button
                size="lg"
                className="relative w-full overflow-hidden rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold shadow-soft transition-all active:scale-98 cursor-pointer"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 size-4" />
                Add to cart
              </Button>
              {ripple && (
                <span className="absolute inset-0 rounded-2xl bg-berry/30 animate-ripple-out pointer-events-none" />
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            🕐 Baked the morning of your chosen slot. Orders need at least 24 h notice.
          </p>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-cocoa">
              You might also like
            </h2>
            <span className="text-berry text-xl">·</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      {showStickyBar && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
            showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-cocoa truncate">{product.name}</p>
            <p className="text-sm font-black text-foreground">{formatCurrency(price)}</p>
          </div>
          <Button
            size="sm"
            className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs px-4 h-9 shrink-0 cursor-pointer shadow-soft"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="mr-1.5 size-3.5" />
            Add to cart
          </Button>
        </div>
      )}
    </div>
  );
}