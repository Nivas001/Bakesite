import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useSiteContent } from "@/lib/site-content";

const PERKS = ["🥐 4:00 AM dawn oven", "🛵 Pondicherry doorstep", "🧈 100% French butter"];

export function ClosingCta() {
  const { content } = useSiteContent();
  const cta = content.home_cta;

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-[#FFF9F4] to-secondary/45 px-5 py-9 text-center shadow-lift sm:rounded-4xl sm:px-12 sm:py-14 dark:to-secondary/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-berry/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-60 rounded-full bg-amber-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-berry-deep uppercase shadow-2xs sm:text-xs">
            <Sparkles className="size-3" /> {cta.badge || "Fresh mornings"}
          </span>

          <h2 className="font-blogh text-2xl leading-[1.15] font-bold tracking-wide text-cocoa uppercase sm:text-4xl lg:text-5xl">
            {cta.title || "Tomorrow morning could smell a lot better."}
          </h2>

          <p className="mx-auto mt-2.5 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {cta.description ||
              "Reserve your next-day slot now. We mix and bake fresh at dawn for your chosen arrival window."}
          </p>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[11px] font-bold text-cocoa shadow-2xs backdrop-blur-xs"
              >
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
            <Link
              to="/shop"
              className="group inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-[#2C1810] px-6 text-xs font-bold text-white shadow-lift transition-transform duration-200 hover:scale-[1.02] active:scale-95 sm:w-auto sm:text-sm"
            >
              <span>Start your bake box</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/offers"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border/80 bg-card/80 px-6 text-xs font-bold text-cocoa shadow-2xs backdrop-blur transition-colors hover:bg-secondary/60 sm:w-auto sm:text-sm"
            >
              View offers
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
