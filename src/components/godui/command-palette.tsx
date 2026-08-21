"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { createPortal } from "react-dom";

export type CommandItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string | undefined;
  keywords?: string[] | undefined;
  description?: string | undefined;
  onSelect?: (() => void) | undefined;
};

export type CommandGroup = {
  heading?: string | undefined;
  items: CommandItem[];
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string | undefined;
  enableShortcut?: boolean | undefined;
};

function matches(item: CommandItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
  return false;
}

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open,
      onOpenChange,
      groups,
      placeholder = "Type a command or search…",
      enableShortcut = true,
    },
    ref,
  ) => {
    const mounted = useMounted();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [query, setQuery] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);

    const filteredGroups = React.useMemo(
      () =>
        groups
          .map((g) => ({
            ...g,
            items: g.items.filter((i) => matches(i, query)),
          }))
          .filter((g) => g.items.length > 0),
      [groups, query],
    );

    const flat = React.useMemo(
      () => filteredGroups.flatMap((g) => g.items),
      [filteredGroups],
    );

    React.useEffect(() => {
      if (!open) return;
      setQuery("");
      setActiveIndex(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(id);
        document.body.style.overflow = prevOverflow;
      };
    }, [open]);

    React.useEffect(() => {
      if (!enableShortcut) return;
      const onKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          onOpenChange(!open);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [enableShortcut, open, onOpenChange]);

    const select = (item: CommandItem) => {
      item.onSelect?.();
      onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(flat.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1),
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flat[activeIndex];
        if (item) select(item);
      }
    };

    if (!mounted) return null;

    let runningIndex = -1;

    return createPortal(
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]">
            {/* Backdrop */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              data-slot="command-palette"
              initial={{ opacity: 0, scale: 0.96, y: -10, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97, y: -6, filter: "blur(4px)" }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                mass: 0.8,
              }}
              onKeyDown={handleKeyDown}
              className="relative z-10 flex max-h-[72vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3 bg-secondary/30">
                <span aria-hidden className="text-muted-foreground flex items-center justify-center size-5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4.5 text-muted-foreground/80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-sm sm:text-base font-semibold text-cocoa outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="hidden sm:inline-flex items-center rounded-lg border border-border/70 bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground/80 shadow-2xs">
                  ESC
                </kbd>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto p-2 max-h-[55vh] no-scrollbar">
                {flat.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <p className="text-2xl mb-1.5">🔍</p>
                    <p className="font-semibold text-cocoa">No commands found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try searching with different keywords like &quot;orders&quot;, &quot;menu&quot;, or &quot;coupons&quot;.
                    </p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.heading ?? "group"} className="mb-2">
                      {group.heading ? (
                        <div className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70">
                          {group.heading}
                        </div>
                      ) : null}
                      {group.items.map((item) => {
                        runningIndex += 1;
                        const isActive = runningIndex === activeIndex;
                        const itemIndex = runningIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => select(item)}
                            onMouseMove={() => setActiveIndex(itemIndex)}
                            className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors duration-100 cursor-pointer ${
                              isActive ? "text-cocoa" : "text-foreground hover:text-cocoa"
                            }`}
                          >
                            {isActive ? (
                              <motion.span
                                layoutId="command-active"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 35,
                                }}
                                className="absolute inset-0 rounded-2xl bg-berry/10 border border-berry/20"
                              />
                            ) : null}
                            {item.icon ? (
                              <span className="relative flex size-6 items-center justify-center shrink-0 text-berry">
                                {item.icon}
                              </span>
                            ) : null}
                            <div className="relative flex flex-col min-w-0 flex-1">
                              <span className="truncate font-bold text-cocoa">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="text-[11px] text-muted-foreground font-normal truncate mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.shortcut ? (
                              <kbd className="relative shrink-0 rounded-lg border border-border/70 bg-card px-2 py-0.5 font-mono text-[10.5px] font-bold text-muted-foreground shadow-2xs">
                                {item.shortcut}
                              </kbd>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t border-border/70 bg-secondary/20 px-4 py-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border px-1 text-[10px]">↑</kbd>
                    <kbd className="rounded border border-border px-1 text-[10px]">↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border px-1 text-[10px]">↵</kbd>
                    <span>to select</span>
                  </span>
                </div>
                <span className="font-medium text-berry">Ani Bakes Studio</span>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  },
);

CommandPalette.displayName = "CommandPalette";
export default CommandPalette;
