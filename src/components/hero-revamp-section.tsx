import React, { useState } from "react";
import { TextLoop } from "@/components/ui/text-loop";

const FLAVORS = [
  {
    id: "strawberry",
    label: "Strawberry",
    pillLabel: "Glazed Donuts",
    heroImage: "/hero/hero-3d-donut-sprinkles.jpg",
    image: "/hero/mini-strawberry-donut.jpg",
    title: "Pink Strawberry Nonpareil Donut",
    pillBg: "bg-[#E63956]",
    textColor: "text-white",
    borderColor: "border-[#C9203E]",
    canvasBg: "#F5C2CD",
    word: "DONUTING",
    headlineHighlight: "FRESH GLAZED DONUTS",
    headingText: "#3A1018",
    highlightText: "#9B112D",
    depthFront: "#C41E3A",
    depthMid: "#8B1228",
    depthShadow: "#4E0713",
    ribbonColor: "#FCE7EC",
    ribbonTextColor: "#3A1018",
  },
  {
    id: "mango",
    label: "Mango",
    pillLabel: "Cheesecake",
    heroImage: "/hero/hero-3d-mango-cheesecake.jpg",
    image: "/hero/mini-mango-cheesecake.jpg",
    title: "Alphonso Mango Glaze Cheesecake",
    pillBg: "bg-[#D97706]",
    textColor: "text-white",
    borderColor: "border-[#B45309]",
    canvasBg: "#FDE68A",
    word: "CHEESECAKING",
    headlineHighlight: "MANGO CHEESECAKE",
    headingText: "#361D04",
    highlightText: "#92400E",
    depthFront: "#B45309",
    depthMid: "#78350F",
    depthShadow: "#451A03",
    ribbonColor: "#FFFBEB",
    ribbonTextColor: "#361D04",
  },
  {
    id: "cookie",
    label: "Choc Chip",
    pillLabel: "Cookie",
    heroImage: "/hero/hero-3d-cookie.jpg",
    image: "/hero/mini-cookie.jpg",
    title: "Warm Chunky Chocolate Chip Cookie",
    pillBg: "bg-[#78350F]",
    textColor: "text-white",
    borderColor: "border-[#572607]",
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
      className="w-full min-h-0 lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-between text-[#3A1C14] overflow-hidden relative transition-colors duration-700 pt-6 sm:pt-10 lg:pt-14 pb-1 sm:pb-2"
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
        
        {/* 1. [TOP]: Punchy Responsive Blogh Headline */}
        <div className="w-full max-w-[96vw] mx-auto text-center px-2 sm:px-4 overflow-hidden pt-1 sm:pt-2">
          <h1
            style={{ color: activeFlavor.headingText }}
            className="font-blogh tracking-tight leading-[1.08] transition-colors duration-500 drop-shadow-xs text-center flex flex-col items-center justify-center lg:inline-block lg:whitespace-nowrap lg:text-[clamp(2.2rem,4.3vw,4.75rem)]"
          >
            <span className="text-lg sm:text-2xl lg:text-inherit font-bold opacity-90 block lg:inline mr-0 lg:mr-3">
              PURE JOY IN
            </span>
            <span
              style={{ color: activeFlavor.highlightText }}
              className="text-2xl sm:text-4xl lg:text-inherit font-black tracking-wide transition-colors duration-500 block lg:inline mt-0.5 lg:mt-0"
            >
              {activeFlavor.headlineHighlight}
            </span>
          </h1>
        </div>

        {/* 2. [MIDDLE]: Seamless 3D Pastry Photo with 3D Depth Typography Layered IN FRONT */}
        <div className="relative w-full max-w-3xl flex items-center justify-center min-h-[170px] sm:min-h-[260px] lg:min-h-[380px]">
          
          {/* Seamless 3D Floating Pastry (Feathered edge dissolving) */}
          <div
            className="relative z-10 w-full max-w-sm sm:max-w-xl lg:max-w-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${-mousePos.y * 10}deg) rotateY(${mousePos.x * 10}deg) scale(1.02)`,
            }}
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center">
              <img
                key={activeFlavor.id}
                src={activeFlavor.heroImage}
                alt={activeFlavor.title}
                className="size-full object-cover transition-all duration-700 pointer-events-none"
                style={{
                  maskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 28%, rgba(0,0,0,0.85) 48%, transparent 72%)",
                  WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 28%, rgba(0,0,0,0.85) 48%, transparent 72%)",
                }}
              />
            </div>
          </div>

          {/* Giant 3D Depth Typography in Blogh font Layered IN FRONT (After the Photo) */}
          <div
            className="absolute -top-3 sm:-top-8 lg:-top-10 right-2 sm:right-6 z-30 pointer-events-none select-none"
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
                className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 font-blogh text-4xl sm:text-7xl lg:text-[9.5rem] opacity-50 tracking-tight transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
              <span
                aria-hidden
                style={{ color: activeFlavor.depthMid }}
                className="absolute top-1 sm:top-2 left-1 sm:left-2 font-blogh text-4xl sm:text-7xl lg:text-[9.5rem] opacity-75 tracking-tight transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
              {/* Top Face */}
              <span
                style={{ color: activeFlavor.depthFront }}
                className="relative font-blogh text-4xl sm:text-7xl lg:text-[9.5rem] tracking-tight drop-shadow-xl transition-colors duration-500"
              >
                {activeFlavor.word}
              </span>
            </div>
          </div>

        </div>

        {/* 3. [BOTTOM]: 3 Flavor Pill Buttons in a Streamlined Row */}
        <div className="w-full flex items-center justify-center pt-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 w-full">
            {FLAVORS.map((flavor, index) => {
              const isSelected = activeFlavor.id === flavor.id;
              return (
                <button
                  key={flavor.id}
                  type="button"
                  onClick={() => setActiveFlavor(flavor)}
                  className={`group relative flex items-center rounded-full ${flavor.pillBg} ${flavor.textColor} p-1 pr-3 sm:p-1.5 sm:pr-4 shadow-md border ${flavor.borderColor} transition-all duration-300 hover:scale-[1.04] active:scale-98 cursor-pointer ${
                    isSelected
                      ? "ring-3 sm:ring-4 ring-white/95 shadow-lg scale-[1.04] z-20"
                      : "opacity-85 hover:opacity-100"
                  }`}
                  style={{
                    transform: `rotate(${index === 0 ? "-2deg" : index === 1 ? "0deg" : "2deg"})`,
                  }}
                >
                  {/* Circular Product Thumbnail */}
                  <div className="size-7 sm:size-10 rounded-full overflow-hidden shrink-0 border-1.5 sm:border-2 border-white shadow-xs bg-white/20 p-0.5">
                    <img
                      src={flavor.image}
                      alt={flavor.label}
                      className="size-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    />
                  </div>

                  {/* Pill Label Text */}
                  <div className="ml-2 sm:ml-2.5 text-left">
                    <span className="block text-[11px] sm:text-xs font-black tracking-wide leading-tight">
                      {flavor.label}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] opacity-90 font-semibold leading-tight mt-0.5">
                      {flavor.pillLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. [BOTTOM WAVE]: Kinetic TextLoop Ribbon with Responsive Sizing */}
      <div className="w-full mt-2 sm:mt-3 overflow-hidden select-none pointer-events-auto">
        <TextLoop
          text="Ani Bakes ✦ Fresh Sunrise Dawn Bakes ✦ Wild Sourdough Ferment ✦ Zero Preservatives ✦ Small-Batch Studio"
          shape="wave"
          speed={46}
          direction="forward"
          separator="🥮"
          curviness={10}
          fontSize={24}
          fontWeight={800}
          fontFamily="var(--font-blogh), var(--font-body), sans-serif"
          letterSpacing={2}
          uppercase
          color={activeFlavor.ribbonTextColor}
          ribbon
          ribbonColor={activeFlavor.ribbonColor}
          ribbonWidth={44}
          pauseOnHover={false}
          className="opacity-95"
        />
      </div>

    </div>
  );
}

export default HeroRevampSection;
