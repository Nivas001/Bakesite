import React, { useState } from "react";
import TextLoop from "@/components/ui/text-loop";

const FLAVORS = [
  {
    id: "strawberry",
    pillBg: "bg-[#D61B6B] hover:bg-[#E52579]",
    textColor: "text-white",
    borderColor: "border-[#B01456]/60",
    label: "Natural flavors",
    title: "Pink Strawberry Nonpareil Donut",
    pillLabel: "Strawberry Donut",
    image: "/hero/mini-strawberry-donut.jpg",
    heroImage: "/hero/hero-3d-donut-sprinkles.jpg",
    accentColor: "#F31260",
    canvasBg: "#E3A9B8",
    word: "DONUTING",
    headlineHighlight: "FRESH GLAZED DONUTS",
    headingText: "#2C101B",
    highlightText: "#9E105C",
    depthFront: "#B01777",
    depthMid: "#7A0D50",
    depthShadow: "#4D0832",
    ribbonColor: "#FBE8EF",
    ribbonTextColor: "#3A1020",
  },
  {
    id: "mango",
    pillBg: "bg-[#E6A817] hover:bg-[#F2B624]",
    textColor: "text-[#3A1C14]",
    borderColor: "border-[#C98E08]/60",
    label: "Real ingredients",
    title: "Velvet Mango Cheesecake",
    pillLabel: "Mango Cheesecake",
    image: "/hero/mini-mango-cheesecake.jpg",
    heroImage: "/hero/hero-3d-mango-cheesecake.jpg",
    accentColor: "#F5A524",
    canvasBg: "#E8C982",
    word: "CHEESECAKING",
    headlineHighlight: "MANGO CHEESECAKE",
    headingText: "#331800",
    highlightText: "#B45309",
    depthFront: "#D97706",
    depthMid: "#92400E",
    depthShadow: "#522200",
    ribbonColor: "#FDF4DB",
    ribbonTextColor: "#3A1E00",
  },
  {
    id: "cookie",
    pillBg: "bg-[#3D1D10] hover:bg-[#542917]",
    textColor: "text-white",
    borderColor: "border-[#2B1408]/60",
    label: "Artisanal magic",
    title: "Chunky Chocolate Chip Cookie",
    pillLabel: "Chunky Cookie",
    image: "/hero/mini-cookie.jpg",
    heroImage: "/hero/hero-3d-cookie.jpg",
    accentColor: "#8B4513",
    canvasBg: "#DFCCB5",
    word: "COOKING",
    headlineHighlight: "CHUNKY CHOC COOKIES",
    headingText: "#2B1408",
    highlightText: "#7A3E1D",
    depthFront: "#8D4922",
    depthMid: "#5C2E13",
    depthShadow: "#361A08",
    ribbonColor: "#F8F1E9",
    ribbonTextColor: "#2B1408",
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
      className="w-full flex flex-col justify-between text-[#3A1C14] overflow-hidden relative transition-colors duration-700 pt-6 sm:pt-10 pb-1 sm:pb-2"
    >
      {/* Ambient Soft Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 size-[32rem] rounded-full bg-black/10 blur-3xl"
      />

      {/* Main Vertical Hero Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-3 sm:gap-5 my-auto text-center">
        
        {/* 1. [TOP]: Single-Line Bold Blogh Headline across horizontal space */}
        <div className="w-full text-center px-1 sm:px-3 overflow-hidden">
          <h1
            style={{ color: activeFlavor.headingText }}
            className="font-blogh whitespace-nowrap text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-none transition-colors duration-500 drop-shadow-xs"
          >
            PURE JOY IN{" "}
            <span
              style={{ color: activeFlavor.highlightText }}
              className="transition-colors duration-500"
            >
              {activeFlavor.headlineHighlight}
            </span>
          </h1>
        </div>

        {/* 2. [MIDDLE]: Seamless 3D Pastry Photo with 3D Depth Typography */}
        <div className="relative w-full max-w-3xl flex items-center justify-center min-h-[240px] sm:min-h-[340px] lg:min-h-[400px]">
          
          {/* Giant 3D Depth Typography in Blogh font */}
          <div
            className="absolute -top-4 sm:-top-8 right-2 sm:right-10 z-10 pointer-events-none select-none"
            style={{
              transform: `perspective(800px) rotateZ(-12deg) rotateY(${mousePos.x * 14}deg) rotateX(${-mousePos.y * 14}deg)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <div className="relative">
              {/* 3D Extrusion Shadow Layers */}
              <span
                aria-hidden
                style={{ color: activeFlavor.depthShadow }}
                className="absolute top-3 sm:top-3.5 left-3 sm:left-3.5 font-blogh text-6xl sm:text-8xl lg:text-[10rem] opacity-50 tracking-tight transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
              <span
                aria-hidden
                style={{ color: activeFlavor.depthMid }}
                className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 font-blogh text-6xl sm:text-8xl lg:text-[10rem] opacity-75 tracking-tight transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
              {/* Top Face */}
              <span
                style={{ color: activeFlavor.depthFront }}
                className="relative font-blogh text-6xl sm:text-8xl lg:text-[10rem] tracking-tight drop-shadow-md transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
            </div>
          </div>

          {/* Seamless 3D Floating Pastry (No box, no card frame, feathered radial mask) */}
          <div
            className="relative z-20 w-full max-w-lg sm:max-w-xl lg:max-w-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg) scale(1.03)`,
            }}
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center">
              <img
                key={activeFlavor.id}
                src={activeFlavor.heroImage}
                alt={activeFlavor.title}
                className="size-full object-cover transition-all duration-700 pointer-events-none"
                style={{
                  maskImage: "radial-gradient(circle at center, black 40%, rgba(0,0,0,0.85) 55%, transparent 76%)",
                  WebkitMaskImage: "radial-gradient(circle at center, black 40%, rgba(0,0,0,0.85) 55%, transparent 76%)",
                }}
              />
            </div>
          </div>

        </div>

        {/* 3. [BOTTOM]: 3 Flavor Pill Buttons in a Horizontal Row */}
        <div className="w-full flex items-center justify-center pt-1 sm:pt-2">
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
                      {flavor.pillLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. [BOTTOM WAVE]: Kinetic TextLoop Ribbon integrated directly with matching background (zero gap) */}
      <div className="w-full mt-2 sm:mt-4 overflow-hidden select-none pointer-events-auto">
        <TextLoop
          text="Ani Bakes ✦ Fresh Sunrise Dawn Bakes ✦ Wild Sourdough Ferment ✦ Zero Preservatives ✦ Small-Batch Studio"
          shape="wave"
          speed={48}
          direction="forward"
          separator="🥮"
          curviness={10}
          fontSize={22}
          fontWeight={800}
          fontFamily="var(--font-blogh), var(--font-body), sans-serif"
          letterSpacing={2}
          uppercase
          color={activeFlavor.ribbonTextColor}
          ribbon
          ribbonColor={activeFlavor.ribbonColor}
          ribbonWidth={42}
          pauseOnHover={false}
          className="opacity-95"
        />
      </div>

    </div>
  );
}

export default HeroRevampSection;
