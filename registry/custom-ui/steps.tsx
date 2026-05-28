"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsProps extends Omit<
  React.ComponentProps<"nav">,
  "children" | "onChange"
> {
  steps: StepItem[];
  currentStep?: string;
  currentStepIndex?: number;
  onStepSelect?: (step: StepItem, index: number) => void;
  showDescriptions?: boolean;
}

function getCurrentIndex(
  steps: StepItem[],
  currentStep?: string,
  currentStepIndex?: number,
) {
  if (steps.length === 0) return -1;

  if (typeof currentStepIndex === "number") {
    return Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
  }

  if (currentStep) {
    const index = steps.findIndex((step) => step.id === currentStep);
    return index >= 0 ? index : 0;
  }

  const explicitCurrentIndex = steps.findIndex(
    (step) => step.status === "current",
  );
  return explicitCurrentIndex >= 0 ? explicitCurrentIndex : 0;
}

function getStepStatus(
  step: StepItem,
  index: number,
  currentIndex: number,
): StepStatus {
  if (step.status) return step.status;
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

function Steps({
  className,
  steps,
  currentStep,
  currentStepIndex,
  onStepSelect,
  showDescriptions = true,
  ...props
}: StepsProps) {
  const currentIndex = getCurrentIndex(steps, currentStep, currentStepIndex);

  return (
    <nav
      aria-label="Progress"
      className={cn("w-full", className)}
      data-slot="steps"
      {...props}
    >
      <ol
        className="grid gap-4 sm:flex sm:gap-8"
        data-slot="steps-list"
        role="list"
      >
        {steps.map((step, index) => {
          const status = getStepStatus(step, index, currentIndex);
          const interactive = !step.disabled && (step.href || onStepSelect);

          const content = (
            <>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  status === "complete" &&
                    "text-foreground group-hover/step:text-primary",
                  status === "current" && "text-primary",
                  status === "upcoming" && "text-muted-foreground",
                  step.disabled && "text-muted-foreground/50",
                )}
                data-slot="steps-title"
              >
                {step.title}
              </span>
              {showDescriptions && step.description && (
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    status === "complete" &&
                      "text-muted-foreground group-hover/step:text-primary/70",
                    status === "current" && "text-foreground",
                    status === "upcoming" && "text-muted-foreground/50",
                    step.disabled && "text-muted-foreground/40",
                  )}
                  data-slot="steps-description"
                >
                  {step.description}
                </span>
              )}
            </>
          );

          const itemClassName = cn(
            "group/step flex h-full flex-col border-l-4 py-2 pl-4 text-left transition-colors sm:border-t-4 sm:border-l-0 sm:pt-4 sm:pb-0 sm:pl-0",
            status === "complete" &&
              "border-primary/60 hover:border-primary/80",
            status === "current" && "border-primary",
            status === "upcoming" && "border-muted",
            interactive &&
              "cursor-pointer hover:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            step.disabled &&
              "pointer-events-none cursor-not-allowed opacity-50",
          );

          return (
            <li
              className="min-w-0 sm:flex-1"
              data-slot="steps-item"
              data-status={status}
              key={step.id}
            >
              {step.href ? (
                <a
                  aria-current={status === "current" ? "step" : undefined}
                  aria-disabled={step.disabled || undefined}
                  className={itemClassName}
                  href={step.href}
                  onClick={(event) => {
                    if (step.disabled) event.preventDefault();
                  }}
                >
                  {content}
                </a>
              ) : onStepSelect ? (
                <button
                  aria-current={status === "current" ? "step" : undefined}
                  className={itemClassName}
                  disabled={step.disabled}
                  onClick={() => onStepSelect(step, index)}
                  type="button"
                >
                  {content}
                </button>
              ) : (
                <div
                  aria-current={status === "current" ? "step" : undefined}
                  className={itemClassName}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Steps, getStepStatus };
