import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Every motion primitive in `src/components/motion` consults this and renders
 * its children in the final (settled) state when motion is not wanted, so the
 * site stays fully legible without any animation.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(query.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefers;
}

/** Clamps `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Maps `value` from the `[inMin, inMax]` range onto `[outMin, outMax]`. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Frame-rate independent damping toward a target, for smooth scroll follow. */
export function damp(current: number, target: number, smoothing = 0.12): number {
  return current + (target - current) * smoothing;
}

/** The easing curve used across the site — a gentle overshoot-free ease-out. */
export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
