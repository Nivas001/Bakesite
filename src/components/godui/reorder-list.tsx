"use client";

import { Reorder } from "framer-motion";
import * as React from "react";

// Snappy enough that neighbours flow out of the way instantly, but with a
// little spring so items settle rather than snap.
const REORDER_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 32,
};

export type ReorderListProps<T> = {
  /** Ordered values rendered as items. Each must be referentially stable. */
  values: T[];
  /** Called with the next order while dragging. */
  onReorder: (values: T[]) => void;
  /** Drag axis. Defaults to `"y"`. */
  axis?: "x" | "y" | undefined;
  className?: string | undefined;
  children?: React.ReactNode;
};

export function ReorderList<T>({
  values,
  onReorder,
  axis = "y",
  className,
  children,
}: ReorderListProps<T>) {
  return (
    <Reorder.Group
      as="ul"
      axis={axis}
      values={values}
      onReorder={onReorder}
      data-slot="reorder-list"
      className={`flex ${axis === "y" ? "flex-col" : "flex-row"} gap-2.5 ${className ?? ""}`}
    >
      {children}
    </Reorder.Group>
  );
}

export type ReorderItemProps<T> = {
  /** The value this item represents within the parent list's `values`. */
  value: T;
  className?: string | undefined;
  children?: React.ReactNode;
};

export function ReorderItem<T>({
  value,
  className,
  children,
}: ReorderItemProps<T>) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <Reorder.Item
      as="li"
      value={value}
      data-slot="reorder-item"
      data-dragging={dragging || undefined}
      transition={REORDER_SPRING}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      className={`group relative flex origin-center touch-none select-none items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 text-card-foreground shadow-xs transition-all duration-150 active:scale-[1.01] active:shadow-md data-[dragging]:z-50 data-[dragging]:scale-[1.02] data-[dragging]:border-berry/60 data-[dragging]:shadow-xl ${className ?? ""}`}
    >
      {children}
    </Reorder.Item>
  );
}
