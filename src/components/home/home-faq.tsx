import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Accordion } from "@/components/godui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { useSiteContent } from "@/lib/site-content";

const FAQ_ITEMS = [
  {
    category: "Freshness",
    question: "How fresh are the bakes when they reach my door?",
    answer:
      "Every item is mixed, proofed and baked the same morning as your slot, starting at 4:00 AM. Nothing is prepared the day before, and unsold stock never sits on a shelf overnight.",
  },
  {
    category: "Ordering",
    question: "How do next-day delivery and pickup slots work?",
    answer:
      "Slots run Morning (8–11 AM), Midday (11 AM–2 PM), Afternoon (2–5 PM) and Evening (5–8 PM), always for the next day. Small-batch baking needs at least 24 hours of notice.",
  },
  {
    category: "Payment",
    question: "Why do I only pay after my order is approved?",
    answer:
      "We check the morning's oven capacity and ingredients first, so you never pay for something we cannot bake fresh. Once the head baker approves the slot you get a secure payment link.",
  },
  {
    category: "Delivery",
    question: "Where do you deliver, and how does the map pin work?",
    answer:
      "We cover central and suburban Pondicherry. Dropping an exact pin at checkout lets the rider reach your gate or apartment entrance first time, without a round of phone calls.",
  },
  {
    category: "Delivery",
    question: "Can I collect my order from the bakery instead?",
    answer:
      "Yes — choose Pickup at checkout and pick an arrival slot. Your order will be boxed and waiting at the counter, open Tue–Sun, 8:00 AM to 8:00 PM.",
  },
  {
    category: "Ordering",
    question: "What if I need to reschedule or cancel?",
    answer:
      "Tell us before the 4:00 AM baking cycle and we will reschedule or cancel happily. Once a batch is in the oven it was mixed for you alone, so same-day cancellations are not possible.",
  },
  {
    category: "Cakes",
    question: "Can I order a custom celebration cake?",
    answer:
      "Yes. Use the cake designer on this page to choose size, sponge, finish and add-ons, or send us a reference photo through Help & Support and we will quote it.",
  },
  {
    category: "Cakes",
    question: "Do you make eggless cakes?",
    answer:
      "Most of the celebration range can be baked eggless for a small surcharge — pick the eggless option in the cake designer, or add a note to your order.",
  },
] as const;

const CATEGORIES = ["All", "Freshness", "Ordering", "Payment", "Delivery", "Cakes"] as const;

export function HomeFaq() {
  const { content } = useSiteContent();
  const faq = content.home_faq;
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered =
    selected === "All" ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === selected);

  return (
    <Reveal variant="rise" className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-[#FFF9F3] via-[#FFF5EC] to-[#FFEEE0] p-5 shadow-soft sm:rounded-4xl sm:p-8 lg:p-10 dark:from-[#1A1008] dark:via-[#130B06] dark:to-[#1B0F09]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-berry/10 blur-3xl"
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-cocoa uppercase shadow-2xs backdrop-blur sm:text-[11px]">
              <HelpCircle className="size-3 text-berry-deep" /> {faq.badge || "Clear answers"}
            </span>
            <h2 className="mt-2.5 font-blogh text-2xl font-bold tracking-wide text-cocoa uppercase sm:text-4xl">
              {faq.title || "Frequently asked questions"}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-cocoa/75 sm:text-sm dark:text-muted-foreground">
              {faq.description ||
                "Everything you need to know about freshness, morning slots, and delivery."}
            </p>

            <div className="mt-4 rounded-3xl border border-border/70 bg-card/85 p-4 shadow-2xs backdrop-blur">
              <p className="flex items-center gap-1.5 text-xs font-bold text-cocoa">
                <MessageCircle className="size-3.5 text-berry-deep" />
                Still not sure?
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Ask us anything about an order, an allergy or a custom cake — a real person answers.
              </p>
              <Link
                to="/orders"
                className="mt-2.5 inline-flex h-9 items-center rounded-xl bg-cocoa px-3.5 text-[11px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-95"
              >
                Open Help &amp; Support
              </Link>
            </div>
          </div>

          <div>
            <div className="no-scrollbar -mx-4 mb-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1.5 sm:mx-0 sm:flex-wrap sm:px-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelected(category)}
                  aria-pressed={selected === category}
                  className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selected === category
                      ? "bg-berry text-berry-foreground shadow-xs"
                      : "border border-border/70 bg-card/90 text-cocoa hover:bg-card"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border/70 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground">
                Nothing here yet — pick another topic, or ask us directly.
              </p>
            ) : (
              <Accordion
                type="single"
                collapsible
                animation="spring"
                items={filtered.map((item, index) => ({
                  value: `faq-${selected}-${index}`,
                  title: item.question,
                  content: item.answer,
                }))}
                className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/95 shadow-soft backdrop-blur-md sm:rounded-3xl"
              />
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
