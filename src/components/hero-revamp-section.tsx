import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FLAVORS = [
  {
    id: "blueberry",
    pillBg: "bg-[#2D1B4E] hover:bg-[#3D256B]",
    textColor: "text-white",
    borderColor: "border-[#4A2D80]/60",
    label: "Artisanal magic",
    title: "Wild Blueberry & Violet Glaze",
    image: "/hero/mini-blueberry-donut.jpg",
    heroImage: "/hero/hero-3d-blueberry-donut.jpg",
    accentColor: "#9353D3",
    word: "DONUTING",
  },
  {
    id: "caramel",
    pillBg: "bg-[#F7BC1E] hover:bg-[#FFC72C]",
    textColor: "text-[#3A1C14]",
    borderColor: "border-[#E5A80B]/60",
    label: "Real ingredients",
    title: "Golden Honey Caramel Glaze",
    image: "/hero/mini-caramel-donut.jpg",
    heroImage: "/hero/hero-3d-caramel-donut.jpg",
    accentColor: "#F5A524",
    word: "CRAFTING",
  },
  {
    id: "strawberry",
    pillBg: "bg-[#D61B6B] hover:bg-[#E52579]",
    textColor: "text-white",
    borderColor: "border-[#B01456]/60",
    label: "Natural flavors",
    title: "Pink Strawberry Nonpareil",
    image: "/hero/mini-strawberry-donut.jpg",
    heroImage: "/hero/hero-3d-donut-sprinkles.jpg",
    accentColor: "#F31260",
    word: "DONUTING",
  },
];

export function HeroRevampSection() {
  const [activeFlavor, setActiveFlavor] = useState<(typeof FLAVORS)[number]>(FLAVORS[2]!);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#FFAED1] via-[#F89BBF] to-[#FFA3C8] text-[#3A1C14] overflow-hidden relative border-b border-white/30">
      {/* Soft Background Wave Contours */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
      >
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path
            d="M0,200 C300,350 700,50 1000,220 L1000,600 L0,600 Z"
            fill="white"
            opacity="0.3"
          />
          <path
            d="M0,380 C400,250 600,480 1000,320 L1000,600 L0,600 Z"
            fill="white"
            opacity="0.25"
          />
        </svg>
      </div>

      {/* Ambient Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 size-80 rounded-full bg-white/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-[#DE1D72]/25 blur-3xl"
      />

      {/* Floating Decorative Sprinkle Particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/3 size-3 rounded-full bg-[#00C2FF] shadow-xs animate-bounce"
        style={{ animationDuration: "3.2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-1/4 size-2.5 rounded-full bg-[#FFE600] shadow-xs animate-bounce"
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-12 left-1/4 size-3.5 rounded-full bg-[#7828C8] shadow-xs animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 right-1/3 size-3 rounded-full bg-[#17C964] shadow-xs animate-bounce"
        style={{ animationDuration: "3.6s", animationDelay: "0.8s" }}
      />

      {/* Main Hero Container */}
      <section
        onMouseMove={handleMouseMove}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 py-7 sm:py-10 lg:py-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Clean Blogh Headline, Floating Flavor Pills & CTAs (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4 sm:gap-6">
            
            {/* Bold Blogh Headline */}
            <div>
              <h1 className="font-blogh text-4xl sm:text-5xl lg:text-6xl text-[#2C101B] tracking-tight leading-[1.02]">
                PURE JOY IN <br />
                <span className="text-[#A8156C]">EVERY FRESH GLAZE</span>
              </h1>
            </div>

            {/* Floating Flavor Pills (Click to switch 3D Hero Donut) */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="space-y-2.5">
                {FLAVORS.map((flavor, index) => {
                  const isSelected = activeFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setActiveFlavor(flavor)}
                      className={`group relative flex items-center w-full max-w-sm rounded-full ${flavor.pillBg} ${flavor.textColor} p-1.5 pr-5 sm:pr-6 shadow-md border ${flavor.borderColor} transition-all duration-300 hover:scale-[1.03] active:scale-98 cursor-pointer ${
                        isSelected ? "ring-3 ring-white/90 shadow-lg scale-[1.03]" : "opacity-90 hover:opacity-100"
                      }`}
                      style={{
                        transform: `rotate(${index === 0 ? "-2deg" : index === 1 ? "1deg" : "-1deg"})`,
                      }}
                    >
                      {/* Circular Donut Thumbnail */}
                      <div className="size-11 sm:size-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-white/20 p-0.5">
                        <img
                          src={flavor.image}
                          alt={flavor.label}
                          className="size-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                        />
                      </div>

                      {/* Pill Label Text */}
                      <div className="ml-3 sm:ml-4 text-left flex-1">
                        <span className="block text-xs sm:text-sm font-black tracking-wide">
                          {flavor.label}
                        </span>
                        <span className="block text-[10px] opacity-85 font-medium leading-none mt-0.5">
                          {flavor.title}
                        </span>
                      </div>

                      <ChevronRight
                        className={`size-4 transition-transform duration-200 ${
                          isSelected ? "translate-x-1 opacity-100" : "opacity-60 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 pt-1">
              <Button
                asChild
                size="default"
                className="rounded-full bg-[#2C101B] hover:bg-[#45182C] text-white px-6 sm:px-8 py-5 text-xs sm:text-sm font-black shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <Link to="/shop">
                  Browse Fresh Counter <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="default"
                variant="outline"
                className="rounded-full border-2 border-white/80 bg-white/70 hover:bg-white text-[#2C101B] px-5 sm:px-7 py-5 text-xs sm:text-sm font-bold backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <Link to="/offers">Daily Specials & Slots</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Active 3D Giant Glazed Donut + 3D Arched Blogh Depth Text (7 cols on lg) */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[300px] sm:min-h-[420px] lg:min-h-[480px]">
            
            {/* Scalloped Starburst Die-Cut Badge ("Explore Flavors") */}
            <div
              className="absolute top-2 left-1 sm:top-4 sm:left-4 z-30 animate-pulse"
              style={{ animationDuration: "4s" }}
            >
              <div className="relative size-18 sm:size-22 flex items-center justify-center">
                {/* 12-point SVG scalloped starburst */}
                <svg
                  viewBox="0 0 100 100"
                  className="size-full fill-[#DE1D72] text-[#DE1D72] drop-shadow-md transition-transform duration-500 hover:rotate-45"
                >
                  <path d="M50 0 C53 10 58 15 68 18 C78 21 82 28 82 38 C82 48 88 53 96 60 C104 67 100 76 92 82 C84 88 81 95 72 98 C63 101 55 96 50 100 C45 96 37 101 28 98 C19 95 16 88 8 82 C0 76 -4 67 4 60 C12 53 18 48 18 38 C18 28 22 21 32 18 C42 15 47 10 50 0 Z" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="font-sans font-black text-[9px] sm:text-[10px] uppercase text-white leading-tight">
                    Explore
                  </span>
                  <span className="font-sans font-black text-[9px] sm:text-[10px] uppercase text-white leading-tight">
                    Flavors
                  </span>
                  <span className="text-[8px] text-yellow-200 mt-0.5">✨</span>
                </div>
              </div>
            </div>

            {/* Giant 3D Depth Typography in Blogh font: "DONUTING" */}
            <div
              className="absolute top-0 right-2 sm:right-6 z-10 pointer-events-none select-none"
              style={{
                transform: `perspective(800px) rotateZ(-12deg) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="relative">
                {/* 3D Extrusion Depth Shadow Layers */}
                <span
                  aria-hidden
                  className="absolute top-2.5 left-2.5 font-blogh text-6xl sm:text-8xl lg:text-9xl text-[#750D4F] opacity-70 tracking-tight"
                >
                  {activeFlavor.word}
                </span>
                <span
                  aria-hidden
                  className="absolute top-1.5 left-1.5 font-blogh text-6xl sm:text-8xl lg:text-9xl text-[#941164] opacity-80 tracking-tight"
                >
                  {activeFlavor.word}
                </span>
                {/* Top Face */}
                <span className="relative font-blogh text-6xl sm:text-8xl lg:text-9xl text-[#C71585] tracking-tight drop-shadow-md">
                  {activeFlavor.word}
                </span>
              </div>
            </div>

            {/* Active Hero 3D Donut Composition with Parallax & Cross-Fade */}
            <div
              className="relative z-20 w-full max-w-lg lg:max-w-xl transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${-mousePos.y * 10}deg) rotateY(${mousePos.x * 10}deg) scale(1.02)`,
              }}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/60 group">
                <img
                  key={activeFlavor.id}
                  src={activeFlavor.heroImage}
                  alt={activeFlavor.title}
                  className="size-full object-cover transition-all duration-500 group-hover:scale-105"
                />

                {/* Subtle Inner Glass Vignette */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#B01777]/30 via-transparent to-white/10 pointer-events-none"
                />

                {/* Floating Telemetry Tooltip Badge */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-30 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] sm:text-xs font-black text-[#2C101B] backdrop-blur shadow-md border border-white">
                  <span
                    className="size-2 rounded-full animate-ping"
                    style={{ backgroundColor: activeFlavor.accentColor }}
                  />
                  <span>Selected: {activeFlavor.title}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

export default HeroRevampSection;
