import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useFlag } from "@/lib/feature-flags";
import { Search, X, ArrowUpDown } from "lucide-react";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop all bakes — Ani Bakes Bakery" },
      {
        name: "description",
        content: "Browse cakes, cookies and pastries from Ani Bakes, baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop all bakes — Ani Bakes Bakery" },
      { property: "og:description", content: "Cakes, cookies and pastries baked fresh to order." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [filterKey, setFilterKey] = useState(0);

  const showSearch = useFlag("ff_shop_search") ?? true;
  const showStagger = useFlag("ff_shop_stagger") ?? true;

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

  function handleCategoryChange(slug: string | null) {
    setActive(slug);
    setFilterKey((k) => k + 1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="font-blogh text-3xl sm:text-5xl lg:text-6xl font-bold text-cocoa uppercase tracking-wide leading-tight">
          The bakery counter
        </h1>
        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">
          Everything is baked in small batches on the morning of your slot.
        </p>
      </div>

      {/* Filters Row: Category pills + Search + Sort */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar shrink-0">
          <Button
            variant={active === null ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs shrink-0 h-8 px-3.5 transition-all"
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Button>
          {data.categories.map((category) => (
            <Button
              key={category.id}
              variant={active === category.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs shrink-0 h-8 px-3.5 transition-all"
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
          {/* Minimalist Underline Search Bar */}
          {showSearch && (
            <div className="relative flex-1 sm:w-48 lg:w-56 flex items-center border-b-2 border-[#2C1810]/30 hover:border-[#2C1810]/60 focus-within:border-[#2C1810] transition-colors pb-1 shrink-0">
              <Search className="size-3.5 text-[#2C1810]/60 mr-2 shrink-0 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bakes…"
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

          {/* Enhanced Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8.5 rounded-full border-2 border-[#2C1810]/20 bg-white/95 dark:bg-[#1E110A] pl-3.5 pr-8 text-xs font-bold text-cocoa shadow-2xs hover:border-[#2C1810]/50 focus:outline-none focus:border-[#2C1810] cursor-pointer appearance-none transition-all"
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

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center py-16 gap-3">
          <span className="text-5xl">🥐</span>
          <p className="font-display text-lg font-bold text-cocoa">No bakes found</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {search ? `No results for "${search}". Try a different name.` : "Nothing in this category right now."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs mt-1"
            onClick={() => { handleCategoryChange(null); setSearch(""); }}
          >
            Show all bakes
          </Button>
        </div>
      ) : (
        <div
          key={showStagger ? filterKey : undefined}
          className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6"
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={showStagger ? "animate-scale-in" : ""}
              style={showStagger ? { animationDelay: `${index * 40}ms` } : undefined}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}