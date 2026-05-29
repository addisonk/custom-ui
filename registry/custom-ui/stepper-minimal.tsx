import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/custom-ui/stepper";

export default function StepperMinimal() {
  return (
    <Stepper>
      <StepperItem status="complete">
        <StepperIndicator />
        <StepperTitle>Create account</StepperTitle>
        <StepperSeparator />
      </StepperItem>
      <StepperItem status="complete">
        <StepperIndicator />
        <StepperTitle>Connect workspace</StepperTitle>
        <StepperSeparator />
      </StepperItem>
      <StepperItem status="current">
        <StepperIndicator />
        <StepperTitle>Configure settings</StepperTitle>
        <StepperSeparator />
      </StepperItem>
      <StepperItem status="upcoming">
        <StepperIndicator />
        <StepperTitle>Invite team</StepperTitle>
        <StepperSeparator />
      </StepperItem>
      <StepperItem status="upcoming">
        <StepperIndicator />
        <StepperTitle>Start building</StepperTitle>
        <StepperSeparator />
      </StepperItem>
    </Stepper>
  );
}
