import { useEffect, useState } from "react";

/**
 * A hairline reading-progress bar pinned under the site header.
 * Purely decorative, so it is hidden from assistive tech.
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div
        className="h-full origin-left rounded-r-full bg-gradient-to-r from-berry via-amber-400 to-berry shadow-[0_0_12px_oklch(0.771_0.126_20_/_60%)]"
        style={{
          transform: `scaleX(${progress})`,
          transition: "transform 120ms linear",
        }}
      />
    </div>
  );
}
