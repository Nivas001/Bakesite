import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { clamp, usePrefersReducedMotion } from "@/lib/motion";

interface Scene {
  id: string;
  /** Position on the film's own clock, shown like a video timestamp. */
  timecode: string;
  kicker: string;
  /** Split across two lines so the type can be set large without wrapping badly. */
  headline: [string, string];
  /** The subtitle track — what a voiceover would be saying over this shot. */
  caption: string;
  stat: string;
  statLabel: string;
  image: string;
  /** Focal point for the frame, so the subject survives the crop on phones. */
  focus: string;
}

/**
 * Six shots of a morning at the bakery, cut from our own product photography.
 *
 * The images are ones the catalogue already ships, so the film is of the actual
 * bakes rather than stock footage, and it costs no extra download on a page
 * that has already loaded them.
 */
const SCENES: Scene[] = [
  {
    id: "dark",
    timecode: "00:00",
    kicker: "The dark",
    headline: ["It starts", "at 4 AM"],
    caption:
      "The street is still asleep. The deck oven has been climbing to 240°C for an hour, and the first sourdough goes in before the sky does anything at all.",
    stat: "4:00",
    statLabel: "AM, every day",
    image: "/products/artisan-sourdough.jpg",
    focus: "50% 45%",
  },
  {
    id: "butter",
    timecode: "00:09",
    kicker: "The fold",
    headline: ["Butter,", "folded 72 times"],
    caption:
      "Cold French butter laminated into cold dough, rested, turned, rested again. You cannot rush a croissant — it counts the hours whether you do or not.",
    stat: "72",
    statLabel: "Layers, by hand",
    image: "/products/artisan-croissant.jpg",
    focus: "50% 50%",
  },
  {
    id: "cocoa",
    timecode: "00:18",
    kicker: "The fudge",
    headline: ["Chocolate,", "taken seriously"],
    caption:
      "70% Belgian couverture melted into browned butter. Pulled from the oven while the centre still wobbles, so it sets to fudge instead of cake.",
    stat: "70%",
    statLabel: "Belgian couverture",
    image: "/products/belgian-fudge-brownie-stack.jpg",
    focus: "50% 50%",
  },
  {
    id: "bento",
    timecode: "00:27",
    kicker: "The message",
    headline: ["Small cakes,", "big days"],
    caption:
      "A four-inch bento, whipped mascarpone, and whatever you want written across it. Most of these leave the counter with somebody's name on them.",
    stat: "2–3",
    statLabel: "Guests per bento",
    image: "/cakes/pink-bento-cake.webp",
    focus: "50% 42%",
  },
  {
    id: "cold",
    timecode: "00:36",
    kicker: "The set",
    headline: ["Cold-set,", "never rushed"],
    caption:
      "Cheesecakes bake in a water bath, then sit overnight. The wait is the recipe — it is the only way the middle comes out silk instead of grainy.",
    stat: "12h",
    statLabel: "Overnight chill",
    image: "/products/strawberry-cheesecake.jpg",
    focus: "50% 48%",
  },
  {
    id: "yours",
    timecode: "00:45",
    kicker: "The hand-off",
    headline: ["Then it", "is yours"],
    caption:
      "Boxed cold, driven across Pondicherry, and handed over inside your slot. The part we never get to watch is the only part that counts.",
    stat: "24h",
    statLabel: "Notice, that is all",
    image: "/cakes/royal-gold-brownie.webp",
    focus: "50% 50%",
  },
];

/** How long the film takes to play itself, in seconds. */
const RUNTIME_SECONDS = 52;

/**
 * A scroll-scrubbed film of the bakery's own product photography.
 *
 * The section pins while it plays: scrolling scrubs through six shots that
 * cross-dissolve and push in, with the subtitle for the current shot set
 * directly beneath its headline. Pressing play hands the scrolling over to the
 * page itself, so it genuinely runs like a video — and any real wheel, touch or
 * key press takes control straight back.
 *
 * The frame is deliberately edge to edge with almost no chrome. An earlier
 * version split the stage into a photograph and a scrolling list of all six
 * subtitles, which clipped its own text mid-word, fought the photograph for
 * attention and left two competing calls to action inside the picture. One
 * shot, one caption, one button.
 *
 * Visitors who prefer reduced motion get the same six shots as a plain
 * editorial grid, with no pinning, no scrubbing and no autoplay.
 */
export function ProductFilm() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();

  // ------------------------------------------------------------ scroll driver
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      setProgress(travel > 0 ? clamp(-rect.top / travel) : 0);
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

  // ----------------------------------------------------------------- playback
  // Playing scrolls the window at a constant rate, which keeps one source of
  // truth for where the film is: the scroll position. Nothing has to be kept in
  // sync, and stopping simply leaves the page where it is.
  useEffect(() => {
    if (!playing || reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const delta = Math.min(now - last, 100) / 1000;
      last = now;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0 || -rect.top >= travel) {
        setPlaying(false);
        return;
      }
      window.scrollBy(0, (travel / RUNTIME_SECONDS) * delta);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    // Any deliberate input from the visitor takes the film off autoplay. The
    // `scroll` event is deliberately not listened for — this loop causes it.
    //
    // The player's own controls are exempt. Discrete events flush their state
    // update before the click that follows them, so without this a pointerdown
    // on Pause turned playback off a beat before the click handler toggled it
    // straight back on, and the button did nothing.
    const stop = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-player-control]")) return;
      setPlaying(false);
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const event of events) window.addEventListener(event, stop, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      for (const event of events) window.removeEventListener(event, stop);
    };
  }, [playing, reduced]);

  /** Scrolls so the film sits at `target` (0–1) of its own timeline. */
  const seek = useCallback((target: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const travel = section.offsetHeight - window.innerHeight;
    if (travel <= 0) return;
    window.scrollTo({ top: section.offsetTop + travel * clamp(target), behavior: "smooth" });
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((wasPlaying) => {
      if (wasPlaying) return false;
      // Starting from the very end would look like nothing happened.
      if (progress > 0.985) seek(0);
      return true;
    });
  }, [progress, seek]);

  const sceneFloat = progress * SCENES.length;
  const active = Math.min(SCENES.length - 1, Math.floor(sceneFloat));
  const scene = SCENES[active] ?? SCENES[0]!;
  const elapsed = Math.round(progress * RUNTIME_SECONDS);

  // ------------------------------------------------------------ reduced motion
  if (reduced) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#0E0906] p-5 text-white sm:rounded-[2.5rem] sm:p-8">
          <FilmHeading />
          <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENES.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-4/3 w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase">
                    {item.timecode} · {item.kicker}
                  </p>
                  <h3 className="mt-1.5 font-blogh text-xl font-bold tracking-wide text-white uppercase">
                    {item.headline[0]} {item.headline[1]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.caption}</p>
                </div>
              </li>
            ))}
          </ol>
          <FilmCta className="mt-7" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label="A morning at Aniii Bakes, in six shots"
      className="relative h-[520vh] w-full"
    >
      {/* Pinned below the site header rather than at the very top of the
          viewport: the header is `sticky top-0 z-50`, so a stage pinned at 0
          slid its controls underneath it. 4rem clears the header in both its
          normal and condensed heights. */}
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] w-full items-center overflow-hidden sm:px-4 sm:py-5">
        <figure className="relative mx-auto h-full w-full max-w-7xl overflow-hidden bg-[#0E0906] sm:rounded-[2rem]">
          {/* ── The frame ─────────────────────────────────────────────── */}
          {SCENES.map((item, index) => {
            // Scenes stack in order and each fades in over the first fifth of
            // its own band, so the one beneath is still fully painted — a clean
            // dissolve rather than a flash of background.
            const local = clamp(sceneFloat - index, 0, 1);
            const opacity = index === 0 ? 1 : clamp((sceneFloat - index) / 0.2);
            return (
              <img
                key={item.id}
                src={item.image}
                alt=""
                aria-hidden
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 size-full object-cover will-change-transform"
                style={{
                  opacity,
                  objectPosition: item.focus,
                  transform: `scale(${(1.04 + local * 0.11).toFixed(4)})`,
                }}
              />
            );
          })}

          {/* Legibility scrim. Weighted to the bottom where the copy sits, so
              the top two-thirds of the photograph keeps its full colour — the
              previous left-to-right wash drained the whole shot. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E0906] from-[8%] via-[#0E0906]/55 via-[38%] to-transparent to-[68%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent"
          />

          {/* ── Top chrome ────────────────────────────────────────────── */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 sm:p-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative grid size-2.5 shrink-0 place-items-center">
                <span className="absolute inset-0 animate-halo-pulse rounded-full bg-rose-500/70" />
                <span className="relative size-1.5 rounded-full bg-rose-400" />
              </span>
              <span className="truncate font-mono text-[10px] font-bold tracking-[0.22em] text-white/70 uppercase sm:text-[11px]">
                The morning reel
              </span>
              <span className="hidden font-mono text-[11px] font-bold text-white/40 tabular-nums sm:inline">
                {formatClock(elapsed)} / {formatClock(RUNTIME_SECONDS)}
              </span>
            </div>

            <button
              type="button"
              data-player-control
              onClick={togglePlay}
              aria-pressed={playing}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:bg-black/60 sm:text-xs"
            >
              {playing ? (
                <Pause className="size-3.5 text-amber-300" />
              ) : (
                <Play className="size-3.5 text-amber-300" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
          </div>

          {/* ── Chapter ticks ─────────────────────────────────────────── */}
          {/* A minimal index down the right edge. Only the current chapter is
              named; the rest are marks, so the photograph is never competing
              with a wall of text. */}
          <ol className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col items-end gap-3.5 sm:right-6 md:flex">
            {SCENES.map((item, index) => {
              const current = index === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => seek((index + 0.35) / SCENES.length)}
                    aria-label={`Jump to ${item.timecode}, ${item.headline[0]} ${item.headline[1]}`}
                    aria-current={current ? "true" : undefined}
                    className="group flex cursor-pointer items-center justify-end gap-3"
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold tracking-[0.18em] whitespace-nowrap uppercase transition-all duration-300",
                        current
                          ? "translate-x-0 text-white opacity-100"
                          : "translate-x-2 text-white/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                      )}
                    >
                      {item.kicker}
                    </span>
                    <span
                      className={cn(
                        "block h-px transition-all duration-300",
                        current
                          ? "w-9 bg-amber-300"
                          : "w-4 bg-white/35 group-hover:w-7 group-hover:bg-white/80",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* ── Caption block ─────────────────────────────────────────── */}
          {/* Keyed on the scene so the whole block replays on every cut. */}
          <figcaption
            key={scene.id}
            className="absolute inset-x-0 bottom-0 z-10 p-5 pb-7 sm:p-8 sm:pb-10 lg:p-12 lg:pb-14"
            style={{ animation: "fade-up 640ms cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <div className="max-w-2xl">
              <p className="flex items-center gap-2.5 font-mono text-[10px] font-bold tracking-[0.24em] text-amber-300 uppercase sm:text-[11px]">
                <span className="tabular-nums">{scene.timecode}</span>
                <span aria-hidden className="h-px w-6 bg-amber-300/50" />
                <span>{scene.kicker}</span>
              </p>

              <h3 className="mt-2.5 font-blogh text-[clamp(2rem,6.5vw,5rem)] leading-[0.92] font-bold tracking-wide text-white uppercase">
                <span className="block">{scene.headline[0]}</span>
                <span className="block text-amber-300">{scene.headline[1]}</span>
              </h3>

              {/* The subtitle sits directly under the headline, where the eye
                  already is, instead of in a separate column beside it. */}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                {scene.caption}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="flex items-baseline gap-2 border-l-2 border-amber-300/60 pl-3">
                  <span className="font-blogh text-2xl font-bold text-white sm:text-3xl">
                    {scene.stat}
                  </span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-white/55 uppercase">
                    {scene.statLabel}
                  </span>
                </p>

                <FilmCta />
              </div>
            </div>
          </figcaption>

          {/* ── Progress ──────────────────────────────────────────────── */}
          {/* One hairline flush to the bottom edge, with a tick between each
              chapter. Clicking anywhere on it seeks. */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex h-4 items-end">
            {SCENES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => seek((index + 0.35) / SCENES.length)}
                aria-label={`Jump to ${item.timecode}`}
                tabIndex={-1}
                className="group h-4 flex-1 cursor-pointer px-px"
              >
                <span className="block h-0.5 w-full overflow-hidden bg-white/20 transition-colors group-hover:bg-white/45">
                  <span
                    className="block h-full bg-amber-300"
                    style={{ width: `${clamp(sceneFloat - index) * 100}%` }}
                  />
                </span>
              </button>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}

function FilmHeading() {
  return (
    <div>
      <span className="font-mono text-[10px] font-black tracking-[0.2em] text-amber-300 uppercase">
        The morning reel
      </span>
      <h2 className="mt-2 font-blogh text-2xl font-bold tracking-wide text-white uppercase sm:text-4xl">
        Six shots, one morning
      </h2>
    </div>
  );
}

function FilmCta({ className }: { className?: string }) {
  return (
    <Link
      to="/shop"
      className={cn(
        "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-black tracking-wider text-[#2A1509] uppercase transition-transform hover:scale-[1.03] active:scale-95 sm:text-sm",
        className,
      )}
    >
      Order the morning bake
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default ProductFilm;
