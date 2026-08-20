import React, { useState, useEffect, useRef } from "react";
import { TextLoop } from "@/components/ui/text-loop";
import { setHeroTheme, resetHeroTheme } from "@/lib/hero-navbar-theme";

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
    ringClass: "ring-white/95",
    blendMode: "normal",
    canvasBg: "#F5C2CD",
    word: "DONUTING",
    sizeClass: "text-3xl sm:text-5xl lg:text-[4.85rem] xl:text-[5.75rem]",
    headlineHighlight: "FRESH GLAZED DONUTS",
    headingText: "#3A1018",
    highlightText: "#9B112D",
    depthFront: "#C41E3A",
    depthMid: "#8B1228",
    depthShadow: "#4E0713",
    ribbonColor: "#FCE7EC",
    ribbonTextColor: "#3A1018",
    showChocoDrip: false,
    dotColor: "#C41E3A",
    btnBg: "#C41E3A",
    btnText: "#ffffff",
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
    ringClass: "ring-white/95",
    blendMode: "normal",
    canvasBg: "#FDE68A",
    word: "CHEESECAKE",
    sizeClass: "text-2xl sm:text-4xl lg:text-[3.6rem] xl:text-[4.35rem]",
    headlineHighlight: "MANGO CHEESECAKE",
    headingText: "#361D04",
    highlightText: "#92400E",
    depthFront: "#B45309",
    depthMid: "#78350F",
    depthShadow: "#451A03",
    ribbonColor: "#FFFBEB",
    ribbonTextColor: "#361D04",
    showChocoDrip: false,
    dotColor: "#D97706",
    btnBg: "#B45309",
    btnText: "#ffffff",
  },
  {
    id: "brownie",
    label: "Belgian",
    pillLabel: "Fudge Brownie",
    heroImage: "/hero/hero-3d-brownie.jpg",
    image: "/hero/mini-brownie.jpg",
    title: "Artisan Belgian Dark Chocolate Fudge Brownie",
    pillBg: "bg-[#5C2D0A]",
    textColor: "text-white",
    borderColor: "border-[#3D1A05]",
    ringClass: "ring-white/95",
    blendMode: "normal",
    // Sampled exact amber-gold from the product image background
    canvasBg: "#D4A040",
    word: "BROWNIE",
    sizeClass: "text-2xl sm:text-4xl lg:text-[4rem] xl:text-[4.85rem]",
    headlineHighlight: "BELGIAN FUDGE BROWNIES",
    headingText: "#3D1A05",
    highlightText: "#7A2D08",
    depthFront: "#7A2E0A",
    depthMid: "#4A1A05",
    depthShadow: "#280E02",
    ribbonColor: "#F5D680",
    ribbonTextColor: "#3D1A05",
    showChocoDrip: true,
    dotColor: "#7A2E0A",
    btnBg: "#5C2D0A",
    btnText: "#FFF3E0",
  },
];

// Fixed drip positions for the BROWNIE text chocolate drip effect
const CHOCO_DRIPS = [
  { left: "5%",  height: 16, delay: "0s",    width: 7  },
  { left: "16%", height: 24, delay: "0.3s",  width: 6  },
  { left: "27%", height: 14, delay: "0.6s",  width: 8  },
  { left: "38%", height: 20, delay: "0.15s", width: 6  },
  { left: "50%", height: 28, delay: "0.45s", width: 7  },
  { left: "61%", height: 12, delay: "0.7s",  width: 5  },
  { left: "72%", height: 22, delay: "0.25s", width: 8  },
  { left: "83%", height: 18, delay: "0.55s", width: 6  },
  { left: "93%", height: 26, delay: "0.1s",  width: 7  },
];

export function HeroRevampSection() {
  const [activeFlavor, setActiveFlavor] = useState<(typeof FLAVORS)[number]>(FLAVORS[0]!);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.bottom > 64 && rect.top <= 200;
      setHeroTheme({
        inHero: isVisible,
        bgColor: isVisible ? activeFlavor.canvasBg : null,
        textColor: isVisible ? activeFlavor.headingText : null,
        accentColor: isVisible ? activeFlavor.highlightText : null,
        dotColor: isVisible ? activeFlavor.dotColor : null,
        btnBg: isVisible ? activeFlavor.btnBg : null,
        btnText: isVisible ? activeFlavor.btnText : null,
      });
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      resetHeroTheme();
    };
  }, [activeFlavor.canvasBg, activeFlavor.headingText, activeFlavor.highlightText]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: activeFlavor.canvasBg }}
      className="w-full min-h-0 lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-between text-[#3A1C14] overflow-hidden relative transition-colors duration-700 pt-6 sm:pt-10 lg:pt-14 pb-1 sm:pb-2"
    >
      {/* Ambient Soft Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -left-32 size-96 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 size-[32rem] rounded-full bg-black/10 blur-3xl"
      />

      {/* Main Vertical Hero Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-3 sm:gap-5 my-auto text-center">

        {/* 1. [TOP]: Prominent Bold Headline */}
        <div className="w-full max-w-[98vw] mx-auto text-center px-2 sm:px-4 overflow-hidden pt-1 sm:pt-2">
          <h1
            style={{ color: activeFlavor.headingText }}
            className="font-blogh tracking-tight leading-[1.05] transition-colors duration-500 drop-shadow-xs text-center text-3xl sm:text-5xl lg:text-[clamp(2.5rem,4.1vw,4.6rem)] lg:whitespace-nowrap"
          >
            <span className="block lg:inline mr-0 lg:mr-3.5 opacity-90">
              PURE JOY IN
            </span>
            <span
              style={{ color: activeFlavor.highlightText }}
              className="transition-colors duration-500 block lg:inline mt-0.5 lg:mt-0"
            >
              {activeFlavor.headlineHighlight}
            </span>
          </h1>
        </div>

        {/* 2. [MIDDLE]: 3D Pastry + 3D Depth Typography */}
        {/* Bigger container: max-w-4xl (was 3xl), taller min-h */}
        <div className="relative w-full max-w-4xl flex items-center justify-center min-h-[200px] sm:min-h-[310px] lg:min-h-[440px]">

          {/* 3D Floating Pastry — bigger: max-w-md → xl → 3xl */}
          <div
            className="relative z-10 w-full max-w-md sm:max-w-2xl lg:max-w-3xl transition-transform duration-200 ease-out"
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
                  mixBlendMode: activeFlavor.blendMode as React.CSSProperties["mixBlendMode"],
                  maskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 28%, rgba(0,0,0,0.85) 48%, transparent 72%)",
                  WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 28%, rgba(0,0,0,0.85) 48%, transparent 72%)",
                }}
              />
            </div>
          </div>

          {/* Giant 3D Depth Typography */}
          <div
            className="absolute bottom-0 sm:bottom-1 lg:bottom-1 right-0 sm:right-2 lg:-right-2 xl:-right-6 z-30 pointer-events-none select-none"
            style={{
              transform: `perspective(800px) rotateZ(-6deg) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <div className="relative">
              {/* 3D Extrusion Shadow Layers */}
              <span
                aria-hidden
                style={{ color: activeFlavor.depthShadow }}
                className={`absolute top-1.5 sm:top-2.5 lg:top-2.5 left-1.5 sm:left-2.5 lg:left-2.5 font-blogh ${activeFlavor.sizeClass} opacity-50 tracking-tight transition-colors duration-500`}
              >
                {activeFlavor.word}
              </span>
              <span
                aria-hidden
                style={{ color: activeFlavor.depthMid }}
                className={`absolute top-0.5 sm:top-1.5 lg:top-1.5 left-0.5 sm:left-1.5 lg:left-1.5 font-blogh ${activeFlavor.sizeClass} opacity-75 tracking-tight transition-colors duration-500`}
              >
                {activeFlavor.word}
              </span>
              {/* Top Face */}
              <span
                style={{ color: activeFlavor.depthFront }}
                className={`relative font-blogh ${activeFlavor.sizeClass} tracking-tight drop-shadow-xl transition-colors duration-500`}
              >
                {activeFlavor.word}
              </span>

              {/* 🍫 Chocolate Drip Effect — only for brownie */}
              {activeFlavor.showChocoDrip && (
                <div
                  aria-hidden
                  className="absolute left-0 right-0 top-full flex items-start"
                  style={{ marginTop: "-2px" }}
                >
                  {CHOCO_DRIPS.map((drip, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: drip.left,
                        top: 0,
                        width: `${drip.width}px`,
                        height: `${drip.height}px`,
                        backgroundColor: "#3D1A05",
                        borderRadius: "0 0 40% 40%",
                        opacity: 0.88,
                        animationName: "chocoDripDrop",
                        animationDuration: "2.4s",
                        animationDelay: drip.delay,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDirection: "alternate",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 3. [BOTTOM]: Flavor Pill Buttons */}
        <div className="w-full flex items-center justify-center pt-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 w-full">
            {FLAVORS.map((flavor) => {
              const isSelected = activeFlavor.id === flavor.id;
              return (
                <button
                  key={flavor.id}
                  type="button"
                  onClick={() => setActiveFlavor(flavor)}
                  className={`group relative flex items-center rounded-full ${flavor.pillBg} ${flavor.textColor} p-1 pr-3 sm:p-1.5 sm:pr-4 shadow-md border ${flavor.borderColor} transition-all duration-300 hover:scale-[1.04] active:scale-98 cursor-pointer ${
                    isSelected
                      ? `ring-3 sm:ring-4 ${flavor.ringClass} shadow-lg scale-[1.04] z-20`
                      : "opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="size-6 sm:size-7.5 rounded-full overflow-hidden shrink-0 border border-white/40 shadow-xs mr-2 sm:mr-2.5">
                    <img
                      src={flavor.image}
                      alt={flavor.title}
                      className="size-full object-cover"
                    />
                  </div>

                  <span className="font-blogh font-bold text-xs sm:text-sm tracking-wider uppercase drop-shadow-xs">
                    {flavor.label} {flavor.pillLabel}
                  </span>

                  {isSelected && (
                    <span className="ml-1.5 sm:ml-2 size-1.5 sm:size-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. [BOTTOM WAVE]: Kinetic TextLoop Ribbon */}
      <div className="w-full mt-2 sm:mt-4 overflow-hidden select-none pointer-events-auto">
        <TextLoop
          text="Ani Bakes ✦ Fresh Sunrise Dawn Bakes ✦ Wild Sourdough Ferment ✦ Zero Preservatives ✦ Small-Batch Studio"
          shape="wave"
          speed={48}
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
          ribbonWidth={46}
          pauseOnHover={false}
          className="opacity-95"
        />
      </div>

    </div>
  );
}

export default HeroRevampSection;
