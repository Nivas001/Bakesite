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
  Eye,
  MousePointerClick,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    macros: { calories: string; protein: string; sugar: string; butterfat: string };
    hotspots: Array<{ top: string; left: string; label: string; bg: string }>;
  }
> = {
  front: {
    title: "3-Tier Dark Chocolate & Salted Caramel Masterpiece",
    description:
      "Exposed 70% dark Belgian cocoa sponge layers stacked with organic coconut milk caramel cream and dripping couverture ganache.",
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
    macros: { calories: "185 kcal", protein: "14g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "30%", left: "40%", label: "Organic Wheat Germ", bg: "bg-yellow-400 text-yellow-950" },
      { top: "55%", left: "60%", label: "Cold Retard Crust", bg: "bg-amber-700 text-white" },
    ],
  },
  top: {
    title: "Gilded Crown & Truffle Centerpiece",
    description:
      "A coronation of 4 hand-rolled dark chocolate truffles dusted with edible 24K gold dust and sea salt flakes.",
    macros: { calories: "190 kcal", protein: "12g", sugar: "0g Refined", butterfat: "84% French" },
    hotspots: [
      { top: "20%", left: "50%", label: "Gilded Spheres", bg: "bg-amber-400 text-amber-950" },
      { top: "50%", left: "30%", label: "Caramel Rosettes", bg: "bg-orange-500 text-white" },
    ],
  },
};

const WELLNESS_DIETS = [
  { id: "all", label: "All Wellness Bakes", count: "18 Bakes" },
  { id: "sugarfree", label: "Sugar-Free Monkfruit", count: "8 Bakes" },
  { id: "highprotein", label: "High-Protein Blend", count: "6 Bakes" },
  { id: "dairyfree", label: "Lactose-Free & Vegan", count: "7 Bakes" },
];

export function AboutUsPage() {
  const [activeMuffinHotspot, setActiveMuffinHotspot] = useState<number>(1);
  const [activeAngle, setActiveAngle] = useState<CakeAngle>("front");
  const [activeDietFilter, setActiveDietFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"collage" | "story">("collage");
  const [isRotating, setIsRotating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const heroCardRef = useRef<HTMLDivElement>(null);
  const currentCakeSpec = CAKE_SPECS[activeAngle];

  function handleSpinClick() {
    setIsRotating(true);
    const angles: CakeAngle[] = ["front", "orbit", "crumb", "top"];
    const nextIdx = (angles.indexOf(activeAngle) + 1) % angles.length;
    setActiveAngle(angles[nextIdx]!);
    setShowTooltip(false);
    setTimeout(() => setIsRotating(false), 600);
  }

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

          {/* Interactive Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border/70 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("collage")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "collage"
                  ? "bg-cocoa text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Collage Artboard</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("story")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "story"
                  ? "bg-cocoa text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3.5" />
              <span>Guided Story</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Central 3D Hero Cake Explorer ("The Core Wellness Cake") */}
      <section className="py-6 px-4 sm:px-6 max-w-6xl mx-auto">
        <div
          ref={heroCardRef}
          className="relative rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-b from-[#1C120C] via-[#2A1810] to-[#180E08] text-white p-6 sm:p-10 shadow-2xl overflow-hidden group"
        >
          {/* Ambient Lighting & Glows */}
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

          {/* Top Bar inside the Hero Canvas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-5">
            <div className="flex items-center gap-2">
              <span className="flex size-3 rounded-full bg-amber-400 animate-ping" />
              <span className="font-blogh text-lg sm:text-xl text-amber-300 uppercase tracking-wide">
                Interactive 3D Cake Atelier
              </span>
            </div>

            {/* Angle Navigation Pills */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/15">
              {(["front", "orbit", "crumb", "top"] as CakeAngle[]).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => {
                    setActiveAngle(angle);
                    setShowTooltip(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeAngle === angle
                      ? "bg-amber-400 text-black shadow-xs font-black"
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
              
              {/* Interactive Tooltip Trigger */}
              {showTooltip && (
                <div className="absolute -top-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl animate-bounce pointer-events-none">
                  <MousePointerClick className="size-3.5 text-amber-600" />
                  <span>Click to spin and explore ingredient layers</span>
                </div>
              )}

              {/* Central Cake Showcase with 3D Hover & Click-to-Spin */}
              <div
                onClick={handleSpinClick}
                className="relative size-72 sm:size-96 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-500 group-hover:scale-[1.02] flex items-center justify-center"
              >
                <img
                  src="/about/hero-3d-caramel-cake.jpg"
                  alt="3D Dark Chocolate & Salted Caramel Cake"
                  className={`w-full h-full object-cover select-none transition-all duration-700 ${
                    isRotating ? "rotate-3 scale-105" : ""
                  }`}
                />

                {/* Subtle Radial Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Anchored Glowing Die-Cut Labels */}
                {currentCakeSpec.hotspots.map((hs, idx) => (
                  <div
                    key={idx}
                    className="absolute z-20 pointer-events-none transition-all duration-500 animate-in fade-in"
                    style={{ top: hs.top, left: hs.left }}
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

              {/* Interactive Spin Controls Bar */}
              <button
                type="button"
                onClick={handleSpinClick}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <RotateCw className={`size-3.5 ${isRotating ? "animate-spin" : ""}`} />
                <span>Spin 3D Cake Angle ({activeAngle.toUpperCase()})</span>
              </button>
            </div>

            {/* Spec Sheet & Macro Breakdown (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider">
                  Pure Craft Architecture
                </span>
                <h2 className="font-blogh text-2xl sm:text-3xl text-white leading-tight">
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
                  <p className="font-blogh text-xl sm:text-2xl text-amber-300 mt-0.5">
                    {currentCakeSpec.macros.calories}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Clean Protein</p>
                  <p className="font-blogh text-xl sm:text-2xl text-rose-300 mt-0.5">
                    {currentCakeSpec.macros.protein}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Refined Sugars</p>
                  <p className="font-blogh text-xl sm:text-2xl text-emerald-300 mt-0.5">
                    {currentCakeSpec.macros.sugar}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Dairy Butter</p>
                  <p className="font-blogh text-xl sm:text-2xl text-amber-200 mt-0.5">
                    {currentCakeSpec.macros.butterfat}
                  </p>
                </div>
              </div>

              {/* CTA button */}
              <div className="pt-2">
                <Button
                  asChild
                  className="w-full rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm h-11 shadow-lift cursor-pointer"
                >
                  <Link to="/" className="flex items-center justify-center gap-2">
                    <span>Customize This Cake in Studio</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. The 4 Multi-Layered Floating Pastel Collage Cards */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${viewMode === "collage" ? "lg:gap-y-12" : "gap-6"}`}>
          
          {/* ========================================================= */}
          {/* CARD 1: 🌸 PINK CARD ("Our Story: Indulgence With a Healthy Twist") */}
          {/* ========================================================= */}
          <div
            className={`rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FFE8F0] via-[#FFD8E6] to-[#FFC2DA] text-[#2C1810] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#2C1810] transition-all duration-300 hover:shadow-[10px_10px_0px_0px_#2C1810] relative overflow-hidden flex flex-col justify-between ${
              viewMode === "collage" ? "lg:-rotate-1 lg:translate-y-2" : ""
            }`}
          >
            {/* Soft Wavy Watermark Contours */}
            <div className="absolute -top-12 -right-12 size-60 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#E83181] shadow-[2px_2px_0px_#2C1810]">
                  Our Story
                </span>
                <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #01</span>
              </div>

              {/* Header in Blogh Font */}
              <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#E83181] uppercase leading-tight tracking-tight drop-shadow-xs">
                Indulgence with a healthy twist
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

                {/* 4 Interactive Star Hot-Spots (1, 2, 3, 4) */}
                {/* Pin 1: Top-Left */}
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

                {/* Pin 2: Bottom-Left */}
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

                {/* Pin 3: Top-Right */}
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

                {/* Pin 4: Bottom-Right */}
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
                <span className="font-blogh text-sm text-[#E83181] uppercase tracking-wide">
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

          {/* ========================================================= */}
          {/* CARD 2: 💛 YELLOW CARD ("Our Mission: Experience the Full Taste of Wellness") */}
          {/* ========================================================= */}
          <div
            className={`rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FEF9B5] via-[#FFF380] to-[#FFE655] text-[#2C1810] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#2C1810] transition-all duration-300 hover:shadow-[10px_10px_0px_0px_#2C1810] relative overflow-hidden flex flex-col justify-between ${
              viewMode === "collage" ? "lg:rotate-1 lg:-translate-y-2" : ""
            }`}
          >
            {/* Contour Glow */}
            <div className="absolute -bottom-10 -left-10 size-60 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#4A154B] shadow-[2px_2px_0px_#2C1810]">
                  Our Mission
                </span>
                <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #02</span>
              </div>

              {/* Header in Blogh Font */}
              <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#4A154B] uppercase leading-tight tracking-tight drop-shadow-xs">
                Experience the full taste of wellness
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

                {/* Floating Die-Cut Badges (Matching Reference) */}
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

          {/* ========================================================= */}
          {/* CARD 3: 🌿 MINT GREEN CARD ("Our Vision: A New Taste of Wellness") */}
          {/* ========================================================= */}
          <div
            className={`rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#C8F6EC] via-[#A6EFE0] to-[#88E4D2] text-[#2C1810] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#2C1810] transition-all duration-300 hover:shadow-[10px_10px_0px_0px_#2C1810] relative overflow-hidden flex flex-col justify-between ${
              viewMode === "collage" ? "lg:rotate-1 lg:translate-y-4" : ""
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#2E1854] shadow-[2px_2px_0px_#2C1810]">
                  Our Vision
                </span>
                <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #03</span>
              </div>

              {/* Header in Blogh Font */}
              <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#2E1854] uppercase leading-tight tracking-tight drop-shadow-xs">
                A new taste of wellness
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

                {/* Floating Die-Cut Labels */}
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

            {/* Vision Quote Footer */}
            <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-4 shadow-[3px_3px_0px_#2C1810] text-center">
              <p className="font-blogh text-xs sm:text-sm text-[#2E1854] uppercase tracking-wide">
                Guiding Healthy Indulgence with 0% Compromise on Flavor
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 4: 🧁 CREAM-BEIGE CARD ("Our Values: From Our Oven to Your Heart") */}
          {/* ========================================================= */}
          <div
            className={`rounded-[2.5rem] border-[3.5px] border-[#2C1810] bg-gradient-to-br from-[#FFF8EC] via-[#FDF0DE] to-[#F8E3C8] text-[#2C1810] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#2C1810] transition-all duration-300 hover:shadow-[10px_10px_0px_0px_#2C1810] relative overflow-hidden flex flex-col justify-between ${
              viewMode === "collage" ? "lg:-rotate-1 lg:translate-y-2" : ""
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[#2C1810] px-3 py-1 text-[11px] font-black uppercase text-[#5C3218] shadow-[2px_2px_0px_#2C1810]">
                  Our Values
                </span>
                <span className="font-mono text-xs font-black text-[#2C1810]/70">PILLAR #04</span>
              </div>

              {/* Header in Blogh Font */}
              <h2 className="font-blogh text-3xl sm:text-4xl lg:text-5xl text-[#5C3218] uppercase leading-tight tracking-tight drop-shadow-xs">
                From our oven to your heart
              </h2>

              <p className="text-xs sm:text-sm text-[#5C3218] font-medium leading-relaxed">
                Experience muffins, celebration cakes, and sourdoughs that put health, purity, and honesty first.
              </p>
            </div>

            {/* 4 Core Bakery Craft Value Pillars */}
            <div className="grid grid-cols-2 gap-3 my-6">
              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                <span className="text-xl">🔥</span>
                <h3 className="font-blogh text-xs sm:text-sm text-[#5C3218] uppercase">4:00 AM Dawn Bake</h3>
                <p className="text-[10.5px] text-[#5C3218]/80 leading-snug">
                  Baked fresh every single morning for your slot.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                <span className="text-xl">🌾</span>
                <h3 className="font-blogh text-xs sm:text-sm text-[#5C3218] uppercase">36-Hour Wild Ferment</h3>
                <p className="text-[10.5px] text-[#5C3218]/80 leading-snug">
                  Slow cold proofing for gut health and open crumb.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                <span className="text-xl">🧈</span>
                <h3 className="font-blogh text-xs sm:text-sm text-[#5C3218] uppercase">100% French Butter</h3>
                <p className="text-[10.5px] text-[#5C3218]/80 leading-snug">
                  84% butterfat dairy. Zero margarine or palm oil.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-[#2C1810] bg-white/85 p-3 shadow-[2px_2px_0px_#2C1810] space-y-1">
                <span className="text-xl">🍫</span>
                <h3 className="font-blogh text-xs sm:text-sm text-[#5C3218] uppercase">70% Belgian Callebaut</h3>
                <p className="text-[10.5px] text-[#5C3218]/80 leading-snug">
                  Real cocoa butter and pure Bourbon vanilla beans.
                </p>
              </div>
            </div>

            {/* Bottom Value Guarantee Pill */}
            <div className="rounded-2xl border-2 border-[#2C1810] bg-white/90 p-3 shadow-[3px_3px_0px_#2C1810] flex items-center justify-between text-xs font-bold text-[#5C3218]">
              <span>Zero Chemical Preservatives</span>
              <span className="text-emerald-700 font-extrabold">✓ Guaranteed Purity</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Bottom Bakery Call-To-Action */}
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
