import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clapperboard, Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { clamp, usePrefersReducedMotion } from "@/lib/motion";
import { finalPrice, formatCurrency, type CatalogProduct } from "@/lib/pricing";

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
    kicker: "Reel 01 — The dark",
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
    kicker: "Reel 02 — The fold",
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
    kicker: "Reel 03 — The fudge",
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
    kicker: "Reel 04 — The message",
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
    kicker: "Reel 05 — The set",
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
    kicker: "Reel 06 — The hand-off",
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
 * cross-dissolve and push in, with the subtitle for the current shot beside the
 * frame. Pressing play hands the scrolling over to the page itself, so it
 * genuinely runs like a video — and any real wheel, touch or key press takes
 * control straight back.
 *
 * Visitors who prefer reduced motion get the same six shots as a plain
 * editorial grid, with no pinning, no scrubbing and no autoplay.
 */
export function ProductFilm({ products }: { products: CatalogProduct[] }) {
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

  // A strip of what is actually on the counter today, so the film ends on
  // something orderable rather than on a mood.
  const cast = products
    .filter((product) => product.image_url)
    .slice(0, 10)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image_url as string,
      price: finalPrice(product.price, product.discount_type, product.discount_value),
    }));

  // ------------------------------------------------------------ reduced motion
  if (reduced) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#140B06] p-5 text-white sm:rounded-[2.5rem] sm:p-8">
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
          <FilmFooterCta />
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
          slid its player chrome underneath it. 4rem clears the header in both
          its normal and condensed heights. */}
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] w-full items-center overflow-hidden sm:px-4 sm:py-6">
        <div className="film-grain relative mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden border-white/10 bg-[#140B06] text-white sm:h-auto sm:max-h-full sm:rounded-[2.5rem] sm:border">
          {/* ── Player chrome ─────────────────────────────────────────── */}
          <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative grid size-7 shrink-0 place-items-center">
                <span className="absolute inset-0 animate-halo-pulse rounded-full bg-rose-500/60" />
                <span className="relative size-2.5 rounded-full bg-rose-400" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-amber-300 uppercase">
                  Now playing
                </p>
                <p className="truncate font-blogh text-sm font-bold tracking-wide text-white uppercase sm:text-base">
                  A morning at Aniii Bakes
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/60 uppercase lg:inline-flex">
                <Volume2 className="size-3" /> Subtitles on
              </span>
              <span className="font-mono text-xs font-bold text-white/70 tabular-nums">
                {formatClock(elapsed)}
                <span className="text-white/35"> / {formatClock(RUNTIME_SECONDS)}</span>
              </span>
              <button
                type="button"
                data-player-control
                onClick={togglePlay}
                aria-pressed={playing}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-amber-400 px-3.5 text-[11px] font-black text-[#2A1509] uppercase transition-transform hover:scale-[1.03] active:scale-95 sm:h-9 sm:px-4 sm:text-xs"
              >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                <span className="hidden sm:inline">{playing ? "Pause" : "Play film"}</span>
              </button>
            </div>
          </div>

          {/* ── Frame + subtitle rail ─────────────────────────────────── */}
          <div className="relative grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
            {/* The frame */}
            <div className="relative min-h-0 overflow-hidden bg-black">
              {SCENES.map((item, index) => {
                // Scenes stack in order and each fades in over the first fifth
                // of its own band, so the one beneath is still fully painted —
                // a clean dissolve rather than a flash of background.
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
                      transform: `scale(${(1.05 + local * 0.1).toFixed(4)})`,
                    }}
                  />
                );
              })}

              {/* Legibility wash — from the bottom, and from the left where the
                  headline sits, so the middle of the shot keeps its colour. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140B06] via-[#140B06]/35 via-40% to-transparent to-72%"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#140B06]/80 to-transparent to-55%"
              />

              {/* Headline for the current shot. Keyed so it replays on a cut. */}
              <div
                key={scene.id}
                className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 lg:p-9"
                style={{ animation: "fade-up 620ms cubic-bezier(0.16,1,0.3,1) both" }}
              >
                <p className="font-mono text-[10px] font-bold tracking-[0.24em] text-amber-300 uppercase sm:text-[11px]">
                  {scene.timecode} — {scene.kicker}
                </p>
                <h3 className="mt-2 font-blogh text-[clamp(1.75rem,5.5vw,4rem)] leading-[0.95] font-bold tracking-wide text-white uppercase">
                  <span className="block">{scene.headline[0]}</span>
                  <span className="block text-amber-300">{scene.headline[1]}</span>
                </h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-blogh text-2xl font-bold text-white sm:text-3xl">
                    {scene.stat}
                  </span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-white/55 uppercase">
                    {scene.statLabel}
                  </span>
                </p>
              </div>
            </div>

            {/* The subtitle rail beside the frame */}
            <aside className="relative hidden min-h-0 flex-col border-l border-white/10 bg-[#1B0F08] lg:flex">
              <div className="border-b border-white/10 px-5 py-4">
                <FilmHeading compact />
              </div>

              <ol className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                {SCENES.map((item, index) => {
                  const current = index === active;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => seek((index + 0.35) / SCENES.length)}
                        aria-current={current ? "true" : undefined}
                        className={cn(
                          "w-full cursor-pointer rounded-2xl border p-3.5 text-left transition-colors",
                          current
                            ? "border-amber-400/40 bg-amber-400/10"
                            : "border-transparent hover:bg-white/5",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold tabular-nums",
                              current ? "text-amber-300" : "text-white/40",
                            )}
                          >
                            {item.timecode}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold tracking-[0.18em] uppercase",
                              current ? "text-white" : "text-white/45",
                            )}
                          >
                            {item.kicker}
                          </span>
                        </div>
                        {/* Only the current subtitle is spelled out; the rest
                            stay as a contents list, so the rail never becomes a
                            wall of text competing with the frame. */}
                        <p
                          className={cn(
                            "mt-1 font-blogh text-base font-bold tracking-wide uppercase transition-colors",
                            current ? "text-white" : "text-white/55",
                          )}
                        >
                          {item.headline[0]} {item.headline[1]}
                        </p>
                        <span
                          className={cn(
                            "grid transition-all duration-500",
                            current ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="mt-1.5 block text-[13px] leading-relaxed text-white/70">
                              {item.caption}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="border-t border-white/10 p-4">
                <FilmFooterCta compact />
              </div>
            </aside>
          </div>

          {/* ── Scrubber ──────────────────────────────────────────────── */}
          <div className="relative z-20 shrink-0 border-t border-white/10 px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="flex items-center gap-1.5">
              {SCENES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => seek((index + 0.35) / SCENES.length)}
                  aria-label={`Jump to ${item.timecode}, ${item.headline[0]} ${item.headline[1]}`}
                  className="group h-6 flex-1 cursor-pointer"
                >
                  <span className="block h-1 w-full overflow-hidden rounded-full bg-white/15 transition-colors group-hover:bg-white/30">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${clamp(sceneFloat - index) * 100}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>

            {/* On phones the rail has nowhere to sit, so the current subtitle
                runs under the scrubber instead. */}
            <p
              key={`${scene.id}-caption`}
              className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-white/65 lg:hidden"
              style={{ animation: "fade-up 500ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {scene.caption}
            </p>
          </div>

          {/* ── The cast: what is actually on the counter ─────────────── */}
          {cast.length > 0 && (
            <div className="relative z-20 hidden shrink-0 items-center gap-3 border-t border-white/10 px-4 py-2.5 sm:flex sm:px-6">
              <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                Starring
              </span>
              <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {cast.map((item) => (
                  <Link
                    key={item.id}
                    to="/shop/$slug"
                    params={{ slug: item.slug }}
                    className="group flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1 transition-colors hover:border-amber-400/40 hover:bg-white/10"
                  >
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-6 rounded-full object-cover"
                    />
                    <span className="max-w-32 truncate text-[11px] font-bold text-white/80 group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-300 tabular-nums">
                      {formatCurrency(item.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilmHeading({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-amber-300 uppercase">
        <Clapperboard className="size-3" /> The morning reel
      </span>
      <h2
        className={cn(
          "mt-2 font-blogh font-bold tracking-wide text-white uppercase",
          compact ? "text-lg" : "text-2xl sm:text-4xl",
        )}
      >
        Six shots, one morning
      </h2>
      {!compact && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
          Scroll to scrub through it, or press play and let it run.
        </p>
      )}
    </div>
  );
}

function FilmFooterCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex gap-2", compact ? "flex-col" : "mt-7 flex-col sm:flex-row")}>
      <Link
        to="/shop"
        className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-amber-400 px-5 text-xs font-black text-[#2A1509] uppercase transition-transform hover:scale-[1.02] active:scale-95"
      >
        Order what you just watched
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Link
        to="/about"
        className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/15 px-5 text-xs font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        How we bake it
      </Link>
    </div>
  );
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default ProductFilm;
