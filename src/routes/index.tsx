import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Croissant,
  Leaf,
  Star,
  Truck,
  HelpCircle,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Cake,
  Flame,
} from "lucide-react";
import heroImage from "@/assets/hero-bakery.jpg";
import { getCatalog } from "@/lib/catalog.functions";
import { FeaturedProducts } from "@/components/featured-products";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CakeStudioCarousel } from "@/components/cake-studio-carousel";
import { CakeBuilderWidget } from "@/components/cake-builder-widget";
import { BakerLaboratoryBento } from "@/components/baker-laboratory-bento";
import { PolaroidMomentsWall } from "@/components/polaroid-moments-wall";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ani Bakes Bakery — Fresh small-batch cakes & cookies" },
      {
        name: "description",
        content:
          "Order artisanal cakes, cookies and pastries from Ani Bakes. Pick a next-day slot, pay to secure, and enjoy fresh bakes.",
      },
      { property: "og:title", content: "Ani Bakes Bakery — Fresh small-batch cakes & cookies" },
      {
        property: "og:description",
        content: "Artisanal bakes made the morning of your slot. Delivery or pickup.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

const CATEGORY_META: Record<
  string,
  { icon: typeof Croissant; desc: string; color: string; badge: string }
> = {
  breads: {
    icon: Croissant,
    desc: "Slow-fermented artisan sourdough & morning loaves",
    color: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badge: "Slow Ferment",
  },
  cakes: {
    icon: Sparkles,
    desc: "Celebration layer cakes & tea-time sponge slices",
    color: "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badge: "Celebration",
  },
  pastries: {
    icon: Leaf,
    desc: "French butter croissants, danishes & cruffins",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badge: "Pure Butter",
  },
  cookies: {
    icon: Star,
    desc: "Crispy-edged, chewy-centred chunky cookies",
    color: "from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20",
    badge: "Small Batch",
  },
};

const FAQ_ITEMS = [
  {
    category: "Freshness & Ingredients",
    question: "How fresh are the bakes when they reach my door?",
    answer:
      "Every single item is mixed, proofed, and baked the same morning as your slot (starting at 4:00 AM). Nothing is prepared the day before, and we never keep unsold stock on shelves overnight.",
  },
  {
    category: "Slots & Ordering",
    question: "How do next-day delivery and pickup slots work?",
    answer:
      "We offer next-day slots across Morning (8:00–11:00 AM), Midday (11:00 AM–2:00 PM), Afternoon (2:00–5:00 PM), and Evening (5:00–8:00 PM). Small-batch baking requires at least 24 hours advance notice.",
  },
  {
    category: "Payment & Guarantee",
    question: "Why do I only pay after my order is approved?",
    answer:
      "We verify our morning oven capacity and ingredient inventory first so you never pay for something we cannot bake fresh. Once approved by our team, you receive a secure payment link.",
  },
  {
    category: "Delivery & Pickup",
    question: "Where do you deliver and how does the map pin work?",
    answer:
      "We deliver across central and suburban neighbourhoods. Dropping an exact map pin during checkout allows our delivery rider to reach your specific gate or apartment entrance on the very first try without calls.",
  },
  {
    category: "Delivery & Pickup",
    question: "Can I pick up my bakes directly from the bakery counter?",
    answer:
      "Yes! Select 'Pickup' at checkout and choose your arrival slot. Your order will be freshly boxed and waiting for you at our counter (open Tue–Sun, 8:00 AM to 8:00 PM).",
  },
  {
    category: "Slots & Ordering",
    question: "What if I need to reschedule or cancel my slot?",
    answer:
      "Reach out before our 4:00 AM baking cycle begins and we will gladly reschedule or cancel your order. Since each batch is baked strictly for you, same-day cancellations cannot be accommodated.",
  },
];

function Home() {
  const { data } = useSuspenseQuery(catalogQuery);
  const featured = data.products.slice(0, 6);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");

  const faqCategories = ["All", "Freshness & Ingredients", "Slots & Ordering", "Delivery & Pickup", "Payment & Guarantee"];

  const filteredFaqs =
    selectedFaqCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === selectedFaqCategory);

  return (
    <div className="w-full space-y-12 sm:space-y-20 overflow-x-clip">
      
      {/* Container 1: Hero & Live Ambient Telemetry */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 space-y-4 pt-2">
        
        {/* Live Ambient Kitchen Telemetry Bar (Inspired by Haoqi) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-secondary/40 border border-border/80 px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-cocoa">📍 Pondicherry Kitchen</span>
            <span className="text-border">·</span>
            <span className="text-muted-foreground hidden xs:inline">4:00 AM Dawn Bake Ritual</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              🔥 Oven #2 Active (220°C)
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="hidden sm:inline font-bold text-emerald-600 dark:text-emerald-400">
              📦 Next Slot: Tomorrow Morning
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-secondary via-accent to-berry/30 opacity-25 blur-3xl sm:-inset-6 sm:rounded-[3.5rem]"
          />
          <div className="glass-panel relative grid overflow-hidden rounded-2xl shadow-lift sm:rounded-[2.25rem] md:grid-cols-2">
            <div className="flex flex-col justify-center gap-3.5 p-5 sm:gap-6 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/90 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground backdrop-blur">
                  <Sparkles className="size-3 text-berry" /> Baked to order
                </span>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
                  🧈 100% French Butter
                </span>
              </div>

              <h1 className="font-nimbus text-3xl font-bold leading-[1.18] text-cocoa sm:text-5xl lg:text-6xl tracking-tight">
                Slow bakes, warm mornings, and a slot that{" "}
                <span className="italic text-berry font-serif">suits you.</span>
              </h1>
              <p className="max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Everything at Ani Bakes is handcrafted in small batches the morning of your delivery. Choose
                your bakes, pick a slot, and our head baker prepares your order fresh.
              </p>
              <div className="flex flex-col xs:flex-row gap-2.5 pt-1 sm:gap-3">
                <Button
                  asChild
                  size="default"
                  className="w-full xs:w-auto rounded-xl sm:rounded-2xl bg-berry px-5 sm:px-7 text-xs sm:text-sm font-semibold text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.02] hover:bg-berry/90 active:scale-95"
                >
                  <Link to="/shop">
                    Browse bakery <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="w-full xs:w-auto rounded-xl sm:rounded-2xl border-border bg-card/60 px-5 sm:px-7 text-xs sm:text-sm font-semibold backdrop-blur transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Link to="/offers">See offers</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-44 sm:h-64 md:h-full min-h-[180px] md:min-h-[420px]">
              <img
                src={heroImage}
                alt="Freshly baked breads and pastries on a wooden bakery counter"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-background/20"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 2. Daily Selection — Fresh from the counter */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
        <section className="section-shell section-shell-plain">
          <div className="flex items-end justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-berry">
                Daily Selection
              </span>
              <h2 className="mt-0.5 font-nimbus text-2xl sm:text-4xl font-bold leading-tight text-cocoa">
                Fresh from the counter
              </h2>
              <p className="text-xs sm:text-sm italic text-muted-foreground">
                Baked at dawn, boxed for your chosen slot.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 sm:mr-24">
              <Link
                to="/shop"
                className="story-link text-xs font-semibold uppercase tracking-wider text-berry hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
          <FeaturedProducts products={featured} />
        </section>
      </div>

      {/* 3. The Celebration Cake Studio (25% Story / 70% Carousel Showcase) */}
      <CakeStudioCarousel />

      {/* 4. Interactive Cake Customizer Simulator */}
      <CakeBuilderWidget />

      {/* 5. The Baker's Laboratory Bento Grid */}
      <BakerLaboratoryBento />

      {/* 6. Polaroid Moments Wall (Real Celebrations) */}
      <PolaroidMomentsWall />

      {/* 7. Category Counter Showcase: 2x2 grid on mobile, 4 columns on desktop */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
        <section className="section-shell section-shell-tint rounded-2xl sm:rounded-[2.25rem] p-4 sm:p-8 border border-border/80 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-berry/10 border border-berry/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-berry">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  The Bakery Counter
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                  · Handcrafted every dawn from 4:00 AM
                </span>
              </div>
              <h2 className="font-nimbus text-2xl sm:text-4xl font-bold text-cocoa">
                Explore by bake category
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="w-fit rounded-xl border-border bg-card/90 text-berry hover:bg-secondary/60 text-xs font-semibold h-8 px-3.5 shadow-2xs">
              <Link to="/shop">
                Browse all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {/* 2x2 Grid on Mobile, 4 Cols on Desktop */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {data.categories.slice(0, 4).map((category) => {
              const meta = CATEGORY_META[category.slug] ?? {
                icon: Croissant,
                desc: category.description ?? "Freshly crafted daily bakes",
                color: "from-secondary/40 to-secondary/10 text-berry border-border",
                badge: "Artisan",
              };
              const Icon = meta.icon;
              const productCount = data.products.filter(
                (p) => p.category_id === category.id,
              ).length;

              return (
                <Link
                  key={category.id}
                  to="/shop"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-3 sm:p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-berry/50 hover:shadow-lift cursor-pointer"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${meta.color} opacity-35 blur-xl transition-opacity duration-300 group-hover:opacity-75`}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-secondary/90 text-berry shadow-2xs transition-transform duration-300 group-hover:scale-105 group-hover:bg-berry group-hover:text-berry-foreground">
                        <Icon className="size-4 sm:size-5" />
                      </div>
                      <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] sm:text-[11px] font-bold text-cocoa/80 border border-border/40">
                        {productCount > 0 ? `${productCount} bakes` : meta.badge}
                      </span>
                    </div>

                    <h3 className="mt-3 sm:mt-4 font-recurso text-base sm:text-xl font-bold text-cocoa transition-colors group-hover:text-berry leading-tight tracking-wide">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2 hidden xs:block">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-5 flex items-center justify-between border-t border-border/60 pt-2.5 sm:pt-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-berry">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* 8. Frequently Asked Questions with Swipeable Filter Pills */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
        <section className="section-shell section-shell-plain">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground backdrop-blur">
              <HelpCircle className="size-3 text-berry" /> Clear Answers
            </span>
            <h2 className="mt-2 font-display text-xl sm:text-3xl font-bold text-cocoa">
              Frequently asked questions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about freshness, morning slots, and delivery.
            </p>
          </div>

          {/* Swipeable Filter Pills on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {faqCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFaqCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedFaqCategory === cat
                    ? "bg-berry text-berry-foreground shadow-xs"
                    : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Single-Column Accordion */}
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-2.5">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem
                  key={`${selectedFaqCategory}-${i}`}
                  value={`faq-${i}`}
                  className="overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card px-4 py-1 sm:px-6 shadow-2xs transition-all hover:border-berry/30"
                >
                  <AccordionTrigger className="py-3.5 text-left font-sans text-sm font-semibold text-cocoa hover:no-underline sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>

      {/* 9. Closing Call-To-Action Banner */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 pb-4">
        <section className="mb-2">
          <div className="glass-panel relative overflow-hidden rounded-2xl sm:rounded-[2.25rem] px-5 py-10 text-center sm:px-12 sm:py-14 shadow-lift">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-berry/15 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 size-60 rounded-full bg-secondary/50 blur-2xl"
            />

            <div className="relative mx-auto max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground mb-3">
                <Sparkles className="size-3 text-berry" /> Fresh Mornings
              </span>
              <h2 className="font-display text-xl sm:text-4xl font-bold leading-tight text-cocoa">
                Tomorrow morning could smell a lot better.
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Reserve your next-day slot now. We mix and bake fresh at dawn for your chosen arrival window.
              </p>
              <div className="mt-6 flex flex-col xs:flex-row items-center justify-center gap-2.5 sm:gap-3">
                <Button
                  asChild
                  size="default"
                  className="w-full xs:w-auto rounded-xl sm:rounded-2xl bg-berry px-6 py-5 text-xs sm:text-sm font-semibold text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.02] hover:bg-berry/90 active:scale-95 cursor-pointer"
                >
                  <Link to="/shop">
                    Start your bake box <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="w-full xs:w-auto rounded-xl sm:rounded-2xl px-6 py-5 text-xs sm:text-sm font-semibold border-border bg-card/60 backdrop-blur hover:bg-secondary/60 cursor-pointer"
                >
                  <Link to="/offers">View offers</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}