"use client";

import {
  type MotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import * as React from "react";

export type TextAnimateBy = "text" | "word" | "character" | "line";

export type TextAnimatePreset =
  | "fadeIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown";

const STAGGER_BY_SPLIT: Record<TextAnimateBy, number> = {
  text: 0.06,
  word: 0.045,
  character: 0.025,
  line: 0.06,
};

export const TEXT_ANIMATE_ITEM_PRESETS: Record<TextAnimatePreset, Variants> = {
  fadeIn: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 16,
      transition: { duration: 0.25 },
    },
  },
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.25 },
    },
  },
  blurInUp: {
    hidden: { opacity: 0, filter: "blur(8px)", y: 22 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.45 },
        filter: { duration: 0.35 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      y: 22,
      transition: {
        y: { duration: 0.3 },
        opacity: { duration: 0.3 },
        filter: { duration: 0.25 },
      },
    },
  },
  blurInDown: {
    hidden: { opacity: 0, filter: "blur(8px)", y: -22 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.45 },
        filter: { duration: 0.35 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      y: -22,
      transition: {
        y: { duration: 0.3 },
        opacity: { duration: 0.3 },
        filter: { duration: 0.25 },
      },
    },
  },
  slideUp: {
    hidden: { y: 24, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      y: -24,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
  slideDown: {
    hidden: { y: -24, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      y: 24,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
  slideLeft: {
    hidden: { x: 24, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      x: -24,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
  slideRight: {
    hidden: { x: -24, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      x: 24,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
  scaleUp: {
    hidden: { scale: 0.7, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        scale: {
          type: "spring",
          damping: 28,
          stiffness: 300,
          mass: 0.8,
        },
      },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      transition: { duration: 0.25 },
    },
  },
  scaleDown: {
    hidden: { scale: 1.3, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        scale: {
          type: "spring",
          damping: 28,
          stiffness: 300,
          mass: 0.8,
        },
      },
    },
    exit: {
      scale: 1.3,
      opacity: 0,
      transition: { duration: 0.25 },
    },
  },
};

function getTextContent(children: React.ReactNode): string {
  if (children == null || typeof children === "boolean") {
    return "";
  }
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (typeof children === "object" && "props" in children) {
    const props = (children as { props?: { children?: React.ReactNode } }).props;
    return getTextContent(props?.children ?? "");
  }
  return "";
}

type TextAnimateSegment = {
  key: string;
  segment: string;
};

function splitTextAnimate(text: string, by: TextAnimateBy): TextAnimateSegment[] {
  const normalized = typeof text === "string" ? text : String(text ?? "");
  let raw: string[];

  switch (by) {
    case "word":
      raw = normalized.split(/(\s+)/);
      break;
    case "character":
      raw = [...normalized];
      break;
    case "line":
      raw = normalized.split("\n");
      break;
    default:
      raw = [normalized];
      break;
  }

  let offset = 0;
  return raw.map((segment) => {
    const item = {
      key: `${by}-${offset}-${segment}`,
      segment,
    };
    offset += Math.max(segment.length, 1);
    return item;
  });
}

function getSegmentClassName(by: TextAnimateBy, segmentClassName?: string): string {
  const base =
    by === "line"
      ? "block"
      : by === "character"
        ? "inline-block"
        : "inline-block whitespace-pre";

  return segmentClassName ? `${base} ${segmentClassName}` : base;
}

export type TextAnimateElement =
  | "article"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "li"
  | "p"
  | "section"
  | "span";

export type TextAnimateProps = {
  children: React.ReactNode;
  className?: string | undefined;
  segmentClassName?: string | undefined;
  delay?: number | undefined;
  duration?: number | undefined;
  stagger?: number | undefined;
  variants?: Variants | undefined;
  as?: TextAnimateElement | undefined;
  by?: TextAnimateBy | undefined;
  startOnView?: boolean | undefined;
  once?: boolean | undefined;
  viewportAmount?: number | "some" | "all" | undefined;
  animation?: TextAnimatePreset | undefined;
  accessible?: boolean | undefined;
  id?: string | undefined;
};

export const TextAnimate = React.forwardRef<HTMLElement, TextAnimateProps>(
  (
    {
      children,
      delay = 0,
      duration = 0.35,
      stagger,
      variants,
      className,
      segmentClassName,
      as: Component = "p",
      startOnView = true,
      once = true,
      viewportAmount = 0.25,
      by = "word",
      animation = "blurInUp",
      accessible = true,
      id,
    },
    ref,
  ) => {
    const reducedMotion = useReducedMotion() ?? false;
    const textContent = getTextContent(children);
    const segments = React.useMemo(
      () => splitTextAnimate(textContent, by),
      [textContent, by],
    );

    const staggerChildren =
      stagger ??
      (segments.length > 1 ? duration / segments.length : STAGGER_BY_SPLIT[by]);

    const itemVariants = variants || TEXT_ANIMATE_ITEM_PRESETS[animation];
    const rootClassName = `whitespace-pre-wrap ${className ?? ""}`.trim();

    if (reducedMotion) {
      return React.createElement(
        Component,
        { ref, className: rootClassName, id },
        textContent,
      );
    }

    let nonSpaceIndex = 0;

    return React.createElement(
      Component,
      {
        ref,
        id,
        className: rootClassName,
        ...(accessible && textContent ? { "aria-label": textContent } : {}),
      },
      <>
        {accessible && textContent ? (
          <span className="sr-only absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0">
            {textContent}
          </span>
        ) : null}
        {segments.map(({ key, segment }) => {
          const isWhitespace = /^\s+$/.test(segment);
          const currentDelay = delay + nonSpaceIndex * staggerChildren;
          if (!isWhitespace) {
            nonSpaceIndex += 1;
          }

          return (
            <motion.span
              key={key}
              variants={itemVariants}
              initial="hidden"
              {...(startOnView
                ? {
                    whileInView: "show",
                    viewport: { once, amount: viewportAmount },
                  }
                : { animate: "show" })}
              transition={{
                delay: currentDelay,
              }}
              className={getSegmentClassName(by, segmentClassName)}
              aria-hidden={accessible ? true : undefined}
            >
              {segment}
            </motion.span>
          );
        })}
      </>,
    );
  },
);

TextAnimate.displayName = "TextAnimate";
