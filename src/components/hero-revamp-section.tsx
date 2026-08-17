import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const FLAVORS = [
  {
    id: "strawberry",
    pillBg: "bg-[#D61B6B] hover:bg-[#E52579]",
    textColor: "text-white",
    borderColor: "border-[#B01456]/60",
    label: "Natural flavors",
    title: "Pink Strawberry Nonpareil Donut",
    image: "/hero/mini-strawberry-donut.jpg",
    heroImage: "/hero/hero-3d-donut-sprinkles.jpg",
    accentColor: "#F31260",
    canvasBg: "#E3A9B8",
    word: "DONUTING",
    headlineHighlight: "FRESH GLAZED DONUTS",
  },
  {
    id: "mango",
    pillBg: "bg-[#E6A817] hover:bg-[#F2B624]",
    textColor: "text-[#3A1C14]",
    borderColor: "border-[#C98E08]/60",
    label: "Real ingredients",
    title: "Velvet Mango Cheesecake",
    image: "/hero/mini-mango-cheesecake.jpg",
    heroImage: "/hero/hero-3d-mango-cheesecake.jpg",
    accentColor: "#F5A524",
    canvasBg: "#E8C982",
    word: "CHEESECAKING",
    headlineHighlight: "MANGO CHEESECAKE",
  },
  {
    id: "blueberry",
    pillBg: "bg-[#483270] hover:bg-[#5A408A]",
    textColor: "text-white",
    borderColor: "border-[#3A2460]/60",
    label: "Artisanal magic",
    title: "Wild Blueberry Layer Cake",
    image: "/hero/mini-blueberry-cake.jpg",
    heroImage: "/hero/hero-3d-blueberry-cake.jpg",
    accentColor: "#9353D3",
    canvasBg: "#AA94C9",
    word: "CAKING",
    headlineHighlight: "BLUEBERRY VELVET CAKE",
  },
];

export function HeroRevampSection() {
  const [activeFlavor, setActiveFlavor] = useState<(typeof FLAVORS)[number]>(FLAVORS[0]!);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: activeFlavor.canvasBg }}
      className="w-full min-h-[92vh] lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center text-[#3A1C14] overflow-hidden relative transition-colors duration-700 py-6 sm:py-8 lg:py-10"
    >
      {/* Ambient Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 size-[32rem] rounded-full bg-[#DE1D72]/15 blur-3xl"
      />

      {/* Floating Decorative Sprinkle Particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-12 left-1/6 size-3.5 rounded-full bg-[#00C2FF] shadow-xs animate-bounce"
        style={{ animationDuration: "3.2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-1/6 size-3 rounded-full bg-[#FFE600] shadow-xs animate-bounce"
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-1/5 size-3.5 rounded-full bg-[#7828C8] shadow-xs animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 right-1/4 size-3 rounded-full bg-[#17C964] shadow-xs animate-bounce"
        style={{ animationDuration: "3.6s", animationDelay: "0.8s" }}
      />

      {/* Main Vertical Hero Container */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-7 my-auto text-center">
        
        {/* 1. [TOP]: Clean Bold Blogh Headline */}
        <div className="max-w-4xl mx-auto space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] text-[#2C101B]/80 backdrop-blur">
            <Sparkles className="size-3.5 text-[#C71585]" /> Artisanal Confectionery Studio
          </span>
          <h1 className="font-blogh text-4xl sm:text-6xl lg:text-7xl text-[#2C101B] tracking-tight leading-[1.02] drop-shadow-xs">
            PURE JOY IN <br className="hidden xs:inline" />
            <span className="text-[#8B1058] transition-colors duration-500">
              {activeFlavor.headlineHighlight}
            </span>
          </h1>
        </div>

        {/* 2. [MIDDLE]: Seamless 3D Pastry Photo with 3D Depth Typography */}
        <div className="relative w-full max-w-3xl flex items-center justify-center min-h-[260px] sm:min-h-[380px] lg:min-h-[440px]">
          
          {/* Scalloped Starburst Die-Cut Badge ("Explore Flavors") */}
          <div
            className="absolute -top-3 left-4 sm:top-2 sm:left-12 z-30 animate-pulse pointer-events-none"
            style={{ animationDuration: "4s" }}
          >
            <div className="relative size-18 sm:size-24 flex items-center justify-center">
              {/* 12-point SVG scalloped starburst */}
              <svg
                viewBox="0 0 100 100"
                className="size-full fill-[#C71585] text-[#C71585] drop-shadow-lg transition-transform duration-500 hover:rotate-45"
              >
                <path d="M50 0 C53 10 58 15 68 18 C78 21 82 28 82 38 C82 48 88 53 96 60 C104 67 100 76 92 82 C84 88 81 95 72 98 C63 101 55 96 50 100 C45 96 37 101 28 98 C19 95 16 88 8 82 C0 76 -4 67 4 60 C12 53 18 48 18 38 C18 28 22 21 32 18 C42 15 47 10 50 0 Z" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="font-sans font-black text-[9px] sm:text-[11px] uppercase text-white leading-tight">
                  Explore
                </span>
                <span className="font-sans font-black text-[9px] sm:text-[11px] uppercase text-white leading-tight">
                  Flavors
                </span>
                <span className="text-[9px] text-yellow-200 mt-0.5">✨</span>
              </div>
            </div>
          </div>

          {/* Giant 3D Depth Typography in Blogh font: "DONUTING" / "CHEESECAKING" / "CAKING" */}
          <div
            className="absolute -top-6 sm:-top-10 right-2 sm:right-8 z-10 pointer-events-none select-none"
            style={{
              transform: `perspective(800px) rotateZ(-12deg) rotateY(${mousePos.x * 14}deg) rotateX(${-mousePos.y * 14}deg)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <div className="relative">
              {/* 3D Extrusion Depth Shadow Layers */}
              <span
                aria-hidden
                className="absolute top-3.5 left-3.5 font-blogh text-6xl sm:text-8xl lg:text-[10rem] text-[#550838] opacity-50 tracking-tight"
              >
                {activeFlavor.word}
              </span>
              <span
                aria-hidden
                className="absolute top-2 left-2 font-blogh text-6xl sm:text-8xl lg:text-[10rem] text-[#7A0D50] opacity-70 tracking-tight"
              >
                {activeFlavor.word}
              </span>
              {/* Top Face */}
              <span className="relative font-blogh text-6xl sm:text-8xl lg:text-[10rem] text-[#B01777] tracking-tight drop-shadow-lg">
                {activeFlavor.word}
              </span>
            </div>
          </div>

          {/* Seamless 3D Floating Pastry (No bounding box / card frame) */}
          <div
            className="relative z-20 w-full max-w-lg sm:max-w-xl lg:max-w-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg) scale(1.03)`,
            }}
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center">
              {/* Seamlessly blended 3D model matching canvas background */}
              <img
                key={activeFlavor.id}
                src={activeFlavor.heroImage}
                alt={activeFlavor.title}
                className="size-full object-cover transition-all duration-700 pointer-events-none drop-shadow-2xl"
                style={{
                  maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 48%, transparent 94%)",
                  WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 48%, transparent 94%)",
                }}
              />

              {/* Floating Telemetry Tooltip Badge */}
              <div className="absolute -bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-[#2C101B] backdrop-blur shadow-lg border border-white/80 whitespace-nowrap">
                <span
                  className="size-2 sm:size-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: activeFlavor.accentColor }}
                />
                <span>{activeFlavor.title}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. [BOTTOM]: 3 Flavor Pill Buttons & Quick Action CTAs */}
        <div className="w-full flex flex-col items-center gap-4 sm:gap-5 pt-2 sm:pt-3">
          
          {/* The 3 Interactive Flavor Pills in a Horizontal Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full">
            {FLAVORS.map((flavor, index) => {
              const isSelected = activeFlavor.id === flavor.id;
              return (
                <button
                  key={flavor.id}
                  type="button"
                  onClick={() => setActiveFlavor(flavor)}
                  className={`group relative flex items-center rounded-full ${flavor.pillBg} ${flavor.textColor} p-1.5 pr-4 sm:pr-5 shadow-lg border ${flavor.borderColor} transition-all duration-300 hover:scale-[1.04] active:scale-98 cursor-pointer ${
                    isSelected
                      ? "ring-4 ring-white/95 shadow-xl scale-[1.04] z-20"
                      : "opacity-85 hover:opacity-100"
                  }`}
                  style={{
                    transform: `rotate(${index === 0 ? "-2deg" : index === 1 ? "0deg" : "2deg"})`,
                  }}
                >
                  {/* Circular Product Thumbnail */}
                  <div className="size-9 sm:size-11 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-white/20 p-0.5">
                    <img
                      src={flavor.image}
                      alt={flavor.label}
                      className="size-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    />
                  </div>

                  {/* Pill Label Text */}
                  <div className="ml-2.5 sm:ml-3 text-left">
                    <span className="block text-xs sm:text-sm font-black tracking-wide leading-tight">
                      {flavor.label}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] opacity-90 font-semibold leading-tight mt-0.5">
                      {flavor.id === "strawberry"
                        ? "Strawberry Donut"
                        : flavor.id === "mango"
                          ? "Mango Cheesecake"
                          : "Blueberry Cake"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col xs:flex-row items-center justify-center gap-3 pt-1 w-full max-w-md">
            <Button
              asChild
              size="default"
              className="w-full xs:w-auto rounded-full bg-[#2C101B] hover:bg-[#45182C] text-white px-7 sm:px-9 py-5 sm:py-6 text-xs sm:text-sm font-black shadow-xl transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <Link to="/shop">
                Browse Fresh Counter <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="default"
              variant="outline"
              className="w-full xs:w-auto rounded-full border-2 border-white/80 bg-white/80 hover:bg-white text-[#2C101B] px-6 sm:px-8 py-5 sm:py-6 text-xs sm:text-sm font-bold backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <Link to="/offers">Daily Specials & Slots</Link>
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default HeroRevampSection;
