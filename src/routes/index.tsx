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
import { Accordion } from "@/components/godui/accordion";
import { CakeStudioCarousel } from "@/components/cake-studio-carousel";
import { CakeBuilderWidget } from "@/components/cake-builder-widget";
import { BakerLaboratoryBento } from "@/components/baker-laboratory-bento";
import { PolaroidMomentsWall } from "@/components/polaroid-moments-wall";
import { CategoryPeekCarousel } from "@/components/category-peek-carousel";
import { HeroRevampSection } from "@/components/hero-revamp-section";

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

import { useSiteContent } from "@/lib/site-content";

function Home() {
  const { data } = useSuspenseQuery(catalogQuery);
  const featured = data.products.slice(0, 6);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
  const { content: siteContent } = useSiteContent();

  const faqCategories = ["All", "Freshness & Ingredients", "Slots & Ordering", "Delivery & Pickup", "Payment & Guarantee"];

  const filteredFaqs =
    selectedFaqCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === selectedFaqCategory);

  return (
    <div className="w-full overflow-x-clip">
      
      {/* 1. Full-Width 3D Confectionery Hero Section (Includes Seamless Integrated TextLoop) */}
      <HeroRevampSection />

      {/* Main Content Sections with Standard Spacing */}
      <div className="w-full space-y-12 sm:space-y-20 pt-4 sm:pt-8">
        {/* 2. Daily Selection — Fresh from the counter (Enhanced Warm Contrast Background) */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
          <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-[#2C1810]/15 dark:border-white/10 bg-gradient-to-b from-[#FFF9F2] via-[#FFF3E7] to-[#FFF8F0] dark:from-[#1E110A] dark:via-[#160D07] dark:to-[#1C1009] p-5 sm:p-8 lg:p-10 shadow-[0_12px_36px_rgba(44,24,16,0.08)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-amber-500/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-berry/10 blur-3xl"
            />

            <div className="relative z-10">
              <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-berry shadow-2xs mb-1.5">
                    ✨ Daily Selection
                  </span>
                  <h2 className="mt-0.5 font-nimbus text-2xl sm:text-4xl font-bold leading-tight text-cocoa">
                    Fresh from the counter
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-cocoa/70 dark:text-muted-foreground mt-0.5">
                    Baked at dawn, boxed for your chosen slot.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to="/shop"
                    className="rounded-xl bg-card/80 hover:bg-card border border-border/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cocoa hover:text-berry transition-all flex items-center gap-1.5 shadow-2xs group"
                  >
                    <span>View all</span>
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
              <FeaturedProducts products={featured} />
            </div>
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

        {/* 8. Frequently Asked Questions (Enhanced Elevated Background) */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10">
          <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-[#2C1810]/15 dark:border-border/80 bg-gradient-to-br from-[#FFF9F3] via-[#FFF5EC] to-[#FFEEE0] dark:from-[#1A1008] dark:via-[#130B06] dark:to-[#1B0F09] p-6 sm:p-10 lg:p-12 shadow-[0_12px_40px_rgba(44,24,16,0.07)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-berry/10 blur-3xl"
            />

            <div className="relative z-10">
              <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 border border-border/80 px-3.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-cocoa shadow-2xs backdrop-blur">
                  <HelpCircle className="size-3 text-berry" /> {siteContent.home_faq.badge || "Clear Answers"}
                </span>
                <h2 className="mt-2.5 font-display text-2xl sm:text-4xl font-bold text-cocoa">
                  {siteContent.home_faq.title || "Frequently asked questions"}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-cocoa/75 dark:text-muted-foreground leading-relaxed">
                  {siteContent.home_faq.description || "Everything you need to know about freshness, morning slots, and delivery."}
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
                        : "bg-card/90 text-cocoa border border-border/60 hover:bg-card"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Single-Column GodUI Spring Accordion */}
              <div className="mx-auto max-w-3xl">
                <Accordion
                  type="single"
                  collapsible
                  animation="spring"
                  items={filteredFaqs.map((faq, i) => ({
                    value: `faq-${selectedFaqCategory}-${i}`,
                    title: faq.question,
                    content: faq.answer,
                  }))}
                  className="rounded-2xl sm:rounded-3xl border-2 border-[#2C1810]/15 dark:border-border/80 bg-card/95 shadow-soft backdrop-blur-md divide-y divide-border/60"
                />
              </div>
            </div>
          </section>
        </div>

        {/* 9. Closing Call-To-Action Banner */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 pb-6">
          <section className="mb-2">
            <div className="glass-panel relative overflow-hidden rounded-3xl sm:rounded-4xl border border-border/80 bg-gradient-to-br from-card via-[#FFF9F4] to-secondary/40 px-5 py-9 text-center sm:px-12 sm:py-14 shadow-lift">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-berry/15 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 size-60 rounded-full bg-amber-500/15 blur-3xl"
              />

              <div className="relative mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-berry mb-3 shadow-2xs">
                  <Sparkles className="size-3 text-berry" /> {siteContent.home_cta.badge || "Fresh Mornings"}
                </span>
                <h2 className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-cocoa uppercase tracking-wide">
                  {siteContent.home_cta.title || "Tomorrow morning could smell a lot better."}
                </h2>
                <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                  {siteContent.home_cta.description || "Reserve your next-day slot now. We mix and bake fresh at dawn for your chosen arrival window."}
                </p>

                {/* Micro Perks Pills */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-cocoa border border-border/60 shadow-2xs">
                    🥐 4:00 AM Dawn Oven
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-cocoa border border-border/60 shadow-2xs">
                    🛵 Pondicherry Doorstep
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-cocoa border border-border/60 shadow-2xs">
                    🧈 100% French Butter
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                  <Button
                    asChild
                    size="default"
                    className="w-full sm:w-auto rounded-2xl bg-[#2C1810] text-white hover:bg-[#3D2217] px-6 py-5 text-xs sm:text-sm font-bold shadow-lift transition-transform duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Link to="/shop">
                      <span>Start your bake box</span>
                      <ArrowRight className="ml-1.5 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="default"
                    variant="outline"
                    className="w-full sm:w-auto rounded-2xl px-6 py-5 text-xs sm:text-sm font-bold border-border/80 bg-card/80 text-cocoa backdrop-blur hover:bg-secondary/60 cursor-pointer shadow-2xs"
                  >
                    <Link to="/offers">View offers</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}