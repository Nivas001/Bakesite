import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { clamp, usePrefersReducedMotion } from "@/lib/motion";
import type { CakeScene } from "./cake-scroll-scene";

interface Chapter {
  kicker: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

const CHAPTERS: Chapter[] = [
  {
    kicker: "Chapter 01",
    title: "The sponge",
    body: "Stone-ground wheat, farm butter and whole-food sweeteners, folded by hand and baked in a 220°C deck oven. Three tiers, each one levelled while it is still warm.",
    stat: "0g",
    statLabel: "Refined sugar",
  },
  {
    kicker: "Chapter 02",
    title: "The cream",
    body: "French buttercream whipped to a ribbon, then chilled twice so it holds a clean edge. Berry mascarpone between the lower tiers, vanilla bean above.",
    stat: "84%",
    statLabel: "French butterfat",
  },
  {
    kicker: "Chapter 03",
    title: "The ganache",
    body: "70% Belgian couverture, tempered and poured at exactly 31°C. Too warm and it runs off the edge; too cool and it will not fall at all. Every drip is placed by hand.",
    stat: "31°C",
    statLabel: "Pour temperature",
  },
  {
    kicker: "Chapter 04",
    title: "The crown",
    body: "Hand-rolled truffle spheres, fresh berries and edible 24K gold leaf. Nothing artificial, nothing that was not made in this kitchen this morning.",
    stat: "24K",
    statLabel: "Edible gold leaf",
  },
  {
    kicker: "Chapter 05",
    title: "Your celebration",
    body: "Boxed cold, delivered to your slot, and lit at your table. This is the part we do not get to see — and the only part that actually matters.",
    stat: "4:00",
    statLabel: "AM dawn bake",
  },
];

/**
 * A pinned, scroll-choreographed 3D sequence: the bakery's signature cake
 * assembles itself tier by tier as the visitor scrolls, one story chapter at a
 * time.
 *
 * The WebGL context is created lazily when the section first approaches the
 * viewport and the render loop only runs while the section is actually on
 * screen, so it costs nothing on the rest of the page. Visitors who prefer
 * reduced motion get the chapters as a plain stacked list with no canvas at all.
 */
export function CakeScrollStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<CakeScene | null>(null);
  const progressRef = useRef(0);

  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  // ----------------------------------------------------------- scroll driver
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const t = travel > 0 ? clamp(-rect.top / travel) : 0;
      progressRef.current = t;
      setProgress(t);
      setActive(Math.min(CHAPTERS.length - 1, Math.floor(t * CHAPTERS.length)));
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
  }, [reduced]);

  // ------------------------------------------------------- WebGL scene + loop
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let raf = 0;
    let visible = false;
    let disposed = false;
    const start = performance.now();

    const sizeToBox = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const rect = canvas.getBoundingClientRect();
      scene.resize(Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)));
    };

    const loop = () => {
      raf = 0;
      const scene = sceneRef.current;
      if (!scene || disposed) return;
      // On wide layouts the copy occupies the left column, so the cake moves
      // right far enough to clear it. Below that it centres behind the copy,
      // which the scrim keeps readable.
      const width = window.innerWidth;
      const focusX = width >= 1280 ? 1.75 : width >= 1024 ? 1.3 : 0;
      // Narrow screens anchor the copy panel to the bottom of the stage, so the
      // cake lifts to sit clear of it.
      const focusY = width >= 1024 ? 0 : 1.15;
      scene.update(progressRef.current, (performance.now() - start) / 1000, focusX, focusY);
      scene.render();
      if (visible) raf = requestAnimationFrame(loop);
    };

    let booting = false;

    // Three.js is imported here rather than at module scope so it lands in its
    // own chunk and is only fetched as this section comes into range, instead
    // of being paid for by every page that shares the entry bundle.
    const boot = async () => {
      if (sceneRef.current || disposed || booting) return;
      booting = true;
      try {
        const { createCakeScene } = await import("./cake-scroll-scene");
        if (disposed) return;
        // Smaller viewports get a cheaper scene: no antialiasing, no shadow
        // map, fewer segments and fewer decorations.
        const quality = window.innerWidth < 820 ? "low" : "high";
        sceneRef.current = createCakeScene(canvas, quality);
        sizeToBox();
        setReady(true);
        if (visible && !raf) raf = requestAnimationFrame(loop);
      } catch (error) {
        // A machine without a usable WebGL context still gets the chapter text,
        // but the reason should not disappear silently.
        console.warn("[cake-scroll-story] 3D scene unavailable:", error);
        setReady(false);
      } finally {
        booting = false;
      }
    };

    // Build the scene slightly before it is needed, run it only while on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible) {
          void boot();
          if (sceneRef.current && !raf) raf = requestAnimationFrame(loop);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(section);

    // Fall back to a manual geometry check, for embeddings that throttle
    // observer callbacks away entirely.
    const recheck = window.setTimeout(() => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400 && rect.bottom > -400) {
        visible = true;
        void boot();
        if (sceneRef.current && !raf) raf = requestAnimationFrame(loop);
      }
    }, 1500);

    window.addEventListener("resize", sizeToBox);
    return () => {
      disposed = true;
      window.clearTimeout(recheck);
      observer.disconnect();
      window.removeEventListener("resize", sizeToBox);
      if (raf) cancelAnimationFrame(raf);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [reduced]);

  // ------------------------------------------------------------ reduced motion
  if (reduced) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <StoryHeading />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((chapter) => (
            <li
              key={chapter.kicker}
              className="rounded-3xl border-2 border-[#2C1810]/15 bg-card/90 p-5 shadow-soft"
            >
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-berry-deep">
                {chapter.kicker}
              </p>
              <h3 className="mt-1 font-nimbus text-2xl font-bold text-cocoa">{chapter.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chapter.body}</p>
              <p className="mt-3 font-nimbus text-xl font-bold text-cocoa">
                {chapter.stat}{" "}
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {chapter.statLabel}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const current = CHAPTERS[active] ?? CHAPTERS[0]!;

  return (
    <section
      ref={sectionRef}
      aria-label="How an Ani Bakes celebration cake is built"
      className="relative h-[460vh] w-full sm:h-[520vh]"
    >
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-[100svh] w-full items-end overflow-hidden lg:items-center">
        {/* Warm studio backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,#FFF3E2_0%,#FBE2D2_45%,#F3CDBE_100%)] dark:bg-[radial-gradient(120%_90%_at_50%_10%,#241509_0%,#180D06_50%,#0F0704_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/3 size-[34rem] rounded-full bg-amber-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 bottom-0 size-[30rem] rounded-full bg-berry/20 blur-3xl"
        />

        {/* The cake */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Keeps the chapter copy readable where it crosses the cake: a wash
            from the left on wide layouts, from the bottom on narrow ones.
            Explicit stops keep it over the copy only — without them the
            midpoint sat across the cake and drained the colour out of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFF3E2] from-0% via-[#FFF3E2]/80 via-25% to-transparent to-55% lg:bg-gradient-to-r lg:via-[#FFF3E2]/70 lg:via-22% lg:to-45% dark:from-[#150B05] dark:via-[#150B05]/80 lg:dark:via-[#150B05]/70"
        />

        {/* Copy rail */}
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-12 lg:items-center lg:px-6">
          {/* Below lg the cake fills the stage behind this, so the copy needs
              its own surface rather than a gradient it can still lose against. */}
          <div className="rounded-t-[2rem] border-t border-[#2C1810]/10 bg-[#FFF3E2]/94 px-5 pt-5 pb-7 backdrop-blur-md lg:col-span-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none dark:border-white/10 dark:bg-[#150B05]/94 lg:dark:bg-transparent">
            <StoryHeading />

            {/* Chapters cross-fade in place so the cake stays the focus. */}
            {/* Tall enough for the longest chapter, so the body copy never runs
                over the progress rail beneath it. */}
            <div className="relative mt-4 min-h-[15.5rem] sm:min-h-[14rem] lg:mt-5 lg:min-h-[21rem]">
              {CHAPTERS.map((chapter, i) => (
                <article
                  key={chapter.kicker}
                  aria-hidden={i !== active}
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    i === active
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-3 opacity-0",
                  )}
                >
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-berry-deep">
                    {chapter.kicker}
                  </p>
                  <h3 className="mt-1.5 font-nimbus text-3xl font-bold leading-tight text-cocoa sm:text-5xl">
                    {chapter.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-cocoa/75 sm:text-base dark:text-muted-foreground">
                    {chapter.body}
                  </p>
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="font-nimbus text-3xl font-bold text-cocoa sm:text-4xl">
                      {chapter.stat}
                    </span>
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {chapter.statLabel}
                    </span>
                  </p>
                </article>
              ))}
            </div>

            {/* Chapter rail doubles as a progress indicator. */}
            <ol className="mt-6 flex items-center gap-2" aria-hidden>
              {CHAPTERS.map((chapter, i) => (
                <li key={chapter.kicker} className="flex-1">
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-colors duration-300",
                      i < active
                        ? "bg-berry"
                        : i === active
                          ? "bg-berry/40"
                          : "bg-cocoa/15 dark:bg-white/15",
                    )}
                  >
                    {i === active && (
                      <span
                        className="block h-full rounded-full bg-berry transition-[width] duration-150"
                        style={{
                          width: `${((progress * CHAPTERS.length) % 1) * 100}%`,
                        }}
                      />
                    )}
                  </span>
                </li>
              ))}
            </ol>

            <p
              className={cn(
                "mt-5 inline-flex items-center gap-1.5 rounded-full border border-cocoa/15 bg-card/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cocoa/70 backdrop-blur transition-opacity duration-500",
                progress > 0.04 ? "opacity-0" : "opacity-100",
              )}
            >
              <ChevronDown className="size-3 animate-bounce" />
              Scroll to bake
            </p>
          </div>

          {/* Right column is deliberately empty on desktop — it is the cake's stage. */}
          <div className="hidden lg:col-span-7 lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function StoryHeading() {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-berry-deep">
        Built in five steps
      </span>
      <h2 className="mt-2.5 font-blogh text-2xl font-bold uppercase leading-tight tracking-wide text-cocoa sm:text-3xl">
        One cake, start to finish
      </h2>
    </div>
  );
}

export default CakeScrollStory;
