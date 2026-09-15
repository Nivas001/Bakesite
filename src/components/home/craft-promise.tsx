import { Check, Croissant, Sunrise, ThermometerSun, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useSiteContent } from "@/lib/site-content";
import { CountUp } from "@/components/motion/count-up";

const FIGURES = [
  { icon: Sunrise, value: 4, suffix: ":00 AM", label: "Ovens on", sub: "Seven days a week" },
  { icon: ThermometerSun, value: 36, suffix: "h", label: "Cold ferment", sub: "For the sourdough" },
  { icon: Croissant, value: 27, suffix: "-layer", label: "Croissant", sub: "Butter, folded" },
] as const;

const WE_DO = [
  "Real Normandy butter, never margarine or shortening",
  "Stone-ground flour milled for us, not bleached",
  "Belgian couverture chocolate at 70% cocoa",
  "Everything baked the morning it reaches you",
];

const WE_DONT = [
  "No chemical improvers or dough conditioners",
  "No day-old stock sold as fresh",
  "No artificial colour or flavour essence",
  "No frozen, bought-in bases",
];

/**
 * What the bakery stands behind, in plain terms.
 *
 * Replaces the old fermentation-laboratory bento, which spent a full screen on
 * hydration percentages and temperatures that no customer was shopping on.
 * The headline copy stays admin-editable through `home_lab`.
 */
export function CraftPromise() {
  const { content } = useSiteContent();
  const lab = content.home_lab;

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-[#2C1810] via-[#3A2117] to-[#24130C] p-5 text-white shadow-lift sm:rounded-4xl sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-berry/20 blur-3xl"
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-amber-100 uppercase sm:text-[11px]">
              {lab.badge || "Pure craft"}
            </span>
            <h2 className="mt-2.5 font-blogh text-2xl font-bold tracking-wide uppercase sm:text-4xl">
              {lab.title || "The artisan bakery laboratory"}
            </h2>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
              {lab.description ||
                "No shortcuts, zero chemical improvers. Just wild fermentation, stone-ground flour, and real French butter."}
            </p>

            <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              {FIGURES.map(({ icon: Icon, value, suffix, label, sub }) => (
                <li
                  key={label}
                  className="rounded-2xl border border-white/12 bg-white/6 p-2.5 backdrop-blur-sm sm:p-3.5"
                >
                  <Icon className="size-4 text-amber-200" />
                  <p className="mt-1.5 font-blogh text-base leading-none font-bold tabular-nums sm:text-xl">
                    <CountUp to={value} />
                    {suffix}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-white/85 sm:text-[11px]">{label}</p>
                  <p className="text-[10px] text-white/50">{sub}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/8 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-emerald-200 uppercase">
                <Check className="size-3.5" /> Always
              </p>
              <ul className="mt-2.5 space-y-2">
                {WE_DO.map((line) => (
                  <li key={line} className="flex gap-2 text-[11px] leading-snug text-white/80">
                    <Check className="mt-0.5 size-3 shrink-0 text-emerald-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-rose-300/20 bg-rose-400/8 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-rose-200 uppercase">
                <X className="size-3.5" /> Never
              </p>
              <ul className="mt-2.5 space-y-2">
                {WE_DONT.map((line) => (
                  <li key={line} className="flex gap-2 text-[11px] leading-snug text-white/80">
                    <X className="mt-0.5 size-3 shrink-0 text-rose-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
