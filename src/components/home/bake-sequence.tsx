import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { clamp, usePrefersReducedMotion } from "@/lib/motion";
import type { BakeScene } from "./bake-sequence-scene";

interface Step {
  index: string;
  kicker: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

const STEPS: Step[] = [
  {
    index: "01",
    kicker: "The empty bowl",
    title: "Nothing but a bowl",
    body: "Every bake on this site starts the same way — one cold steel bowl on the bench, scales zeroed, nothing in it yet. No pre-mix, no packet, no shortcut waiting in a cupboard.",
    stat: "0",
    statLabel: "Pre-mixes used",
  },
  {
    index: "02",
    kicker: "The flour",
    title: "Flour goes in first",
    body: "Stone-ground wheat, sifted twice so the crumb comes out light instead of tight. It is weighed to the gram — baking is the one kind of cooking where guessing shows.",
    stat: "±1g",
    statLabel: "Weighed, not scooped",
  },
  {
    index: "03",
    kicker: "The mix",
    title: "Water, then the whisk",
    body: "Cold water and eggs go in against the flour and the whisk does the rest. Beaten until the ribbon holds for three full seconds — that is the only timer we trust here.",
    stat: "3s",
    statLabel: "Ribbon stage",
  },
  {
    index: "04",
    kicker: "The oven",
    title: "Into the heat, and it rises",
    body: "A 180°C deck oven, no fan, no opening the door. The batter climbs the tin, sets at the edges, and turns from pale to gold in the last four minutes.",
    stat: "180°C",
    statLabel: "Deck oven, no fan",
  },
  {
    index: "05",
    kicker: "The finish",
    title: "Buttercream and berries",
    body: "Cooled completely, then coated in pink whipped mascarpone and piped around the rim by hand. Fresh berries and a little gold go on last, while the cream is still soft.",
    stat: "4″",
    statLabel: "Bento, serves 2–3",
  },
  {
    index: "06",
    kicker: "The name",
    title: "And someone's name on top",
    body: "The last thing that happens to every cake is a piping bag and a steady hand. This is the part that makes it theirs — and the reason most of these leave with a name on them.",
    stat: "1",
    statLabel: "Cake, one person",
  },
];

/**
 * A pinned, scroll-choreographed 3D bake: an empty bowl takes flour and water,
 * is whisked to batter, rises under oven elements, and is finished as a bento
 * cake with lettering piped across the top.
 *
 * The WebGL context is created lazily as the section approaches the viewport
 * and the render loop only runs while the section is actually on screen, so it
 * costs nothing on the rest of the page. Visitors who prefer reduced motion get
 * the six steps as a plain stacked list with no canvas at all.
 */
export function BakeSequence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<BakeScene | null>(null);
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
      setActive(Math.min(STEPS.length - 1, Math.floor(t * STEPS.length)));
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
    let booting = false;
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
      // On wide layouts the copy occupies the left column, so the bake moves
      // right far enough to clear it. Below that it centres behind the copy,
      // which the scrim keeps readable.
      const width = window.innerWidth;
      const focusX = width >= 1280 ? 1.7 : width >= 1024 ? 1.25 : 0;
      // Narrow screens anchor the copy panel to the bottom of the stage, so the
      // bake lifts to sit clear of it.
      const focusY = width >= 1024 ? 0 : 1.1;
      scene.update(progressRef.current, (performance.now() - start) / 1000, focusX, focusY);
      scene.render();
      if (visible) raf = requestAnimationFrame(loop);
    };

    // Three.js is imported here rather than at module scope so it lands in its
    // own chunk and is only fetched as this section comes into range, instead
    // of being paid for by every page that shares the entry bundle.
    const boot = async () => {
      if (sceneRef.current || disposed || booting) return;
      booting = true;
      try {
        const { createBakeScene } = await import("./bake-sequence-scene");
        if (disposed) return;
        // Smaller viewports get a cheaper scene: no antialiasing, no shadow
        // map, fewer segments and fewer decorations.
        const quality = window.innerWidth < 820 ? "low" : "high";
        sceneRef.current = createBakeScene(canvas, quality);
        sizeToBox();
        setReady(true);
        if (visible && !raf) raf = requestAnimationFrame(loop);
      } catch (error) {
        // A machine without a usable WebGL context still gets the step text,
        // but the reason should not disappear silently.
        console.warn("[bake-sequence] 3D scene unavailable:", error);
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
        <SequenceHeading />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.index}
              className="rounded-3xl border-2 border-[#2C1810]/15 bg-card/90 p-5 shadow-soft"
            >
              <p className="font-mono text-[10px] font-black tracking-[0.2em] text-berry-deep uppercase">
                {step.index} · {step.kicker}
              </p>
              <h3 className="mt-1 font-nimbus text-2xl font-bold text-cocoa dark:text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <p className="mt-3 font-nimbus text-xl font-bold text-cocoa dark:text-foreground">
                {step.stat}{" "}
                <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {step.statLabel}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const current = STEPS[active] ?? STEPS[0]!;

  return (
    <section
      ref={sectionRef}
      aria-label="How a cake is made at Aniii Bakes, from empty bowl to finished bento"
      className="relative h-[520vh] w-full sm:h-[560vh]"
    >
      {/* Pinned stage. Offset below the sticky site header so the step counter
          along the top is never tucked underneath it. */}
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] w-full items-end overflow-hidden lg:items-center">
        {/* Warm kitchen backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,#FFF6E9_0%,#FBE6D4_45%,#F2CDBA_100%)] dark:bg-[radial-gradient(120%_90%_at_50%_15%,#26170B_0%,#190E06_50%,#100704_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/4 -left-40 size-[32rem] rounded-full bg-amber-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 bottom-0 size-[28rem] rounded-full bg-berry/20 blur-3xl"
        />

        {/* The bake */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Keeps the step copy readable where it crosses the bake: a wash from
            the left on wide layouts, from the bottom on narrow ones. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFF6E9] from-0% via-[#FFF6E9]/80 via-25% to-transparent to-55% lg:bg-gradient-to-r lg:via-[#FFF6E9]/70 lg:via-22% lg:to-45% dark:from-[#150B05] dark:via-[#150B05]/80 lg:dark:via-[#150B05]/70"
        />

        {/* Step ticks down the right edge — a contents list for the sequence,
            so its length is legible before committing to the scroll. */}
        <ol
          aria-hidden
          className="absolute top-1/2 right-5 z-10 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
        >
          {STEPS.map((step, i) => (
            <li key={step.index} className="flex items-center justify-end gap-2.5">
              <span
                className={cn(
                  "font-mono text-[10px] font-bold tracking-[0.18em] whitespace-nowrap uppercase transition-all duration-300",
                  i === active
                    ? "translate-x-0 text-cocoa opacity-100 dark:text-foreground"
                    : "translate-x-1 text-cocoa/40 opacity-0 dark:text-foreground/40",
                )}
              >
                {step.kicker}
              </span>
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  i === active
                    ? "size-2.5 bg-berry"
                    : i < active
                      ? "size-1.5 bg-berry/50"
                      : "size-1.5 bg-cocoa/20 dark:bg-white/25",
                )}
              />
            </li>
          ))}
        </ol>

        {/* Copy rail */}
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-12 lg:items-center lg:px-6">
          {/* Below lg the bake fills the stage behind this, so the copy needs
              its own surface rather than a gradient it can still lose against. */}
          <div className="rounded-t-[2rem] border-t border-[#2C1810]/10 bg-[#FFF6E9]/94 px-5 pt-5 pb-7 backdrop-blur-md lg:col-span-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none dark:border-white/10 dark:bg-[#150B05]/94 lg:dark:bg-transparent">
            <SequenceHeading />

            {/* Steps cross-fade in place so the bake stays the focus. Tall
                enough for the longest step, so the body copy never runs over
                the progress rail beneath it. */}
            <div className="relative mt-4 min-h-[16.5rem] sm:min-h-[15rem] lg:mt-5 lg:min-h-[21rem]">
              {STEPS.map((step, i) => (
                <article
                  key={step.index}
                  aria-hidden={i !== active}
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    i === active
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-3 opacity-0",
                  )}
                >
                  <p className="flex items-center gap-2.5 font-mono text-[10px] font-black tracking-[0.24em] text-berry-deep uppercase">
                    <span className="tabular-nums">{step.index}</span>
                    <span aria-hidden className="h-px w-6 bg-berry/40" />
                    <span>{step.kicker}</span>
                  </p>
                  <h3 className="mt-1.5 font-nimbus text-3xl leading-tight font-bold text-cocoa sm:text-5xl dark:text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-cocoa/75 sm:text-base dark:text-muted-foreground">
                    {step.body}
                  </p>
                  <p className="mt-4 inline-flex items-baseline gap-2 rounded-2xl border border-cocoa/12 bg-card/70 px-3.5 py-2 backdrop-blur-sm dark:border-white/10">
                    <span className="font-nimbus text-3xl font-bold text-cocoa sm:text-4xl dark:text-foreground">
                      {step.stat}
                    </span>
                    <span className="font-mono text-[10px] font-black tracking-[0.18em] text-muted-foreground uppercase">
                      {step.statLabel}
                    </span>
                  </p>
                </article>
              ))}
            </div>

            {/* Step rail doubles as a progress indicator. */}
            <div className="mt-6">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                  Step {active + 1} of {STEPS.length}
                </span>
                <span className="font-mono text-[10px] font-bold text-muted-foreground tabular-nums">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <ol className="flex items-center gap-2" aria-hidden>
                {STEPS.map((step, i) => (
                  <li key={step.index} className="flex-1">
                    <span
                      className={cn(
                        "block h-1 overflow-hidden rounded-full transition-colors duration-300",
                        i < active ? "bg-berry" : "bg-cocoa/15 dark:bg-white/15",
                      )}
                    >
                      {i === active && (
                        <span
                          className="block h-full rounded-full bg-berry transition-[width] duration-150"
                          style={{ width: `${((progress * STEPS.length) % 1) * 100}%` }}
                        />
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* The prompt at the start gives way to the way out at the end, so
                the pinned section never dead-ends. */}
            <div className="relative mt-5 h-11">
              <p
                className={cn(
                  "absolute inset-y-0 left-0 inline-flex items-center gap-1.5 rounded-full border border-cocoa/15 bg-card/70 px-3 font-mono text-[10px] font-bold tracking-[0.18em] text-cocoa/70 uppercase backdrop-blur transition-opacity duration-500 dark:text-foreground/70",
                  progress > 0.04 ? "pointer-events-none opacity-0" : "opacity-100",
                )}
              >
                <ChevronDown className="size-3 animate-bounce" />
                Scroll to bake
              </p>

              <Link
                to="/shop"
                search={{ category: "cakes" }}
                className={cn(
                  "group absolute inset-y-0 left-0 inline-flex items-center gap-2 rounded-full bg-cocoa px-5 text-xs font-black tracking-wider text-background uppercase shadow-lift transition-all duration-500 hover:scale-[1.03] active:scale-95 sm:text-sm",
                  progress > 0.88 ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                Order one like this
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right column is deliberately empty on desktop — it is the bake's stage. */}
          <div className="hidden lg:col-span-7 lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function SequenceHeading() {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-berry/25 bg-berry/10 px-3 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-berry-deep uppercase">
        <span className="relative grid size-2 place-items-center">
          <span className="absolute inset-0 animate-halo-pulse rounded-full bg-berry/70" />
          <span className="relative size-1 rounded-full bg-berry-deep" />
        </span>
        Bowl to bento, in six steps
      </span>
      <h2 className="mt-2.5 font-blogh text-2xl leading-tight font-bold tracking-wide text-cocoa uppercase sm:text-3xl dark:text-foreground">
        Watch one get made
      </h2>
    </div>
  );
}

export default BakeSequence;
