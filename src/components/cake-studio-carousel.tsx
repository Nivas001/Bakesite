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
    <section className="relative overflow-hidden py-12 sm:py-16 bg-secondary/20 border-y border-border/70">
      {/* Ambient Background Glows */}
      <div className="absolute -left-20 top-1/3 size-72 rounded-full bg-berry/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl px-4">
        
        {/* Section Header (Cleaned: Subheader removed) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-nimbus text-3xl sm:text-4xl lg:text-5xl font-bold text-cocoa leading-tight">
              Bespoke bakes for core memories
            </h2>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
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

        {/* Locked-Height Grid (Zero jumping across all 8 slides) */}
        <div className="grid grid-cols-1 lg:grid-cols-[32%_64%] gap-6 lg:gap-[4%] items-stretch lg:h-[560px]">
          
          {/* Left Column: Fixed height card with perfectly non-overflowing tags */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-soft h-full min-h-[500px] lg:min-h-0">
            <div className="space-y-3.5">
              
              {/* Badge & Perfectly Aligned Serves Row */}
              <div className="flex items-center justify-between gap-2 h-7">
                <span className="rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider truncate">
                  {activeSlide.badge}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-bold text-cocoa shrink-0 border border-border/50">
                  <Users className="size-3 text-berry" />
                  <span>{activeSlide.serves}</span>
                </span>
              </div>

              {/* Title & Subtitle Slot (Fixed Height) */}
              <div className="h-16 flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-berry line-clamp-1">
                  {activeSlide.subtitle}
                </p>
                <h3 className="font-display text-xl font-bold text-cocoa leading-tight line-clamp-2 mt-0.5">
                  {activeSlide.title}
                </h3>
              </div>

              {/* Description Slot (Fixed Height) */}
              <div className="h-16 flex items-start">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {activeSlide.story}
                </p>
              </div>

              {/* Occasion & Studio Info Box: Clean Grid Alignment */}
              <div className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60 text-xs text-muted-foreground space-y-1.5 h-[72px] flex flex-col justify-center">
                <div className="grid grid-cols-[85px_1fr] items-center gap-2">
                  <span className="font-bold text-foreground shrink-0">Perfect for:</span>
                  <span className="font-semibold text-cocoa truncate">{activeSlide.occasion}</span>
                </div>
                <div className="grid grid-cols-[85px_1fr] items-center gap-2 pt-1.5 border-t border-border/40">
                  <span className="font-bold text-foreground shrink-0">Handcrafted:</span>
                  <span className="text-berry font-bold truncate">Ani Bakes Studio</span>
                </div>
              </div>

              {/* Tags Slot (Non-Overflowing Flex Wrap Grid) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeSlide.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-border/80 bg-secondary/40 px-2.5 py-1 text-[10.5px] font-medium text-foreground shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions Slot (Anchored Strictly at Base) */}
            <div className="pt-4 border-t border-border/70 mt-4 space-y-2.5">
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
                  size="default"
                  className="w-full rounded-2xl bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs shadow-lift h-10 transition-all hover:scale-[1.01] cursor-pointer"
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

          {/* Right Column: Fixed height 3D Showcase Card (Clean: Pondicherry Kitchen tag removed) */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative h-[380px] sm:h-[480px] lg:h-full rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lift transition-all duration-200 group flex items-center justify-center"
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
              {/* Product Photograph with Smooth Crossfade */}
              <img
                key={activeSlide.image}
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover select-none transition-all duration-500"
              />

              {/* Dynamic Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              {/* Floating Badge (Top Right) */}
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 text-xs font-extrabold shadow-lg">
                  <Sparkles className="size-3 text-amber-300" />
                  <span>{activeSlide.badge}</span>
                </span>
              </div>

              {/* Caption & Indicator Bullets (Bottom Overlay) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Artisan Custom Creation
                  </p>
                  <p className="font-display text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
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
