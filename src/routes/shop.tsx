import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useFlag } from "@/lib/feature-flags";
import { Search, X, Sparkles, SlidersHorizontal, ArrowUpDown, Filter } from "lucide-react";
import { ALL_CATEGORY_THEME, CATEGORY_THEMES, getCategoryTheme } from "@/lib/category-theme";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Bakes & Cakes — Ani Bakes Bakery" },
      {
        name: "description",
        content:
          "Browse celebration cakes, 36-hour wild sourdoughs, French lamination croissants, brownies, and cookies from Ani Bakes. Baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop All Bakes & Cakes — Ani Bakes Bakery" },
      { property: "og:description", content: "Fresh artisanal cakes, sourdoughs, and pastries baked to order." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [filterKey, setFilterKey] = useState(0);

  const showSearch = useFlag("ff_shop_search") ?? true;
  const showStagger = useFlag("ff_shop_stagger") ?? true;

  // Compute products per category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.products.length };
    data.products.forEach((p) => {
      if (p.category_slug) {
        counts[p.category_slug] = (counts[p.category_slug] ?? 0) + 1;
      }
    });
    return counts;
  }, [data.products]);

  // Filtered & sorted products list
  const filteredProducts = useMemo(() => {
    let list = activeCategory
      ? data.products.filter((p) => p.category_slug === activeCategory)
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
  }, [activeCategory, search, sortBy, data.products]);

  const currentTheme = getCategoryTheme(activeCategory);

  function handleCategoryChange(slug: string | null) {
    setActiveCategory(slug);
    setFilterKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-foreground pb-24 selection:bg-berry/20">
      {/* 1. Shop Hero Showcase Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF4EC] via-[#FDF8F2] to-[#FFFDF9] border-b border-[#2C1810]/10 pt-10 pb-8 sm:pt-14 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border-2 border-amber-600/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-950">
                <Sparkles className="size-3.5 text-amber-700" />
                <span>4:00 AM Small-Batch Morning Bake</span>
              </div>

              <h1 className="font-nimbus text-3xl sm:text-5xl lg:text-6xl font-bold text-cocoa leading-tight uppercase tracking-tight">
                The Bakery Counter
              </h1>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium max-w-xl">
                Explore our full daily bake catalogue. 100% French butter lamination, 36-hour wild sourdough ferments, and celebration layer cakes baked fresh for your morning slot.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-[#2C1810]/15 shadow-sm">
              <div className="px-3 py-1.5 rounded-xl bg-[#2C1810]/5 text-center">
                <p className="text-[9.5px] uppercase font-bold text-zinc-500">Live Counter Bakes</p>
                <p className="font-sans font-black text-lg text-cocoa">{data.products.length} Items</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-center">
                <p className="text-[9.5px] uppercase font-bold text-amber-800">Categories</p>
                <p className="font-sans font-black text-lg text-amber-900">{data.categories.length}</p>
              </div>
            </div>
          </div>

          {/* 2. Interactive Category Filter Pills Bar */}
          <div className="mt-8 flex flex-col gap-4">
            
            {/* Scrollable Category Bar with Individual Color Accents */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              
              {/* "All" Tab */}
              <button
                type="button"
                onClick={() => handleCategoryChange(null)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2 ${
                  activeCategory === null
                    ? `${ALL_CATEGORY_THEME.pillActiveBg} ${ALL_CATEGORY_THEME.pillActiveText} border-[#2C1810] shadow-md scale-[1.02]`
                    : "bg-white/80 text-zinc-700 hover:bg-white hover:text-black border-zinc-200"
                }`}
              >
                <span>{ALL_CATEGORY_THEME.icon}</span>
                <span>All Bakes</span>
                <span
                  className={`size-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    activeCategory === null ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {categoryCounts["all"] ?? data.products.length}
                </span>
              </button>

              {/* Dynamic Category Tabs */}
              {data.categories.map((cat) => {
                const theme = getCategoryTheme(cat.slug);
                const isActive = activeCategory === cat.slug;
                const count = categoryCounts[cat.slug] ?? 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2 ${
                      isActive
                        ? `${theme.pillActiveBg} ${theme.pillActiveText} ${theme.pillBorder} shadow-md scale-[1.02]`
                        : "bg-white/80 text-zinc-700 hover:bg-white hover:text-black border-zinc-200"
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.shortName}</span>
                    <span
                      className={`size-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              
              {/* Active Category Tagline Banner */}
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 self-start sm:self-auto">
                <span className="text-sm">{currentTheme.icon}</span>
                <span className="font-semibold">{currentTheme.tagline}</span>
              </div>

              {/* Search & Sort Input Bar */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {showSearch && (
                  <div className="relative flex-1 sm:w-56 lg:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search bakes, flavors…"
                      className="h-9 w-full rounded-full border-2 border-zinc-200 bg-white pl-9 pr-8 text-xs font-medium placeholder:text-zinc-400 focus:outline-none focus:border-[#2C1810] shadow-2xs transition-all"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
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
                    className="h-9 rounded-full border-2 border-zinc-200 bg-white px-3.5 pr-8 text-xs font-bold text-cocoa shadow-2xs focus:outline-none focus:border-[#2C1810] cursor-pointer appearance-none"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-zinc-500 pointer-events-none" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Product Bento Grid Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        
        {/* Results Count / Filter Status */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Showing {filteredProducts.length} of {data.products.length} bakes
            {activeCategory && ` in ${currentTheme.name}`}
            {search && ` for "${search}"`}
          </p>

          {(activeCategory || search) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setSearch("");
              }}
              className="text-xs font-bold text-berry hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="size-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[2.5rem] border-2 border-dashed border-zinc-300 bg-white/60">
            <span className="text-5xl mb-3">🥐</span>
            <h3 className="font-nimbus text-xl sm:text-2xl font-bold text-cocoa uppercase">
              No matching bakes found
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mt-1 mb-4 leading-relaxed">
              {search
                ? `We couldn't find anything matching "${search}". Try searching for chocolate, croissant, or sourdough.`
                : "No products currently available in this category."}
            </p>
            <Button
              size="sm"
              onClick={() => {
                setActiveCategory(null);
                setSearch("");
              }}
              className="rounded-full bg-[#2C1810] text-white hover:bg-[#2C1810]/90 text-xs font-bold h-9 px-6 cursor-pointer"
            >
              Show All Bakery Bakes
            </Button>
          </div>
        ) : (
          <div
            key={showStagger ? filterKey : undefined}
            className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={showStagger ? "animate-in fade-in zoom-in-95 duration-300" : ""}
                style={showStagger ? { animationDelay: `${(index % 12) * 45}ms` } : undefined}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default Shop;