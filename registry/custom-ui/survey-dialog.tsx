"use client";

import * as React from "react";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Context for step components to trigger navigation
interface SurveyContextValue {
  goToNextStep: () => Promise<void>;
  goBack: () => void;
  direction: "forward" | "back";
  isFirst: boolean;
}

const SurveyContext = React.createContext<SurveyContextValue | null>(null);

export function useSurvey() {
  const context = React.useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyDialog");
  }
  return context;
}

export interface SurveyStep {
  title: string;
  fields: string[];
  render: () => React.ReactNode;
  hideFooter?: boolean;
}

export interface SurveyDialogProps<TOutput extends FieldValues = FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  steps: SurveyStep[];
  schema: z.ZodType<TOutput>;
  defaultValues: Partial<TOutput>;
  onComplete: (data: TOutput) => Promise<void>;
  /** Merged onto `DialogContent` — use to override width/height per project. */
  className?: string;
}

export function SurveyDialog<TOutput extends FieldValues>({
  open,
  onOpenChange,
  title,
  steps,
  schema,
  defaultValues,
  onComplete,
  className,
}: SurveyDialogProps<TOutput>) {
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "back">(
    "forward",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Type assertions needed due to complex zodResolver generic constraints.
  // Type safety is maintained at the call site via TOutput inference.
  const methods = useForm<TOutput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  const currentStep = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setDirection("forward");
      setError(null);
      methods.reset();
    }
  }, [open, methods]);

  // Advance to next step (validates current step's fields first)
  const goToNextStep = React.useCallback(async () => {
    if (isLast) return;
    // Type assertion needed as step.fields are runtime strings, not typed paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valid = await methods.trigger(steps[step].fields as any);
    if (valid) {
      setDirection("forward");
      setStep((s) => s + 1);
    }
  }, [isLast, step, steps, methods]);

  // For the footer Next button
  async function handleNext() {
    await goToNextStep();
  }

  const goBack = React.useCallback(() => {
    setDirection("back");
    setStep((s) => s - 1);
  }, []);

  const surveyContextValue = React.useMemo<SurveyContextValue>(
    () => ({ goToNextStep, goBack, direction, isFirst }),
    [goToNextStep, goBack, direction, isFirst],
  );

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = methods.getValues();
      await onComplete(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const progressValue = ((step + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="survey-dialog"
        className={cn("flex max-h-[85vh] flex-col sm:max-w-md", className)}
      >
        {/* Fixed header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {steps.length}: {currentStep.title}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress */}
        <Progress value={progressValue} />

        {/* Scrollable content area — full-bleed scrollbar, padded content */}
        <FormProvider {...methods}>
          <SurveyContext.Provider value={surveyContextValue}>
            <div className="-mx-6 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6">
              <div
                key={step}
                className={cn(
                  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
                  direction === "forward"
                    ? "motion-safe:slide-in-from-right-4"
                    : "motion-safe:slide-in-from-left-4",
                )}
              >
                {currentStep.render()}
              </div>
            </div>
          </SurveyContext.Provider>
        </FormProvider>

        {/* Error message */}
        {error && <p className="text-destructive text-sm">{error}</p>}

        {/* Fixed footer - hidden if step has hideFooter */}
        {!currentStep.hideFooter && (
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div>
              {!isFirst && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
            </div>
            <div>
              {isLast ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  Submit
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
