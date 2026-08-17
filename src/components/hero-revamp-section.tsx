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
    canvasBg: "#CA8F8B",
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
    canvasBg: "#DDB1B8",
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
    canvasBg: "#E3A9B8",
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
    <div
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: activeFlavor.canvasBg }}
      className="w-full min-h-[90vh] lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center text-[#3A1C14] overflow-hidden relative transition-colors duration-500"
    >
      {/* Ambient Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 size-[32rem] rounded-full bg-[#DE1D72]/15 blur-3xl"
      />

      {/* Floating Decorative Sprinkle Particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-12 left-1/4 size-3.5 rounded-full bg-[#00C2FF] shadow-xs animate-bounce"
        style={{ animationDuration: "3.2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 size-3 rounded-full bg-[#FFE600] shadow-xs animate-bounce"
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-1/3 size-3.5 rounded-full bg-[#7828C8] shadow-xs animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-28 right-1/3 size-3 rounded-full bg-[#17C964] shadow-xs animate-bounce"
        style={{ animationDuration: "3.6s", animationDelay: "0.8s" }}
      />

      {/* Main Hero Container */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Clean Blogh Headline, Floating Flavor Pills & CTAs (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-5 sm:gap-7">
            
            {/* Bold Blogh Headline */}
            <div>
              <h1 className="font-blogh text-4xl sm:text-5xl lg:text-7xl text-[#2C101B] tracking-tight leading-[1.02]">
                PURE JOY IN <br />
                <span className="text-[#A8156C]">EVERY FRESH GLAZE</span>
              </h1>
            </div>

            {/* Floating Flavor Pills (Click to switch 3D Hero Donut) */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="space-y-3">
                {FLAVORS.map((flavor, index) => {
                  const isSelected = activeFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => setActiveFlavor(flavor)}
                      className={`group relative flex items-center w-full max-w-sm rounded-full ${flavor.pillBg} ${flavor.textColor} p-1.5 pr-6 shadow-lg border ${flavor.borderColor} transition-all duration-300 hover:scale-[1.03] active:scale-98 cursor-pointer ${
                        isSelected ? "ring-4 ring-white/90 shadow-xl scale-[1.03]" : "opacity-90 hover:opacity-100"
                      }`}
                      style={{
                        transform: `rotate(${index === 0 ? "-2.5deg" : index === 1 ? "1.5deg" : "-1deg"})`,
                      }}
                    >
                      {/* Circular Donut Thumbnail */}
                      <div className="size-12 sm:size-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-white/20 p-0.5">
                        <img
                          src={flavor.image}
                          alt={flavor.label}
                          className="size-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                        />
                      </div>

                      {/* Pill Label Text */}
                      <div className="ml-3 sm:ml-4 text-left flex-1">
                        <span className="block text-sm sm:text-base font-black tracking-wide">
                          {flavor.label}
                        </span>
                        <span className="block text-[11px] opacity-85 font-medium leading-none mt-0.5">
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
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 pt-2">
              <Button
                asChild
                size="default"
                className="rounded-full bg-[#2C101B] hover:bg-[#45182C] text-white px-7 sm:px-9 py-6 text-sm sm:text-base font-black shadow-xl transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <Link to="/shop">
                  Browse Fresh Counter <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="default"
                variant="outline"
                className="rounded-full border-2 border-white/80 bg-white/70 hover:bg-white text-[#2C101B] px-6 sm:px-8 py-6 text-sm sm:text-base font-bold backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <Link to="/offers">Daily Specials & Slots</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Seamless 3D Floating Donut with Exploding Sprinkles + 3D Blogh Depth Text (7 cols on lg) */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]">
            
            {/* Scalloped Starburst Die-Cut Badge ("Explore Flavors") */}
            <div
              className="absolute top-0 left-0 sm:top-2 sm:left-4 z-30 animate-pulse pointer-events-none"
              style={{ animationDuration: "4s" }}
            >
              <div className="relative size-20 sm:size-26 flex items-center justify-center">
                {/* 12-point SVG scalloped starburst */}
                <svg
                  viewBox="0 0 100 100"
                  className="size-full fill-[#DE1D72] text-[#DE1D72] drop-shadow-lg transition-transform duration-500 hover:rotate-45"
                >
                  <path d="M50 0 C53 10 58 15 68 18 C78 21 82 28 82 38 C82 48 88 53 96 60 C104 67 100 76 92 82 C84 88 81 95 72 98 C63 101 55 96 50 100 C45 96 37 101 28 98 C19 95 16 88 8 82 C0 76 -4 67 4 60 C12 53 18 48 18 38 C18 28 22 21 32 18 C42 15 47 10 50 0 Z" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="font-sans font-black text-[10px] sm:text-xs uppercase text-white leading-tight">
                    Explore
                  </span>
                  <span className="font-sans font-black text-[10px] sm:text-xs uppercase text-white leading-tight">
                    Flavors
                  </span>
                  <span className="text-[9px] text-yellow-200 mt-0.5">✨</span>
                </div>
              </div>
            </div>

            {/* Giant 3D Depth Typography in Blogh font: "DONUTING" / "CRAFTING" */}
            <div
              className="absolute -top-4 sm:-top-8 right-0 sm:right-4 z-10 pointer-events-none select-none"
              style={{
                transform: `perspective(800px) rotateZ(-14deg) rotateY(${mousePos.x * 14}deg) rotateX(${-mousePos.y * 14}deg)`,
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="relative">
                {/* 3D Extrusion Depth Shadow Layers */}
                <span
                  aria-hidden
                  className="absolute top-3.5 left-3.5 font-blogh text-7xl sm:text-9xl lg:text-[11rem] text-[#6B0B47] opacity-60 tracking-tight"
                >
                  {activeFlavor.word}
                </span>
                <span
                  aria-hidden
                  className="absolute top-2 left-2 font-blogh text-7xl sm:text-9xl lg:text-[11rem] text-[#8C105E] opacity-75 tracking-tight"
                >
                  {activeFlavor.word}
                </span>
                {/* Top Face */}
                <span className="relative font-blogh text-7xl sm:text-9xl lg:text-[11rem] text-[#C71585] tracking-tight drop-shadow-lg">
                  {activeFlavor.word}
                </span>
              </div>
            </div>

            {/* Seamless 3D Floating Donut (No bounding box / card frame) */}
            <div
              className="relative z-20 w-full max-w-xl lg:max-w-2xl transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg) scale(1.04)`,
              }}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center">
                {/* Seamlessly blended 3D donut matching canvas background */}
                <img
                  key={activeFlavor.id}
                  src={activeFlavor.heroImage}
                  alt={activeFlavor.title}
                  className="size-full object-cover transition-all duration-500 pointer-events-none drop-shadow-2xl"
                  style={{
                    maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 50%, transparent 95%)",
                    WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 50%, transparent 95%)",
                  }}
                />

                {/* Floating Telemetry Tooltip Badge */}
                <div className="absolute bottom-1 sm:bottom-2 left-4 sm:left-8 z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs sm:text-sm font-black text-[#2C101B] backdrop-blur shadow-lg border border-white/80">
                  <span
                    className="size-2.5 rounded-full animate-ping"
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
