"use client";

import {
  animate,
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import * as React from "react";

export type InertiaGalleryProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> & {
  /** Slides, in order. */
  children?: React.ReactNode;
  /** Slide width in px. Default is 270. */
  itemWidth?: number | undefined;
  /** Gap between slides in px. Default is 24. */
  gap?: number | undefined;
  /** Snap the nearest slide to center when the throw settles. */
  snap?: boolean | undefined;
  /** 0 disables the distance-from-center scale/blur/opacity falloff. */
  falloff?: number | undefined;
  /** Slide centered on mount (0-indexed). */
  defaultIndex?: number | undefined;
  /** Fired when a new slide reaches center. */
  onChange?: ((index: number) => void) | undefined;
  className?: string | undefined;
};

// SPRING.smooth — surfaces / settle.
const SETTLE_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.9,
} as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

type ItemProps = {
  offset: number;
  pitch: number;
  x: MotionValue<number>;
  falloff: number;
  reduce: boolean;
  width: number;
  children: React.ReactNode;
};

const InertiaItem: React.FC<ItemProps> = ({
  offset,
  pitch,
  x,
  falloff,
  reduce,
  width,
  children,
}) => {
  // Normalised distance of this slide's center from the viewport center.
  const nd = useTransform(x, (xv) =>
    Math.min(Math.abs(offset + xv) / pitch, 2.6),
  );
  const scale = useTransform(nd, (d) => 1 - d * 0.14 * falloff);
  const opacity = useTransform(nd, (d) => clamp(1 - d * 0.32 * falloff, 0.35, 1));
  const blurPx = useTransform(nd, (d) =>
    reduce ? 0 : Math.min(d * 3.4, 5) * falloff,
  );
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      className="relative shrink-0 select-none py-4"
      style={{ width, scale, opacity, filter }}
    >
      <div className="aspect-[3/4] size-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl shadow-black/15 transition-shadow duration-300">
        {children}
      </div>
    </motion.div>
  );
};

export const InertiaGallery = React.forwardRef<HTMLDivElement, InertiaGalleryProps>(
  (
    {
      children,
      itemWidth = 270,
      gap = 24,
      snap = true,
      falloff = 1,
      defaultIndex = 0,
      onChange,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const reduce = useReducedMotion() ?? false;
    const rawItems = React.Children.toArray(children);
    const count = rawItems.length;
    const pitch = itemWidth + gap;
    const effFalloff = reduce ? 0 : falloff;

    // Build 3 clones for seamless 360° circular wrapping: [Clone Left, Active Middle, Clone Right]
    const clonedItems = React.useMemo(() => {
      if (count <= 1) return rawItems;
      return [...rawItems, ...rawItems, ...rawItems];
    }, [rawItems, count]);

    const totalClones = clonedItems.length;
    const middleOffset = count > 1 ? count : 0;
    const initialIndex = middleOffset + Math.max(0, Math.min(count - 1, defaultIndex));

    const x = useMotionValue(-initialIndex * pitch);
    const [virtualActive, setVirtualActive] = React.useState(initialIndex);
    const [pad, setPad] = React.useState(0);
    const viewportRef = React.useRef<HTMLDivElement>(null);

    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;

    // Center the active slide by padding the track by half the viewport free space
    React.useEffect(() => {
      const el = viewportRef.current;
      if (!el) return;
      const measure = () =>
        setPad(Math.max(0, (el.clientWidth - itemWidth) / 2));
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [itemWidth]);

    const normalizeIndex = React.useCallback(
      (idx: number) => {
        if (count <= 1) return 0;
        return ((idx % count) + count) % count;
      },
      [count],
    );

    const commit = React.useCallback(
      (virtualIdx: number) => {
        const clampedIdx = clamp(virtualIdx, 0, totalClones - 1);
        setVirtualActive(clampedIdx);
        const realIdx = normalizeIndex(clampedIdx);
        onChangeRef.current?.(realIdx);
        return clampedIdx;
      },
      [totalClones, normalizeIndex],
    );

    const goTo = React.useCallback(
      (targetVirtualIdx: number) => {
        const next = commit(targetVirtualIdx);
        animate(x, -next * pitch, {
          ...SETTLE_SPRING,
          onComplete: () => {
            // If we moved into outer buffer sets, seamlessly jump back to the middle set
            if (count > 1) {
              if (next < count) {
                const wrapped = next + count;
                x.set(-wrapped * pitch);
                setVirtualActive(wrapped);
              } else if (next >= count * 2) {
                const wrapped = next - count;
                x.set(-wrapped * pitch);
                setVirtualActive(wrapped);
              }
            }
          },
        });
      },
      [commit, pitch, x, count],
    );

    const nearest = React.useCallback(
      () => clamp(Math.round(-x.get() / pitch), 0, totalClones - 1),
      [totalClones, pitch, x],
    );

    const handleDragEnd = () => {
      if (snap) {
        goTo(nearest());
      } else {
        commit(nearest());
      }
    };

    const handleKey = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(virtualActive - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(virtualActive + 1);
      }
    };

    const currentDisplayIndex = count > 0 ? normalizeIndex(virtualActive) + 1 : 1;

    return (
      <div
        ref={forwardedRef}
        data-slot="inertia-gallery"
        className={`flex flex-col items-center gap-4 ${className ?? ""}`}
        {...props}
      >
        {/* Gallery Throw Track — Generous padding prevents any bottom shadow line clipping */}
        <div
          ref={viewportRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="Artisan Gallery"
          className="relative w-full max-w-full touch-pan-y overflow-hidden py-6 -my-2 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
        >
          <motion.div
            className="flex cursor-grab items-center active:cursor-grabbing"
            style={{ x, gap, paddingLeft: pad, paddingRight: pad }}
            drag="x"
            dragConstraints={
              count > 1
                ? { left: -(totalClones - 1) * pitch, right: 0 }
                : { left: 0, right: 0 }
            }
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
          >
            {clonedItems.map((child, i) => (
              <InertiaItem
                key={i}
                offset={i * pitch}
                pitch={pitch}
                x={x}
                falloff={effFalloff}
                reduce={reduce}
                width={itemWidth}
              >
                {child}
              </InertiaItem>
            ))}
          </motion.div>
        </div>

        {/* Carousel Position Indicator & Seamless Infinite Navigation Controls */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => goTo(virtualActive - 1)}
            onKeyDown={handleKey}
            aria-label="Previous Shot"
            className="grid size-9.5 place-items-center rounded-full border border-border/80 bg-card text-foreground shadow-xs transition-all hover:bg-secondary hover:border-berry/40 active:scale-95 cursor-pointer text-base font-bold select-none"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3.5 py-1 text-xs font-mono font-bold text-muted-foreground shadow-2xs backdrop-blur-xs select-none">
            <span className="text-cocoa font-black">{currentDisplayIndex}</span>
            <span>/</span>
            <span>{count}</span>
          </div>
          <button
            type="button"
            onClick={() => goTo(virtualActive + 1)}
            onKeyDown={handleKey}
            aria-label="Next Shot"
            className="grid size-9.5 place-items-center rounded-full border border-border/80 bg-card text-foreground shadow-xs transition-all hover:bg-secondary hover:border-berry/40 active:scale-95 cursor-pointer text-base font-bold select-none"
          >
            ›
          </button>
        </div>
      </div>
    );
  },
);

InertiaGallery.displayName = "InertiaGallery";

export interface GalleryShotProps {
  image: string;
  label: string;
  tag?: string | undefined;
  alt?: string | undefined;
  onClick?: (() => void) | undefined;
}

export function GalleryShot({ image, label, tag, alt, onClick }: GalleryShotProps) {
  return (
    <div
      onClick={onClick}
      className="group relative size-full overflow-hidden bg-muted cursor-pointer select-none"
    >
      <img
        src={image}
        alt={alt ?? label}
        draggable={false}
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
      />

      {/* Subtle radial lighting gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

      {/* Top Tag (Optional) */}
      {tag && (
        <div className="absolute top-3.5 right-3.5 pointer-events-none">
          <span className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            {tag}
          </span>
        </div>
      )}

      {/* Floating Bottom Glassmorphic Badge Pill (Matches Screenshot) */}
      <div className="absolute bottom-3.5 left-3.5 pointer-events-none max-w-[calc(100%-1.75rem)]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20">
          <span className="truncate">{label}</span>
        </div>
      </div>
    </div>
  );
}
