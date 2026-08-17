import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./text-loop.css";

export interface TextLoopProps {
  text?: string;
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
  shape?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  letterSpacing?: number;
  uppercase?: boolean;
}

export function TextLoop({
  text = "Ani Bakes ✦ Fresh Sunrise Dawn Bakes ✦ Wild Sourdough Ferment ✦ Zero Preservatives ✦ Small-Batch Studio",
  speed = 46,
  direction = "forward",
  separator = "🥮",
  color = "#3A1018",
  ribbonColor = "#FCE7EC",
  pauseOnHover = false,
  className = "",
  style = {},
}: TextLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure loop distance (half of full duplicated track)
    const singleWidth = track.scrollWidth / 2;
    if (singleWidth <= 0) return;

    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || speed <= 0) return;

    const moveDistance = direction === "reverse" ? singleWidth : -singleWidth;

    const tween = gsap.to(track, {
      x: moveDistance,
      duration: singleWidth / speed,
      ease: "none",
      repeat: -1,
    });

    const root = containerRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener("mouseenter", pause);
      root.addEventListener("mouseleave", resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener("mouseenter", pause);
        root.removeEventListener("mouseleave", resume);
      }
    };
  }, [speed, direction, pauseOnHover, text, separator]);

  // Create 6 repeated segments to guarantee smooth infinite marquee on any viewport width
  const segments = Array.from({ length: 6 });

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: ribbonColor, color, ...style }}
      className={`w-full overflow-hidden py-2.5 sm:py-3.5 select-none relative transition-colors duration-500 ${className}`.trim()}
      role="region"
      aria-label="Bakery highlights marquee"
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform font-blogh tracking-wider uppercase text-xs sm:text-sm md:text-base font-extrabold"
      >
        {segments.map((_, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span className="px-3 sm:px-4 leading-none tracking-wide drop-shadow-2xs">{text}</span>
            <span className="px-2 sm:px-3 text-sm sm:text-base opacity-90 inline-block">
              {separator}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TextLoop;
