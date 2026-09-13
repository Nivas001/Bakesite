import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

interface ParallaxProps {
  children: ReactNode;
  /**
   * How far the content drifts across its full scroll pass, in pixels.
   * Positive values drift down (slower than the page), negative drift up.
   */
  distance?: number;
  /** Extra scale applied at the midpoint of the pass. */
  zoom?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Drifts its children against the scroll direction for depth. Falls back to a
 * plain static wrapper when the user prefers reduced motion.
 */
export function Parallax({
  children,
  distance = 60,
  zoom = 0,
  className,
  style,
}: ParallaxProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  // progress runs 0 → 1; centre the drift so the element sits neutral mid-screen.
  const offset = reduced ? 0 : (progress - 0.5) * distance;
  const scale = reduced ? 1 : 1 + zoom * (1 - Math.abs(progress - 0.5) * 2);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        transform: `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
