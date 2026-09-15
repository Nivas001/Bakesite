import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, ImageOff } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { categoryVisual } from "@/lib/category-visuals";
import { finalPrice, formatCurrency, type CatalogProduct } from "@/lib/pricing";

export interface ExplorerCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/**
 * The "what do you actually sell?" section.
 *
 * A visitor landing on the homepage previously had to scroll through six
 * editorial bands before meeting a category name. This puts the whole range one
 * tap away: pick a counter on the left, see what is on it on the right.
 */
export function CravingExplorer({
  categories,
  products,
}: {
  categories: ExplorerCategory[];
  products: CatalogProduct[];
}) {
  const lanes = useMemo(
    () =>
      categories
        .map((category) => {
          const items = products.filter((p) => p.category_slug === category.slug);
          const prices = items.map((p) => finalPrice(p.price, p.discount_type, p.discount_value));
          return {
            category,
            items,
            from: prices.length ? Math.min(...prices) : null,
            images: items
              .map((p) => p.image_url)
              .filter((url): url is string => Boolean(url))
              .slice(0, 4),
          };
        })
        .filter((lane) => lane.items.length > 0),
    [categories, products],
  );

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = lanes.find((lane) => lane.category.slug === activeSlug) ?? lanes[0];

  if (!active) return null;

  const visual = categoryVisual(active.category.slug);
  const cover = active.images[0];

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/35 p-5 shadow-soft sm:rounded-4xl sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-berry/10 blur-3xl"
        />

        <div className="relative z-10">
          <header className="mb-5 sm:mb-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-berry-deep uppercase sm:text-[11px]">
              <Compass className="size-3" /> Start here
            </span>
            <h2 className="mt-2.5 font-blogh text-2xl font-bold tracking-wide text-cocoa uppercase sm:text-4xl">
              What are you in the mood for?
            </h2>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {lanes.length} counters, all baked to order. Pick one to see what is on it today.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6">
            {/* Category picker — a scrolling rail on phones, a list on desktop. */}
            <nav aria-label="Browse by category">
              <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1.5 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
                {lanes.map((lane) => {
                  const Icon = categoryVisual(lane.category.slug).icon;
                  const selected = lane.category.slug === active.category.slug;
                  return (
                    <li key={lane.category.id} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => setActiveSlug(lane.category.slug)}
                        aria-pressed={selected}
                        className={`flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition-all lg:gap-3 ${
                          selected
                            ? "border-cocoa bg-cocoa text-background shadow-soft"
                            : "border-border/70 bg-card/80 text-cocoa hover:border-berry/40 hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 text-xs font-bold whitespace-nowrap lg:text-sm">
                          {lane.category.name}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                            selected ? "bg-white/20" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {lane.items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Preview of the selected counter. */}
            <div
              key={active.category.slug}
              className="animate-scale-in overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft"
            >
              <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="relative aspect-4/3 overflow-hidden bg-secondary/50 sm:aspect-auto sm:min-h-56">
                  {cover ? (
                    <img
                      src={cover}
                      alt={active.category.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <ImageOff className="size-8" />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-linear-to-t ${visual.tint}`}
                  />
                  {active.from !== null && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-card/92 px-2.5 py-1 text-[11px] font-bold text-cocoa shadow-soft backdrop-blur">
                      from {formatCurrency(active.from)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <h3 className="font-blogh text-lg font-bold tracking-wide text-cocoa uppercase sm:text-2xl">
                      {active.category.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {active.category.description || visual.blurb}
                    </p>

                    {active.images.length > 1 && (
                      <ul className="mt-3 flex gap-1.5">
                        {active.images.slice(1, 4).map((src) => (
                          <li key={src}>
                            <img
                              src={src}
                              alt=""
                              loading="lazy"
                              className="size-12 rounded-xl border border-border/60 object-cover sm:size-14"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Link
                    to="/shop"
                    search={{ category: active.category.slug }}
                    className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-cocoa px-4 text-xs font-bold text-background shadow-soft transition-transform hover:scale-[1.01] active:scale-95 sm:text-sm"
                  >
                    {/* The category name is already plural, so a count in front
                        of it reads badly at one ("Browse 1 brownies"). The count
                        is on the picker beside it. */}
                    <span>Browse all {active.category.name.toLowerCase()}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
