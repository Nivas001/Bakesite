import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT, usePrefersReducedMotion } from "@/lib/motion";

export type RevealVariant =
  "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "blur-up" | "rise";

/** The hidden-state transform for each variant. The settled state is always identity. */
const HIDDEN_TRANSFORM: Record<RevealVariant, string> = {
  fade: "none",
  "fade-up": "translate3d(0, 28px, 0)",
  "fade-down": "translate3d(0, -24px, 0)",
  "fade-left": "translate3d(-32px, 0, 0)",
  "fade-right": "translate3d(32px, 0, 0)",
  scale: "scale(0.94)",
  "blur-up": "translate3d(0, 20px, 0)",
  rise: "translate3d(0, 56px, 0) scale(0.97)",
};

const HIDDEN_FILTER: Partial<Record<RevealVariant, string>> = {
  "blur-up": "blur(10px)",
};

/** How long to wait for the observer before revealing regardless. */
const FAILSAFE_MS = 2500;

interface RevealProps {
  children: ReactNode;
  /** Motion style applied as the element scrolls into view. */
  variant?: RevealVariant;
  /** Delay before the transition starts, in milliseconds. */
  delay?: number;
  /** Transition duration, in milliseconds. */
  duration?: number;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  /** Shrinks the viewport rect so the reveal fires slightly before the edge. */
  rootMargin?: string;
  /** Re-hide and replay every time the element leaves and re-enters the viewport. */
  repeat?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Reveals its children once they scroll into view.
 *
 * Renders children in their settled state immediately when the user prefers
 * reduced motion, and during SSR — so content is never trapped behind a
 * transition that cannot run.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 720,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  repeat = false,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (!repeat) observer.disconnect();
          } else if (repeat) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);

    // Safety net: content must never be left permanently invisible. Background
    // tabs, throttled embeddings and headless renderers can all delay or
    // suppress observer callbacks, so reveal anyway if nothing has fired.
    const failsafe = window.setTimeout(() => {
      setShown(true);
      if (!repeat) observer.disconnect();
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [reduced, repeat, threshold, rootMargin]);

  const settled = shown || reduced;

  return (
    <Tag
      ref={ref as never}
      data-revealed={settled ? "true" : "false"}
      className={cn("will-change-[opacity,transform]", className)}
      style={{
        opacity: settled ? 1 : 0,
        transform: settled ? "none" : HIDDEN_TRANSFORM[variant],
        filter: settled ? "none" : (HIDDEN_FILTER[variant] ?? "none"),
        transition: reduced
          ? "none"
          : `opacity ${duration}ms ${EASE_OUT} ${delay}ms, transform ${duration}ms ${EASE_OUT} ${delay}ms, filter ${duration}ms ${EASE_OUT} ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface RevealGroupProps extends Omit<RevealProps, "delay" | "children"> {
  children: ReactNode;
  /** Milliseconds added to each successive child's delay. */
  stagger?: number;
  /** Delay applied to the first child. */
  initialDelay?: number;
}

/**
 * Wraps each direct child in a {@link Reveal} with an incrementing delay, so a
 * grid or list cascades in rather than appearing all at once.
 */
export function RevealGroup({
  children,
  stagger = 80,
  initialDelay = 0,
  className,
  as: Tag = "div",
  ...revealProps
}: RevealGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Tag className={className}>
      {items.map((child, index) => (
        <Reveal key={index} delay={initialDelay + index * stagger} {...revealProps}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}
