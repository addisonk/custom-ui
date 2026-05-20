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

### Navigator Dialog

An N-level drill-in dialog. Open a dialog, navigate _into_ sub-views to edit
things, then go _back_ — an arbitrary-depth view stack inside a single Radix
Dialog (real focus trap, `Esc`, scroll lock). Forward navigation slides in from
the right, back navigation from the left. Where `SurveyDialog` is a _linear_
multi-step form, `NavigatorDialog` is _non-linear_ drill-in navigation.

```tsx
import {
  NavigatorDialog,
  useNavigator,
} from "@/components/custom-ui/navigator-dialog";

function MenuView() {
  const { navigate } = useNavigator();
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => navigate("edit-name")}>Edit name</button>
      <button onClick={() => navigate("edit-email")}>Edit email</button>
    </div>
  );
}

<NavigatorDialog
  open={open}
  onOpenChange={setOpen}
  initialView="menu"
  views={[
    { id: "menu", title: "Settings", render: () => <MenuView /> },
    { id: "edit-name", title: "Edit name", render: () => <NameForm /> },
    { id: "edit-email", title: "Edit email", render: () => <EmailForm /> },
  ]}
/>;
```

Views are declared as data and own their own state — the dialog owns only
navigation. Any view drives it through the `useNavigator()` hook (`navigate`,
`back`, `canGoBack`, `activeViewId`, `stack`). A Back button appears in the
header automatically at depth; the dialog's close button always dismisses the
whole dialog. The view stack resets to `initialView` on close.
