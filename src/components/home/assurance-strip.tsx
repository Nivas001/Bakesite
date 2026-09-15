import { Sunrise, ShieldCheck, MapPin, Wallet } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/**
 * The four things a first-time visitor needs to know before anything else:
 * when we bake, when we charge, where we go, and what happens if it goes wrong.
 *
 * Deliberately placed directly under the hero and kept to one line each — the
 * page has plenty of room further down for the story.
 */
const PROMISES = [
  {
    icon: Sunrise,
    title: "Baked at 4 AM",
    line: "Nothing is made the day before. Ever.",
  },
  {
    icon: Wallet,
    title: "Pay after approval",
    line: "We confirm oven space first, then send a link.",
  },
  {
    icon: MapPin,
    title: "Pondicherry delivery",
    line: "Drop a map pin — the rider finds your gate.",
  },
  {
    icon: ShieldCheck,
    title: "Arrives intact",
    line: "Chilled, boxed and braced for the ride.",
  },
] as const;

export function AssuranceStrip() {
  return (
    <Reveal variant="fade-up" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {PROMISES.map(({ icon: Icon, title, line }) => (
          <li
            key={title}
            className="group flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-2xs backdrop-blur-sm transition-colors hover:border-berry/40 sm:gap-3 sm:rounded-3xl sm:p-4"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-berry/12 text-berry-deep transition-transform duration-300 group-hover:scale-105 sm:size-9 sm:rounded-2xl">
              <Icon className="size-4 sm:size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-cocoa sm:text-sm">{title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                {line}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
