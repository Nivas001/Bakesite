import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Pause,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

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
    image: "/cakes/pink-bento-cake.webp",
    story:
      "Single-tier mini celebration cake with signature fluffy vanilla sponge, layered with strawberry confit and silky whipped mascarpone.",
    tags: [
      "🍓 Strawberry Confit",
      "✨ Custom Lettering",
      "💕 4-Inch Bento",
      "🧈 French Buttercream",
    ],
    serves: "2–3 Persons",
    price: "₹550",
    occasion: "Anniversaries & Besties",
    badge: "Most Loved Bento",
  },
  {
    id: "butterfly-lilac",
    title: '"Butterfly Dream" Lilac Swirl Cake',
    subtitle: "Edible Golden Butterfly & Pearl Swirl",
    image: "/cakes/butterfly-lilac-cake.webp",
    story:
      "Two-tone lilac swirl with 3D edible gold & lilac flutter butterflies and glistening sugar pearls over a Madagascar vanilla crumb.",
    tags: [
      "🦋 3D Gold Butterflies",
      "🦪 Edible Pearl Beading",
      "💜 Lavender Vanilla",
      "🎂 5-Inch Tier",
    ],
    serves: "4–6 Persons",
    price: "₹890",
    occasion: "Garden Birthdays & High-Teas",
    badge: "New Creation",
  },
  {
    id: "coral-heart",
    title: '"Golden Heart & Petal" Celebration Cake',
    subtitle: "Piped Buttercream Hearts & 24K Gold Heart",
    image: "/cakes/coral-heart-cake.webp",
    story:
      "Peach-coral buttercream swirl adorned with hand-piped heart droplets, golden pearls, and an edible 24K gilded chocolate heart centerpiece.",
    tags: [
      "💛 24K Gold Heart",
      "💕 Buttercream Hearts",
      "🍓 Strawberry Crumb",
      "✨ Golden Spheres",
    ],
    serves: "4–6 Persons",
    price: "₹850",
    occasion: "Valentine & Anniversaries",
    badge: "Signature Romance",
  },
  {
    id: "biscoff-herringbone",
    title: '"Biscoff Caramel Chevron" Feast Slab',
    subtitle: "Caramel Feathered Slab with Golden Topper",
    image: "/cakes/biscoff-herringbone-cake.webp",
    story:
      "Multi-layered square feast slab with handcrafted caramel herringbone feathering, crunchy lotus crumb border, and golden acrylic topper.",
    tags: [
      "🍪 Biscoff Feathering",
      "👑 Acrylic Gold Topper",
      "🍯 Salted Caramel",
      "🎂 Square Slab",
    ],
    serves: "8–12 Persons",
    price: "₹1,550",
    occasion: "Grand Milestone Birthdays",
    badge: "Celebration Feast",
  },
  {
    id: "lavender-pearl",
    title: "Lavender Dream Floral Ombré Cake",
    subtitle: "Artisan Edible Pearl & Floral Sculpture",
    image: "/cakes/lavender-pearl-cake.webp",
    story:
      "Two-tone lilac ombré with hand-piped buttercream hydrangea blossoms and gleaming sugar pearls over a Madagascar vanilla bean crumb.",
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
    image: "/cakes/royal-gold-brownie.webp",
    story:
      "Ultra-dense 70% dark Belgian fudge brownie slab topped with shimmering golden chocolate spheres and intricate birthday wreath piping.",
    tags: [
      "✨ 24K Gold Shimmer",
      "🍫 70% Couverture",
      "👑 Celebration Slab",
      "🌰 Hazelnut Truffle",
    ],
    serves: "8–12 Persons",
    price: "₹1,650",
    occasion: "Luxury Birthdays & Feasts",
    badge: "Head Baker's Signature",
  },
  {
    id: "biscoff-mosaic",
    title: "Artisan Mosaic Nut & Biscoff Tapestry",
    subtitle: "Four-Flavour Gourmet Texture Grid",
    image: "/cakes/biscoff-nut-brownie.webp",
    story:
      "A feast for eyes and palate: Belgian dark chocolate fudge, crunchy roasted pistachio crumbles, Lotus Biscoff swirl, and white chocolate piping.",
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
    image: "/cakes/trio-snack-loaves.webp",
    story:
      "Baked in golden bakery foil tins: Classic Chocolate Chip Golden Blondie, Double Dark Cocoa Fudge Loaf, and White-Chip Velvet Cake.",
    tags: ["🍯 Golden Blondie", "🍫 Double Fudge", "❤️ Red Velvet Bar", "📦 Gift Tin Packaging"],
    serves: "6–9 Servings",
    price: "₹780",
    occasion: "Afternoon Teas & Gifting",
    badge: "Teatime Essential",
  },
];

const WHATSAPP_NUMBER = "917448724920";
/** How long each slide holds before the lookbook turns itself. */
const AUTOPLAY_MS = 6000;

/**
 * The custom-cake lookbook.
 *
 * Rebuilt around a single stage: one large photograph with the design's details
 * sitting on it, a filmstrip of every other design underneath, and a progress
 * ring on the turn arrows so it is obvious the lookbook advances on its own.
 *
 * The previous version maintained two entirely separate layouts — a phone card
 * and a desktop split — which meant two sets of markup to keep in step and a
 * desktop layout locked to a fixed 580px height that clipped longer titles. One
 * responsive stage replaces both.
 */
export function CakeStudioCarousel() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const touchStartX = useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();

  const activeSlide = CAKE_SLIDES[current]!;

  const goTo = useCallback((index: number) => {
    setCurrent(((index % CAKE_SLIDES.length) + CAKE_SLIDES.length) % CAKE_SLIDES.length);
  }, []);
  const handleNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const handlePrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // --------------------------------------------------------------- autoplay
  // Paused whenever the visitor takes over, whenever the section is off screen,
  // and entirely for anyone who prefers reduced motion.
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reduced || !onScreen) return;
    const id = window.setTimeout(handleNext, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, reduced, onScreen, handleNext, current]);

  // Keep the active thumbnail in view as the lookbook turns.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.querySelector<HTMLElement>(`[data-index="${current}"]`);
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [current]);

  // ------------------------------------------------------------ interaction
  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setPlaying(false);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? null;
    if (endX === null) return;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -4, y: x * 4 });
  }

  const whatsappMessage = encodeURIComponent(
    `Hi Aniii Bakes! 🥐 I would like to order the "${activeSlide.title}" (${activeSlide.price}) custom cake for an upcoming celebration. Can we customize the message and date?`,
  );

  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-secondary/25 py-8 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-20 size-72 rounded-full bg-berry/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4">
        {/* ── Heading + transport controls ──────────────────────────── */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <span className="mb-1 block text-[10px] font-black tracking-[0.2em] text-berry-deep uppercase sm:text-xs">
              Custom Celebration Studio
            </span>
            <h2 className="font-blogh text-[clamp(1.4rem,4.6vw,3rem)] leading-[1.05] font-bold tracking-wide text-cocoa uppercase">
              Bespoke bakes for core memories
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground tabular-nums sm:text-sm">
              <strong className="font-black text-cocoa">
                {String(current + 1).padStart(2, "0")}
              </strong>
              <span className="mx-0.5">/</span>
              {String(CAKE_SLIDES.length).padStart(2, "0")}
            </span>

            {!reduced && (
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-pressed={playing}
                aria-label={playing ? "Pause the lookbook" : "Play the lookbook"}
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 sm:size-10"
              >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  handlePrev();
                }}
                aria-label="Previous design"
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 sm:size-10"
              >
                <ChevronLeft className="size-3.5 sm:size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  handleNext();
                }}
                aria-label="Next design"
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-border/80 bg-card text-cocoa shadow-2xs transition-all hover:bg-secondary active:scale-95 sm:size-10"
              >
                <ChevronRight className="size-3.5 sm:size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ── The stage ─────────────────────────────────────────────── */}
        <div
          ref={stageRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-cocoa shadow-lift sm:rounded-[2.25rem]"
          style={{ perspective: "1400px" }}
        >
          {/* Photograph. All slides stay mounted and cross-fade, so turning
              the page never shows a gap while the next image decodes. */}
          <div
            className="relative aspect-4/5 w-full transition-transform duration-300 ease-out sm:aspect-16/10 lg:aspect-21/9"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {CAKE_SLIDES.map((slide, index) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={index === current ? slide.title : ""}
                aria-hidden={index !== current}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={cn(
                  "absolute inset-0 size-full object-cover transition-all duration-700 ease-out",
                  index === current ? "scale-100 opacity-100" : "scale-105 opacity-0",
                )}
              />
            ))}

            {/* Readability washes: from the bottom everywhere, and from the
                left on wide screens where the detail panel sits. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-cocoa via-cocoa/45 via-45% to-transparent to-75%"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 lg:bg-linear-to-r lg:from-cocoa/88 lg:to-transparent lg:to-60%"
            />

            {/* Badge */}
            <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md sm:top-4 sm:right-4">
              <Sparkles className="size-3.5 text-amber-300" />
              {activeSlide.badge}
            </span>

            {/* Design details, sitting on the photograph */}
            <div
              key={activeSlide.id}
              className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:max-w-xl lg:p-8"
              style={{ animation: "fade-up 600ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <span className="text-[10px] font-black tracking-[0.2em] text-amber-300 uppercase sm:text-[11px]">
                {activeSlide.subtitle}
              </span>
              <h3 className="mt-1.5 font-blogh text-[clamp(1.15rem,3.4vw,2rem)] leading-tight font-bold tracking-wide text-white uppercase">
                {activeSlide.title}
              </h3>
              <p className="mt-2 hidden max-w-lg text-[13px] leading-relaxed text-white/75 sm:block">
                {activeSlide.story}
              </p>

              {/* Facts */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Users className="size-3.5 text-berry" />
                  {activeSlide.serves}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-amber-300" />
                  {activeSlide.occasion}
                </span>
                {activeSlide.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="hidden items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm lg:inline-flex"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price and the two ways out */}
              <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-3">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/55 uppercase">
                    Starting from
                  </p>
                  <p className="font-blogh text-2xl leading-none font-bold text-white tabular-nums sm:text-3xl">
                    {activeSlide.price}
                  </p>
                </div>

                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-xs font-black text-[#2A1509] shadow-lift transition-transform hover:scale-[1.02] active:scale-95 sm:text-sm"
                  >
                    <MessageCircle className="size-4" />
                    Design this on WhatsApp
                  </a>
                  <Link
                    to="/shop"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-white/20 px-4 text-xs font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Daily counter
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Swipe affordance — phones only, and only until the first turn. */}
            {current === 0 && (
              <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase backdrop-blur-sm sm:hidden">
                Swipe to browse
              </span>
            )}

            {/* Autoplay progress — a hairline that fills across each hold.
                Keyed on the slide so it restarts with every turn. */}
            {playing && !reduced && onScreen && (
              <span
                key={`${activeSlide.id}-progress`}
                aria-hidden
                className="animate-progress-fill pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-amber-400/80"
                style={{ "--progress-duration": `${AUTOPLAY_MS}ms` } as React.CSSProperties}
              />
            )}
          </div>
        </div>

        {/* ── Filmstrip ─────────────────────────────────────────────── */}
        <ul
          ref={stripRef}
          className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mt-4 sm:gap-2.5"
        >
          {CAKE_SLIDES.map((slide, index) => {
            const selected = index === current;
            return (
              <li key={slide.id} data-index={index} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    goTo(index);
                  }}
                  aria-label={`Show ${slide.title}`}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "group relative block cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300",
                    selected
                      ? "w-28 border-cocoa shadow-soft sm:w-36"
                      : "w-16 border-transparent opacity-60 hover:opacity-100 sm:w-20",
                  )}
                >
                  <img
                    src={slide.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-4/3 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {selected && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/80 to-transparent px-2 pt-4 pb-1 text-[9px] font-bold text-white uppercase">
                      {slide.price}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default CakeStudioCarousel;
