import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

interface LazyVideoProps {
  /** Base asset path without an extension, e.g. `/illustration/open-mailbox`. */
  src: string;
  /** Extensions to offer, in preference order. */
  formats?: Array<"webm" | "mp4" | "mov">;
  /** Still frame shown before the clip is fetched, and in place of it when
   *  the visitor prefers reduced motion. */
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
 * The `<source>` elements only render once the video scrolls into view, so the
 * browser never fetches the file for a section the visitor never reaches — this
 * matters because several of these clips are multi-megabyte HEVC assets.
 * Playback pauses whenever the clip scrolls back out of view.
 *
 * When the visitor prefers reduced motion the poster image is shown instead and
 * no video is ever requested.
 */
export function LazyVideo({
  src,
  formats = ["webm", "mp4"],
  poster,
  alt = "",
  className,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setLoad(true);
          void el.play().catch(() => {
            /* autoplay can be refused; the poster still shows */
          });
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  // Once the sources appear the element needs an explicit load() to pick them up.
  useEffect(() => {
    if (load) videoRef.current?.load();
  }, [load]);

  if (reduced && poster) {
    return <img src={poster} alt={alt} className={className} loading="lazy" decoding="async" />;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-hidden={alt === "" ? true : undefined}
      aria-label={alt || undefined}
      className={className}
    >
      {load &&
        formats.map((format) => (
          <source key={format} src={`${src}.${format}`} type={MIME[format]} />
        ))}
    </video>
  );
}
