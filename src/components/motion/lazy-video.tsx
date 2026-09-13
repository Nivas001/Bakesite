import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

interface LazyVideoProps {
  /** Base asset path without an extension, e.g. `/illustration/open-mailbox`. */
  src: string;
  /** Extensions to offer, in preference order. */
  formats?: Array<"webm" | "mp4" | "mov">;
  /** Still frame shown in place of the clip when reduced motion is preferred. */
  poster?: string;
  alt?: string;
  className?: string;
}

const MIME: Record<string, string> = {
  webm: "video/webm",
  mp4: "video/mp4",
  mov: "video/quicktime",
};

/**
 * A decorative looping clip that costs nothing until it is actually on screen.
 *
 * The `<video>` element itself is only mounted once the wrapper scrolls into
 * view. That matters twice over: the browser never fetches the file for a
 * section the visitor does not reach — several of these are multi-megabyte
 * HEVC assets — and an empty `<video>` renders as a solid black rectangle in
 * some browsers, which would flash over these transparent illustrations before
 * their sources attached.
 *
 * Playback pauses whenever the clip scrolls back out of view, and visitors who
 * prefer reduced motion get the poster (or nothing) with no video requested.
 */
export function LazyVideo({
  src,
  formats = ["webm", "mp4"],
  poster,
  alt = "",
  className,
}: LazyVideoProps) {
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setLoad(true);
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);

    // Some embeddings throttle observer callbacks badly enough that they never
    // arrive. Re-check the geometry once by hand so an on-screen clip still
    // loads, without giving up laziness for off-screen ones.
    const recheck = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200 && rect.bottom > -200) setLoad(true);
    }, 1500);

    return () => {
      window.clearTimeout(recheck);
      observer.disconnect();
    };
  }, [reduced]);

  if (reduced) {
    return poster ? (
      <img src={poster} alt={alt} className={className} loading="lazy" decoding="async" />
    ) : (
      <span className={className} aria-hidden />
    );
  }

  return (
    <span ref={wrapRef} className={cn("block", className)}>
      {load && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={poster}
          aria-hidden={alt === "" ? true : undefined}
          aria-label={alt || undefined}
          className="size-full object-contain"
        >
          {formats.map((format) => (
            <source key={format} src={`${src}.${format}`} type={MIME[format]} />
          ))}
        </video>
      )}
    </span>
  );
}
