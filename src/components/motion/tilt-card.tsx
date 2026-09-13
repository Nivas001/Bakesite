import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

interface TiltCardProps {
  children: ReactNode;
  /** Maximum rotation in degrees at the corners. */
  max?: number;
  /** Adds a light sheen that follows the pointer. */
  glare?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Tilts toward the pointer in 3D on hover. Pointer-driven only — it is inert on
 * touch devices and when reduced motion is requested, so it never interferes
 * with tapping or scrolling.
 */
export function TiltCard({
  children,
  max = 8,
  glare = true,
  className,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, active: false });

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    setTilt({
      x: (0.5 - py / 100) * 2 * max,
      y: (px / 100 - 0.5) * 2 * max,
      px,
      py,
      active: true,
    });
  }

  function reset() {
    setTilt({ x: 0, y: 0, px: 50, py: 50, active: false });
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale(${tilt.active ? 1.015 : 1})`,
        transition: tilt.active ? "transform 90ms linear" : "transform 520ms cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
    >
      {children}
      {glare && !reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, oklch(1 0 0 / 0.28), transparent 55%)`,
          }}
        />
      )}
    </div>
  );
}
