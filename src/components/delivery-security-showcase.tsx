import { useState, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Package,
  ThermometerSnowflake,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Ribbon,
  HeartHandshake,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/site-content";
import { TextAnimate } from "@/components/godui/text-animate";

export interface PackagingSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: string;
  image: string;
  desc: string;
  perks: string[];
}

export const PACKAGING_SLIDES: PackagingSlide[] = [
  {
    id: "insulated-brownie",
    title: "Partitioned Gourmet Brownie & Pastry Vault",
    subtitle: "Custom Multi-Compartment Shock Absorption",
    tag: "Multi-Grid Protection",
    badge: "Food-Grade Gold Board",
    image: "/packaging/insulated-brownie-box.jpg",
    desc: "Every artisan fudge brownie and delicate tea cake sits in its own dedicated snug compartment. Fitted with a thermal-reflective insulated interior and cold-pack pocket to ensure toppings and glazes stay immaculately pristine.",
    perks: [
      "Zero-movement partition walls",
      "Thermal reflective interior liner",
      "Cold-pack cooling pocket",
      "Food-grade gold-coated baseboard",
    ],
  },
  {
    id: "sealed-gift-box",
    title: "Luxury Gold-Foil Gift Box & Thermal Courier Bag",
    subtitle: "Double-Walled Rigid Carton with Silk Satin Ribbon",
    tag: "Cellar-Cool Transit",
    badge: "Wax Quality Seal",
    image: "/packaging/sealed-gift-delivery-box.jpg",
    desc: "Delivered in bespoke white-and-blush rigid packaging embossed with gold foil Ani Bakes branding. Tied with our signature satin berry ribbon and sealed with a certified head baker wax badge, housed within an insulated courier thermal tote.",
    perks: [
      "Heavyweight crush-proof rigid carton",
      "Signature satin berry ribbon wrap",
      "Tamper-evident head baker wax seal",
      "Dedicated insulated delivery bag",
    ],
  },
  {
    id: "safe-cake-unboxing",
    title: "100% Intact Multi-Tier Celebration Arrival",
    subtitle: "Dry-Ice Chill Pouch & Rigid Corner Buffers",
    tag: "Doorstep Freshness",
    badge: "Zero-Damage Guarantee",
    image: "/packaging/safe-cake-unboxing.jpg",
    desc: "From single-tier bento cakes to grand 3-tier celebration masterpieces, our engineered cake bases lock securely into the base of our insulated container. Buttercream flowers, mirror glazes, and 24K gold leaves arrive exactly as piped.",
    perks: [
      "Anti-tip lock-in-place baseboard",
      "Pondicherry heat & humidity shield",
      "Easy-lift slide-out side flaps",
      "100% Intact Arrival Guarantee",
    ],
  },
];

const SECURITY_PILLARS = [
  {
    icon: ThermometerSnowflake,
    title: "18°C Thermal Cold-Chain",
    desc: "Dual-wall insulated thermal box and eco-friendly cooling pouches defeat Pondicherry humidity, keeping buttercreams cellar-fresh.",
    color: "text-sky-600 bg-sky-500/10 border-sky-300/60",
  },
  {
    icon: Package,
    title: "Lock-In-Place Baseboard",
    desc: "Heavyweight food-grade gold baseboard and custom corner buffers prevent sliding, tipping, or icing damage during transit.",
    color: "text-amber-600 bg-amber-500/10 border-amber-300/60",
  },
  {
    icon: Ribbon,
    title: "Tamper-Evident Freshness Seal",
    desc: "Every order is inspected by our head baker and sealed with certified gold ribbon and tamper-evident quality seal.",
    color: "text-rose-600 bg-rose-500/10 border-rose-300/60",
  },
];

export function DeliverySecurityShowcase() {
  const { content: siteContent } = useSiteContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const active = PACKAGING_SLIDES[currentSlide]!;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PACKAGING_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + PACKAGING_SLIDES.length) % PACKAGING_SLIDES.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? null;
    if (touchEndX === null) return;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section className="py-12 sm:py-18 bg-secondary/15 border-y border-border/70 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute -left-20 top-1/4 size-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-berry/10 blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-3.5 py-1 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
            <ShieldCheck className="size-3.5 text-sky-600" />
            <span>{siteContent.about_delivery.badge || "Safe & Damage-Proof Courier Shield"}</span>
          </div>
          <TextAnimate
            as="h2"
            animation="blurInUp"
            by="word"
            className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight uppercase tracking-wide text-center"
          >
            {siteContent.about_delivery.title || "How we deliver your bakes 100% safe & intact"}
          </TextAnimate>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {siteContent.about_delivery.description || "Delicate croissants, moist multi-layer cakes, and artisanal brownie slabs require precision engineering to travel from our dawn hearth to your celebration table."}
          </p>
        </div>

        {/* 3 Security Standards Bento Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {SECURITY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]"
              >
                <div className="space-y-2.5">
                  <div className={`size-10 rounded-2xl flex items-center justify-center border ${pillar.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-blogh text-base sm:text-lg font-bold text-cocoa uppercase tracking-wide">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>Standard on every order</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Packaging Photography Carousel */}
        <div className="rounded-3xl sm:rounded-4xl border border-border/80 bg-card overflow-hidden shadow-lift">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left/Top: High-Res Photo Stage with Touch & Navigation Controls */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="lg:col-span-7 relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[440px] w-full overflow-hidden bg-secondary/40 group"
            >
              <img
                key={active.image}
                src={active.image}
                alt={active.title}
                className="size-full object-cover transition-all duration-700 select-none group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {/* Floating Badge */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1 text-[10px] sm:text-xs font-bold shadow-md">
                  <Sparkles className="size-3 text-amber-300" />
                  <span>{active.badge}</span>
                </span>
              </div>

              {/* Tag Pill */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 pointer-events-none">
                <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cocoa border border-border/60 shadow-2xs">
                  {active.tag}
                </span>
              </div>

              {/* Navigation Overlay Buttons */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous packaging step"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex size-8 sm:size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 hover:bg-black/70 transition-all cursor-pointer z-20"
              >
                <ChevronLeft className="size-4 sm:size-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next packaging step"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex size-8 sm:size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 hover:bg-black/70 transition-all cursor-pointer z-20"
              >
                <ChevronRight className="size-4 sm:size-5" />
              </button>

              {/* Bottom Image Caption */}
              <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none sm:hidden">
                <p className="font-blogh text-sm font-bold text-white uppercase tracking-wider truncate">
                  {active.title}
                </p>
              </div>
            </div>

            {/* Right/Bottom: Packaging Specifications & Guarantee */}
            <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-5 bg-card">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-berry">
                    Step 0{currentSlide + 1} of 0{PACKAGING_SLIDES.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {PACKAGING_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        aria-label={`Jump to ${slide.title}`}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentSlide === idx ? "w-6 bg-berry shadow-2xs" : "w-1.5 bg-border/80 hover:bg-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-blogh text-lg sm:text-2xl font-bold text-cocoa leading-tight uppercase tracking-wide">
                  {active.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {active.desc}
                </p>

                {/* 4 Checkmark Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {active.perks.map((perk) => (
                    <div
                      key={perk}
                      className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-2.5 border border-border/60 text-xs font-semibold text-cocoa"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-3.5 sm:p-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-400/40">
                  <HeartHandshake className="size-4 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-900 dark:text-amber-200">
                    100% Intact Arrival Guarantee
                  </p>
                  <p className="text-[10.5px] sm:text-xs text-muted-foreground leading-snug">
                    If anything shifts or gets damaged in transit, we will immediately re-bake and re-deliver free of cost.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default DeliverySecurityShowcase;
