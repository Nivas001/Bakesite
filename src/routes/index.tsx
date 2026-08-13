import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Croissant,
  Leaf,
  Quote,
  Star,
  Truck,
  HelpCircle,
} from "lucide-react";
import heroImage from "@/assets/hero-bakery.jpg";
import aboutImage from "@/assets/about-baker.jpg";
import { getCatalog } from "@/lib/catalog.functions";
import { FeaturedProducts } from "@/components/featured-products";
import { BentoCard } from "@/components/bento-card";
import { Button } from "@/components/ui/button";
import { finalPrice, hasDiscount } from "@/lib/pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sweet Crumb Bakery — Fresh small-batch cakes & cookies" },
      {
        name: "description",
        content:
          "Order artisanal cakes, cookies and pastries from Sweet Crumb. Pick a next-day slot, we confirm, then you pay.",
      },
      { property: "og:title", content: "Sweet Crumb Bakery — Fresh small-batch cakes & cookies" },
      {
        property: "og:description",
        content: "Artisanal bakes made the morning of your slot. Delivery or pickup.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(catalogQuery);
  const featured = data.products.slice(0, 6);
  const offers = data.products.filter((p) => hasDiscount(p.discount_type, p.discount_value));

  const stats = [
    { icon: Croissant, value: "Small batch", label: "Baked the morning of your slot" },
    { icon: Leaf, value: "No preservatives", label: "Butter, flour, fruit — nothing odd" },
    { icon: Truck, value: "Next-day slots", label: "Delivery or counter pickup" },
    { icon: Star, value: "4.9 / 5", label: "From 300+ neighbourhood orders" },
  ];

  const testimonials = [
    {
      quote:
        "The pistachio loaf arrived still faintly warm. It genuinely tasted like someone baked it for us that morning — because they did.",
      name: "Ananya R.",
      detail: "Indiranagar",
    },
    {
      quote:
        "Picking a slot and getting a confirmation before paying made ordering a birthday cake completely stress-free.",
      name: "Karthik M.",
      detail: "Koramangala",
    },
    {
      quote:
        "The map pin saved us. Our building is impossible to find and the rider walked straight to the door.",
      name: "Fatima S.",
      detail: "Frazer Town",
    },
  ];

  const steps = [
    {
      icon: Clock,
      step: "01",
      title: "Next-day slots",
      body: "Reserve a morning, midday, afternoon or evening window. We bake strictly to order, so nothing sits on a shelf.",
    },
    {
      icon: MapPin,
      step: "02",
      title: "Pin your door",
      body: "Drop a map marker with your exact entrance so our rider finds you on the very first try.",
    },
    {
      icon: Sparkles,
      step: "03",
      title: "Approve then pay",
      body: "We confirm your slot before any money moves. You only pay once the bake is locked in.",
    },
  ];

  const faqs = [
    {
      question: "How fresh is everything when it reaches me?",
      answer:
        "Every item is baked the same morning as your slot. Nothing is made the night before, and anything unsold is donated rather than stored.",
    },
    {
      question: "Can I choose a delivery time?",
      answer:
        "Yes. We offer next-day slots across morning, midday, afternoon and evening windows. Pick what works for you at checkout.",
    },
    {
      question: "Why do I only pay after approval?",
      answer:
        "We confirm your slot and inventory first so you never pay for something we cannot bake fresh. Once approved, you receive a secure payment link.",
    },
    {
      question: "Do you deliver across Bangalore?",
      answer:
        "We currently serve central Bangalore neighbourhoods. Drop a map pin during checkout so our rider can reach your exact entrance.",
    },
    {
      question: "Can I pick up from the bakery counter?",
      answer:
        "Absolutely. Select counter pickup at checkout and choose a time that suits you. The counter is open Tue – Sun, 7:30am to 8pm.",
    },
    {
      question: "What if I need to cancel or change my slot?",
      answer:
        "Reach out before your slot window begins and we will move or cancel it. Since each bake is made to order, last-minute changes may not always be possible.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-[3rem] bg-gradient-to-tr from-secondary via-accent to-berry/40 opacity-30 blur-3xl sm:-inset-6 sm:rounded-[3.5rem]"
        />
        <div className="glass-panel relative grid overflow-hidden rounded-[1.75rem] shadow-lift sm:rounded-[2.5rem] md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 p-6 sm:gap-6 sm:p-12 lg:p-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground backdrop-blur">
              <Sparkles className="size-3.5" /> Baked to order
            </span>
            <h1 className="font-display text-[2rem] font-bold leading-[1.1] text-cocoa sm:text-5xl lg:text-6xl">
              Slow bakes, warm mornings, and a slot that{" "}
              <span className="italic text-berry">suits you.</span>
            </h1>
            <p className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
              Everything at Sweet Crumb is made in small batches the morning of your delivery. Choose
              your bakes, pick a next-day slot, and we&apos;ll confirm before you ever pay.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="w-full rounded-2xl bg-berry px-7 text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95 sm:w-auto"
              >
                <Link to="/shop">
                  Browse the bakery <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-2xl border-white/60 bg-card/40 px-7 backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:w-auto"
              >
                <Link to="/offers">See this week&apos;s offers</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-56 sm:min-h-64 md:min-h-[520px]">
            <img
              src={heroImage}
              alt="Freshly baked breads and pastries on a wooden bakery counter"
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-l from-transparent to-background/25"
            />
          </div>
        </div>
      </section>

      {/* About — bento */}
      <section id="about" className="section-shell section-shell-tint mt-16 scroll-mt-24 sm:mt-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-berry">
              Our story
            </span>
            <h2 className="mt-2 font-display text-[1.65rem] font-bold leading-tight text-cocoa sm:text-4xl">
              A tiny bakery with stubborn habits
            </h2>
          </div>
          <Link
            to="/shop"
            className="story-link w-fit shrink-0 text-xs font-semibold uppercase tracking-widest text-berry sm:text-sm"
          >
            All bakes
          </Link>
        </div>

        <div className="mt-6 grid auto-rows-auto gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 md:auto-rows-[minmax(0,1fr)] md:grid-cols-3 lg:grid-cols-4">
          {/* Story tile */}
          <BentoCard
            className="md:col-span-2 md:row-span-2"
            expandedContent={
              <p className="text-sm leading-relaxed text-cocoa/80">
                Every flour sack is unbleached. Every fruit is seasonal. We ferment our doughs
                slowly and bake in small batches so nothing waits on a shelf.
              </p>
            }
          >
            <article className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[1.5rem] p-6 sm:rounded-[2rem] sm:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-berry/20 blur-3xl"
              />
              <div className="relative flex h-full flex-col">
                <h3 className="font-display text-xl font-bold leading-tight text-cocoa sm:text-3xl">
                  We start at 4am so your morning starts better.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Sweet Crumb began in a home kitchen with one oven, a hand-me-down mixer and a
                  neighbourhood that kept asking for one more loaf. We still bake in small batches,
                  still use real butter and slow ferments, and still refuse to keep anything on a
                  shelf overnight.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Every order is baked the morning of your slot — which is why we confirm your
                  timing before we ever take a rupee.
                </p>
                <div className="mt-auto flex flex-wrap gap-3 pt-6 sm:pt-8">
                  <Button
                    asChild
                    className="w-full rounded-2xl bg-berry px-6 text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95 sm:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link to="/shop">
                      Taste the difference <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </BentoCard>

          {/* Image tile */}
          <BentoCard
            className="md:row-span-2"
            expandedContent={
              <p className="text-sm leading-relaxed text-cocoa/80">
                Hand-shaped, never rushed. Our bakers shape every loaf and pastry by hand the
                same morning it reaches you.
              </p>
            }
          >
            <div className="glass-panel group relative flex h-full min-h-52 flex-col overflow-hidden rounded-[1.5rem] p-0 sm:min-h-56 sm:rounded-[2rem]">
              <img
                src={aboutImage}
                alt="Baker shaping dough on a floured marble counter"
                loading="lazy"
                width={1024}
                height={1024}
                className="h-full w-full flex-1 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cocoa/60 to-transparent"
              />
              <p className="absolute bottom-5 left-5 right-5 font-display text-lg font-bold text-background">
                Hand-shaped, never rushed.
              </p>
            </div>
          </BentoCard>

          {/* Stat tiles */}
          {stats.slice(0, 2).map((s) => (
            <BentoCard
              key={s.value}
              expandedContent={
                <p className="text-sm leading-relaxed text-cocoa/80">
                  {s.value === "Small batch"
                    ? "We bake only what is ordered for each slot. No bulk production, no overnight holding."
                    : "Butter, flour, fruit, sugar, eggs — and time. That's the full ingredient list."}
                </p>
              }
            >
              <div className="glass-soft flex h-full flex-col justify-between rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
                <s.icon className="size-5 text-berry" />
                <div className="mt-5 sm:mt-6">
                  <p className="font-display text-lg font-bold text-cocoa">{s.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </BentoCard>
          ))}

          {/* Category tiles */}
          {data.categories.slice(0, 4).map((category) => (
            <BentoCard key={category.id} expandable={false}>
              <Link
                to="/shop"
                className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-accent/50 blur-2xl"
                />
                <h3 className="relative font-display text-xl font-bold text-cocoa">
                  {category.name}
                </h3>
                <p className="relative mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {category.description ?? "Freshly baked, boxed for your slot."}
                </p>
                <span className="relative mt-auto inline-flex items-center gap-1 pt-5 text-xs font-semibold uppercase tracking-widest text-berry">
                  Explore
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </BentoCard>
          ))}

          {/* Hours tile */}
          <BentoCard
            expandedContent={
              <div className="space-y-1 text-sm text-cocoa/80">
                <p>Tue – Sun: 7:30am – 8:00pm</p>
                <p>Monday: Closed for prep & pastry trials</p>
              </div>
            }
          >
            <div className="glass-soft flex h-full flex-col justify-between rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
              <Clock className="size-5 text-berry" />
              <div className="mt-5 sm:mt-6">
                <p className="font-display text-lg font-bold text-cocoa">Counter hours</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Tue – Sun, 7:30am to 8pm. Closed Mondays for prep and pastry trials.
                </p>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Featured products */}
      <section className="section-shell section-shell-plain mt-10 sm:mt-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:justify-between">
          <div>
            <h2 className="font-display text-[1.65rem] font-bold leading-tight text-cocoa sm:text-4xl">
              Fresh from the counter
            </h2>
            <p className="mt-2 text-sm italic text-muted-foreground sm:text-base">
              Baked at dawn, boxed for your slot.
            </p>
          </div>
          <Link
            to="/shop"
            className="story-link w-fit shrink-0 text-xs font-semibold uppercase tracking-widest text-berry sm:mr-28 sm:text-sm"
          >
            View all
          </Link>
        </div>
        <FeaturedProducts products={featured} />
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-muted-foreground sm:hidden">
          Swipe to browse
        </p>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <div className="glass-panel relative overflow-hidden rounded-[1.75rem] px-6 py-10 sm:rounded-[2.5rem] sm:px-14 sm:py-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-berry/30 blur-3xl"
            />
            <div className="relative">
              <h2 className="font-display text-[1.65rem] font-bold leading-tight text-cocoa sm:text-4xl">
                On offer right now
              </h2>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                {offers.length} bake{offers.length > 1 ? "s" : ""} at a friendlier price, starting at ₹
                {Math.min(
                  ...offers.map((o) => finalPrice(o.price, o.discount_type, o.discount_value)),
                ).toFixed(0)}
                .
              </p>
              <Button
                asChild
                className="mt-6 w-full rounded-2xl bg-berry px-7 text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95 sm:mt-7 sm:w-auto"
              >
                <Link to="/offers">Shop offers</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How it works — moved below the counter */}
      <section className="section-shell section-shell-tint mt-10 sm:mt-12">
        <div className="text-center">
          <h2 className="font-display text-[1.65rem] font-bold text-cocoa sm:text-4xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Three calm steps between craving and doorstep.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          {steps.map((item, index) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lift sm:rounded-[2rem] sm:p-8 ${
                index === 1 ? "glass-panel md:scale-[1.04]" : "glass-soft"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card font-display text-lg font-bold text-berry shadow-soft">
                  {item.step}
                </span>
                <item.icon className="size-5 text-berry opacity-70 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold leading-tight text-cocoa sm:mt-6 sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-shell section-shell-plain mt-10 sm:mt-12">
        <div className="text-center">
          <h2 className="font-display text-[1.65rem] font-bold text-cocoa sm:text-4xl">
            Loved down the street
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            A few notes from people who order on repeat.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="glass-panel flex flex-col rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lift sm:rounded-[2rem] sm:p-7"
            >
              <Quote className="size-6 text-berry opacity-60" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cocoa/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border/60 pt-4">
                <p className="font-display text-base font-bold text-cocoa">{t.name}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t.detail}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-shell section-shell-tint mt-10 sm:mt-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground backdrop-blur">
            <HelpCircle className="size-3.5" /> Questions
          </span>
          <h2 className="mt-4 font-display text-[1.65rem] font-bold text-cocoa sm:text-4xl">
            Everything you need to know
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Freshness, slots, pickup and delivery — answered.
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2"
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass-panel overflow-hidden rounded-[1.5rem] border-0 px-5 py-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:rounded-[2rem] sm:px-7"
            >
              <AccordionTrigger className="py-5 text-left font-display text-base font-semibold text-cocoa hover:no-underline sm:py-6 sm:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Closing CTA */}
      <section className="mb-2 mt-10 sm:mb-4 sm:mt-12">
        <div className="glass-panel relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center sm:rounded-[2.5rem] sm:px-14 sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-secondary/60 blur-3xl"
          />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight text-cocoa sm:text-4xl">
              Tomorrow morning could smell a lot better.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Reserve a next-day slot now — we only take payment once the bakery confirms it.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 w-full rounded-2xl bg-berry px-8 text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95 sm:mt-8 sm:w-auto"
            >
              <Link to="/shop">
                Start your box <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}