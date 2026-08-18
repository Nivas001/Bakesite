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
import {
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  Leaf,
  Flame,
  Wheat,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Croissant,
  Star,
} from "lucide-react";

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

const EXPLORE_CATEGORIES = [
  {
    name: "Handcrafted Cakes",
    slug: "cakes",
    tag: "Pure Buttercream",
    badge: "Korean Bento & Tiers",
    desc: "Single-serve 4-inch lunchbox cakes & bespoke celebration layers.",
    image: "/cakes/pink-bento-cake.jpg",
    accentGlow: "from-rose-500/20 via-pink-500/10 to-amber-500/5",
    icon: Sparkles,
  },
  {
    name: "French Pastries",
    slug: "pastries",
    tag: "27 Flaky Layers",
    badge: "100% Pure Butter",
    desc: "Golden morning croissants, pistachio danishes & morning cruffins.",
    image: "/products/artisan-croissant.jpg",
    accentGlow: "from-emerald-500/20 via-teal-500/10 to-amber-500/5",
    icon: Croissant,
  },
  {
    name: "Artisanal Cookies",
    slug: "cookies",
    tag: "70% Couverture",
    badge: "Brown Butter Dough",
    desc: "Molten dark chocolate chunks & rich fudge walnut brownies.",
    image: "/products/artisan-cookies.jpg",
    accentGlow: "from-amber-500/20 via-orange-500/10 to-stone-500/5",
    icon: Star,
  },
  {
    name: "Hearth Sourdough",
    slug: "breads",
    tag: "36h Ferment",
    badge: "Wild Starter",
    desc: "Crisp blistered crusts, airy crumb & rustic morning loaves.",
    image: "/products/artisan-sourdough.jpg",
    accentGlow: "from-amber-600/20 via-yellow-500/10 to-orange-500/5",
    icon: Wheat,
  },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [ripple, setRipple] = useState(false);
  const addBtnRef = useRef<HTMLDivElement | null>(null);

  const showTrustBadges = useFlag("ff_product_trust_badges") ?? true;
  const showStickyBar = useFlag("ff_product_sticky_bar") ?? true;
  const showHowItWorks = useFlag("ff_product_how_it_works") ?? true;

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
    toast.success(`${product.name} (${quantity}) added to your counter cart!`);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 pb-24 md:pb-12 space-y-12 sm:space-y-16">

      {/* Back link */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-cocoa transition-colors group font-medium"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to bakery counter</span>
        </Link>
      </div>

      {/* Hero: Image + Details Bento Grid */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        
        {/* Left Column: Product Showcase Photo Frame */}
        <div className="relative group overflow-hidden rounded-3xl sm:rounded-4xl border border-border/80 bg-card p-2 sm:p-3 shadow-soft">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-secondary/30">
            <img
              src={product.image_url ?? "/products/artisan-croissant.jpg"}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "/products/artisan-croissant.jpg";
              }}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Discount Badge */}
            {discounted && (
              <span className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-full bg-berry px-3.5 py-1 text-xs font-bold text-berry-foreground shadow-lift">
                {discountLabel(product.discount_type, product.discount_value)}
              </span>
            )}

            {/* Kitchen Freshness Pill */}
            <span className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-cocoa border border-border/60 shadow-2xs">
              ✨ Fresh Morning Bake
            </span>
          </div>
        </div>

        {/* Right Column: Details & Ordering Bento */}
        <div className="flex flex-col justify-center space-y-5">
          
          <div>
            {/* Category Breadcrumb */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-full bg-secondary px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
                {product.category_name ?? "Bakery Atelier"}
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="size-3" /> In Small-Batch Queue
              </span>
            </div>

            {/* Product Title in Blogh font */}
            <h1 className="font-blogh text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight tracking-wide">
              {product.name}
            </h1>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 border-b border-border/60 pb-4">
            <span className="font-sans text-3xl sm:text-4xl font-black text-cocoa tracking-tight">
              {formatCurrency(price)}
            </span>
            {discounted && (
              <>
                <span className="text-base sm:text-lg text-muted-foreground line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
                <span className="rounded-full bg-berry/15 px-2.5 py-0.5 text-xs font-bold text-berry">
                  Save {formatCurrency(product.price - price)}
                </span>
              </>
            )}
          </div>

          {/* Trust Badges */}
          {showTrustBadges && (
            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-semibold text-cocoa shadow-2xs"
                >
                  <Icon className={`size-3.5 ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Artisan Quality & Dietary Badges */}
          <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border/70 bg-card p-3 sm:p-4 text-xs text-muted-foreground shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🌾</span>
              <span className="font-medium text-cocoa">Slow Fermentation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🧈</span>
              <span className="font-medium text-cocoa">100% Pure Dairy Butter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="font-medium text-cocoa">Baked at 4 AM Dawn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🌿</span>
              <span className="font-medium text-cocoa">Clean Pantry Ingredients</span>
            </div>
          </div>

          {/* "How it gets to you" Pipeline */}
          {showHowItWorks && (
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3.5 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                How It Gets To You
              </p>
              <div className="flex items-start gap-1 sm:gap-2">
                {HOW_STEPS.map((step, i) => (
                  <div key={step.title} className="flex-1 flex flex-col items-center text-center relative">
                    {/* Connector line */}
                    {i < HOW_STEPS.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-px bg-border/80" />
                    )}
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-card border border-border/70 text-sm shadow-2xs">
                      {step.emoji}
                    </span>
                    <p className="mt-1.5 text-[11px] font-bold text-cocoa leading-tight">{step.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper + Add to Cart Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3" ref={addBtnRef}>
            {/* Pill Quantity Stepper */}
            <div className="inline-flex h-11 items-center justify-between sm:justify-start gap-2 rounded-full border border-border bg-secondary/50 px-2 shadow-2xs">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex size-7.5 items-center justify-center rounded-full bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer font-bold"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-cocoa tabular-nums px-2">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex size-7.5 items-center justify-center rounded-full bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <div className="relative flex-1">
              <Button
                size="lg"
                className="relative w-full h-11 overflow-hidden rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-sm shadow-lift transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 size-4.5" />
                <span>Add {quantity > 1 ? `(${quantity})` : ""} to Cart • {formatCurrency(price * quantity)}</span>
              </Button>
              {ripple && (
                <span className="absolute inset-0 rounded-2xl bg-berry/30 animate-ripple-out pointer-events-none" />
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            🕐 Fresh morning bake. Small-batch artisan orders require 24 hours advance notice.
          </p>
        </div>

      </div>

      {/* 2. Reviews Bento Atelier */}
      <ProductReviews productId={product.id} />

      {/* 3. Related Products ("You Might Also Like") */}
      {related.length > 0 && (
        <section className="border-t border-border/60 pt-10 sm:pt-14 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-berry" />
                <span className="text-xs font-bold uppercase tracking-wider text-berry">
                  Paired Recommendations
                </span>
              </div>
              <h2 className="font-blogh text-2xl sm:text-3xl font-bold text-cocoa uppercase tracking-wide">
                You Might Also Like
              </h2>
            </div>

            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-berry hover:text-berry/80">
              <Link to="/shop">
                <span>View Full Counter</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* 4. [NEW]: "Explore Bakery Categories" Section */}
      <section className="border-t border-border/60 pt-10 sm:pt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Croissant className="size-4 text-berry" />
              <span className="text-xs font-bold uppercase tracking-wider text-berry">
                Artisan Collections
              </span>
            </div>
            <h2 className="font-blogh text-2xl sm:text-3xl lg:text-4xl font-bold text-cocoa uppercase tracking-wide">
              Explore Our Bakery Atelier
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Browse our complete range of small-batch sweet and savory delights, made fresh daily.
            </p>
          </div>

          <Button asChild className="rounded-full bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft w-fit">
            <Link to="/shop">
              <span>All Bakery Categories</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Category Bento Cards Grid (Responsive: 1 col on xs, 2 on sm, 4 on lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {EXPLORE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to="/shop"
                search={{ category: cat.slug } as any}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-3 sm:p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-berry/60 hover:shadow-lift flex flex-col justify-between"
              >
                {/* Photo showcase with gradient glow */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary/40">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.accentGlow}`} />

                  {/* Badge pill */}
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-cocoa border border-border/60 shadow-2xs">
                    {cat.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-blogh text-lg font-bold text-cocoa group-hover:text-berry transition-colors">
                      {cat.name}
                    </h3>
                    <Icon className="size-4 text-berry shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Footer Action Arrow */}
                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs font-bold text-berry">
                  <span>Explore Bakes</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sticky Mobile Add to Cart Bar */}
      {showStickyBar && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 transition-all duration-300 shadow-2xl ${
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