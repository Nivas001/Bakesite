"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type AccordionItem = {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean | undefined;
};

/**
 * Motion feel for the open/close animation.
 * - `smooth`  critically damped — no overshoot (default)
 * - `spring`  gentle overshoot with a soft settle
 * - `bounce`  playful — content springs into place
 */
export type AccordionAnimation = "smooth" | "spring" | "bounce";

const MOTION_PRESETS: Record<
  AccordionAnimation,
  {
    height: { bounce: number; duration: number };
    content: { bounce: number; duration: number };
    lift: number;
  }
> = {
  smooth: {
    height: { bounce: 0, duration: 0.38 },
    content: { bounce: 0, duration: 0.38 },
    lift: 6,
  },
  spring: {
    height: { bounce: 0.05, duration: 0.42 },
    content: { bounce: 0.25, duration: 0.45 },
    lift: 8,
  },
  bounce: {
    height: { bounce: 0.12, duration: 0.48 },
    content: { bounce: 0.5, duration: 0.55 },
    lift: 12,
  },
};

export type AccordionProps = {
  items: AccordionItem[];
  /** `single` keeps one panel open; `multiple` allows many. */
  type?: "single" | "multiple" | undefined;
  /** Open value(s) on mount. */
  defaultValue?: string | string[] | undefined;
  /** Allow closing the open panel in `single` mode. */
  collapsible?: boolean | undefined;
  /** Motion feel for the height animation. */
  animation?: AccordionAnimation | undefined;
  className?: string | undefined;
  id?: string | undefined;
};

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      type = "single",
      defaultValue,
      collapsible = true,
      animation = "spring",
      className,
      id,
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const preset = MOTION_PRESETS[animation];
    const heightSpring = { type: "spring" as const, ...preset.height };
    const contentSpring = { type: "spring" as const, ...preset.content };

    const [open, setOpen] = React.useState<string[]>(() => {
      if (defaultValue === undefined) return [];
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    });

    const toggle = (value: string) => {
      setOpen((current) => {
        const isOpen = current.includes(value);
        if (type === "single") {
          if (isOpen) return collapsible ? [] : current;
          return [value];
        }
        return isOpen
          ? current.filter((v) => v !== value)
          : [...current, value];
      });
    };

    return (
      <div
        ref={ref}
        id={id}
        className={`w-full divide-y divide-border overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card/90 shadow-soft backdrop-blur-xs ${
          className ?? ""
        }`}
      >
        {items.map((item) => {
          const isOpen = open.includes(item.value);
          const panelId = `accordion-panel-${item.value}`;
          const triggerId = `accordion-trigger-${item.value}`;
          return (
            <div
              key={item.value}
              className="group transition-colors duration-200"
              data-open={isOpen}
            >
              <h3 className="flex">
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={() => toggle(item.value)}
                  className={`flex flex-1 items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-cocoa transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-berry/50 disabled:pointer-events-none disabled:opacity-50 ${
                    isOpen
                      ? "bg-secondary/30 text-berry"
                      : "hover:bg-secondary/20 hover:text-berry"
                  }`}
                >
                  <span className="flex-1">{item.title}</span>
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-berry/15 text-berry"
                        : "bg-secondary/70 text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    key="content"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    {...(!reduceMotion ? { exit: { height: 0, opacity: 0 } } : {})}
                    transition={{
                      height: heightSpring,
                      opacity: { duration: 0.2 },
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={reduceMotion ? false : { y: -preset.lift }}
                      animate={{ y: 0 }}
                      {...(!reduceMotion
                        ? { transition: { ...contentSpring, delay: 0.02 } }
                        : {})}
                      className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed [text-wrap:pretty]"
                    >
                      {item.content}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = "Accordion";
