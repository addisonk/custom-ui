# custom-ui

Personal collection of composable UI components built on [shadcn/ui](https://ui.shadcn.com) conventions.

## Install

```bash
npx shadcn add https://raw.githubusercontent.com/addisonk/custom-ui/main/registry.json
```

## Components

### Cell

A composable list-cell component with start, content, and end slots.

```tsx
import {
  Cell,
  CellContent,
  CellDescription,
  CellEnd,
  CellStart,
  CellTitle,
} from "@/components/custom-ui/cell";

<Cell>
  <CellStart>
    <Avatar />
  </CellStart>
  <CellContent>
    <CellTitle>Title</CellTitle>
    <CellDescription>Description</CellDescription>
  </CellContent>
  <CellEnd>
    <ChevronRight />
  </CellEnd>
</Cell>
```

Sub-components: `Cell`, `CellStart`, `CellContent`, `CellLabel`, `CellTitle`, `CellDescription`, `CellNote`, `CellEnd`, `CellSkeleton`

### Survey Dialog

A multi-step form dialog with forward/back navigation, per-step field
validation (React Hook Form + Zod), and a progress bar. Steps are declared as
data; each step renders its own fields and lists which fields to validate
before advancing.

```tsx
import { SurveyDialog, useSurvey } from "@/components/custom-ui/survey-dialog";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
});

<SurveyDialog
  open={open}
  onOpenChange={setOpen}
  title="Onboarding"
  schema={schema}
  defaultValues={{ name: "", role: "" }}
  steps={[
    { title: "Your name", fields: ["name"], render: () => <NameStep /> },
    { title: "Your role", fields: ["role"], render: () => <RoleStep /> },
  ]}
  onComplete={async (data) => {
    await save(data);
  }}
/>;
```

Step components read the form via React Hook Form's `useFormContext()` and can
drive navigation with the `useSurvey()` hook (`goToNextStep`, `goBack`,
`direction`, `isFirst`). Set `hideFooter: true` on a step to render your own
navigation controls.
