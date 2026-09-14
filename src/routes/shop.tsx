import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo, useRef, useEffect } from "react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { MagicInput } from "@/components/godui/magic-input";
import { Combobox, type ComboboxOption } from "@/components/godui/combobox";
import { TextAnimate } from "@/components/godui/text-animate";
import { useFlag } from "@/lib/feature-flags";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Store,
  Flame,
  PieChart,
  Cake,
  Coffee,
  Croissant,
  Wheat,
  Cookie,
} from "lucide-react";
import type { CatalogProduct } from "@/lib/pricing";

function getCategoryIcon(slug: string | null) {
  switch (slug) {
    case "brownies":
      return Flame;
    case "cheesecakes":
      return PieChart;
    case "cakes":
      return Cake;
    case "tea-cakes":
      return Coffee;
    case "pastries":
      return Croissant;
    case "breads":
      return Wheat;
    case "cookies":
      return Cookie;
    default:
      return Store;
  }
}

const SORT_OPTIONS: ComboboxOption[] = [
  { label: "Featured", value: "featured", description: "Curated bakery highlights" },
  { label: "Price: Low to High", value: "price_asc", description: "Most affordable treats first" },
  { label: "Price: High to Low", value: "price_desc", description: "Signature gourmet specials" },
  { label: "Name: A to Z", value: "name_asc", description: "Alphabetical catalog order" },
];

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop all bakes — Ani Bakes Bakery" },
      {
        name: "description",
        content:
          "Browse cakes, cookies, brownies, cheesecakes and pastries from Ani Bakes, baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop all bakes — Ani Bakes Bakery" },
      {
        property: "og:description",
        content: "Cakes, brownies, cheesecakes and tea-cakes baked fresh to order.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

/**
 * Horizontal Category Lane with responsive 4-cards-per-row layout, 1-4 row support, and 2-column mobile bento showcase
 */
function CategoryHorizontalLane({
  categoryName,
  categorySlug,
  description,
  products,
  layoutRows = 1,
  onViewAll,
}: {
  categoryName: string;
  categorySlug: string;
  description: string | null;
  products: CatalogProduct[];
  layoutRows?: number;
  onViewAll: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // A category with only a couple of products does not overflow, so its arrows
  // would do nothing. Track the real overflow and hide them when there is none.
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflow({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [products.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -containerWidth * 0.85 : containerWidth * 0.85;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  const rows = Math.min(4, Math.max(1, layoutRows));

  // Chunk into columns of `rows` items for desktop horizontal multi-row layout
  const columns: CatalogProduct[][] = [];
  for (let i = 0; i < products.length; i += rows) {
    columns.push(products.slice(i, i + rows));
  }

  // On mobile: pick top 4 items for 2x2 bento showcase
  const mobileTopProducts = products.slice(0, 4);

  return (
    <section className="space-y-3.5 py-5 border-b border-border/40 last:border-b-0">
      {/* Category Row Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-berry" />
            <h2 className="font-blogh text-xl sm:text-2xl lg:text-3xl font-bold text-cocoa uppercase tracking-wide">
              {categoryName}
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-cocoa/80 border border-border/60">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed hidden sm:block">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls: View All Button & Arrow Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop/Tablet Scroll Arrows */}
          {(overflow.left || overflow.right) && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!overflow.left}
                aria-label={`Scroll ${categoryName} left`}
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-cocoa hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs disabled:cursor-default disabled:opacity-35 disabled:hover:bg-card"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!overflow.right}
                aria-label={`Scroll ${categoryName} right`}
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-cocoa hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs disabled:cursor-default disabled:opacity-35 disabled:hover:bg-card"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* View All Products Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewAll(categorySlug)}
            className="rounded-full border-berry/30 hover:border-berry text-berry-deep hover:bg-berry/10 font-bold text-xs h-8 px-3.5 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View all {categoryName}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed sm:hidden">{description}</p>
      )}

      {/* 📱 MOBILE VIEW: Clean 2-Column Grid (Shows 4 Featured Cards + View All Button) */}
      <div className="sm:hidden space-y-3">
        <div className="grid grid-cols-2 gap-2.5 pt-2 pb-2">
          {mobileTopProducts.map((product) => (
            <div key={product.id} className="min-w-0 h-full flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {products.length > 4 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onViewAll(categorySlug)}
            className="w-full rounded-2xl border-berry/30 text-berry-deep hover:bg-berry/10 font-bold text-xs h-10 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>
              View all {products.length} {categoryName}
            </span>
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>

      {/* 💻 DESKTOP & TABLET VIEW: Exact 4-Cards per Row Horizontal Lane (Supports 1, 2, 3, 4 Rows)
          A lane that cannot fill its row is laid out as a plain grid instead —
          a single card against three empty columns reads as a loading failure
          rather than a short category. */}
      <div
        ref={scrollRef}
        className={
          columns.length < 3
            ? "-mt-2 hidden gap-4 pt-3.5 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "no-scrollbar -mt-2 hidden snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-3.5 pb-4 sm:flex"
        }
      >
        {columns.map((column, colIdx) => (
          <div
            key={colIdx}
            className={
              columns.length < 3
                ? "flex flex-col gap-4"
                : "flex shrink-0 snap-start flex-col gap-4 sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
            }
          >
            {column.map((product) => (
              <div key={product.id} className="h-full flex flex-col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ))}

        {/* A short category cannot fill the row. Rather than leaving the
            remaining columns blank — which reads as something failing to load —
            the gap becomes an invitation to keep browsing. */}
        {columns.length < 3 && (
          <div className="hidden min-h-[18rem] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-border/80 bg-card/40 p-6 text-center sm:flex">
            <span className="text-3xl" aria-hidden>
              🧺
            </span>
            <p className="font-blogh text-sm font-bold tracking-wide text-cocoa uppercase">
              A short range today
            </p>
            {/* Phrased without the category name as the subject — it may be
                singular or plural, and "Brownies is baked" reads badly. */}
            <p className="max-w-[24ch] text-[11px] leading-relaxed text-muted-foreground">
              This range is baked in small batches, so the counter carries only what is fresh today.
              More returns as it comes out of the oven.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">(
    "featured",
  );
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
          p.category_name?.toLowerCase().includes(q),
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

  const categoryItems = useMemo(
    () => [
      { id: "all", slug: null as string | null, icon: Store, label: "All" },
      ...data.categories.map((c) => ({
        id: c.slug,
        slug: c.slug as string | null,
        icon: getCategoryIcon(c.slug),
        label: c.name,
      })),
    ],
    [data.categories],
  );

  const isLaneMode = active === null && !search.trim() && sortBy === "featured";

  const activeCategoryObj = useMemo(() => {
    if (!active) return null;
    return data.categories.find((c) => c.slug === active) ?? null;
  }, [active, data.categories]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/30 px-3.5 py-1 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-berry-deep w-fit">
          <Sparkles className="size-3.5" />
          <span>Fresh Small-Batch Counter</span>
        </div>
        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="word"
          className="font-blogh text-3xl sm:text-5xl lg:text-6xl font-bold text-cocoa uppercase tracking-wide leading-tight"
        >
          The bakery counter
        </TextAnimate>
        <p className="max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Explore our signature brownies, velvety cheesecakes, celebration cakes, and morning tea
          cakes baked fresh on the day of your slot.
        </p>
      </div>

      {/* Filters Row: Category MultiButton Rail + Search + Sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4 justify-between border-b border-border/60 pb-4">
        {/* Category rail. Every pill shows its name: the previous control only
            labelled the selected item, leaving six unlabelled glyphs that are
            not reliably distinguishable at this size. */}
        <nav
          aria-label="Filter by category"
          className="no-scrollbar -mx-4 shrink-0 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          <ul className="flex items-center gap-1.5">
            {categoryItems.map((item) => {
              const Icon = item.icon;
              const selected = (active ?? "all") === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(item.slug)}
                    aria-current={selected ? "true" : undefined}
                    className={`flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition-all ${
                      selected
                        ? "border-cocoa bg-cocoa text-background shadow-xs"
                        : "border-border/70 bg-card text-cocoa hover:border-cocoa/40 hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
          {/* Search Bar with GodUI 3D MagicInput */}
          {showSearch && (
            <div className="w-full sm:w-52 lg:w-60 shrink-0">
              <MagicInput
                size="sm"
                rainbow
                depth="focus"
                icon={<Search className="size-3.5" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch("")}
                placeholder="Search any products..."
                className="w-full text-xs font-semibold text-cocoa"
              />
            </div>
          )}

          {/* Sort Dropdown with GodUI Combobox */}
          <div className="shrink-0">
            <Combobox
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              searchable={false}
              icon={<ArrowUpDown className="size-3.5" />}
              placeholder="Sort bakes…"
              className="w-auto"
            />
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
              layoutRows={(category as any).layout_rows ?? 1}
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
              onClick={() => {
                handleCategoryChange(null);
                setSearch("");
                setSortBy("featured");
              }}
              className="text-xs font-bold text-berry-deep hover:underline cursor-pointer"
            >
              ← Back to category lanes
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
              <span className="text-5xl">🥐</span>
              <p className="font-display text-lg font-bold text-cocoa">No bakes found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {search
                  ? `No results for "${search}". Try another keyword.`
                  : "Nothing in this category right now."}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs mt-1 cursor-pointer"
                onClick={() => {
                  handleCategoryChange(null);
                  setSearch("");
                }}
              >
                Show all bakes
              </Button>
            </div>
          ) : (
            <div
              key={showStagger ? filterKey : undefined}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 pt-2 pb-2"
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`h-full flex flex-col ${showStagger ? "animate-scale-in" : ""}`}
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
