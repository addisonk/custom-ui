"use client";

import { useState } from "react";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";

import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/custom-ui/stepper";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Create account",
    description: "Sign up with your email and password",
  },
  {
    title: "Connect workspace",
    description: "Link your existing workspace or create a new one",
  },
  {
    title: "Configure settings",
    description: "Set up your preferences and notifications",
  },
  {
    title: "Invite team",
    description: "Add collaborators to your workspace",
  },
  {
    title: "Start building",
    description: "Create your first project and get started",
  },
];

function getStatus(
  index: number,
  currentStep: number,
): "complete" | "current" | "upcoming" {
  if (index < currentStep) return "complete";
  if (index === currentStep) return "current";
  return "upcoming";
}

export default function StepperDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const isComplete = currentStep > steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <Stepper>
        {steps.map((step, index) => (
          <StepperItem
            key={step.title}
            status={getStatus(index, currentStep)}
          >
            <StepperIndicator />
            <StepperContent>
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </StepperContent>
            <StepperSeparator />
          </StepperItem>
        ))}
      </Stepper>
      <div className="flex items-center gap-2">
        <Button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(0)}
          size="sm"
          variant="outline"
        >
          <RotateCcwIcon />
          Reset
        </Button>
        <Button
          disabled={isComplete}
          onClick={() => setCurrentStep((step) => step + 1)}
          size="sm"
        >
          Next step
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
