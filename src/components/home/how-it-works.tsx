import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, CreditCard, ShoppingBasket, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    id: "basket",
    icon: ShoppingBasket,
    kicker: "Step 1",
    title: "Fill your box",
    short: "Pick bakes and a slot",
    detail:
      "Add whatever you like to the cart, then choose a next-day arrival window: morning, midday, afternoon or evening. Small-batch baking needs about 24 hours of notice, so today's orders come out of tomorrow's oven.",
    footnote: "Delivery or counter pickup — your choice at checkout.",
  },
  {
    id: "approve",
    icon: CalendarClock,
    kicker: "Step 2",
    title: "We check the oven",
    short: "A baker confirms the slot",
    detail:
      "Every request goes to the head baker, who checks that the morning has oven space and that the ingredients are in. You are not charged while this happens — if we cannot bake it fresh, we say so instead of taking your money.",
    footnote: "Usually confirmed the same day.",
  },
  {
    id: "pay",
    icon: CreditCard,
    kicker: "Step 3",
    title: "Then you pay",
    short: "Secure link, only once approved",
    detail:
      "Once your slot is approved you get a secure payment link. Paying locks the slot in, and the dough goes into the cold retarder that night to ferment for the morning bake.",
    footnote: "Cards, UPI and netbanking accepted.",
  },
  {
    id: "deliver",
    icon: Truck,
    kicker: "Step 4",
    title: "Baked at dawn, then out",
    short: "4 AM oven, then your door",
    detail:
      "Ovens start at 4:00 AM. Your order is boxed while still warm, braced for the ride, and handed to the rider in time for the window you picked. You can follow every stage of this on your orders page.",
    footnote: "Track it live under Orders.",
  },
] as const;

/**
 * Explains the one thing about this bakery that surprises people: they are not
 * charged at checkout. Making the approve-then-pay order explicit here heads off
 * the "why hasn't my card been charged?" support message.
 */
export function HowItWorks() {
  const [openId, setOpenId] = useState<string>(STEPS[0].id);
  const active = STEPS.find((step) => step.id === openId) ?? STEPS[0];
  const ActiveIcon = active.icon;

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-5 shadow-soft backdrop-blur-sm sm:rounded-4xl sm:p-8 lg:p-10">
        <header className="mb-6 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-cocoa uppercase sm:text-[11px]">
            How ordering works
          </span>
          <h2 className="mt-2.5 font-blogh text-2xl font-bold tracking-wide text-cocoa uppercase sm:text-4xl">
            Four steps, and no charge until we say yes
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Tap a step to see exactly what happens on our side.
          </p>
        </header>

        <ol className="grid gap-2.5 sm:gap-3 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const open = openId === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(step.id)}
                  aria-expanded={open}
                  className={`flex h-full w-full cursor-pointer flex-col items-start gap-2 rounded-3xl border p-4 text-left transition-all duration-300 ${
                    open
                      ? "border-berry/45 bg-linear-to-br from-berry/12 to-card shadow-soft"
                      : "border-border/70 bg-card/80 hover:border-berry/30 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={`flex size-9 items-center justify-center rounded-2xl transition-colors ${
                        open ? "bg-berry text-berry-foreground" : "bg-secondary text-cocoa"
                      }`}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <span className="font-blogh text-2xl leading-none font-bold text-cocoa/15 tabular-nums">
                      0{index + 1}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-berry-deep uppercase">
                      {step.kicker}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-cocoa">{step.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {step.short}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        {/* One shared detail panel rather than an accordion inside each card:
            expanding in place stretched the whole four-column row and left three
            cards two thirds empty. */}
        <div
          key={active.id}
          className="animate-scale-in mt-3 flex flex-col gap-2 rounded-3xl border border-berry/30 bg-linear-to-br from-berry/10 to-card p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-berry text-berry-foreground shadow-soft">
            <ActiveIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-cocoa">
              {active.kicker} · {active.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-cocoa/80 dark:text-muted-foreground">
              {active.detail}
            </p>
            <p className="mt-1.5 text-[11px] font-bold text-berry-deep">{active.footnote}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Link
            to="/shop"
            className="group inline-flex h-10 items-center gap-1.5 rounded-2xl bg-cocoa px-5 text-xs font-bold text-background shadow-soft transition-transform hover:scale-[1.02] active:scale-95 sm:text-sm"
          >
            <span>Start an order</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/orders"
            className="inline-flex h-10 items-center rounded-2xl border border-border/80 bg-card/80 px-5 text-xs font-bold text-cocoa transition-colors hover:bg-secondary/60 sm:text-sm"
          >
            Track an existing order
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
