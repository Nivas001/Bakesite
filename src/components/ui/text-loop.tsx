import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./text-loop.css";

const VIEW_W = 1400;
const EDGE_PAD = 4;

export type TextLoopShape = "wave" | "circle" | "infinity" | "arch" | "line";
export type TextLoopDirection = "forward" | "reverse";

export interface TextLoopProps {
  text?: string;
  shape?: TextLoopShape;
  path?: string;
  speed?: number;
  direction?: TextLoopDirection;
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getViewHeight = (shape: TextLoopShape, curviness: number, ribbonWidth: number): number => {
  const c = Math.max(0, curviness);
  const rw = Math.max(0, ribbonWidth);
  switch (shape) {
    case "line":
      return Math.round(Math.max(56, rw + 18));
    case "wave":
      return Math.round(Math.max(76, rw + c * 2 + 18));
    case "arch":
      return Math.round(Math.max(140, rw + c * 1.4 + 60));
    case "circle":
    case "infinity":
    default:
      return 520;
  }
};

const buildPath = (shape: TextLoopShape, curviness: number, ribbonWidth: number, viewH: number) => {
  const c = Math.max(0, curviness);
  const CX = VIEW_W / 2;
  const CY = viewH / 2;
  const room = Math.max(8, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case "infinity": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case "line":
      return `M -400 ${CY} L ${VIEW_W + 400} ${CY}`;
    case "wave":
    default: {
      const a = Math.min(c * 0.9, room);
      return `M -400 ${CY} Q -200 ${CY - a} 0 ${CY} Q 200 ${CY + a} 400 ${CY} Q 600 ${CY - a} 800 ${CY} Q 1000 ${CY + a} 1200 ${CY} Q 1400 ${CY - a} ${VIEW_W + 400} ${CY}`;
    }
  }
};

export function TextLoop({
  text = "Ani Bakes ✦ Fresh Dawn Bakes",
  shape = "wave",
  path,
  speed = 48,
  direction = "forward",
  separator = "✦",
  curviness = 6,
  fontSize = 24,
  fontWeight = 700,
  fontFamily,
  letterSpacing = 1.5,
  uppercase = true,
  color = "#442723",
  ribbon = true,
  ribbonColor = "#FDF1E8",
  ribbonWidth = 46,
  pauseOnHover = false,
  className = "",
  style = {},
}: TextLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);

  const [unitWidth, setUnitWidth] = useState(0);

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, "")}`;

  const viewH = useMemo(
    () => getViewHeight(shape, curviness, ribbonWidth),
    [shape, curviness, ribbonWidth]
  );

  const d = useMemo(
    () => path || buildPath(shape, curviness, ribbonWidth, viewH),
    [path, shape, curviness, ribbonWidth, viewH]
  );

  const unit = useMemo(() => {
    const base = uppercase ? String(text).toUpperCase() : String(text);
    const gap = separator ? `\u00A0\u00A0${separator}\u00A0\u00A0` : "\u00A0\u00A0\u00A0\u00A0";
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      ...(fontFamily ? { fontFamily } : {}),
    }),
    [fontSize, fontWeight, letterSpacing, fontFamily]
  );

  useLayoutEffect(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      try {
        const w = measureEl.getComputedTextLength();
        if (w > 0) setUnitWidth(w);
      } catch {}
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [unit, fontSize, fontWeight, letterSpacing, fontFamily]);

  useEffect(() => {
    const head = headRef.current;
    const tail = tailRef.current;
    const pathEl = pathRef.current;
    if (!head || !tail || !pathEl || unitWidth <= 0) return undefined;

    let pathLength = 0;
    try {
      pathLength = pathEl.getTotalLength();
    } catch {
      return undefined;
    }
    if (pathLength <= 0) return undefined;

    // Use unitWidth as the seamless loop cycle length
    const loopCycle = unitWidth;

    const apply = (offset: number) => {
      const normalized = ((offset % loopCycle) + loopCycle) % loopCycle;
      head.setAttribute("startOffset", `${normalized}px`);
      tail.setAttribute("startOffset", `${normalized - loopCycle}px`);
    };

    apply(0);

    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === "reverse" ? -loopCycle : loopCycle,
      duration: loopCycle / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener("pointerenter", pause);
        root.removeEventListener("pointerleave", resume);
      }
    };
  }, [unitWidth, speed, direction, pauseOnHover]);

  // Repeat enough times to cover the full viewport path seamlessly
  const repeatedText = useMemo(() => {
    return unit.repeat(12);
  }, [unit]);

  return (
    <div ref={rootRef} className={`text-loop ${className}`.trim()} style={style}>
      <svg
        className="text-loop-svg"
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : "none"}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="text-loop-measure" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset="0px">
            {repeatedText}
          </textPath>
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset="0px">
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default TextLoop;
