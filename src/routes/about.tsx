import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Flame,
  ArrowRight,
  RotateCw,
  Check,
  Wheat,
  Droplets,
  Leaf,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
  MousePointerClick,
  Info,
  Clock,
  BookOpen,
  Award,
  Compass,
  Box,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cake3dModelViewer } from "@/components/cake-3d-model-viewer";
import { DeliverySecurityShowcase } from "@/components/delivery-security-showcase";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Ani Bakes Wellness & Artisan Bakery" },
      {
        name: "description",
        content:
          "Explore the craft behind Ani Bakes: 36-hour wild fermentation, healthy indulgence with zero refined sugars, and 100% pure butter bakes.",
      },
      { property: "og:title", content: "About Us — Ani Bakes Wellness Bakery" },
      {
        property: "og:description",
        content:
          "Explore the craft behind Ani Bakes: 36-hour wild fermentation, healthy indulgence with zero refined sugars, and 100% pure butter bakes.",
      },
    ],
  }),
  component: AboutUsPage,
});

type CakeAngle = "front" | "orbit" | "crumb" | "top";

interface HotspotDetail {
  id: number;
  title: string;
  badge: string;
  tag: string;
  description: string;
  benefit: string;
  color: string;
}

const MUFFIN_HOTSPOTS: HotspotDetail[] = [
  {
    id: 1,
    title: "Dairy-Free Coconut & Almond Crumb",
    badge: "DAIRY-FREE",
    tag: "Lactose-Free",
    description:
      "Enjoy our bakes without milk or dairy derivatives, perfect for those seeking lactose-free and gentle digestion.",
    benefit: "Zero Bloat · Light & Velvety Texture",
    color: "bg-rose-500 text-white",
  },
  {
    id: 2,
    title: "Stone-Ground Wheat Flour",
    badge: "WHEAT FLOUR (GLUTEN)",
    tag: "Ancient Grain",
    description:
      "Our sponge cakes and muffins are made with high-quality cold stone-ground wheat flour, giving each bite a rich, custard-soft crumb.",
    benefit: "Natural Wheat Germ Intact · Nutrient Dense",
    color: "bg-amber-600 text-white",
  },
  {
    id: 3,
    title: "High-Protein Artisan Blend",
    badge: "HIGH-PROTEIN BLEND",
    tag: "Energizing",
    description:
      "Enriched with a balanced clean protein blend, helping you stay energized, nourished, and fully satisfied longer.",
    benefit: "14g Protein per portion · Slow-Release Energy",
    color: "bg-fuchsia-600 text-white",
  },
  {
    id: 4,
    title: "Sugar-Free Natural Sweeteners",
    badge: "SUGAR-FREE SWEETENERS",
    tag: "0g Added Sugar",
    description:
      "Enjoy the perfect sweetness with organic monkfruit and whole date purée with zero refined white sugars, ideal for a balanced lifestyle.",
    benefit: "Low Glycemic Index · Diabetic Friendly",
    color: "bg-emerald-600 text-white",
  },
];

const CAKE_SPECS: Record<
  CakeAngle,
  {
    title: string;
    description: string;
    image: string;
    angleDegree: number;
    macros: { calories: string; protein: string; sugar: string; butterfat: string };
    hotspots: Array<{ top: string; left: string; label: string; bg: string }>;
  }
> = {
  front: {
    title: "3-Tier Dark Chocolate & Salted Caramel Masterpiece",
    description:
      "Exposed 70% dark Belgian cocoa sponge layers stacked with organic coconut milk caramel cream and dripping couverture ganache.",
    image: "/about/cake-3d-front.jpg",
    angleDegree: 0,
    macros: { calories: "185 kcal", protein: "12g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "18%", left: "32%", label: "24K Gold Leaf", bg: "bg-amber-400 text-amber-950" },
      { top: "35%", left: "70%", label: "Salted Caramel Ganache", bg: "bg-orange-500 text-white" },
      { top: "58%", left: "22%", label: "Moist Dark Cocoa Sponge", bg: "bg-amber-800 text-white" },
      { top: "72%", left: "65%", label: "Zero Added Sugar", bg: "bg-emerald-500 text-emerald-950" },
    ],
  },
  orbit: {
    title: "360° Studio Rotation: Handcrafted Symmetry",
    description:
      "Every angle showcases hand-piped caramel droplets, gilded chocolate truffle spheres, and glossy slow-dripping Belgian ganache.",
    image: "/about/cake-3d-orbit.jpg",
    angleDegree: 90,
    macros: { calories: "185 kcal", protein: "12g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "25%", left: "48%", label: "Couverture Truffles", bg: "bg-amber-500 text-white" },
      { top: "45%", left: "25%", label: "Lactose-Free Option", bg: "bg-rose-500 text-white" },
      { top: "65%", left: "75%", label: "High-Protein Core", bg: "bg-purple-600 text-white" },
    ],
  },
  crumb: {
    title: "Macro Crumb & Air Pocket Architecture",
    description:
      "Wild cold proofing creates airy alveoli and custard-like sponge that holds rich moisture without requiring artificial chemical emulsifiers.",
    image: "/about/cake-3d-crumb.jpg",
    angleDegree: 180,
    macros: { calories: "185 kcal", protein: "14g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "30%", left: "40%", label: "Organic Wheat Germ", bg: "bg-yellow-400 text-yellow-950" },
      { top: "55%", left: "60%", label: "Cold Retard Crust", bg: "bg-amber-700 text-white" },
      { top: "75%", left: "68%", label: "Air Pocket Sponge", bg: "bg-emerald-500 text-emerald-950" },
    ],
  },
  top: {
    title: "Gilded Crown & Truffle Centerpiece",
    description:
      "A coronation of 4 hand-rolled dark chocolate truffles dusted with edible 24K gold dust and sea salt flakes.",
    image: "/about/cake-3d-top.jpg",
    angleDegree: 270,
    macros: { calories: "190 kcal", protein: "12g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "20%", left: "50%", label: "Gilded Spheres", bg: "bg-amber-400 text-amber-950" },
      { top: "50%", left: "30%", label: "Caramel Rosettes", bg: "bg-orange-500 text-white" },
      { top: "40%", left: "65%", label: "Mirror Glaze Crown", bg: "bg-amber-700 text-white" },
    ],
  },
};

const WELLNESS_DIETS = [
  { id: "all", label: "All Wellness Bakes", count: "18 Bakes" },
  { id: "sugarfree", label: "Sugar-Free Monkfruit", count: "8 Bakes" },
  { id: "highprotein", label: "High-Protein Blend", count: "6 Bakes" },
  { id: "dairyfree", label: "Lactose-Free & Vegan", count: "7 Bakes" },
];

const STORY_CHAPTERS = [
  {
    id: 1,
    chapter: "CHAPTER 01",
    tag: "Our Story",
    title: "INDULGENCE WITH A HEALTHY TWIST",
    subtitle: "Re-imagining classic French baking for modern vitality.",
    narrative:
      "In 2024, our founder embarked on a mission to solve a glaring problem in pastry: bakery treats looked irresistible but were loaded with inflammatory refined sugars, artificial premixes, and industrial palm oils. We asked ourselves — what if a chocolate muffin had 14g of clean protein, zero refined sugars, and the velvety crumb of a Parisian boulangerie? After 300+ recipe iterations, Ani Bakes was born.",
    badge: "100% Monkfruit & Dates",
    icon: Sparkles,
    themeColor: "from-[#FFE8F0] via-[#FFD8E6] to-[#FFC2DA]",
    textColor: "text-[#E83181]",
    borderColor: "border-[#2C1810]",
    image: "/about/wellness-chocolate-muffin.jpg",
    imageAlt: "Healthy Indulgence Chocolate Muffin",
  },
  {
    id: 2,
    chapter: "CHAPTER 02",
    tag: "Our Mission",
    title: "EXPERIENCE THE FULL TASTE OF WELLNESS",
    subtitle: "Custom dietary nutrition meets artisan counter craftsmanship.",
    narrative:
      "We believe wellness is inclusive. Whether you are living diabetic-friendly, tracking macro protein, avoiding dairy lactose, or managing gluten sensitivities, our small-batch laboratory creates treats that celebrate your lifestyle rather than restrict it. Every single bake undergoes rigorous macro testing before arriving on the morning counter.",
    badge: "Dietary Inclusion",
    icon: Compass,
    themeColor: "from-[#FEF9B5] via-[#FFF380] to-[#FFE655]",
    textColor: "text-[#4A154B]",
    borderColor: "border-[#2C1810]",
    image: "/about/walnut-cupcake-trio.jpg",
    imageAlt: "Brownies and Cupcakes Variety",
  },
  {
    id: 3,
    chapter: "CHAPTER 03",
    tag: "Our Vision",
    title: "A NEW TASTE OF WELLNESS",
    subtitle: "Guiding mindful indulgence without a single compromise on taste.",
    narrative:
      "Our vision extends beyond Pondicherry. We are establishing the blueprint for the bakery of the future: low-glycemic natural sweeteners, sustainable unbleached local flours, and zero artificial shelf-life chemicals. When healthy snacking is this decadent, wellness becomes an effortless, daily joy.",
    badge: "Future of Pastry",
    icon: Award,
    themeColor: "from-[#C8F6EC] via-[#A6EFE0] to-[#88E4D2]",
    textColor: "text-[#2E1854]",
    borderColor: "border-[#2C1810]",
    image: "/about/salted-caramel-cupcake.jpg",
    imageAlt: "Decadent Salted Caramel Cupcake",
  },
  {
    id: 4,
    chapter: "CHAPTER 04",
    tag: "Our Values",
    title: "FROM OUR OVEN TO YOUR HEART",
    subtitle: "The 4:00 AM dawn bake ritual and 36-hour sourdough patience.",
    narrative:
      "We do not cut corners. We do not use commercial speed leaveners. Every sourdough loaf is slowly cold retarded for 36 hours so wild lactobacilli break down gluten and fructans. Every morning at 4:00 AM, our bakers ignite the hearth decks so your reserved morning slot is warm, fragrant, and fresh.",
    badge: "Slow Fermentation",
    icon: Flame,
    themeColor: "from-[#FFF8EC] via-[#FDF0DE] to-[#F8E3C8]",
    textColor: "text-[#5C3218]",
    borderColor: "border-[#2C1810]",
    image: "/about/hero-3d-caramel-cake.jpg",
    imageAlt: "Artisan Dawn Bake Craft",
  },
];

export function AboutUsPage() {
  const [activeMuffinHotspot, setActiveMuffinHotspot] = useState<number>(1);
  const [activeAngle, setActiveAngle] = useState<CakeAngle>("front");
  const [activeDietFilter, setActiveDietFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"collage" | "story">("collage");
  const [activeStoryChapter, setActiveStoryChapter] = useState<number>(1);
  const [showTooltip, setShowTooltip] = useState(true);
  const [is3dStudioOpen, setIs3dStudioOpen] = useState(false);
  const studio3dRef = useRef<HTMLDivElement>(null);

  // 360° Drag-to-Rotate State
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const heroCardRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const dragDataRef = useRef({
    startX: 0,
    startY: 0,
    startRotY: 0,
    startRotX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const currentCakeSpec = CAKE_SPECS[activeAngle];
  const currentChapter = STORY_CHAPTERS[activeStoryChapter - 1]!;

  // Helper to map normalized degrees to angle quadrant
  const getAngleFromDeg = (deg: number): CakeAngle => {
    const norm = ((deg % 360) + 360) % 360;
    if (norm >= 45 && norm < 135) return "orbit";
    if (norm >= 135 && norm < 225) return "crumb";
    if (norm >= 225 && norm < 315) return "top";
    return "front";
  };

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setHasDragged(true);
    setShowTooltip(false);

    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRotY: rotationY,
      startRotX: rotationX,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const now = performance.now();
    const dt = Math.max(1, now - dragDataRef.current.lastTime);
    const dxInstant = e.clientX - dragDataRef.current.lastX;
    const instantVelocity = dxInstant / dt;

    dragDataRef.current.velocity = instantVelocity * 15;
    dragDataRef.current.lastX = e.clientX;
    dragDataRef.current.lastTime = now;

    const totalDx = e.clientX - dragDataRef.current.startX;
    const totalDy = e.clientY - dragDataRef.current.startY;

    const newRotY = dragDataRef.current.startRotY + totalDx * 0.55;
    const newRotX = Math.max(-12, Math.min(12, dragDataRef.current.startRotX - totalDy * 0.2));

    setRotationY(newRotY);
    setRotationX(newRotX);
    setActiveAngle(getAngleFromDeg(newRotY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);

    // Momentum friction physics
    let v = dragDataRef.current.velocity;
    if (Math.abs(v) > 0.1) {
      let currentY = rotationY;
      const runInertia = () => {
        currentY += v;
        v *= 0.92; // friction deceleration
        setRotationY(currentY);
        setActiveAngle(getAngleFromDeg(currentY));

        if (Math.abs(v) > 0.05) {
          animFrameRef.current = requestAnimationFrame(runInertia);
        } else {
          animFrameRef.current = null;
        }
      };
      animFrameRef.current = requestAnimationFrame(runInertia);
    }
  };

  // Smooth Snap to Angle
  const snapToAngle = (targetAngle: CakeAngle) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const angleTargets: Record<CakeAngle, number> = {
      front: 0,
      orbit: 90,
      crumb: 180,
      top: 270,
    };
    const targetDeg = angleTargets[targetAngle];

    // Find shortest rotational path from current rotationY
    const currentNorm = ((rotationY % 360) + 360) % 360;
    let diff = targetDeg - currentNorm;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const startY = rotationY;
    const finalY = rotationY + diff;
    const startTime = performance.now();
    const duration = 550;

    const animateSnap = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const newY = startY + (finalY - startY) * ease;
      setRotationY(newY);
      setActiveAngle(getAngleFromDeg(newY));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSnap);
      } else {
        animFrameRef.current = null;
        setRotationX(0);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSnap);
    setShowTooltip(false);
    setHasDragged(true);
  };

  function handleSpinClick() {
    const angles: CakeAngle[] = ["front", "orbit", "crumb", "top"];
    const nextIdx = (angles.indexOf(activeAngle) + 1) % angles.length;
    snapToAngle(angles[nextIdx]!);
  }

  const normalizedDegree = Math.round(((rotationY % 360) + 360) % 360);

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-berry/20 pb-20 overflow-x-hidden">
      
      {/* 1. Header Banner & View Mode Switcher */}
      <section className="pt-8 sm:pt-12 pb-6 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2.5">
              <Sparkles className="size-3.5" />
              <span>Artisan Craft & Wellness Philosophy</span>
            </div>
            <h1 className="font-nimbus text-3xl sm:text-5xl lg:text-6xl font-bold text-cocoa leading-tight">
              About Ani Bakes
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Where artisan bakery tradition meets modern wellness. Handcrafted with 100% French butter, wild sourdough fermentation, and guilt-free nutrient indulgence.
            </p>
          </div>

          {/* Interactive Mode Toggle with High Contrast & Quick 3D Studio Jump */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <a
              href="#3d-cake-studio"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-400 text-black font-extrabold text-xs shadow-soft hover:bg-amber-300 transition-all cursor-pointer ring-2 ring-amber-400/30"
            >
              <Sparkles className="size-3.5" />
              <span>3D GLB Studio ↓</span>
            </a>

            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-secondary/80 border-2 border-border/80 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("collage")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "collage"
                    ? "bg-cocoa text-background shadow-md ring-2 ring-cocoa/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Layers className="size-4" />
                <span>Collage Artboard</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("story")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "story"
                    ? "bg-cocoa text-background shadow-md ring-2 ring-cocoa/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <BookOpen className="size-4" />
                <span>Guided Story Mode</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Central 3D Hero Cake Explorer ("The Core Wellness Cake") */}
      <section className="py-6 px-4 sm:px-6 max-w-6xl mx-auto">
        <div
          ref={heroCardRef}
          className="relative rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-b from-[#1C120C] via-[#2A1810] to-[#180E08] text-white p-6 sm:p-10 shadow-2xl overflow-hidden group select-none"
        >
          {/* Ambient Lighting & Glows */}
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

          {/* Top Bar inside the Hero Canvas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-3 rounded-full bg-amber-400 animate-ping" />
              <span className="font-nimbus text-lg sm:text-xl text-amber-300 uppercase tracking-wide">
                Interactive 3D Cake Atelier
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-200 border border-white/15 text-[11px] font-mono font-bold">
                <Compass className="size-3 text-amber-400" />
                {normalizedDegree}°
              </span>
            </div>

            {/* Angle Navigation Pills */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/15">
              {(["front", "orbit", "crumb", "top"] as CakeAngle[]).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => snapToAngle(angle)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeAngle === angle
                      ? "bg-amber-400 text-black shadow-xs font-black scale-[1.03]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          {/* Center Stage: 3D Cake Canvas & Floating Glowing Die-Cut Stickers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6 relative z-10">
            
            {/* Cake Visual Stage (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
              
              {/* Interactive Drag Pill / Tooltip Indicator */}
              <div
                className={`absolute -top-3.5 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-zinc-900 border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl transition-all duration-300 pointer-events-none ${
                  isDragging ? "scale-105 bg-amber-300 text-black" : hasDragged ? "opacity-75" : "animate-bounce"
                }`}
              >
                <Compass className={`size-3.5 text-amber-600 ${isDragging ? "animate-spin" : ""}`} />
                <span>{isDragging ? `Rotating Cake: ${normalizedDegree}°` : "⟷ Drag horizontally to rotate 360°"}</span>
              </div>

              {/* 3D Turntable Platter Outer Ring */}
              <div className="relative flex flex-col items-center justify-center pt-2">
                
                {/* Turntable Platter Base Stand with Metallic Edge & Degree Markers */}
                <div
                  className="absolute bottom-3 size-72 sm:size-96 rounded-full border-4 border-amber-800/40 bg-gradient-to-b from-[#331C12] via-[#20110A] to-[#120905] shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `perspective(900px) rotateX(68deg) rotateZ(${rotationY}deg)`,
                  }}
                >
                  {/* Turntable Compass Markers */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300/80">0° FRONT</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-amber-300/80">90°</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300/80">180° CRUMB</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-amber-300/80">270°</span>
                  <div className="absolute inset-4 rounded-full border border-dashed border-amber-500/20" />
                </div>

                {/* Central Cake Showcase with 360° Drag & Touch Pointer Events */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`relative size-72 sm:size-96 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-100 flex items-center justify-center touch-none ${
                    isDragging ? "cursor-grabbing ring-4 ring-amber-400/40 scale-[1.02]" : "cursor-grab hover:scale-[1.01]"
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateY(${((((rotationY % 90) + 90) % 90) - 45) * 0.25}deg) rotateX(${rotationX}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Real Multi-Angle 3D Photogrammetry Cake Frames */}
                  {(["front", "orbit", "crumb", "top"] as CakeAngle[]).map((ang) => {
                    const spec = CAKE_SPECS[ang];
                    const isActive = activeAngle === ang;
                    return (
                      <img
                        key={ang}
                        src={spec.image}
                        alt={spec.title}
                        className={`absolute inset-0 size-full object-cover select-none pointer-events-none transition-all duration-500 ease-out ${
                          isActive
                            ? "opacity-100 scale-100 z-10"
                            : "opacity-0 scale-[1.03] z-0"
                        }`}
                        draggable={false}
                      />
                    );
                  })}

                  {/* Dynamic Radial Lighting Highlight that shifts with rotation */}
                  <div
                    className="absolute inset-0 pointer-events-none z-20 transition-all duration-75"
                    style={{
                      background: `radial-gradient(ellipse 70% 70% at ${
                        50 + Math.sin((rotationY * Math.PI) / 180) * 28
                      }% ${
                        45 + Math.cos((rotationX * Math.PI) / 180) * 15
                      }%, rgba(255,255,255,0.18) 0%, transparent 65%)`,
                    }}
                  />

                  {/* Subtle Radial Bottom Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-20" />

                  {/* Anchored Glowing Die-Cut Labels (Adapts to Active Angle) */}
                  {currentCakeSpec.hotspots.map((hs, idx) => (
                    <div
                      key={idx}
                      className="absolute z-30 pointer-events-none transition-all duration-500 animate-in fade-in"
                      style={{
                        top: hs.top,
                        left: hs.left,
                        transform: `translateZ(25px)`,
                      }}
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-black/80 shadow-[2px_2px_0px_#000] ring-2 ring-white/40 ${hs.bg}`}
                      >
                        <Sparkles className="size-2.5" />
                        <span>{hs.label}</span>
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Interactive Spin & Angle Controls Bar */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpinClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <RotateCw className="size-3.5" />
                  <span>Next Angle ({activeAngle.toUpperCase()})</span>
                </button>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {normalizedDegree}° / 360°
                </span>
              </div>
            </div>

            {/* Spec Sheet & Macro Breakdown (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider">
                  Pure Craft Architecture · {activeAngle.toUpperCase()}
                </span>
                <h2 className="font-nimbus text-2xl sm:text-3xl text-white leading-tight">
                  {currentCakeSpec.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {currentCakeSpec.description}
                </p>
              </div>

              {/* 4 Macro Breakdown Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Calories / Slice</p>
                  <p className="font-sans font-black text-xl sm:text-2xl text-amber-300 mt-0.5 tracking-tight">
                    {currentCakeSpec.macros.calories}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Clean Protein</p>
                  <p className="font-sans font-black text-xl sm:text-2xl text-rose-300 mt-0.5 tracking-tight">
                    {currentCakeSpec.macros.protein}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Refined Sugars</p>
                  <p className="font-sans font-black text-xl sm:text-2xl text-emerald-300 mt-0.5 tracking-tight">
                    {currentCakeSpec.macros.sugar}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Dairy Butter</p>
                  <p className="font-sans font-black text-xl sm:text-2xl text-amber-200 mt-0.5 tracking-tight">
                    {currentCakeSpec.macros.butterfat}
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  asChild
                  className="flex-1 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm h-11 shadow-lift cursor-pointer"
                >
                  <Link to="/" className="flex items-center justify-center gap-2">
                    <span>Customize This Cake in Studio</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIs3dStudioOpen(true);
                    studio3dRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 font-bold text-xs sm:text-sm h-11 transition-all cursor-pointer"
                >
                  <Compass className="size-4" />
                  <span>Launch 3D Real Studio ↓</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. DUAL VIEW SYSTEM: EITHER COLLAGE ARTBOARD OR GUIDED STORY */}

      {viewMode === "collage" ? (
        /* ===================================================================== */
        /* MODE A: 🎨 DYNAMIC MULTI-LAYERED OVERLAPPING COLLAGE ARTBOARD */
        /* ===================================================================== */
        <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-berry" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Scrapbook Lookbook View · 4 Artisan Pillars
              </span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Hover & click pins on cards to explore
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            
            {/* 🌸 PINK CARD ("Our Story: Indulgence With a Healthy Twist") */}
            <div className="rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FFE8F0] via-[#FFD8E6] to-[#FFC2DA] text-[#2C1810] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#2C1810] hover:shadow-[12px_12px_0px_0px_#2C1810] transition-all duration-300 relative overflow-hidden flex flex-col justify-between lg:-rotate-1 lg:translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#E83181] shadow-[2px_2px_0px_#2C1810]">
                    Our Story
                  </span>
                  <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #01</span>
                </div>

                <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#E83181] uppercase leading-tight tracking-tight drop-shadow-xs">
                  INDULGENCE WITH A HEALTHY TWIST
                </h2>

                <p className="text-xs sm:text-sm text-[#4A1D2B] font-medium leading-relaxed">
                  We believe you shouldn't have to choose between rich artisanal pleasure and holistic wellness. Tap the numbered pins on our signature chocolate muffin to explore its clean pantry architecture.
                </p>
              </div>

              {/* Muffin Image with 4 Interactive Numbered Pins */}
              <div className="my-6 relative flex items-center justify-center">
                <div className="relative size-60 sm:size-72 rounded-3xl overflow-hidden border-2 border-[#2C1810] bg-white/60 shadow-md">
                  <img
                    src="/about/wellness-chocolate-muffin.jpg"
                    alt="Healthy Indulgence Chocolate Muffin"
                    className="w-full h-full object-cover select-none"
                  />

                  {/* Pin 1 */}
                  <button
                    type="button"
                    onClick={() => setActiveMuffinHotspot(1)}
                    className={`absolute top-[28%] left-[28%] size-8 rounded-full border-2 border-[#2C1810] flex items-center justify-center font-black text-xs transition-transform cursor-pointer shadow-[2px_2px_0px_#2C1810] ${
                      activeMuffinHotspot === 1
                        ? "bg-yellow-300 text-[#2C1810] scale-125 ring-4 ring-rose-400"
                        : "bg-yellow-300/90 text-[#2C1810] hover:scale-110"
                    }`}
                    aria-label="Dairy Free Ingredient"
                  >
                    1
                  </button>

                  {/* Pin 2 */}
                  <button
                    type="button"
                    onClick={() => setActiveMuffinHotspot(2)}
                    className={`absolute bottom-[24%] left-[30%] size-8 rounded-full border-2 border-[#2C1810] flex items-center justify-center font-black text-xs transition-transform cursor-pointer shadow-[2px_2px_0px_#2C1810] ${
                      activeMuffinHotspot === 2
                        ? "bg-yellow-300 text-[#2C1810] scale-125 ring-4 ring-rose-400"
                        : "bg-yellow-300/90 text-[#2C1810] hover:scale-110"
                    }`}
                    aria-label="Wheat Flour Ingredient"
                  >
                    2
                  </button>

                  {/* Pin 3 */}
                  <button
                    type="button"
                    onClick={() => setActiveMuffinHotspot(3)}
                    className={`absolute top-[32%] right-[28%] size-8 rounded-full border-2 border-[#2C1810] flex items-center justify-center font-black text-xs transition-transform cursor-pointer shadow-[2px_2px_0px_#2C1810] ${
                      activeMuffinHotspot === 3
                        ? "bg-yellow-300 text-[#2C1810] scale-125 ring-4 ring-rose-400"
                        : "bg-yellow-300/90 text-[#2C1810] hover:scale-110"
                    }`}
                    aria-label="High Protein Blend"
                  >
                    3
                  </button>

                  {/* Pin 4 */}
                  <button
                    type="button"
                    onClick={() => setActiveMuffinHotspot(4)}
                    className={`absolute bottom-[24%] right-[30%] size-8 rounded-full border-2 border-[#2C1810] flex items-center justify-center font-black text-xs transition-transform cursor-pointer shadow-[2px_2px_0px_#2C1810] ${
                      activeMuffinHotspot === 4
                        ? "bg-yellow-300 text-[#2C1810] scale-125 ring-4 ring-rose-400"
                        : "bg-yellow-300/90 text-[#2C1810] hover:scale-110"
                    }`}
                    aria-label="Sugar Free Sweeteners"
                  >
                    4
                  </button>
                </div>
              </div>

              {/* Active Pin Detailed Info Callout */}
              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-4 shadow-[3px_3px_0px_#2C1810] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-black text-sm text-[#E83181] uppercase tracking-wide">
                    Pin #{activeMuffinHotspot}: {MUFFIN_HOTSPOTS[activeMuffinHotspot - 1]?.badge}
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    {MUFFIN_HOTSPOTS[activeMuffinHotspot - 1]?.tag}
                  </span>
                </div>
                <p className="text-xs text-[#4A1D2B] leading-relaxed">
                  {MUFFIN_HOTSPOTS[activeMuffinHotspot - 1]?.description}
                </p>
                <div className="text-[11px] font-bold text-[#2C1810] pt-1 border-t border-rose-200">
                  ✨ {MUFFIN_HOTSPOTS[activeMuffinHotspot - 1]?.benefit}
                </div>
              </div>
            </div>

            {/* 💛 YELLOW CARD ("Our Mission: Experience the Full Taste of Wellness") */}
            <div className="rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FEF9B5] via-[#FFF380] to-[#FFE655] text-[#2C1810] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#2C1810] hover:shadow-[12px_12px_0px_0px_#2C1810] transition-all duration-300 relative overflow-hidden flex flex-col justify-between lg:rotate-1 lg:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#4A154B] shadow-[2px_2px_0px_#2C1810]">
                    Our Mission
                  </span>
                  <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #02</span>
                </div>

                <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#4A154B] uppercase leading-tight tracking-tight drop-shadow-xs">
                  EXPERIENCE THE FULL TASTE OF WELLNESS
                </h2>

                <p className="text-xs sm:text-sm text-[#4A154B] font-medium leading-relaxed">
                  Browse our complete range of healthy bakery snacks — each product crafted to meet your lifestyle without sacrificing flavor, rich aroma, or texture.
                </p>
              </div>

              {/* Visual Bakery Trio with Die-Cut Floating Stickers */}
              <div className="my-6 relative flex items-center justify-center">
                <div className="relative size-60 sm:size-72 rounded-3xl overflow-hidden border-2 border-[#2C1810] bg-white/70 shadow-md">
                  <img
                    src="/about/walnut-cupcake-trio.jpg"
                    alt="Gourmet Brownies and Cupcakes"
                    className="w-full h-full object-cover select-none"
                  />

                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#5C3218] text-amber-200 border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                      LACTOS-FREE
                    </span>
                  </div>

                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-300 text-yellow-950 border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] -rotate-6">
                      SUGAR-FREE
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-4 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF1493] text-white border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] rotate-3">
                      HIGH-PROTEIN
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Diet Filter Matrix */}
              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-3.5 shadow-[3px_3px_0px_#2C1810] space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4A154B] block">
                  Explore Recipes By Wellness Target
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {WELLNESS_DIETS.map((diet) => (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setActiveDietFilter(diet.id)}
                      className={`py-1.5 px-2 rounded-xl text-left border-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        activeDietFilter === diet.id
                          ? "bg-[#4A154B] text-white border-[#2C1810] shadow-[2px_2px_0px_#2C1810]"
                          : "bg-white/80 text-[#4A154B] border-[#2C1810]/40 hover:bg-yellow-200"
                      }`}
                    >
                      <span className="truncate text-[11px]">{diet.label}</span>
                      <span className="text-[10px] opacity-80 shrink-0 font-mono ml-1">{diet.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 🌿 MINT GREEN CARD ("Our Vision: A New Taste of Wellness") */}
            <div className="rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#C8F6EC] via-[#A6EFE0] to-[#88E4D2] text-[#2C1810] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#2C1810] hover:shadow-[12px_12px_0px_0px_#2C1810] transition-all duration-300 relative overflow-hidden flex flex-col justify-between lg:rotate-1 lg:translate-y-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#2E1854] shadow-[2px_2px_0px_#2C1810]">
                    Our Vision
                  </span>
                  <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #03</span>
                </div>

                <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#2E1854] uppercase leading-tight tracking-tight drop-shadow-xs">
                  A NEW TASTE OF WELLNESS
                </h2>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <span className="rounded-xl bg-white/80 border-2 border-[#2C1810] p-2.5 text-[10.5px] font-black text-[#2E1854] uppercase tracking-wide text-center shadow-[2px_2px_0px_#2C1810]">
                    Healthy snacking has never been this delicious
                  </span>
                  <span className="rounded-xl bg-white/80 border-2 border-[#2C1810] p-2.5 text-[10.5px] font-black text-[#2E1854] uppercase tracking-wide text-center shadow-[2px_2px_0px_#2C1810]">
                    Incredibly satisfying and fulfilling
                  </span>
                </div>
              </div>

              {/* Salted Caramel Cupcake Showcase with Floating Labels */}
              <div className="my-6 relative flex items-center justify-center">
                <div className="relative size-60 sm:size-72 rounded-3xl overflow-hidden border-2 border-[#2C1810] bg-white/70 shadow-md group">
                  <img
                    src="/about/salted-caramel-cupcake.jpg"
                    alt="Decadent Salted Caramel Cupcake"
                    className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-4 left-3 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-300 text-yellow-950 border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] -rotate-12">
                      SUGAR-FREE
                    </span>
                  </div>

                  <div className="absolute top-6 right-3 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#5C3218] text-amber-200 border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] rotate-6">
                      LACTOS-FREE
                    </span>
                  </div>

                  <div className="absolute bottom-6 right-3 pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF1493] text-white border-2 border-[#2C1810] text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] -rotate-3">
                      HIGH-PROTEIN
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-4 shadow-[3px_3px_0px_#2C1810] text-center">
                <p className="font-nimbus text-xs sm:text-sm font-bold text-[#2E1854] uppercase tracking-wide">
                  Guiding Healthy Indulgence with Zero Compromise on Flavor
                </p>
              </div>
            </div>

            {/* 🧁 CREAM-BEIGE CARD ("Our Values: From Our Oven to Your Heart") */}
            <div className="rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FFF8EC] via-[#FDF0DE] to-[#F8E3C8] text-[#2C1810] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#2C1810] hover:shadow-[12px_12px_0px_0px_#2C1810] transition-all duration-300 relative overflow-hidden flex flex-col justify-between lg:-rotate-1 lg:translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#5C3218] shadow-[2px_2px_0px_#2C1810]">
                    Our Values
                  </span>
                  <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #04</span>
                </div>

                <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#5C3218] uppercase leading-tight tracking-tight drop-shadow-xs">
                  FROM OUR OVEN TO YOUR HEART
                </h2>

                <p className="text-xs sm:text-sm text-[#5C3218] font-medium leading-relaxed">
                  Experience muffins, celebration cakes, and sourdoughs that put health, purity, and honesty first.
                </p>
              </div>

              {/* 4 Core Bakery Craft Value Pillars */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                  <span className="text-xl">🔥</span>
                  <h3 className="font-sans font-black text-xs sm:text-sm text-[#5C3218] uppercase">4:00 AM Dawn Bake</h3>
                  <p className="text-[10.5px] text-[#5C3218]/80 leading-snug font-medium">
                    Baked fresh every single morning for your slot.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                  <span className="text-xl">🌾</span>
                  <h3 className="font-sans font-black text-xs sm:text-sm text-[#5C3218] uppercase">36-Hour Wild Ferment</h3>
                  <p className="text-[10.5px] text-[#5C3218]/80 leading-snug font-medium">
                    Slow cold proofing for gut health and open crumb.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                  <span className="text-xl">🧈</span>
                  <h3 className="font-sans font-black text-xs sm:text-sm text-[#5C3218] uppercase">100% French Butter</h3>
                  <p className="text-[10.5px] text-[#5C3218]/80 leading-snug font-medium">
                    84% butterfat dairy. Zero margarine or palm oil.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                  <span className="text-xl">🍫</span>
                  <h3 className="font-sans font-black text-xs sm:text-sm text-[#5C3218] uppercase">70% Belgian Couverture</h3>
                  <p className="text-[10.5px] text-[#5C3218]/80 leading-snug font-medium">
                    Real cocoa butter and pure Bourbon vanilla beans.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-3 shadow-[3px_3px_0px_#2C1810] flex items-center justify-between text-xs font-bold text-[#5C3218]">
                <span>Zero Chemical Preservatives</span>
                <span className="text-emerald-700 font-extrabold">✓ Guaranteed Purity</span>
              </div>
            </div>

          </div>
        </section>
      ) : (
        /* ===================================================================== */
        /* MODE B: 📖 GUIDED STORY MODE (CHAPTER-BY-CHAPTER SPOTLIGHT IMMERSION) */
        /* ===================================================================== */
        <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-400">
          
          {/* Chapter Timeline Navigation Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                The Bakery Chronicles · Chapter {activeStoryChapter} of 4
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStoryChapter === 1}
                  onClick={() => setActiveStoryChapter((prev) => Math.max(1, prev - 1))}
                  className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  aria-label="Previous Chapter"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={activeStoryChapter === 4}
                  onClick={() => setActiveStoryChapter((prev) => Math.min(4, prev + 1))}
                  className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  aria-label="Next Chapter"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STORY_CHAPTERS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveStoryChapter(ch.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    activeStoryChapter === ch.id
                      ? "border-[#2C1810] bg-cocoa text-white shadow-md scale-[1.02]"
                      : "border-border/60 bg-card hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-80 mb-1">
                    <span>{ch.chapter}</span>
                    <span>{ch.tag}</span>
                  </div>
                  <p className="text-xs font-bold line-clamp-1">
                    {ch.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Full-Width Spotlight Chapter Stage */}
          <div
            className={`rounded-[2.5rem] border-[3.5px] ${currentChapter.borderColor} bg-gradient-to-br ${currentChapter.themeColor} text-[#2C1810] p-6 sm:p-10 shadow-[10px_10px_0px_0px_#2C1810] transition-all duration-500 relative overflow-hidden`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Narrative Story Column (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#2C1810]">
                    {currentChapter.chapter} · {currentChapter.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2C1810] text-white text-[11px] font-black uppercase shadow-xs">
                    {currentChapter.badge}
                  </span>
                </div>

                <h2 className={`font-blogh text-3xl sm:text-5xl ${currentChapter.textColor} uppercase leading-tight drop-shadow-xs`}>
                  {currentChapter.title}
                </h2>

                <p className="text-sm sm:text-base font-semibold text-[#2C1810]/90">
                  {currentChapter.subtitle}
                </p>

                <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-5 shadow-[3px_3px_0px_#2C1810]">
                  <p className="text-xs sm:text-sm text-[#2C1810] font-medium leading-relaxed">
                    "{currentChapter.narrative}"
                  </p>
                </div>

                {/* Chapter Interactive Tooling */}
                {activeStoryChapter === 1 && (
                  <div className="rounded-2xl border-2 border-[#2C1810] bg-white/95 p-4 shadow-[3px_3px_0px_#2C1810] space-y-3">
                    <span className="font-sans font-black text-xs uppercase text-[#E83181] block">
                      Active Chapter Ingredient Hot-Spot Explorer:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {MUFFIN_HOTSPOTS.map((hs) => (
                        <button
                          key={hs.id}
                          type="button"
                          onClick={() => setActiveMuffinHotspot(hs.id)}
                          className={`p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            activeMuffinHotspot === hs.id
                              ? "bg-rose-50 border-rose-500 text-rose-950 font-black shadow-2xs"
                              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="block text-[10px] opacity-70">Pin #{hs.id}</span>
                          <span className="truncate block">{hs.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeStoryChapter === 2 && (
                  <div className="rounded-2xl border-2 border-[#2C1810] bg-white/95 p-4 shadow-[3px_3px_0px_#2C1810] space-y-3">
                    <span className="font-sans font-black text-xs uppercase text-[#4A154B] block">
                      Mission Dietary Filter Testing:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {WELLNESS_DIETS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setActiveDietFilter(d.id)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                            activeDietFilter === d.id
                              ? "bg-[#4A154B] text-white border-[#2C1810]"
                              : "bg-white text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          {d.label} ({d.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeStoryChapter === 3 && (
                  <div className="rounded-2xl border-2 border-[#2C1810] bg-white/95 p-4 shadow-[3px_3px_0px_#2C1810] grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-xl bg-teal-50 border border-teal-200">
                      <p className="text-[10px] font-bold text-teal-800 uppercase">Target Glycemic Index</p>
                      <p className="font-sans font-black text-lg text-teal-950">&lt; 35 GI (Low)</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-teal-50 border border-teal-200">
                      <p className="text-[10px] font-bold text-teal-800 uppercase">Satiety Score</p>
                      <p className="font-sans font-black text-lg text-teal-950">98% Satisfying</p>
                    </div>
                  </div>
                )}

                {activeStoryChapter === 4 && (
                  <div className="rounded-2xl border-2 border-[#2C1810] bg-white/95 p-4 shadow-[3px_3px_0px_#2C1810] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-black text-xs uppercase text-[#5C3218] block">
                        Our Morning Hearth Schedule:
                      </span>
                      <div className="size-8 shrink-0 rounded-xl overflow-hidden bg-amber-100 border border-[#2C1810]/30 flex items-center justify-center">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="size-full object-contain pointer-events-none"
                        >
                          <source
                            src="/illustration/people-walking-together-outdoors-urban-lifestyle-and-daily-routine.webm"
                            type="video/webm"
                          />
                          <source
                            src="/illustration/people-walking-together-outdoors-urban-lifestyle-and-daily-routine.mp4"
                            type="video/mp4"
                          />
                        </video>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-amber-800">4:00 AM</p>
                        <p className="text-amber-950">Deck Hearth Fire</p>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-amber-800">6:30 AM</p>
                        <p className="text-amber-950">First Sourdough Out</p>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-amber-800">8:00 AM</p>
                        <p className="text-amber-950">Counter Opens</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chapter Next / Prev Step Controls */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    disabled={activeStoryChapter === 1}
                    onClick={() => setActiveStoryChapter((prev) => Math.max(1, prev - 1))}
                    className="rounded-full border-[#2C1810] text-[#2C1810] hover:bg-white/50 font-bold text-xs cursor-pointer"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    <span>Previous Chapter</span>
                  </Button>

                  {activeStoryChapter < 4 ? (
                    <Button
                      onClick={() => setActiveStoryChapter((prev) => Math.min(4, prev + 1))}
                      className="rounded-full bg-[#2C1810] text-white hover:bg-[#2C1810]/90 font-bold text-xs cursor-pointer shadow-md"
                    >
                      <span>Next: Chapter {activeStoryChapter + 1}</span>
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="rounded-full bg-emerald-700 text-white hover:bg-emerald-600 font-bold text-xs cursor-pointer shadow-md"
                    >
                      <Link to="/shop">
                        <span>Explore Our Counter Bakes</span>
                        <ArrowRight className="size-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* High-Resolution Chapter Visual Column (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative size-72 sm:size-96 rounded-3xl overflow-hidden border-4 border-[#2C1810] bg-white shadow-2xl">
                  <img
                    src={currentChapter.image}
                    alt={currentChapter.imageAlt}
                    className="w-full h-full object-cover select-none animate-in fade-in zoom-in-95 duration-500"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-[#2C1810] p-3 shadow-md">
                    <p className="font-blogh text-xs sm:text-sm text-[#2C1810] uppercase text-center">
                      Ani Bakes · Certified Artisan Standard
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </section>
      )}

      {/* 4. Real-Time WebGL 3D GLB Model Atelier (Accessible via center button) */}
      <section ref={studio3dRef} id="3d-cake-studio" className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        {!is3dStudioOpen ? (
          <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-border/80 bg-gradient-to-br from-[#2C1810] via-[#1D0F0A] to-[#120704] text-white p-8 sm:p-14 shadow-2xl text-center">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-berry/25 blur-3xl" />

            <div className="relative mx-auto max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 shadow-xs">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>Interactive WebGL 3D Experience</span>
              </span>

              <h2 className="font-blogh text-2xl sm:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide leading-tight">
                See how our cakes look in real world 3D
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
                Rotate, orbit, zoom, and inspect every hand-piped caramel rosette, 24K gold foil crumb, and dietary macro telemetry in our real-time 3D studio.
              </p>

              {/* Center Launch Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setIs3dStudioOpen(true)}
                  className="rounded-2xl bg-amber-400 text-black hover:bg-amber-300 font-extrabold text-xs sm:text-sm h-12 px-8 shadow-lift transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="size-4 text-black" />
                  <span>Launch 3D Real-World Studio (360° Free Orbit)</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-cocoa uppercase tracking-wider">
                  Live WebGL 3D Studio Active
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIs3dStudioOpen(false)}
                className="rounded-xl border-border text-xs font-semibold text-muted-foreground hover:text-cocoa cursor-pointer"
              >
                Collapse 3D Studio ↑
              </Button>
            </div>
            <Cake3dModelViewer />
          </div>
        )}
      </section>

      {/* 5. Safe & Secure Delivery Packaging Showcase */}
      <DeliverySecurityShowcase />

      {/* 5. Bottom Bakery Call-To-Action */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl border-2 border-border/80 bg-card p-8 sm:p-12 shadow-soft space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 border border-berry/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-berry">
            <Sparkles className="size-3.5" />
            <span>Ready for fresh indulgence?</span>
          </span>
          
          <h2 className="font-nimbus text-3xl sm:text-4xl font-bold text-cocoa leading-tight">
            Order your fresh morning slot today
          </h2>
          
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Reserve your sourdough loaves, lamination pastries, and custom celebration cakes before tomorrow's bake queue fills up.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              asChild
              size="default"
              className="rounded-full bg-cocoa text-background hover:bg-cocoa/90 font-bold text-xs sm:text-sm h-11 px-7 shadow-lift cursor-pointer"
            >
              <Link to="/shop" className="flex items-center gap-2">
                <span>Browse Daily Counter Bakes</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="default"
              className="rounded-full border-cocoa/40 text-cocoa hover:bg-secondary font-bold text-xs sm:text-sm h-11 px-7 cursor-pointer"
            >
              <Link to="/">
                <span>Open Cake Studio Atelier</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
