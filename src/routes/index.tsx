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
  Quote,
  Star,
  Truck,
  HelpCircle,
  ShieldCheck,
  Heart,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import heroImage from "@/assets/hero-bakery.jpg";
import aboutImage from "@/assets/about-baker.jpg";
import { getCatalog } from "@/lib/catalog.functions";
import { FeaturedProducts } from "@/components/featured-products";
import { Button } from "@/components/ui/button";
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

const CATEGORY_META: Record<
  string,
  { icon: typeof Croissant; desc: string; color: string; badge: string }
> = {
  breads: {
    icon: Croissant,
    desc: "Slow-fermented artisan sourdough & soft morning loaves",
    color: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badge: "Slow Ferment",
  },
  cakes: {
    icon: Sparkles,
    desc: "Celebration layer cakes & tea-time artisan sponge slices",
    color: "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badge: "Celebration",
  },
  pastries: {
    icon: Leaf,
    desc: "Laminated French butter croissants, danishes & cruffins",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badge: "Pure Butter",
  },
  cookies: {
    icon: Star,
    desc: "Crispy-edged, chewy-centred chunky artisan cookies",
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
      "We offer next-day slots across Morning (7:30–10:30 AM), Midday (11:00 AM–2:00 PM), Afternoon (2:30–5:30 PM), and Evening (6:00–8:00 PM). Because everything is baked strictly to order, we require one day of notice.",
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
      "Yes! Select 'Pickup' at checkout and choose your arrival slot. Your order will be freshly boxed and waiting for you at our counter (open Tue–Sun, 7:30 AM to 8:00 PM).",
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

  const testimonials = [
    {
      quote:
        "The pistachio loaf arrived still faintly warm. It genuinely tasted like someone baked it for us that morning — because they did.",
      name: "Ananya R.",
      detail: "Indiranagar",
      bakes: "Pistachio Loaf & Croissants",
      rating: 5,
    },
    {
      quote:
        "Picking a slot and getting a confirmation before paying made ordering our anniversary cake completely stress-free.",
      name: "Karthik M.",
      detail: "Koramangala",
      bakes: "Belgian Chocolate Cake",
      rating: 5,
    },
    {
      quote:
        "The map pin saved us. Our building entrance is tricky to find and the rider walked straight to our door on the first try.",
      name: "Fatima S.",
      detail: "Frazer Town",
      bakes: "Sourdough & Cookie Box",
      rating: 5,
    },
  ];

  const steps = [
    {
      icon: Clock,
      step: "01",
      title: "Pick Your Bakes & Slot",
      body: "Choose your treats and select a next-day morning, midday, afternoon, or evening window. We bake strictly to order.",
    },
    {
      icon: Sparkles,
      step: "02",
      title: "We Confirm & Bake at Dawn",
      body: "Our bakers lock in your order at 4:00 AM. You receive a confirmation and pay only when the bake is secured.",
    },
    {
      icon: Truck,
      step: "03",
      title: "Doorstep Delivery or Pickup",
      body: "Dispatched warm with precise GPS map guidance right to your door, or packaged ready at our neighbourhood counter.",
    },
  ];

  const faqCategories = ["All", "Freshness & Ingredients", "Slots & Ordering", "Delivery & Pickup", "Payment & Guarantee"];

  const filteredFaqs =
    selectedFaqCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === selectedFaqCategory);

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16 space-y-16 sm:space-y-24">
      {/* 1. Hero (Preserved) */}
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

      {/* 2. Daily Selection — Fresh from the counter (Moved First) */}
      <section className="section-shell section-shell-plain">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:justify-between mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-berry">
              Daily Selection
            </span>
            <h2 className="mt-1 font-display text-[1.65rem] font-bold leading-tight text-cocoa sm:text-4xl">
              Fresh from the counter
            </h2>
            <p className="mt-1.5 text-sm italic text-muted-foreground sm:text-base">
              Baked at dawn, boxed for your chosen slot.
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

      {/* 3. Enhanced Interactive Category Counter Showcase */}
      <section className="section-shell section-shell-tint rounded-[2.5rem] p-6 sm:p-10 border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-berry">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                The Bakery Counter
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                · Handcrafted every dawn from 4:00 AM
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-cocoa sm:text-4xl">
              Explore by bake category
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Choose from slow-fermented artisan sourdough, laminated French pastries, celebration cakes, and chunky cookies.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-2xl border-border bg-card/90 text-berry hover:bg-secondary/60 text-xs font-semibold h-10 px-5 shadow-2xs">
            <Link to="/shop">
              Browse all items <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-berry/50 hover:shadow-lift cursor-pointer"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${meta.color} opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-80`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-secondary/90 text-berry shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-berry group-hover:text-berry-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-secondary/80 px-3 py-1 text-[11px] font-bold text-cocoa/80 border border-border/40 shadow-2xs">
                      {productCount > 0 ? `${productCount} bakes` : meta.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-cocoa transition-colors group-hover:text-berry">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {meta.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-bold uppercase tracking-wider text-berry">
                  <span>Explore {category.name}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-berry group-hover:text-berry-foreground">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Counter Artisan Guarantee Footer Pill */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-berry/10 text-berry">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cocoa">Small-batch morning oven slots</p>
              <p className="text-[11px] text-muted-foreground">
                We bake strictly to order. Choose your slot date and time window during checkout.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-berry hover:text-berry/80 text-xs font-bold shrink-0">
            <Link to="/shop">
              See today&apos;s bakes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 5. The Sweet Crumb Artisan Difference (Bento Grid) */}
      <section className="section-shell section-shell-tint">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-berry">
            Why Sweet Crumb
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-cocoa sm:text-4xl">
            The small-batch difference you can taste
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We bake strictly to order every morning. No commercial shortcuts, no warehouse storage.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: 4 AM Dawn Baking (Wide on LG) */}
          <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-7 shadow-soft transition-all duration-300 hover:shadow-lift lg:col-span-2">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-berry/15 blur-3xl"
            />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-berry text-berry-foreground shadow-xs">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-cocoa sm:text-3xl">
                We start at 4:00 AM so your morning starts warm.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xl">
                Every loaf, croissant, and tea cake is shaped and baked the exact morning of your slot.
                We never store bakes overnight on a shelf, which is why everything arrives with crisp crusts
                and soft, fragrant crumbs.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cocoa">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Baked exclusively to order · Zero day-old stock</span>
            </div>
          </div>

          {/* Card 2: Pure Ingredients */}
          <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-7 shadow-soft transition-all duration-300 hover:shadow-lift">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-berry shadow-xs">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-cocoa">
                100% Honest Ingredients
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Unbleached heritage flour, pure dairy butter, fresh seasonal fruits, and wild sourdough starters.
                Zero artificial preservatives or emulsifiers.
              </p>
            </div>
            <div className="mt-6 border-t border-border/60 pt-4 text-xs font-semibold text-muted-foreground">
              Pure butter · No strange chemicals
            </div>
          </div>

          {/* Card 3: Photo Accent */}
          <div className="group relative overflow-hidden rounded-[2rem] min-h-[220px] shadow-soft">
            <img
              src={aboutImage}
              alt="Baker dusting flour on artisan sourdough loaves"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="font-display text-lg font-bold">Hand-shaped with care</p>
              <p className="text-xs text-white/80">Every single piece made with artisan passion</p>
            </div>
          </div>

          {/* Card 4: Pinpoint GPS Delivery */}
          <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-7 shadow-soft transition-all duration-300 hover:shadow-lift lg:col-span-2">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-berry shadow-xs">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-cocoa sm:text-2xl">
                Pin Your Doorstep on the Map
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Tricky building entrance or gated society? Our live interactive map pin lets you drop
                the exact marker for our delivery rider to find you on the very first try without confusion.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cocoa">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Direct delivery rider navigation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3-Step Morning Slot Ritual (How it works) */}
      <section className="section-shell section-shell-plain">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-berry">
            Simple Process
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-cocoa sm:text-4xl">
            How the morning ritual works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three calm steps between your craving and your warm breakfast table.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((item, index) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift border ${
                index === 1
                  ? "border-berry/40 bg-card shadow-soft"
                  : "border-border bg-card/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-berry/10 font-display text-lg font-extrabold text-berry">
                  {item.step}
                </span>
                <item.icon className="h-5 w-5 text-berry/70 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-cocoa">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Customer Love & Verified Neighbourhood Reviews */}
      <section className="section-shell section-shell-tint">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-berry">
            Neighbourhood Love
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-cocoa sm:text-4xl">
            Loved down the street
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Over 300+ orders baked and delivered across Bangalore neighbourhoods.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="glass-panel flex flex-col justify-between rounded-3xl p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-berry/40 mb-2" />
                <blockquote className="text-sm leading-relaxed text-cocoa/90">
                  “{t.quote}”
                </blockquote>
              </div>

              <figcaption className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-bold text-cocoa">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
                <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground">
                  Verified Order
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 8. Revamped FAQ Section (Fixed Single-Column Layout & Filter Tabs) */}
      <section className="section-shell section-shell-plain">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground backdrop-blur">
            <HelpCircle className="size-3.5 text-berry" /> Clear Answers
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-cocoa sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to know about freshness, morning slots, payment, and delivery.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {faqCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFaqCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedFaqCategory === cat
                  ? "bg-berry text-berry-foreground shadow-xs"
                  : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Unified Single-Column Accordion (Zero jumping height flaws) */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <AccordionItem
                key={`${selectedFaqCategory}-${i}`}
                value={`faq-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-card px-6 shadow-2xs transition-all hover:border-berry/30"
              >
                <AccordionTrigger className="py-5 text-left font-display text-base font-semibold text-cocoa hover:no-underline sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Need Help Helper Chip */}
          <div className="mt-8 rounded-2xl bg-secondary/40 p-4 text-center border border-border/50">
            <p className="text-xs text-muted-foreground">
              Have a special dietary requirement or celebration order?{" "}
              <Link to="/shop" className="font-semibold text-berry hover:underline">
                Explore custom options in the bakery
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 9. Warm Morning Closing CTA */}
      <section className="mb-4">
        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center sm:px-14 sm:py-16 shadow-lift">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-berry/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-secondary/60 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary-foreground mb-4">
              <Sparkles className="size-3.5 text-berry" /> Tomorrow Morning&apos;s Bakes
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight text-cocoa sm:text-5xl">
              Tomorrow morning could smell a lot better.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
              Reserve your next-day slot now. We mix and bake fresh at dawn, and you only pay once
              your delivery slot is confirmed.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-2xl bg-berry px-8 py-6 text-base font-semibold text-berry-foreground shadow-lift transition-transform duration-200 hover:scale-[1.03] hover:bg-berry/90 active:scale-95"
              >
                <Link to="/shop">
                  Start your bake box <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-2xl px-8 py-6 text-base font-semibold border-border bg-card/60 backdrop-blur hover:bg-secondary/60"
              >
                <Link to="/offers">View this week&apos;s offers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}