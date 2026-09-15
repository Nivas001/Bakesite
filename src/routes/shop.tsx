import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MagicInput } from "@/components/godui/magic-input";
import { Combobox, type ComboboxOption } from "@/components/godui/combobox";
import { TextAnimate } from "@/components/godui/text-animate";
import { useFlag } from "@/lib/feature-flags";
import { categoryVisual } from "@/lib/category-visuals";
import { finalPrice, formatCurrency, type CatalogProduct } from "@/lib/pricing";

type SortKey = "featured" | "price_asc" | "price_desc" | "name_asc";
type ViewKey = "lanes" | "grid";
type PriceKey = "all" | "under_200" | "200_500" | "over_500";

const SORT_OPTIONS: ComboboxOption[] = [
  { label: "Featured", value: "featured", description: "The order our baker arranges the counter" },
  { label: "Price: Low to High", value: "price_asc", description: "Cheapest first" },
  { label: "Price: High to Low", value: "price_desc", description: "Signature specials first" },
  { label: "Name: A to Z", value: "name_asc", description: "Alphabetical" },
];

const PRICE_BANDS: Array<{ id: PriceKey; label: string; test: (price: number) => boolean }> = [
  { id: "all", label: "Any price", test: () => true },
  { id: "under_200", label: "Under ₹200", test: (p) => p < 200 },
  { id: "200_500", label: "₹200 – ₹500", test: (p) => p >= 200 && p <= 500 },
  { id: "over_500", label: "Over ₹500", test: (p) => p > 500 },
];

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export type ShopSearch = {
  category?: string | undefined;
  q?: string | undefined;
  sort?: SortKey | undefined;
  view?: ViewKey | undefined;
  price?: PriceKey | undefined;
};

function asSort(value: unknown): SortKey | undefined {
  return value === "price_asc" || value === "price_desc" || value === "name_asc"
    ? value
    : value === "featured"
      ? "featured"
      : undefined;
}

function asPrice(value: unknown): PriceKey | undefined {
  return PRICE_BANDS.some((band) => band.id === value) ? (value as PriceKey) : undefined;
}

export const Route = createFileRoute("/shop")({
  /**
   * The browse state lives in the URL rather than in component state so a
   * category can be linked to — the homepage explorer, a campaign link and the
   * browser back button all depend on it.
   */
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    sort: asSort(search["sort"]),
    view: search["view"] === "grid" || search["view"] === "lanes" ? search["view"] : undefined,
    price: asPrice(search["price"]),
  }),
  head: () => ({
    meta: [
      { title: "Shop all bakes — Aniii Bakes Bakery" },
      {
        name: "description",
        content:
          "Browse cakes, cookies, brownies, cheesecakes and pastries from Aniii Bakes, baked fresh for your slot.",
      },
      { property: "og:title", content: "Shop all bakes — Aniii Bakes Bakery" },
      {
        property: "og:description",
        content: "Cakes, brownies, cheesecakes and tea-cakes baked fresh to order.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

/* ------------------------------------------------------------------ */
/* Category lane                                                       */
/* ------------------------------------------------------------------ */

function CategoryLane({
  name,
  slug,
  description,
  products,
  onViewAll,
}: {
  name: string;
  slug: string;
  description: string | null;
  products: CatalogProduct[];
  onViewAll: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
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

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const visual = categoryVisual(slug);
  const Icon = visual.icon;
  const from = Math.min(
    ...products.map((p) => finalPrice(p.price, p.discount_type, p.discount_value)),
  );

  return (
    <section
      id={`lane-${slug}`}
      className="scroll-mt-32 rounded-3xl border border-border/60 bg-card/50 p-3.5 sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br ${visual.tint} text-cocoa sm:size-11`}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-blogh text-lg font-bold tracking-wide text-cocoa uppercase sm:text-2xl">
                {name}
              </h2>
              <span className="rounded-full border border-border/60 bg-secondary px-2 py-0.5 text-[11px] font-bold text-cocoa/80">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
              <span className="rounded-full border border-berry/25 bg-berry/10 px-2 py-0.5 text-[11px] font-bold text-berry-deep">
                from {formatCurrency(from)}
              </span>
            </div>
            <p className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              {description || visual.blurb}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(overflow.left || overflow.right) && (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!overflow.left}
                aria-label={`Scroll ${name} left`}
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 disabled:cursor-default disabled:opacity-35"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!overflow.right}
                aria-label={`Scroll ${name} right`}
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 disabled:cursor-default disabled:opacity-35"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onViewAll(slug)}
            className="group hidden h-8 cursor-pointer items-center gap-1.5 rounded-full border border-berry/30 px-3.5 text-xs font-bold text-berry-deep shadow-2xs transition-all hover:border-berry hover:bg-berry/10 sm:inline-flex"
          >
            <span>See all</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="no-scrollbar mt-3.5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex w-[63%] shrink-0 snap-start flex-col sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}

        {/* A counter with one or two bakes cannot fill the row, and three empty
            columns read as something failing to load rather than as a short
            range. This takes up exactly the slack. */}
        {products.length < 4 && (
          <div className="hidden min-w-48 flex-1 flex-col items-center justify-center gap-1.5 rounded-[2rem] border-2 border-dashed border-border/70 bg-card/40 p-6 text-center sm:flex">
            <span className="text-3xl" aria-hidden>
              🧺
            </span>
            <p className="font-blogh text-sm font-bold tracking-wide text-cocoa uppercase">
              A short range today
            </p>
            <p className="max-w-[26ch] text-[11px] leading-relaxed text-muted-foreground">
              Baked in small batches, so the counter only carries what is fresh. More appears as it
              comes out of the oven.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onViewAll(slug)}
        className="mt-1 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-berry/30 text-xs font-bold text-berry-deep shadow-2xs transition-colors hover:bg-berry/10 sm:hidden"
      >
        <span>
          See all {products.length} {name.toLowerCase()}
        </span>
        <ArrowRight className="size-3.5" />
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const showSearch = useFlag("ff_shop_search") ?? true;
  const showStagger = useFlag("ff_shop_stagger") ?? true;

  const category = search.category ?? null;
  const query = search.q ?? "";
  const sortBy: SortKey = search.sort ?? "featured";
  const priceBand: PriceKey = search.price ?? "all";
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The search box is typed into far more often than the URL should change, so
  // the field is local and pushed into the URL once the typing settles.
  const [draftQuery, setDraftQuery] = useState(query);
  useEffect(() => setDraftQuery(query), [query]);
  useEffect(() => {
    if (draftQuery === query) return;
    const id = window.setTimeout(() => {
      patch({ q: draftQuery.trim() ? draftQuery : undefined });
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftQuery]);

  function patch(next: Partial<ShopSearch>) {
    navigate({
      search: (prev: ShopSearch) => ({ ...prev, ...next }),
      replace: true,
    });
  }

  const hasFilters = Boolean(category || query.trim() || priceBand !== "all");
  // Lanes are the default way in; any filter collapses to a single flat grid so
  // the result count means something.
  const view: ViewKey = hasFilters ? "grid" : (search.view ?? "lanes");

  const priceTest = PRICE_BANDS.find((band) => band.id === priceBand)?.test ?? (() => true);

  const filtered = useMemo(() => {
    let list = category
      ? data.products.filter((p) => p.category_slug === category)
      : [...data.products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q),
      );
    }

    if (priceBand !== "all") {
      list = list.filter((p) => priceTest(finalPrice(p.price, p.discount_type, p.discount_value)));
    }

    if (sortBy === "price_asc") {
      list.sort(
        (a, b) =>
          finalPrice(a.price, a.discount_type, a.discount_value) -
          finalPrice(b.price, b.discount_type, b.discount_value),
      );
    } else if (sortBy === "price_desc") {
      list.sort(
        (a, b) =>
          finalPrice(b.price, b.discount_type, b.discount_value) -
          finalPrice(a.price, a.discount_type, a.discount_value),
      );
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [category, query, sortBy, priceBand, data.products, priceTest]);

  const lanes = useMemo(
    () =>
      data.categories
        .map((c) => ({
          category: c,
          products: data.products.filter((p) => p.category_slug === c.slug),
        }))
        .filter((lane) => lane.products.length > 0),
    [data.categories, data.products],
  );

  const counterFloor = useMemo(() => {
    const prices = data.products.map((p) => finalPrice(p.price, p.discount_type, p.discount_value));
    return prices.length ? Math.min(...prices) : 0;
  }, [data.products]);

  const activeCategory = category
    ? (data.categories.find((c) => c.slug === category) ?? null)
    : null;

  function openCategory(slug: string | null) {
    patch({ category: slug ?? undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearAll() {
    navigate({ search: {}, replace: true });
    setDraftQuery("");
  }

  const categoryRail = (
    <ul className="flex items-center gap-1.5 lg:flex-wrap">
      <li>
        <button
          type="button"
          onClick={() => openCategory(null)}
          aria-current={!category ? "true" : undefined}
          className={`flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition-all ${
            !category
              ? "border-cocoa bg-cocoa text-background shadow-xs"
              : "border-border/70 bg-card text-cocoa hover:border-cocoa/40 hover:bg-secondary/60"
          }`}
        >
          <Store className="size-3.5 shrink-0" />
          All
          <span className="rounded-full bg-black/10 px-1.5 text-[10px] tabular-nums dark:bg-white/15">
            {data.products.length}
          </span>
        </button>
      </li>
      {lanes.map(({ category: c, products }) => {
        const Icon = categoryVisual(c.slug).icon;
        const selected = category === c.slug;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => openCategory(c.slug)}
              aria-current={selected ? "true" : undefined}
              className={`flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition-all ${
                selected
                  ? "border-cocoa bg-cocoa text-background shadow-xs"
                  : "border-border/70 bg-card text-cocoa hover:border-cocoa/40 hover:bg-secondary/60"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              {c.name}
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  selected ? "bg-white/20" : "bg-secondary"
                }`}
              >
                {products.length}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const priceRail = (
    <ul className="flex flex-wrap items-center gap-1.5">
      {PRICE_BANDS.map((band) => {
        const selected = priceBand === band.id;
        return (
          <li key={band.id}>
            <button
              type="button"
              onClick={() => patch({ price: band.id === "all" ? undefined : band.id })}
              aria-pressed={selected}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                selected
                  ? "border-berry bg-berry/15 text-berry-deep"
                  : "border-border/70 bg-card text-cocoa hover:bg-secondary/60"
              }`}
            >
              {band.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="w-full pb-10">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:space-y-7 sm:py-10">
        {/* ── Counter header ─────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 p-5 shadow-soft sm:rounded-4xl sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-berry/10 blur-3xl"
          />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-berry/30 bg-berry/10 px-3.5 py-1 text-[10.5px] font-bold tracking-wider text-berry-deep uppercase sm:text-xs">
                <Sparkles className="size-3.5" />
                <span>Fresh small-batch counter</span>
              </span>
              <TextAnimate
                as="h1"
                animation="blurInUp"
                by="word"
                className="mt-1.5 font-blogh text-3xl leading-tight font-bold tracking-wide text-cocoa uppercase sm:text-5xl lg:text-6xl"
              >
                The bakery counter
              </TextAnimate>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Everything here is baked the morning of your slot. Browse a counter below, or search
                for something specific.
              </p>
            </div>

            {/* At a glance — answers "what is actually available" before scrolling. */}
            <dl className="grid shrink-0 grid-cols-3 gap-2 lg:w-72">
              {[
                { label: "Bakes today", value: String(data.products.length) },
                { label: "Counters", value: String(lanes.length) },
                { label: "Starting at", value: formatCurrency(counterFloor) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-2.5 text-center shadow-2xs"
                >
                  <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 font-blogh text-base font-bold text-cocoa tabular-nums sm:text-lg">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* ── Sticky toolbar ─────────────────────────────────────────── */}
        <div className="sticky top-16 z-30 -mx-4 border-y border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border sm:px-4 sm:shadow-2xs">
          <div className="flex items-center gap-2">
            {/* Desktop category rail */}
            <nav
              aria-label="Filter by category"
              className="no-scrollbar hidden min-w-0 flex-1 overflow-x-auto md:block"
            >
              {categoryRail}
            </nav>

            {/* Mobile: filters trigger */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 text-xs font-bold text-cocoa shadow-2xs transition-colors hover:bg-secondary/60 md:hidden"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>Filters</span>
                  {hasFilters && <span className="size-1.5 rounded-full bg-berry" />}
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-5"
              >
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Counter
                    </p>
                    <div className="flex flex-wrap gap-1.5">{categoryRail}</div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Price
                    </p>
                    {priceRail}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Sort by
                    </p>
                    <Combobox
                      options={SORT_OPTIONS}
                      value={sortBy}
                      onChange={(val) => patch({ sort: (val as SortKey) || undefined })}
                      searchable={false}
                      placeholder="Sort bakes…"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearAll}
                      className="flex-1 rounded-2xl text-xs font-bold"
                    >
                      Clear all
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="flex-1 rounded-2xl bg-cocoa text-xs font-bold text-background"
                    >
                      Show {filtered.length} bakes
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {showSearch && (
              <div className="min-w-0 flex-1 md:max-w-56 md:flex-none lg:max-w-64">
                <MagicInput
                  size="sm"
                  rainbow
                  depth="focus"
                  icon={<Search className="size-3.5" />}
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                  onClear={() => setDraftQuery("")}
                  placeholder="Search bakes…"
                  className="w-full text-xs font-semibold text-cocoa"
                />
              </div>
            )}

            <div className="hidden shrink-0 lg:block">
              <Combobox
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => patch({ sort: (val as SortKey) || undefined })}
                searchable={false}
                placeholder="Sort bakes…"
                className="w-auto"
              />
            </div>

            {/* View switch — only meaningful while nothing is filtered. */}
            {!hasFilters && (
              <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-border/70 bg-card p-0.5 sm:flex">
                {(
                  [
                    { id: "lanes", icon: Rows3, label: "Category lanes" },
                    { id: "grid", icon: LayoutGrid, label: "One big grid" },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon;
                  const selected = view === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => patch({ view: option.id })}
                      aria-label={option.label}
                      title={option.label}
                      className={`grid size-8 cursor-pointer place-items-center rounded-full transition-all ${
                        selected
                          ? "bg-cocoa text-background shadow-2xs"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price rail, desktop only — on phones it lives in the sheet. */}
          <div className="mt-2 hidden md:block">{priceRail}</div>
        </div>

        {/* ── Active filters ─────────────────────────────────────────── */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-cocoa">
              {filtered.length} {filtered.length === 1 ? "bake" : "bakes"}
            </span>
            {activeCategory && (
              <FilterChip
                label={activeCategory.name}
                onClear={() => patch({ category: undefined })}
              />
            )}
            {query.trim() && <FilterChip label={`“${query}”`} onClear={() => setDraftQuery("")} />}
            {priceBand !== "all" && (
              <FilterChip
                label={PRICE_BANDS.find((b) => b.id === priceBand)?.label ?? ""}
                onClear={() => patch({ price: undefined })}
              />
            )}
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer text-xs font-bold text-berry-deep hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────────── */}
        {view === "lanes" ? (
          <div className="animate-in fade-in space-y-4 duration-300 sm:space-y-5">
            {lanes.map(({ category: c, products }) => (
              <CategoryLane
                key={c.id}
                name={c.name}
                slug={c.slug}
                description={c.description}
                products={products}
                onViewAll={openCategory}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/70 bg-card/50 py-16 text-center">
            <span className="text-5xl">🥐</span>
            <p className="font-blogh text-lg font-bold tracking-wide text-cocoa uppercase">
              Nothing matches that
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {query
                ? `No bake matches “${query}” with these filters.`
                : "This combination of filters has nothing on the counter today."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={clearAll}
              className="mt-1 cursor-pointer rounded-full text-xs"
            >
              Show the whole counter
            </Button>
          </div>
        ) : (
          <div
            key={`${category}-${query}-${sortBy}-${priceBand}`}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6 xl:grid-cols-4"
          >
            {filtered.map((product, index) => (
              <div
                key={product.id}
                className={`flex h-full flex-col ${showStagger ? "animate-scale-in" : ""}`}
                style={
                  showStagger ? { animationDelay: `${Math.min(index, 12) * 30}ms` } : undefined
                }
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* A grid of one category ends abruptly; offer the way back out. */}
        {view === "grid" && hasFilters && filtered.length > 0 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-2xl border border-border/80 bg-card px-5 text-xs font-bold text-cocoa shadow-2xs transition-colors hover:bg-secondary/60"
            >
              <Tag className="size-3.5 text-berry-deep" />
              Back to every counter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-berry/30 bg-berry/10 py-1 pr-1 pl-2.5 text-xs font-bold text-berry-deep">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="grid size-4.5 cursor-pointer place-items-center rounded-full bg-berry/20 transition-colors hover:bg-berry/40"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
