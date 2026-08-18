import { useState, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CakeSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  story: string;
  tags: string[];
  serves: string;
  price: string;
  occasion: string;
  badge: string;
}

export const CAKE_SLIDES: CakeSlide[] = [
  {
    id: "pink-bento",
    title: '"Tummy the Main Character" Bento Cake',
    subtitle: "Pastel Pink Korean Bento Style",
    image: "/cakes/pink-bento-cake.jpg",
    story: "Single-tier mini celebration cake with signature fluffy vanilla sponge, layered with strawberry confit and silky whipped mascarpone.",
    tags: ["🍓 Strawberry Confit", "✨ Custom Lettering", "💕 4-Inch Bento", "🧈 French Buttercream"],
    serves: "2–3 Persons",
    price: "₹550",
    occasion: "Anniversaries & Besties",
    badge: "Most Loved Bento",
  },
  {
    id: "butterfly-lilac",
    title: '"Butterfly Dream" Lilac Swirl Cake',
    subtitle: "Edible Golden Butterfly & Pearl Swirl",
    image: "/cakes/butterfly-lilac-cake.jpg",
    story: "Two-tone lilac swirl with 3D edible gold & lilac flutter butterflies and glistening sugar pearls over a Madagascar vanilla crumb.",
    tags: ["🦋 3D Gold Butterflies", "🦪 Edible Pearl Beading", "💜 Lavender Vanilla", "🎂 5-Inch Tier"],
    serves: "4–6 Persons",
    price: "₹890",
    occasion: "Garden Birthdays & High-Teas",
    badge: "New Creation",
  },
  {
    id: "coral-heart",
    title: '"Golden Heart & Petal" Celebration Cake',
    subtitle: "Piped Buttercream Hearts & 24K Gold Heart",
    image: "/cakes/coral-heart-cake.jpg",
    story: "Peach-coral buttercream swirl adorned with hand-piped heart droplets, golden pearls, and an edible 24K gilded chocolate heart centerpiece.",
    tags: ["💛 24K Gold Heart", "💕 Buttercream Hearts", "🍓 Strawberry Crumb", "✨ Golden Spheres"],
    serves: "4–6 Persons",
    price: "₹850",
    occasion: "Valentine & Anniversaries",
    badge: "Signature Romance",
  },
  {
    id: "biscoff-herringbone",
    title: '"Biscoff Caramel Chevron" Feast Slab',
    subtitle: "Caramel Feathered Slab with Golden Topper",
    image: "/cakes/biscoff-herringbone-cake.jpg",
    story: "Multi-layered square feast slab with handcrafted caramel herringbone feathering, crunchy lotus crumb border, and golden acrylic topper.",
    tags: ["🍪 Biscoff Feathering", "👑 Acrylic Gold Topper", "🍯 Salted Caramel", "🎂 Square Slab"],
    serves: "8–12 Persons",
    price: "₹1,550",
    occasion: "Grand Milestone Birthdays",
    badge: "Celebration Feast",
  },
  {
    id: "lavender-pearl",
    title: "Lavender Dream Floral Ombré Cake",
    subtitle: "Artisan Edible Pearl & Floral Sculpture",
    image: "/cakes/lavender-pearl-cake.jpg",
    story: "Two-tone lilac ombré with hand-piped buttercream hydrangea blossoms and gleaming sugar pearls over a Madagascar vanilla bean crumb.",
    tags: ["🌸 Sugar Blossoms", "🦪 Edible Pearls", "🌿 Pure Vanilla", "🎂 6-Inch Tier"],
    serves: "6–8 Persons",
    price: "₹1,250",
    occasion: "Milestone Birthdays",
    badge: "Artisan Showpiece",
  },
  {
    id: "royal-gold",
    title: "Royal Golden Truffle Celebration Slab",
    subtitle: "Gilded Chocolate Spheres & Birthday Wreath",
    image: "/cakes/royal-gold-brownie.jpg",
    story: "Ultra-dense 70% dark Belgian fudge brownie slab topped with shimmering golden chocolate spheres and intricate birthday wreath piping.",
    tags: ["✨ 24K Gold Shimmer", "🍫 70% Couverture", "👑 Celebration Slab", "🌰 Hazelnut Truffle"],
    serves: "8–12 Persons",
    price: "₹1,650",
    occasion: "Luxury Birthdays & Feasts",
    badge: "Head Baker's Signature",
  },
  {
    id: "biscoff-mosaic",
    title: "Artisan Mosaic Nut & Biscoff Tapestry",
    subtitle: "Four-Flavour Gourmet Texture Grid",
    image: "/cakes/biscoff-nut-brownie.jpg",
    story: "A feast for eyes and palate: Belgian dark chocolate fudge, crunchy roasted pistachio crumbles, Lotus Biscoff swirl, and white chocolate piping.",
    tags: ["🥜 Roasted Pistachio", "🍪 Lotus Biscoff Swirl", "🍫 Belgian Fudge", "✨ Mosaic Grid"],
    serves: "10–14 Persons",
    price: "₹1,450",
    occasion: "Celebration Gifting",
    badge: "Crowd Favorite",
  },
  {
    id: "tin-trio",
    title: "The Gold Tin Snack Loaf Trio",
    subtitle: "Triple-Flavour Teatime Bar Set",
    image: "/cakes/trio-snack-loaves.jpg",
    story: "Baked in golden bakery foil tins: Classic Chocolate Chip Golden Blondie, Double Dark Cocoa Fudge Loaf, and White-Chip Velvet Cake.",
    tags: ["🍯 Golden Blondie", "🍫 Double Fudge", "❤️ Red Velvet Bar", "📦 Gift Tin Packaging"],
    serves: "6–9 Servings",
    price: "₹780",
    occasion: "Afternoon Teas & Gifting",
    badge: "Teatime Essential",
  },
];

export function CakeStudioCarousel() {
  const [current, setCurrent] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const activeSlide = CAKE_SLIDES[current]!;

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % CAKE_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + CAKE_SLIDES.length) % CAKE_SLIDES.length);
  }, []);

  // Touch Swipe Handlers for Mobile
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

  // 3D Tilt calculation (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Ani Bakes! 🥐 I would like to order the "${activeSlide.title}" (${activeSlide.price}) custom cake for an upcoming celebration. Can we customize the message and date?`
  );

  return (
    <section className="relative overflow-hidden py-8 sm:py-14 bg-secondary/20 border-y border-border/70">
      {/* Ambient Background Glows */}
      <div className="absolute -left-20 top-1/3 size-72 rounded-full bg-berry/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header */}
        <div className="flex flex-row items-end justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-berry block mb-1">
              Custom Celebration Studio
            </span>
            <h2 className="font-blogh text-xl sm:text-3xl lg:text-5xl font-bold text-cocoa leading-[1.1] uppercase tracking-wide">
              Bespoke bakes for core memories
            </h2>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm font-sans font-medium text-muted-foreground tracking-widest tabular-nums">
              <strong className="text-cocoa font-bold">{String(current + 1).padStart(2, "0")}</strong> / {String(CAKE_SLIDES.length).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Cake"
                className="flex size-8 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-3.5 sm:size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Cake"
                className="flex size-8 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="size-3.5 sm:size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 📱 MOBILE & TABLET VIEW: Single-View Unified Celebration Stage (<1024px) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="block lg:hidden rounded-3xl border border-border/80 bg-card overflow-hidden shadow-soft transition-all duration-300"
        >
          {/* Top Stage Photo (54% height of card) */}
          <div className="relative aspect-[16/11] sm:aspect-[16/9] w-full overflow-hidden bg-secondary/40">
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.title}
              className="size-full object-cover select-none transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top Badge Floating */}
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                <Sparkles className="size-3 text-amber-300" />
                <span>{activeSlide.badge}</span>
              </span>
            </div>

            {/* Top Subtitle Floating */}
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-berry border border-border/60 shadow-2xs">
                {activeSlide.subtitle}
              </span>
            </div>

            {/* Overlay Prev / Next Touch Arrows on Photo */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-7 sm:size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-sm active:scale-90"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-7 sm:size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-sm active:scale-90"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Bottom Info Deck (Single-view compact specifications & WhatsApp CTA) */}
          <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
            {/* Row 1: Title + Starting Price */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-blogh text-base sm:text-xl font-bold text-cocoa leading-tight uppercase tracking-wide truncate">
                  {activeSlide.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="font-sans text-xl sm:text-2xl font-black text-cocoa tabular-nums">
                  {activeSlide.price}
                </span>
              </div>
            </div>

            {/* Row 2: Micro Portion & Occasion Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl bg-secondary/60 px-2.5 py-1.5 border border-border/60">
                <Users className="size-3.5 text-berry shrink-0" />
                <span className="font-bold text-cocoa text-[11px] sm:text-xs truncate">{activeSlide.serves}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-secondary/60 px-2.5 py-1.5 border border-border/60">
                <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                <span className="font-bold text-cocoa text-[11px] sm:text-xs truncate">{activeSlide.occasion}</span>
              </div>
            </div>

            {/* Row 3: Action Buttons */}
            <div className="pt-0.5 flex items-center gap-2">
              <Button
                asChild
                className="flex-1 rounded-2xl bg-cocoa text-white hover:bg-cocoa/90 font-bold text-xs sm:text-sm h-10 shadow-lift cursor-pointer"
              >
                <a
                  href={`https://wa.me/917448724920?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>Order on WhatsApp</span>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-border/80 text-xs font-bold text-cocoa h-10 px-3 shrink-0"
              >
                <Link to="/shop">
                  <span>Counter</span>
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Row 4: Bullet Dot Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {CAKE_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Jump to ${slide.title}`}
                  onClick={() => setCurrent(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    current === idx ? "w-5 bg-berry shadow-2xs" : "w-1.5 bg-border/80 hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 🖥️ DESKTOP VIEW: Spacious 2-Column Locked-Height Studio Grid (>=1024px) */}
        <div className="hidden lg:grid grid-cols-[34%_63%] gap-[3%] items-stretch h-[580px]">
          
          {/* Left Column: Modern Bento Interior Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-soft h-full">
            <div className="space-y-4">
              
              {/* Top Row: Category Subtitle + Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-berry truncate">
                  {activeSlide.subtitle}
                </span>
                <span className="rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shrink-0">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Title & Description in Blogh & Inter */}
              <div>
                <h3 className="font-blogh text-2xl font-bold text-cocoa leading-tight uppercase tracking-wide">
                  {activeSlide.title}
                </h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                  {activeSlide.story}
                </p>
              </div>

              {/* Modern Mini-Bento Interior Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Bento Item 1: Servings */}
                <div className="rounded-2xl bg-secondary/50 p-3 border border-border/60 flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-berry/10 flex items-center justify-center shrink-0">
                    <Users className="size-4 text-berry" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Portion</span>
                    <span className="text-[13px] font-bold text-cocoa truncate block">{activeSlide.serves}</span>
                  </div>
                </div>

                {/* Bento Item 2: Occasion */}
                <div className="rounded-2xl bg-secondary/50 p-3 border border-border/60 flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Best For</span>
                    <span className="text-[13px] font-bold text-cocoa truncate block">{activeSlide.occasion}</span>
                  </div>
                </div>
              </div>

              {/* Tags Slot */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeSlide.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-border/80 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions Slot */}
            <div className="pt-4 border-t border-border/70 mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Starting from
                  </p>
                  <p className="font-sans text-3xl font-extrabold text-cocoa tracking-tight tabular-nums">
                    {activeSlide.price}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Baked Fresh to Order
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  size="default"
                  className="w-full rounded-2xl bg-cocoa text-white hover:bg-cocoa/90 font-bold text-sm shadow-lift h-11 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <a
                    href={`https://wa.me/917448724920?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="size-4 text-emerald-400" />
                    <span>Order Design via WhatsApp</span>
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-2xl border-border/80 hover:border-cocoa/40 text-xs font-semibold text-muted-foreground hover:text-cocoa h-8.5"
                >
                  <Link to="/shop">
                    <span>Browse All Daily Counter Bakes</span>
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Showcase Card with Refined Tags & Bottom Overlay */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative h-full rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lift transition-all duration-200 group flex items-center justify-center"
            style={{
              perspective: "1200px",
            }}
          >
            {/* 3D Tilted Inner Wrapper */}
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.012 : 1})`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Product Photograph */}
              <img
                key={activeSlide.image}
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover select-none transition-all duration-500"
              />

              {/* Dynamic Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 pointer-events-none" />

              {/* Floating Badge (Top Right) */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg">
                  <Sparkles className="size-3.5 text-amber-300" />
                  <span>{activeSlide.badge}</span>
                </span>
              </div>

              {/* Caption & Indicator Bullets (Bottom Overlay) */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-4 p-5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 text-white">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block mb-0.5">
                    Artisan Custom Creation
                  </span>
                  <p className="font-blogh text-xl font-bold text-white leading-tight uppercase tracking-wide truncate">
                    {activeSlide.title}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {CAKE_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`Jump to ${slide.title}`}
                      onClick={() => setCurrent(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        current === idx
                          ? "w-7 bg-amber-300 shadow-xs"
                          : "w-2 bg-white/40 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default CakeStudioCarousel;
