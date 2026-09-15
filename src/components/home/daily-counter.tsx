import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sun } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion/reveal";
import { finalPrice, type CatalogProduct } from "@/lib/pricing";

type LensId = "picks" | "budget" | "celebration";

const LENSES: Array<{ id: LensId; label: string; hint: string }> = [
  { id: "picks", label: "Today's picks", hint: "What the counter is known for." },
  { id: "budget", label: "Under ₹200", hint: "Small treats that still arrive warm." },
  { id: "celebration", label: "For a celebration", hint: "Cakes sized for a table of people." },
];

/**
 * The counter rail.
 *
 * Uses the same {@link ProductCard} as the shop so a bake looks identical
 * wherever a customer meets it — the old homepage carousel had its own card
 * with different prices, different buttons and no cart quantity state.
 */
export function DailyCounter({ products }: { products: CatalogProduct[] }) {
  const [lens, setLens] = useState<LensId>("picks");
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const shown = useMemo(() => {
    if (lens === "budget") {
      return products
        .filter((p) => finalPrice(p.price, p.discount_type, p.discount_value) <= 200)
        .slice(0, 10);
    }
    if (lens === "celebration") {
      return products
        .filter(
          (p) =>
            p.item_type === "weight" ||
            (p.weight_variants?.length ?? 0) > 0 ||
            p.category_slug === "cakes",
        )
        .slice(0, 10);
    }
    return products.slice(0, 10);
  }, [products, lens]);

  useEffect(() => {
    const el = trackRef.current;
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
  }, [shown.length]);

  function scroll(direction: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  const activeLens = LENSES.find((l) => l.id === lens)!;

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-b from-[#FFF9F2] via-[#FFF4E9] to-[#FFF8F0] p-5 shadow-soft sm:rounded-4xl sm:p-8 lg:p-10 dark:from-[#1E110A] dark:via-[#160D07] dark:to-[#1C1009]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-berry-deep uppercase sm:text-[11px]">
                <Sun className="size-3" /> On the counter
              </span>
              <h2 className="mt-2.5 font-blogh text-2xl font-bold tracking-wide text-cocoa uppercase sm:text-4xl">
                Fresh from the counter
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{activeLens.hint}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!overflow.left}
                  aria-label="Scroll counter left"
                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 disabled:cursor-default disabled:opacity-35"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!overflow.right}
                  aria-label="Scroll counter right"
                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 disabled:cursor-default disabled:opacity-35"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <Link
                to="/shop"
                className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3.5 text-xs font-bold tracking-wide text-cocoa uppercase shadow-2xs transition-all hover:bg-card hover:text-berry-deep"
              >
                <span>View all</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Lens switcher — three ready-made ways to read the same counter. */}
          <div
            role="tablist"
            aria-label="Filter the counter"
            className="no-scrollbar mt-4 -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            {LENSES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={lens === item.id}
                onClick={() => setLens(item.id)}
                className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  lens === item.id
                    ? "bg-cocoa text-background shadow-xs"
                    : "border border-border/70 bg-card/80 text-cocoa hover:bg-secondary/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="mt-5 rounded-2xl border-2 border-dashed border-border/70 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground">
              Nothing on this shelf right now — try another view, or browse the full counter.
            </p>
          ) : (
            <div
              ref={trackRef}
              key={lens}
              className="no-scrollbar mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0"
            >
              {shown.map((product) => (
                <div
                  key={product.id}
                  className="flex w-[68%] shrink-0 snap-start flex-col sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}
