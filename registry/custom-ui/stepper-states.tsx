import {
  Stepper,
  StepperIndicator,
  StepperItem,
} from "@/components/custom-ui/stepper";

const states = [
  {
    status: "complete" as const,
    label: "Complete",
    description: "Step has been finished",
  },
  {
    status: "current" as const,
    label: "Current",
    description: "Step is in progress",
  },
  {
    status: "upcoming" as const,
    label: "Upcoming",
    description: "Step is not yet started",
  },
];

export default function StepperStates() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {states.map((state) => (
        <div className="flex items-center gap-3" key={state.status}>
          <Stepper size="sm">
            <StepperItem status={state.status}>
              <StepperIndicator />
            </StepperItem>
          </Stepper>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{state.label}</p>
            <p className="text-muted-foreground text-xs">
              {state.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
