import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Croissant, Sparkles, Leaf, Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductItem {
  id: string;
  category_id: string | null;
  name: string;
}

const CATEGORY_STYLE_MAP: Record<
  string,
  {
    icon: typeof Croissant;
    desc: string;
    image: string;
    badge: string;
    tag: string;
    accentGlow: string;
  }
> = {
  brownies: {
    icon: Sparkles,
    desc: "Rich dark Belgian chocolate fudge brownies & gourmet tasting squares",
    image: "/products/belgian-fudge-brownie-stack.jpg",
    badge: "70% Couverture",
    tag: "Fudge Hearth",
    accentGlow: "from-amber-900/40 to-stone-950/80",
  },
  breads: {
    icon: Croissant,
    desc: "Wild sourdough boules, rustic hearth loaves & golden morning blondies",
    image: "/products/artisan-sourdough.jpg",
    badge: "36h Ferment",
    tag: "Stone Hearth",
    accentGlow: "from-amber-600/40 to-amber-950/80",
  },
  cakes: {
    icon: Sparkles,
    desc: "Korean bento boxes, ombré floral tiers & custom celebration bakes",
    image: "/cakes/pink-bento-cake.jpg",
    badge: "Pure Buttercream",
    tag: "Celebration",
    accentGlow: "from-rose-600/40 to-pink-950/80",
  },
  pastries: {
    icon: Leaf,
    desc: "100% French butter croissants, pistachio danishes & flaky morning cruffins",
    image: "/products/artisan-croissant.jpg",
    badge: "27 Flaky Layers",
    tag: "Artisan Laminate",
    accentGlow: "from-emerald-600/40 to-emerald-950/80",
  },
  cookies: {
    icon: Star,
    desc: "Molten Belgian chocolate chunk cookies & rich dark cocoa fudge brownies",
    image: "/products/artisan-cookies.jpg",
    badge: "70% Couverture",
    tag: "Small-Batch",
    accentGlow: "from-amber-700/40 to-stone-950/80",
  },
};

export function CategoryPeekCarousel({
  categories,
  products,
}: {
  categories: CategoryItem[];
  products: ProductItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const displayCategories = categories.slice(0, 6);
  const total = displayCategories.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="rounded-3xl p-5 sm:p-8 lg:p-10 border border-border/80 bg-card/60 backdrop-blur-md shadow-soft overflow-hidden">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa">
              Explore by bake category
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-cocoa/30 bg-card/90 text-cocoa hover:bg-cocoa/10 hover:text-cocoa text-xs font-bold h-9 px-4 shadow-2xs cursor-pointer"
            >
              <Link to="/shop">
                Browse Full Catalog <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Category"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Category"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Peek-Ahead Coverflow Carousel Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[380px] sm:h-[430px] lg:h-[460px] flex items-center justify-center overflow-hidden select-none py-2"
        >
          {displayCategories.map((category, idx) => {
            const meta = CATEGORY_STYLE_MAP[category.slug] ?? {
              icon: Croissant,
              desc: category.description ?? "Freshly crafted daily bakes",
              image: "/products/artisan-sourdough.jpg",
              badge: "Artisan",
              tag: "Daily Bake",
              accentGlow: "from-amber-600/40 to-amber-950/80",
            };
            const Icon = meta.icon;
            const productCount = products.filter((p) => p.category_id === category.id).length;

            // Calculate relative offset from active index
            let offset = idx - activeIndex;
            if (offset < -1) offset += total;
            if (offset > total - 2) offset -= total;

            const isCenter = offset === 0;
            const isLeftPeek = offset === -1 || (activeIndex === 0 && idx === total - 1);
            const isRightPeek = offset === 1 || (activeIndex === total - 1 && idx === 0);
            const isHidden = !isCenter && !isLeftPeek && !isRightPeek;

            // Positioning & Transform Styles
            let transformClass = "";
            let opacityClass = "opacity-0 pointer-events-none";
            let zIndex = 0;

            if (isCenter) {
              transformClass = "translate-x-0 scale-100";
              opacityClass = "opacity-100 z-20 shadow-2xl";
              zIndex = 20;
            } else if (isLeftPeek) {
              transformClass = "-translate-x-[72%] sm:-translate-x-[78%] lg:-translate-x-[82%] scale-[0.86] sm:scale-[0.88]";
              opacityClass = "opacity-60 hover:opacity-85 z-10 cursor-pointer";
              zIndex = 10;
            } else if (isRightPeek) {
              transformClass = "translate-x-[72%] sm:translate-x-[78%] lg:translate-x-[82%] scale-[0.86] sm:scale-[0.88]";
              opacityClass = "opacity-60 hover:opacity-85 z-10 cursor-pointer";
              zIndex = 10;
            }

            return (
              <div
                key={category.id}
                onClick={() => {
                  if (isLeftPeek) handlePrev();
                  if (isRightPeek) handleNext();
                }}
                className={`absolute w-[78%] sm:w-[62%] lg:w-[48%] h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-border/80 transition-all duration-500 ease-out flex flex-col justify-between p-5 sm:p-7 group ${transformClass} ${opacityClass}`}
                style={{ zIndex }}
              >
                {/* Full-Bleed Photograph with Subtle Zoom */}
                <img
                  src={meta.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Overlay for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Row: Category Icon & Active Bakes Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md transition-transform group-hover:scale-105">
                    <Icon className="size-5 sm:size-6" />
                  </div>
                  <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/25 px-3 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                    {productCount > 0 ? `${productCount} Bakes` : meta.badge}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-amber-400 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {meta.tag}
                    </span>
                    <span className="text-[11px] font-bold text-white/80">
                      {meta.badge}
                    </span>
                  </div>

                  <h3 className="font-nimbus text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {category.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed max-w-lg">
                    {meta.desc}
                  </p>

                  {/* Interactive Button */}
                  <div className="pt-2">
                    {isCenter ? (
                      <Button
                        asChild
                        size="default"
                        className="rounded-full bg-white text-zinc-900 hover:bg-white/90 font-bold text-xs sm:text-sm h-10 px-5 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Link to="/shop">
                          <span>Explore {category.name}</span>
                          <ArrowRight className="size-4 ml-1.5" />
                        </Link>
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <span>Tap to view</span>
                        <ArrowRight className="size-3" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {displayCategories.map((cat, idx) => (
            <button
              key={cat.id}
              type="button"
              aria-label={`Go to ${cat.name}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx
                  ? "w-7 bg-cocoa"
                  : "w-2 bg-border hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

      </section>
    </div>
  );
}
