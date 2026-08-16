import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Cake, Heart, MessageCircle } from "lucide-react";
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
    occasion: "Anniversaries & Bestie Birthdays",
    badge: "Most Loved Bento",
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
    occasion: "Milestone Birthdays & Showstopper High-Teas",
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
    occasion: "Luxury Birthdays & Grand Feasts",
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
    occasion: "Celebration Gifting & Office Feasts",
    badge: "Crowd Favorite",
  },
  {
    id: "tin-trio",
    title: "The Gold Tin Snack Loaf Trio",
    subtitle: "Triple-Flavour Teatime Bar Set",
    image: "/cakes/trio-snack-loaves.jpg",
    story: "Baked in golden bakery foil tins: Classic Chocolate Chip Golden Blondie, Double Dark Cocoa Fudge Loaf, and White-Chip Velvet Cake.",
    tags: ["🍯 Golden Blondie", "🍫 Double Fudge", "❤️ Red Velvet Bar", "📦 Gift Tin Packaging"],
    serves: "3 Snack Loaves (6–9 Servings)",
    price: "₹780",
    occasion: "Afternoon Teas & Gourmet Snacking",
    badge: "Teatime Essential",
  },
];

export function CakeStudioCarousel() {
  const [current, setCurrent] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSlide = CAKE_SLIDES[current]!;

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % CAKE_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + CAKE_SLIDES.length) % CAKE_SLIDES.length);
  }, []);

  // 3D Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6; // max 6 deg
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
    <section className="relative overflow-hidden py-12 sm:py-20 bg-secondary/25 border-y border-border/70">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute -left-20 top-1/3 size-72 rounded-full bg-berry/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-berry mb-2">
              <Sparkles className="size-3.5" />
              <span>The Celebration Cake Studio</span>
            </div>
            <h2 className="font-nimbus text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
              Bespoke bakes for core memories
            </h2>
          </div>

          {/* Carousel Slide Indicators & Navigation Buttons */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-muted-foreground">
              <strong className="text-cocoa font-extrabold">{String(current + 1).padStart(2, "0")}</strong> / {String(CAKE_SLIDES.length).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Cake"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Cake"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* The 25% Text / 70% Image / 5% Gap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_66%] gap-6 lg:gap-[4%] items-stretch">
          
          {/* Left Column (25-30%): Editorial Story & Custom Order Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft transition-all">
            <div className="space-y-4">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  {activeSlide.badge}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {activeSlide.serves}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-berry">
                  {activeSlide.subtitle}
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-cocoa mt-1 leading-snug">
                  {activeSlide.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeSlide.story}
              </p>

              {/* Occasion / Servings pill */}
              <div className="rounded-2xl bg-secondary/40 p-3 border border-border/60 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Perfect for:</span>
                  <span className="font-medium text-cocoa">{activeSlide.occasion}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="font-semibold text-foreground">Handcrafted at:</span>
                  <span className="text-berry font-bold">Ani Bakes Studio, Pondicherry</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeSlide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/80 bg-secondary/30 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Price & Order CTA */}
            <div className="pt-6 border-t border-border/70 mt-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Starting from
                  </p>
                  <p className="font-sans text-2xl font-black text-cocoa tracking-tight">
                    {activeSlide.price}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Baked Fresh to Order
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs shadow-lift h-11 transition-all hover:scale-[1.01] cursor-pointer"
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
                  className="w-full rounded-2xl border-border/80 hover:border-berry/40 text-xs font-semibold text-muted-foreground hover:text-foreground h-9"
                >
                  <Link to="/shop">
                    <span>Browse All Daily Counter Bakes</span>
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column (70%): High-Resolution 3D Tilt Showcase Card */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lift transition-all duration-200 group flex items-center justify-center"
            style={{
              perspective: "1200px",
            }}
          >
            {/* 3D Tilted Inner Wrapper */}
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.015 : 1})`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Product Photograph with Subtle Zoom */}
              <img
                key={activeSlide.image}
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover select-none animate-in fade-in duration-300"
              />

              {/* Dynamic Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

              {/* Floating Tactile Flavor & Detail Chips (Top Right) */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 text-xs font-extrabold shadow-lg">
                  <Sparkles className="size-3 text-amber-300" />
                  <span>{activeSlide.badge}</span>
                </span>
                <span className="rounded-full bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200/50 px-3 py-1 text-[11px] font-bold shadow-md">
                  📍 Pondicherry Kitchen
                </span>
              </div>

              {/* Caption Bar (Bottom Left Overlay) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Artisan Custom Creation
                  </p>
                  <p className="font-display text-base sm:text-xl font-bold text-white leading-tight mt-0.5">
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
                          ? "w-6 bg-amber-300"
                          : "w-2 bg-white/50 hover:bg-white/80"
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
