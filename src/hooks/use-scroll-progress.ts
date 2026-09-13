import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/motion";

/**
 * Reports how far a element has travelled through the viewport, as a number
 * from 0 (its top edge has just reached the bottom of the viewport) to 1 (its
 * bottom edge has just left the top).
 *
 * Updates are batched into a single rAF per scroll burst, so several of these
 * on one page stay cheap.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const travel = rect.height + viewport;
      if (travel <= 0) return;
      setProgress(clamp((viewport - rect.top) / travel));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress };
}

/**
 * Progress through a pinned/sticky section: 0 while the section's top is still
 * below the viewport top, 1 once the section has been fully scrolled past.
 *
 * Unlike {@link useScrollProgress} this measures the *scrollable* travel of a
 * tall container, which is what a pinned scroll scene needs.
 */
export function usePinnedProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const travel = rect.height - viewport;
      if (travel <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }
      setProgress(clamp(-rect.top / travel));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress };
}
