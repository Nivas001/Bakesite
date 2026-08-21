"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type Step = {
  label: React.ReactNode;
  description?: React.ReactNode | undefined;
};

export type StepperProps = {
  steps: Step[];
  /** Zero-based index of the current step. Earlier steps render complete. */
  active: number;
  orientation?: "horizontal" | "vertical" | undefined;
  className?: string | undefined;
  id?: string | undefined;
};

type StepState = "complete" | "active" | "upcoming";

function StepCircle({
  state,
  index,
  reduceMotion,
}: {
  state: StepState;
  index: number;
  reduceMotion: boolean | null;
}) {
  const base =
    "grid size-8 sm:size-9 shrink-0 place-items-center rounded-full border-2 text-xs sm:text-sm font-bold [transition:background-color_250ms_ease,border-color_250ms_ease,color_250ms_ease,box-shadow_250ms_ease]";
  const tone =
    state === "complete"
      ? "border-berry bg-berry text-berry-foreground shadow-xs"
      : state === "active"
        ? "border-berry bg-card text-cocoa ring-4 ring-berry/20 shadow-xs"
        : "border-border/80 bg-card text-muted-foreground";
  return (
    <div className={`${base} ${tone}`}>
      {state === "complete" ? (
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 sm:size-4"
          aria-hidden="true"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.svg>
      ) : (
        index + 1
      )}
    </div>
  );
}

function Connector({
  filled,
  orientation,
  reduceMotion,
}: {
  filled: boolean;
  orientation: "horizontal" | "vertical";
  reduceMotion: boolean | null;
}) {
  const horizontal = orientation === "horizontal";
  return (
    <div
      className={`relative overflow-hidden bg-border/80 ${
        horizontal ? "mt-[15px] sm:mt-[17px] h-0.5 flex-1 mx-1.5 sm:mx-2 rounded-full" : "my-1 w-0.5 flex-1 self-center"
      }`}
      style={horizontal ? undefined : { minHeight: 24 }}
    >
      <motion.span
        className={`absolute inset-0 bg-berry ${
          horizontal ? "origin-left" : "origin-top"
        }`}
        initial={false}
        animate={
          horizontal ? { scaleX: filled ? 1 : 0 } : { scaleY: filled ? 1 : 0 }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 32, mass: 0.9 }
        }
      />
    </div>
  );
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, active, orientation = "horizontal", className, id }, ref) => {
    const reduceMotion = useReducedMotion();
    const horizontal = orientation === "horizontal";

    const stateFor = (i: number): StepState =>
      i < active ? "complete" : i === active ? "active" : "upcoming";

    const Label = ({ step, state }: { step: Step; state: StepState }) => (
      <>
        <div
          className={`text-xs sm:text-sm font-bold ${
            state === "upcoming" ? "text-muted-foreground/80" : "text-cocoa"
          }`}
        >
          {step.label}
        </div>
        {step.description && (
          <div className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            {step.description}
          </div>
        )}
      </>
    );

    if (horizontal) {
      return (
        <div
          ref={ref}
          id={id}
          className={`flex w-full items-start ${className ?? ""}`}
        >
          {steps.map((step, i) => {
            const state = stateFor(i);
            const isLast = i === steps.length - 1;
            return (
              <React.Fragment key={i}>
                <div
                  className="flex flex-1 flex-col items-center text-center min-w-0"
                  aria-current={state === "active" ? "step" : undefined}
                >
                  <StepCircle
                    state={state}
                    index={i}
                    reduceMotion={reduceMotion}
                  />
                  <div className="mt-2 w-full px-0.5">
                    <Label step={step} state={state} />
                  </div>
                </div>
                {!isLast && (
                  <Connector
                    filled={active > i}
                    orientation="horizontal"
                    reduceMotion={reduceMotion}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    return (
      <div ref={ref} id={id} className={`flex flex-col ${className ?? ""}`}>
        {steps.map((step, i) => {
          const state = stateFor(i);
          const isLast = i === steps.length - 1;
          return (
            <div
              key={i}
              className="flex gap-4"
              aria-current={state === "active" ? "step" : undefined}
            >
              <div className="flex flex-col items-center">
                <StepCircle
                  state={state}
                  index={i}
                  reduceMotion={reduceMotion}
                />
                {!isLast && (
                  <Connector
                    filled={active > i}
                    orientation="vertical"
                    reduceMotion={reduceMotion}
                  />
                )}
              </div>
              <div className="pb-6 pt-1">
                <Label step={step} state={state} />
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Stepper.displayName = "Stepper";
