"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type ComboboxOption = {
  label: string;
  value: string;
  description?: string;
};

export type ComboboxAction = {
  label: React.ReactNode;
  onSelect: (query: string) => void;
};

export type ComboboxProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "onToggle"
> & {
  /** Static option list. Ignored when `onSearch` is provided. */
  options?: ComboboxOption[];
  /** Async resolver. Return options for a query. */
  onSearch?: (query: string) => Promise<ComboboxOption[]>;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  emptyMessage?: string;
  /** Disable the input and prevent opening the listbox. */
  disabled?: boolean;
  onChange?: (value: string, option: ComboboxOption) => void;
  /** Multi-select mode */
  multiple?: boolean;
  values?: string[];
  onToggle?: (value: string, option: ComboboxOption) => void;
  creatable?: boolean;
  onCreate?: (label: string) => void | Promise<void>;
  creating?: boolean;
  /** When false, render a plain click-to-open dropdown (no type-ahead filtering) */
  searchable?: boolean;
  searchableThreshold?: number;
  pinnedAction?: ComboboxAction;
  emptyAction?: ComboboxAction;
  /** Optional icon on trigger button */
  icon?: React.ReactNode;
  /** Custom trigger button styling class */
  triggerClassName?: string;
};

export const COMBOBOX_SEARCHABLE_THRESHOLD = 5;

function highlight(label: string, query: string) {
  if (!query) return label;
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-transparent font-bold text-berry">
        {label.slice(idx, idx + query.length)}
      </mark>
      {label.slice(idx + query.length)}
    </>
  );
}

const Spinner = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4 animate-spin text-muted-foreground"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M21 12a9 9 0 1 1-6.2-8.6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4 text-berry"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options: staticOptions,
      onSearch,
      value: valueProp,
      defaultValue,
      placeholder = "Select option…",
      emptyMessage = "No results",
      disabled = false,
      onChange,
      multiple = false,
      values,
      onToggle,
      creatable = false,
      onCreate,
      creating = false,
      searchable,
      searchableThreshold = COMBOBOX_SEARCHABLE_THRESHOLD,
      pinnedAction,
      emptyAction,
      className,
      icon,
      triggerClassName,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const listboxId = React.useId();
    const inputId = React.useId();
    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const value = isControlled ? valueProp : internal;

    const selectedValues = React.useMemo(() => values ?? [], [values]);

    const allOptions = React.useMemo(
      () => staticOptions ?? [],
      [staticOptions],
    );
    const selectedOption = allOptions.find((o) => o.value === value);

    const isSearchable =
      onSearch != null || multiple || creatable || emptyAction != null
        ? true
        : (searchable ?? allOptions.length > searchableThreshold);

    const [query, setQuery] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [asyncResults, setAsyncResults] = React.useState<ComboboxOption[]>([]);
    const [creatingInternal, setCreatingInternal] = React.useState(false);
    const isCreating = creating || creatingInternal;
    const [liveMessage, setLiveMessage] = React.useState("");
    const [createdFlash, setCreatedFlash] = React.useState(false);
    const flashTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    
    const flashCreated = () => {
      setCreatedFlash(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setCreatedFlash(false), 1300);
    };
    React.useEffect(() => () => clearTimeout(flashTimer.current), []);
    
    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const reqId = React.useRef(0);
    const fetchedQuery = React.useRef<string | null>(null);
    const typeahead = React.useRef({ buf: "", at: 0 });

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    React.useEffect(() => {
      if (!onSearch || !open) return;
      if (fetchedQuery.current === query) return;
      const id = ++reqId.current;
      setLoading(true);
      const t = setTimeout(() => {
        onSearch(query).then((res) => {
          if (id === reqId.current) {
            setAsyncResults(res);
            fetchedQuery.current = query;
            setLoading(false);
            setActive(0);
          }
        });
      }, 180);
      return () => clearTimeout(t);
    }, [query, onSearch, open]);

    const matches = onSearch
      ? asyncResults
      : allOptions.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );

    const trimmedQuery = query.trim();
    const canCreate =
      creatable &&
      trimmedQuery.length > 0 &&
      !matches.some(
        (o) => o.label.toLowerCase() === trimmedQuery.toLowerCase(),
      );
    const createRow: ComboboxOption = {
      value: trimmedQuery,
      label: trimmedQuery,
    };
    const results: ComboboxOption[] = canCreate
      ? [...matches, createRow]
      : matches;

    React.useEffect(() => {
      setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
    }, [results.length]);

    const labelCacheRef = React.useRef(new Map<string, string>());
    React.useEffect(() => {
      for (const o of results) labelCacheRef.current.set(o.value, o.label);
    }, [results]);
    
    const chipLabel = (v: string) =>
      allOptions.find((o) => o.value === v)?.label ??
      labelCacheRef.current.get(v) ??
      v;

    const selectedLabel =
      selectedOption?.label ??
      (value ? labelCacheRef.current.get(value) : undefined);

    const runCreate = async () => {
      if (isCreating) return;
      const created = trimmedQuery;
      if (onCreate) {
        try {
          setCreatingInternal(true);
          await onCreate(created);
          setLiveMessage(`Created "${created}"`);
          flashCreated();
          setQuery("");
          setOpen(false);
        } finally {
          setCreatingInternal(false);
        }
      } else {
        setLiveMessage(`Created "${created}"`);
        flashCreated();
        commit({ value: created, label: created });
      }
    };

    const commit = (opt: ComboboxOption) => {
      if (opt === createRow) {
        void runCreate();
        return;
      }
      if (multiple) {
        labelCacheRef.current.set(opt.value, opt.label);
        onToggle?.(opt.value, opt);
        setQuery("");
        setActive(0);
        inputRef.current?.focus();
        return;
      }
      if (!isControlled) setInternal(opt.value);
      onChange?.(opt.value, opt);
      setQuery("");
      setOpen(false);
    };

    const onInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && open && results[active]) {
        e.preventDefault();
        commit(results[active]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onButtonKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          setActive(
            Math.max(
              0,
              results.findIndex((o) => o.value === value),
            ),
          );
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActive(results.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (results[active]) commit(results[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key.length === 1) {
        const recent = Date.now() - typeahead.current.at < 600;
        const buf = recent ? typeahead.current.buf + e.key : e.key;
        typeahead.current = { buf, at: Date.now() };
        const idx = results.findIndex((o) =>
          o.label.toLowerCase().startsWith(buf.toLowerCase()),
        );
        if (idx >= 0) setActive(idx);
      }
    };

    const spring = reduceMotion
      ? { duration: 0 }
      : ({ type: "spring", stiffness: 520, damping: 32 } as const);

    return (
      <div
        ref={rootRef}
        className={`relative inline-block ${className ?? ""}`}
        {...props}
      >
        <span aria-live="polite" role="status" className="sr-only">
          {liveMessage}
        </span>

        {/* Trigger Button / Non-searchable Control */}
        {!isSearchable ? (
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            onKeyDown={onButtonKeyDown}
            className={`group flex items-center justify-between gap-2 rounded-full border border-border/80 bg-card/95 backdrop-blur-md px-3.5 py-1.5 text-left text-xs sm:text-sm font-bold text-cocoa shadow-2xs hover:border-berry/50 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer ${
              open ? "border-berry ring-1 ring-berry/30 shadow-xs" : ""
            } ${triggerClassName ?? ""}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {icon && <span className="text-muted-foreground group-hover:text-cocoa transition-colors">{icon}</span>}
              <span className={`truncate ${selectedLabel ? "text-cocoa" : "text-muted-foreground"}`}>
                {selectedLabel ? `Sort: ${selectedLabel}` : placeholder}
              </span>
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${
                open ? "rotate-180 text-cocoa" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              disabled={disabled}
              value={
                open
                  ? query
                  : (selectedLabel ?? (creatable ? (value ?? "") : query))
              }
              placeholder={placeholder}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onInputKeyDown}
              className="w-full rounded-2xl border border-border/80 bg-card/95 px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-cocoa outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="-translate-y-1/2 absolute top-1/2 right-3 flex pointer-events-none">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={loading ? "spin" : createdFlash ? "check" : "search"}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }
                  }
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.14 }
                  }
                  className="flex"
                >
                  {loading ? <Spinner /> : createdFlash ? <CheckIcon /> : <SearchIcon />}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        )}

        {/* Animated Popover Menu */}
        <AnimatePresence>
          {open && (
            <motion.ul
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              aria-busy={loading || undefined}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: -4 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: -4 }
              }
              transition={spring}
              className="absolute right-0 top-full z-50 mt-2 min-w-[13.5rem] max-h-72 origin-top-right overflow-y-auto rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-lift backdrop-blur-xl no-scrollbar"
            >
              {loading && results.length === 0 && (
                <li className="flex items-center justify-center gap-2 px-3 py-4 text-muted-foreground text-xs">
                  <Spinner />
                  <span>Loading…</span>
                </li>
              )}
              {!loading && results.length === 0 && (
                <li className="px-3 py-4 text-center text-muted-foreground text-xs">
                  <div>{emptyMessage}</div>
                </li>
              )}
              {results.map((opt, i) => {
                const isActive = i === active;
                const isSelected = opt.value === value;
                return (
                  <motion.li
                    key={opt.value}
                    initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : i * 0.02 }}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(opt)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-berry/10 text-cocoa font-bold"
                        : isSelected
                          ? "bg-secondary/70 text-cocoa font-bold"
                          : "text-foreground hover:bg-secondary/40 font-medium"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="block truncate leading-tight">
                        {highlight(opt.label, query)}
                      </span>
                      {opt.description && (
                        <span className="block text-[11px] text-muted-foreground font-normal truncate mt-0.5">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-berry">
                        <CheckIcon />
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Combobox.displayName = "Combobox";
export default Combobox;
