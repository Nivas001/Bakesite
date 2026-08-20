import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Cake,
  Croissant,
  Cookie,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { useCart } from "@/lib/cart";
import { formatCurrency, finalPrice, hasDiscount, discountLabel, type ProductWeightVariant } from "@/lib/pricing";
import { getProductBySlug } from "@/lib/catalog.functions";
import { useFlag } from "@/lib/feature-flags";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    return getProductBySlug({ data: params.slug });
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} | Ani Bakes Artisan Bakery` : "Product Details | Ani Bakes" },
        {
          name: "description",
          content: p?.description ?? "Order artisan fresh-baked treats handcrafted in small batches.",
        },
      ],
    };
  },
  component: ProductDetailPage,
});

const TRUST_BADGES = [
  { icon: Clock, label: "Baked Same Day", color: "text-amber-600" },
  { icon: ShieldCheck, label: "Fresh Flour", color: "text-emerald-600" },
  { icon: HeartHandshake, label: "Eco Packaging", color: "text-sky-600" },
];

const HOW_STEPS = [
  { emoji: "📅", title: "Choose a slot", desc: "Pick your delivery date & time window" },
  { emoji: "🧑‍🍳", title: "Baker prepares", desc: "Fresh-baked the morning of your slot" },
  { emoji: "📦", title: "Delivered or Pickup", desc: "At your door or collect from counter" },
];

const EXPLORE_CATEGORIES = [
  {
    slug: "cakes",
    name: "Handcrafted Cakes",
    desc: "Bespoke celebration layers & velvet tea slices.",
    tag: "Pure Buttercream",
    icon: Cake,
    image: "/cakes/pink-bento-cake.jpg",
    accentGlow: "from-pink-500/20 to-transparent",
  },
  {
    slug: "pastries",
    name: "French Pastries",
    desc: "Golden lamination & slow-churned butter.",
    tag: "27 Flaky Layers",
    icon: Croissant,
    image: "/products/artisan-croissant.jpg",
    accentGlow: "from-amber-500/20 to-transparent",
  },
  {
    slug: "cookies",
    name: "Artisanal Cookies",
    desc: "Chewy molten centres & sea-salt flakes.",
    tag: "70% Couverture",
    icon: Cookie,
    image: "/products/artisan-cookies.jpg",
    accentGlow: "from-orange-500/20 to-transparent",
  },
  {
    slug: "breads",
    name: "Hearth Sourdough",
    desc: "Wild-fermented loaves with open airy crumb.",
    tag: "36h Ferment",
    icon: Flame,
    image: "/products/artisan-sourdough.jpg",
    accentGlow: "from-yellow-500/20 to-transparent",
  },
];

function ProductDetailPage() {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const { lines, add, setQuantity } = useCart();
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

  const variants = product.weight_variants && product.weight_variants.length > 0 ? product.weight_variants : null;
  const [selectedVariant, setSelectedVariant] = useState<ProductWeightVariant | null>(
    variants ? variants[0] ?? null : null
  );

  // Multi-image gallery carousel state
  const galleryImages = (
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url ?? "/products/artisan-croissant.jpg"]
  ).filter(Boolean) as string[];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage =
    galleryImages[activeImageIndex] || galleryImages[0] || product.image_url || "/products/artisan-croissant.jpg";

  const activeBasePrice = selectedVariant ? selectedVariant.price : product.price;
  const price = finalPrice(activeBasePrice, product.discount_type, product.discount_value);
  const discounted = hasDiscount(product.discount_type, product.discount_value);

  const variantKey = selectedVariant ? `${selectedVariant.label}${selectedVariant.serves ? ` (${selectedVariant.serves})` : ""}` : null;
  const cartLine = lines.find((l) => l.productId === product.id && (variantKey ? l.variantLabel === variantKey : true));
  const quantityInCart = cartLine?.quantity ?? 0;

  function handleAddToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: price,
        basePrice: activeBasePrice,
        imageUrl: activeImage || product.image_url,
        variantLabel: variantKey,
        variantWeightGrams: selectedVariant?.weight_grams ?? product.unit_weight_grams ?? null,
      },
      1,
    );
    toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ""} added to your cart!`);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:py-8 pb-24 md:pb-12 space-y-10 sm:space-y-14">

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

      {/* 1. Hero: Image + Details Bento Grid */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        
        {/* Left Column: Product Showcase Photo Frame & Gallery Carousel */}
        <div className="flex flex-col gap-3">
          <div className="relative group overflow-hidden rounded-3xl sm:rounded-4xl border border-border/80 bg-card p-2 sm:p-3 shadow-soft">
            <div className="relative aspect-[16/10] sm:aspect-square max-h-48 sm:max-h-none w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-secondary/30">
              <img
                src={activeImage}
                alt={`${product.name} — view ${activeImageIndex + 1}`}
                onError={(e) => {
                  e.currentTarget.src = "/products/artisan-croissant.jpg";
                }}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Discount Badge */}
              {discounted && (
                <span className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-full bg-berry px-3 py-0.5 text-xs font-bold text-berry-foreground shadow-lift">
                  {discountLabel(product.discount_type, product.discount_value)}
                </span>
              )}

              {/* Kitchen Freshness Pill */}
              <span className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-cocoa border border-border/60 shadow-2xs">
                ✨ Fresh Small-Batch
              </span>

              {/* Multi-Image Carousel Controls */}
              {galleryImages.length > 1 && (
                <>
                  {/* Prev Button */}
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 flex size-8 sm:size-9 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-md border border-border/60 shadow-md transition-all hover:bg-background hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="size-4 sm:size-5" />
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-8 sm:size-9 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-md border border-border/60 shadow-md transition-all hover:bg-background hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="size-4 sm:size-5" />
                  </button>

                  {/* Slide Counter Indicator */}
                  <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-2xs">
                    📸 {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Thumbnail Strip (if 2+ images exist) */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto px-1 py-1">
              {galleryImages.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-berry ring-2 ring-berry/40 scale-105 shadow-sm"
                        : "border-border/60 hover:border-berry/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/products/artisan-croissant.jpg";
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details & Ordering Bento */}
        <div className="flex flex-col justify-center space-y-3 sm:space-y-4">
          
          <div>
            {/* Category Breadcrumb & Portion Tag */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
                {product.category_name ?? "Bakery Atelier"}
              </span>
              {(product.serving_yield || product.unit_weight_grams) && (
                <span className="rounded-full bg-berry/10 border border-berry/25 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-berry">
                  ⚖️ {product.serving_yield ?? `${product.unit_weight_grams}g`}
                </span>
              )}
            </div>

            {/* Product Title in Blogh font */}
            <h1 className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight tracking-wide">
              {product.name}
            </h1>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2.5 sm:gap-3 border-b border-border/60 pb-3">
            <span className="font-sans text-2xl sm:text-4xl font-black text-cocoa tracking-tight">
              {formatCurrency(price)}
            </span>
            {discounted && (
              <>
                <span className="text-sm sm:text-lg text-muted-foreground line-through font-medium">
                  {formatCurrency(activeBasePrice)}
                </span>
                <span className="rounded-full bg-berry/15 px-2 py-0.5 text-[11px] font-bold text-berry">
                  Save {formatCurrency(activeBasePrice - price)}
                </span>
              </>
            )}
            {selectedVariant?.serves && (
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground ml-auto bg-secondary/80 px-2.5 py-1 rounded-xl border border-border/50">
                🍽️ {selectedVariant.serves}
              </span>
            )}
          </div>

          {/* Interactive Weight / Size Variant Selector (For Cakes & Tiered Items) */}
          {variants && variants.length > 0 && (
            <div className="space-y-2 rounded-2xl sm:rounded-3xl border border-border/80 bg-secondary/20 p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cocoa uppercase tracking-wider">
                  🎂 Choose Cake Weight / Size
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Tiered volume discounts applied
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {variants.map((v: ProductWeightVariant) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vPrice = finalPrice(v.price, product.discount_type, product.discount_value);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-berry bg-berry/15 ring-2 ring-berry/40 text-cocoa shadow-2xs scale-[1.02]"
                          : "border-border/70 bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs sm:text-[13px] text-cocoa">{v.label}</span>
                        {v.savings_label && (
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1 py-0.5 rounded">
                            {v.savings_label.split(" ")[0]} {v.savings_label.split(" ")[1]}
                          </span>
                        )}
                      </div>
                      <span className="font-sans font-black text-sm text-cocoa mt-1">
                        {formatCurrency(vPrice)}
                      </span>
                      {v.serves && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {v.serves}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {showTrustBadges && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-cocoa shadow-2xs"
                >
                  <Icon className={`size-3 sm:size-3.5 ${color}`} />
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

          {/* "How it gets to you" Pipeline */}
          {showHowItWorks && (
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3 sm:p-3.5">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                How It Gets To You
              </p>
              <div className="flex items-start gap-1 sm:gap-2">
                {HOW_STEPS.map((step, i) => (
                  <div key={step.title} className="flex-1 flex flex-col items-center text-center relative">
                    {/* Connector line */}
                    {i < HOW_STEPS.length - 1 && (
                      <div className="absolute top-3.5 left-1/2 w-full h-px bg-border/80" />
                    )}
                    <span className="relative z-10 flex size-7 sm:size-8 items-center justify-center rounded-full bg-card border border-border/70 text-xs sm:text-sm shadow-2xs">
                      {step.emoji}
                    </span>
                    <p className="mt-1 text-[10px] sm:text-[11px] font-bold text-cocoa leading-tight">{step.title}</p>
                    <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground leading-snug hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicit Purchase Action: Add to Cart OR Stepper + View Cart */}
          <div className="pt-1" ref={addBtnRef}>
            {quantityInCart === 0 ? (
              <div className="flex flex-row items-center gap-2 sm:gap-3">
                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className="relative flex-1 h-10 sm:h-11 overflow-hidden rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs sm:text-sm shadow-lift transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer px-3"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-1.5 size-4" />
                  <span>Add to Cart • {formatCurrency(price)}</span>
                  {ripple && (
                    <span className="absolute inset-0 rounded-2xl bg-berry/30 animate-ripple-out pointer-events-none" />
                  )}
                </Button>

                {/* View Cart Button (Pure navigation — does NOT mutate or auto-add) */}
                <Button
                  size="lg"
                  className="flex-1 h-10 sm:h-11 rounded-2xl bg-[#2C1810] text-white hover:bg-[#3D2217] font-bold text-xs sm:text-sm shadow-soft transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer px-3"
                  onClick={() => navigate({ to: "/cart" })}
                >
                  <span>View Cart</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-2 sm:gap-3">
                {/* Quantity Stepper when already in cart */}
                <div className="inline-flex h-10 sm:h-11 items-center justify-between gap-1 sm:gap-2 rounded-2xl border-2 border-berry/40 bg-secondary/80 px-2 sm:px-3 shadow-2xs shrink-0">
                  <button
                    type="button"
                    aria-label="Decrease quantity in cart"
                    className="flex size-6.5 sm:size-7.5 items-center justify-center rounded-full bg-card text-foreground transition-all hover:bg-background active:scale-90 shadow-2xs cursor-pointer font-bold"
                    onClick={() => {
                      setQuantity(product.id, quantityInCart - 1);
                      if (quantityInCart - 1 === 0) {
                        toast.info(`Removed ${product.name} from cart`);
                      }
                    }}
                  >
                    <Minus className="size-3 sm:size-3.5" />
                  </button>
                  <span className="min-w-12 sm:min-w-16 text-center text-xs sm:text-sm font-bold text-cocoa tabular-nums px-1">
                    {quantityInCart} in Cart
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity in cart"
                    className="flex size-6.5 sm:size-7.5 items-center justify-center rounded-full bg-berry text-berry-foreground transition-all hover:bg-berry/90 active:scale-90 shadow-2xs cursor-pointer"
                    onClick={() => setQuantity(product.id, Math.min(50, quantityInCart + 1))}
                  >
                    <Plus className="size-3 sm:size-3.5" />
                  </button>
                </div>

                {/* View Cart & Checkout Button */}
                <Button
                  size="lg"
                  className="flex-1 h-10 sm:h-11 rounded-2xl bg-[#2C1810] text-white hover:bg-[#3D2217] font-bold text-xs sm:text-sm shadow-lift transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer px-3"
                  onClick={() => navigate({ to: "/cart" })}
                >
                  <ShoppingBag className="mr-1.5 size-4" />
                  <span>View Cart • {formatCurrency(price * quantityInCart)}</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            )}
          </div>

          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
            🕐 Fresh morning bake. Small-batch artisan orders require 24 hours advance notice.
          </p>
        </div>

      </div>

      {/* 2. Related Products ("You Might Also Like") */}
      {related.length > 0 && (
        <section className="border-t border-border/60 pt-8 sm:pt-12 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-3.5 sm:size-4 text-berry" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-berry">
                  Paired Recommendations
                </span>
              </div>
              <h2 className="font-blogh text-xl sm:text-3xl font-bold text-cocoa uppercase tracking-wide">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 pt-2 pb-2">
            {related.map((item) => (
              <div key={item.id} className="h-full flex flex-col">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. "Explore Bakery Categories" Section (Compact 2-col on mobile, 4-col on desktop) */}
      <section className="border-t border-border/60 pt-8 sm:pt-12 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Croissant className="size-3.5 sm:size-4 text-berry" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-berry">
                Artisan Collections
              </span>
            </div>
            <h2 className="font-blogh text-xl sm:text-3xl lg:text-4xl font-bold text-cocoa uppercase tracking-wide">
              Explore Our Bakery Atelier
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Browse our complete range of small-batch sweet and savory delights, made fresh daily.
            </p>
          </div>

          <Button asChild size="sm" className="rounded-full bg-berry text-berry-foreground hover:bg-berry/90 shadow-soft w-fit text-xs">
            <Link to="/shop">
              <span>All Categories</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Category Bento Cards Grid (2-columns on mobile, 4-columns on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {EXPLORE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to="/shop"
                search={{ category: cat.slug } as any}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-2.5 sm:p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-berry/60 hover:shadow-lift flex flex-col justify-between"
              >
                {/* Photo showcase with gradient glow */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-secondary/40">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.accentGlow}`} />

                  {/* Badge pill */}
                  <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 rounded-full bg-background/90 backdrop-blur-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-cocoa border border-border/60 shadow-2xs">
                    {cat.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-2 sm:mt-3 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-blogh text-sm sm:text-base lg:text-lg font-bold text-cocoa group-hover:text-berry transition-colors truncate">
                      {cat.name}
                    </h3>
                    <Icon className="size-3.5 text-berry shrink-0 hidden sm:block" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Footer Action Arrow */}
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] sm:text-xs font-bold text-berry">
                  <span>Explore</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Reviews Bento Atelier (Placed at the end of the page) */}
      <ProductReviews productId={product.id} />

      {/* Sticky Mobile Add to Cart & View Cart Bar */}
      {showStickyBar && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-2 transition-all duration-300 shadow-2xl ${
            showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-cocoa truncate">{product.name}</p>
            <p className="text-sm font-black text-foreground">
              {formatCurrency(price * (quantityInCart || 1))}
            </p>
          </div>

          {quantityInCart === 0 ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                className="rounded-xl bg-berry text-berry-foreground hover:bg-berry/90 font-bold text-xs px-3 h-9 shrink-0 cursor-pointer shadow-soft"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-1 size-3.5" />
                Add
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-[#2C1810] text-white hover:bg-[#3D2217] font-bold text-xs px-3 h-9 shrink-0 cursor-pointer shadow-soft"
                onClick={() => navigate({ to: "/cart" })}
              >
                View Cart
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="inline-flex h-9 items-center gap-1 rounded-xl bg-secondary/90 px-1.5 border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity in cart"
                  className="flex size-6 items-center justify-center rounded-lg bg-card text-foreground text-xs"
                  onClick={() => setQuantity(product.id, quantityInCart - 1)}
                >
                  <Minus className="size-3" />
                </button>
                <span className="min-w-5 text-center text-xs font-bold tabular-nums">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity in cart"
                  className="flex size-6 items-center justify-center rounded-lg bg-berry text-berry-foreground text-xs"
                  onClick={() => setQuantity(product.id, quantityInCart + 1)}
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <Button
                size="sm"
                className="rounded-xl bg-[#2C1810] text-white hover:bg-[#3D2217] font-bold text-xs px-3 h-9 shrink-0 cursor-pointer shadow-soft"
                onClick={() => navigate({ to: "/cart" })}
              >
                Cart →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}