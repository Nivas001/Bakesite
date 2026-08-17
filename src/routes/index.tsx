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
import { CategoryPeekCarousel } from "@/components/category-peek-carousel";
import { TextLoop } from "@/components/ui/text-loop";

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
          "Handcrafted small-batch bakery in Pondicherry. Fresh cakes, cookies, breads, and pastries baked the morning of your slot.",
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
      
      {/* Container 1: Hero Section */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 pt-2">
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
                  ✨ Small-Batch Daily Bake
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

      {/* Kinetic Flowing Bakery Text Ribbon */}
      <div className="w-full py-1 -my-6 sm:-my-10 overflow-hidden select-none pointer-events-auto">
        <TextLoop
          text="Ani Bakes ✦ Fresh Sunrise Dawn Bakes ✦ Wild Sourdough Ferment ✦ Zero Preservatives ✦ Small-Batch Studio"
          shape="wave"
          speed={48}
          direction="forward"
          separator="🥮"
          curviness={15}
          fontSize={26}
          fontWeight={800}
          fontFamily="var(--font-blogh), var(--font-body), sans-serif"
          letterSpacing={2}
          uppercase
          color="#3A1C14"
          ribbon
          ribbonColor="#FDF1E8"
          ribbonWidth={52}
          pauseOnHover={false}
          className="opacity-95"
        />
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

      {/* 7. Category Counter Showcase: Peek-Ahead Coverflow Carousel */}
      <CategoryPeekCarousel categories={data.categories} products={data.products} />

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