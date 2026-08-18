import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useFlag } from "@/lib/feature-flags";
import { Search, X, ArrowUpDown, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { CatalogProduct } from "@/lib/pricing";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop all bakes — Ani Bakes Bakery" },
      {
        name: "description",
        content: "Browse cakes, cookies, brownies, cheesecakes and pastries from Ani Bakes, baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop all bakes — Ani Bakes Bakery" },
      { property: "og:description", content: "Cakes, brownies, cheesecakes and tea-cakes baked fresh to order." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

/**
 * Horizontal Category Lane with Left/Right navigation and "View all products" button
 */
function CategoryHorizontalLane({
  categoryName,
  categorySlug,
  description,
  products,
  onViewAll,
}: {
  categoryName: string;
  categorySlug: string;
  description: string | null;
  products: CatalogProduct[];
  onViewAll: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="space-y-3.5 py-4 border-b border-border/40 last:border-b-0">
      {/* Category Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-berry" />
            <h2 className="font-blogh text-xl sm:text-2xl lg:text-3xl font-bold text-cocoa uppercase tracking-wide">
              {categoryName}
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-cocoa/80 border border-border/60">
              {products.length} items
            </span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls: View All Button & Arrow Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label={`Scroll ${categoryName} left`}
              className="flex size-7.5 items-center justify-center rounded-full border border-border/80 bg-card text-cocoa hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label={`Scroll ${categoryName} right`}
              className="flex size-7.5 items-center justify-center rounded-full border border-border/80 bg-card text-cocoa hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* View All Products Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewAll(categorySlug)}
            className="rounded-full border-berry/30 hover:border-berry text-berry hover:bg-berry/10 font-bold text-xs h-8 px-3.5 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View all {categoryName}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scrolling Axis */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3.5 sm:gap-4.5 pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[230px] sm:w-[260px] md:w-[275px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [filterKey, setFilterKey] = useState(0);

  const showSearch = useFlag("ff_shop_search") ?? true;
  const showStagger = useFlag("ff_shop_stagger") ?? true;

  // Filtered products list for Grid Mode
  const products = useMemo(() => {
    let list = active
      ? data.products.filter((p) => p.category_slug === active)
      : [...data.products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [active, search, sortBy, data.products]);

  // Group products by category for Horizontal Lanes Mode
  const categorizedProducts = useMemo(() => {
    return data.categories.map((category) => ({
      category,
      products: data.products.filter((p) => p.category_slug === category.slug),
    }));
  }, [data.categories, data.products]);

  function handleCategoryChange(slug: string | null) {
    setActive(slug);
    setFilterKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isLaneMode = active === null && !search.trim() && sortBy === "featured";

  const activeCategoryObj = useMemo(() => {
    if (!active) return null;
    return data.categories.find((c) => c.slug === active) ?? null;
  }, [active, data.categories]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/30 px-3.5 py-1 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-berry w-fit">
          <Sparkles className="size-3.5" />
          <span>Fresh Small-Batch Counter</span>
        </div>
        <h1 className="font-blogh text-3xl sm:text-5xl lg:text-6xl font-bold text-cocoa uppercase tracking-wide leading-tight">
          The bakery counter
        </h1>
        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Explore our signature brownies, velvety cheesecakes, celebration cakes, and morning tea cakes baked fresh on the day of your slot.
        </p>
      </div>

      {/* Filters Row: Category pills + Search + Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 justify-between border-b border-border/60 pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar shrink-0">
          <Button
            variant={active === null ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs shrink-0 h-8 px-3.5 transition-all cursor-pointer"
            onClick={() => handleCategoryChange(null)}
          >
            All Categories
          </Button>
          {data.categories.map((category) => (
            <Button
              key={category.id}
              variant={active === category.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs shrink-0 h-8 px-3.5 transition-all cursor-pointer"
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative flex-1 sm:w-48 lg:w-56 flex items-center border-b-2 border-[#2C1810]/30 hover:border-[#2C1810]/60 focus-within:border-[#2C1810] transition-colors pb-1 shrink-0">
              <Search className="size-3.5 text-[#2C1810]/60 mr-2 shrink-0 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu…"
                className="w-full bg-transparent text-xs font-semibold text-cocoa placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8.5 rounded-full border-2 border-[#2C1810]/20 bg-card pl-3.5 pr-8 text-xs font-bold text-cocoa shadow-2xs hover:border-[#2C1810]/50 focus:outline-none focus:border-[#2C1810] cursor-pointer appearance-none transition-all"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-[#2C1810]/60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: Curated Horizontal Category Lanes (When "All" is active with no search/sort overrides) */}
      {isLaneMode ? (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {categorizedProducts.map(({ category, products: catProducts }) => (
            <CategoryHorizontalLane
              key={category.id}
              categoryName={category.name}
              categorySlug={category.slug}
              description={category.description}
              products={catProducts}
              onViewAll={handleCategoryChange}
            />
          ))}
        </div>
      ) : (
        /* VIEW MODE 2: Full Responsive Product Grid (When specific category or search/sort is active) */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Active filter banner with Back button */}
          <div className="flex items-center justify-between bg-secondary/30 p-3.5 rounded-2xl border border-border/60">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-berry" />
              <p className="text-xs sm:text-sm font-bold text-cocoa">
                Showing {products.length} {products.length === 1 ? "item" : "items"}{" "}
                {activeCategoryObj ? `in ${activeCategoryObj.name}` : ""}
                {search ? ` matching "${search}"` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { handleCategoryChange(null); setSearch(""); setSortBy("featured"); }}
              className="text-xs font-bold text-berry hover:underline cursor-pointer"
            >
              ← Back to category lanes
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
              <span className="text-5xl">🥐</span>
              <p className="font-display text-lg font-bold text-cocoa">No bakes found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {search ? `No results for "${search}". Try another keyword.` : "Nothing in this category right now."}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs mt-1 cursor-pointer"
                onClick={() => { handleCategoryChange(null); setSearch(""); }}
              >
                Show all bakes
              </Button>
            </div>
          ) : (
            <div
              key={showStagger ? filterKey : undefined}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6"
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={showStagger ? "animate-scale-in" : ""}
                  style={showStagger ? { animationDelay: `${index * 30}ms` } : undefined}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}