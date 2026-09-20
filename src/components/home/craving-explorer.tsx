import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, ImageOff, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { categoryVisual } from "@/lib/category-visuals";
import { cn } from "@/lib/utils";
import { finalPrice, formatCurrency, type CatalogProduct } from "@/lib/pricing";

export interface ExplorerCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Lane {
  category: ExplorerCategory;
  items: CatalogProduct[];
  from: number | null;
  cover: string | null;
  /** Up to three named bakes, so the counter is previewed by what is on it. */
  picks: Array<{ id: string; name: string; slug: string; image: string | null; price: number }>;
}

/**
 * The "what do you actually sell?" section.
 *
 * A visitor landing on the homepage previously had to scroll through six
 * editorial bands before meeting a category name. This puts the whole range one
 * tap away: pick a counter on the left, see what is on it on the right.
 *
 * The rebuild turns the picker into a stack of cards that each carry their own
 * photograph, price floor and count, so the choice is made from pictures rather
 * than from a list of words — and the preview beside it now names three actual
 * bakes and links straight to them, instead of showing anonymous thumbnails
 * that went nowhere.
 */
export function CravingExplorer({
  categories,
  products,
}: {
  categories: ExplorerCategory[];
  products: CatalogProduct[];
}) {
  const lanes = useMemo<Lane[]>(
    () =>
      categories
        .map((category) => {
          const items = products.filter((p) => p.category_slug === category.slug);
          const prices = items.map((p) => finalPrice(p.price, p.discount_type, p.discount_value));
          return {
            category,
            items,
            from: prices.length ? Math.min(...prices) : null,
            cover: items.find((p) => p.image_url)?.image_url ?? null,
            picks: items.slice(0, 3).map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              image: p.image_url,
              price: finalPrice(p.price, p.discount_type, p.discount_value),
            })),
          };
        })
        .filter((lane) => lane.items.length > 0),
    [categories, products],
  );

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = lanes.find((lane) => lane.category.slug === activeSlug) ?? lanes[0];

  if (!active) return null;

  const visual = categoryVisual(active.category.slug);
  const totalBakes = lanes.reduce((sum, lane) => sum + lane.items.length, 0);

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft sm:rounded-[2.75rem]">
        {/* Warm worktop backdrop, so the cards read as things laid out on a
            counter rather than as a flat list on a flat panel. */}
        <div
          aria-hidden
          className="worktop-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_75%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-berry/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-amber-400/10 blur-3xl"
        />

        <div className="relative z-10 p-5 sm:p-8 lg:p-10">
          {/* ── Heading ─────────────────────────────────────────────── */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-berry-deep uppercase sm:text-[11px]">
                <Compass className="size-3" /> Start here
              </span>
              <h2 className="mt-2.5 font-blogh text-[clamp(1.6rem,5vw,2.75rem)] leading-[1.05] font-bold tracking-wide text-cocoa uppercase">
                What are you in the mood for?
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {lanes.length} counters, {totalBakes} bakes, all made the morning of your slot. Pick
                a counter to see what is on it today.
              </p>
            </div>

            <Link
              to="/shop"
              className="group inline-flex h-10 w-fit shrink-0 items-center gap-1.5 rounded-full border border-cocoa/20 bg-card px-4 text-xs font-bold text-cocoa shadow-2xs transition-colors hover:border-cocoa/40 hover:bg-secondary/60"
            >
              Skip to the whole counter
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </header>

          {/* ── Counter picker ──────────────────────────────────────── */}
          {/* A horizontal shelf on phones, a vertical stack on desktop. Each
              card carries its own photograph so the choice can be made by
              looking rather than by reading. */}
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-6">
            <nav aria-label="Browse by category">
              <ul className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0">
                {lanes.map((lane) => {
                  const laneVisual = categoryVisual(lane.category.slug);
                  const Icon = laneVisual.icon;
                  const selected = lane.category.slug === active.category.slug;
                  return (
                    <li key={lane.category.id} className="w-40 shrink-0 lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveSlug(lane.category.slug)}
                        aria-pressed={selected}
                        className={cn(
                          "group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-2 text-left transition-all duration-300",
                          selected
                            ? "border-cocoa bg-cocoa text-background shadow-lift"
                            : "border-border/70 bg-card/85 text-cocoa hover:-translate-y-0.5 hover:border-berry/40 hover:shadow-soft",
                        )}
                      >
                        {/* Thumbnail */}
                        <span
                          className={cn(
                            "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-linear-to-br lg:size-12",
                            laneVisual.tint,
                          )}
                        >
                          {lane.cover ? (
                            <img
                              src={lane.cover}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <Icon className="size-5 text-cocoa" />
                          )}
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-xs font-bold lg:text-sm">
                            {lane.category.name}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 font-mono text-[10px] font-bold tabular-nums",
                              selected ? "text-background/65" : "text-muted-foreground",
                            )}
                          >
                            {lane.items.length} {lane.items.length === 1 ? "bake" : "bakes"}
                            {lane.from !== null && ` · from ${formatCurrency(lane.from)}`}
                          </span>
                        </span>

                        {/* A quiet marker on desktop, where the stack reads as
                            a menu and needs a pointer to the open item. */}
                        <ArrowRight
                          className={cn(
                            "hidden size-4 shrink-0 transition-all lg:block",
                            selected
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-40",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Preview of the selected counter ───────────────────── */}
            <div
              key={active.category.slug}
              className="animate-scale-in overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-soft"
            >
              <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* Hero photograph */}
                <div className="relative aspect-4/3 overflow-hidden bg-secondary/50 sm:aspect-auto sm:min-h-72">
                  {active.cover ? (
                    <img
                      src={active.cover}
                      alt={active.category.name}
                      loading="lazy"
                      decoding="async"
                      className="size-full animate-ken-burns object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <ImageOff className="size-8" />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-linear-to-t",
                      visual.tint,
                    )}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 to-transparent to-55%"
                  />

                  <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                    {active.from !== null && (
                      <span className="rounded-full bg-card/92 px-2.5 py-1 text-[11px] font-black text-cocoa shadow-soft backdrop-blur">
                        from {formatCurrency(active.from)}
                      </span>
                    )}
                    <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur">
                      {active.items.length} on the counter
                    </span>
                  </div>
                </div>

                {/* Copy and picks */}
                <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <h3 className="font-blogh text-lg font-bold tracking-wide text-cocoa uppercase sm:text-2xl">
                      {active.category.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {active.category.description || visual.blurb}
                    </p>

                    {/* Named bakes rather than anonymous thumbnails — each one
                        goes straight to its own page. */}
                    {active.picks.length > 0 && (
                      <ul className="mt-3.5 space-y-1.5">
                        {active.picks.map((pick) => (
                          <li key={pick.id}>
                            <Link
                              to="/shop/$slug"
                              params={{ slug: pick.slug }}
                              className="group flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border/70 hover:bg-secondary/45"
                            >
                              {pick.image ? (
                                <img
                                  src={pick.image}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="size-9 shrink-0 rounded-lg border border-border/60 object-cover"
                                />
                              ) : (
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-secondary text-muted-foreground">
                                  <Sparkles className="size-3.5" />
                                </span>
                              )}
                              <span className="min-w-0 flex-1 truncate text-xs font-bold text-cocoa">
                                {pick.name}
                              </span>
                              <span className="shrink-0 font-mono text-[11px] font-bold text-berry-deep tabular-nums">
                                {formatCurrency(pick.price)}
                              </span>
                              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Link
                    to="/shop"
                    search={{ category: active.category.slug }}
                    className="group relative inline-flex h-11 items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-cocoa px-4 text-xs font-bold text-background shadow-soft transition-transform hover:scale-[1.01] active:scale-95 sm:text-sm"
                  >
                    {/* The category name is already plural, so a count in front
                        of it reads badly at one ("Browse 1 brownies"). The count
                        is on the picker beside it. */}
                    <span>Browse all {active.category.name.toLowerCase()}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/20 opacity-0 group-hover:animate-sheen-sweep group-hover:opacity-100"
                    />
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
