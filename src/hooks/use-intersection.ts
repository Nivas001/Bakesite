import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to a DOM element and a boolean `isVisible`
 * that becomes true once the element enters the viewport.
 * Once visible, stays visible (no re-trigger on scroll back).
 */
export function useIntersection(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // once visible, stop observing
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
