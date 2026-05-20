---
title: "feat: Add navigator-dialog component to custom-ui registry"
type: feat
status: active
created: 2026-05-19
depth: standard
---

# feat: Add navigator-dialog component

## Summary

Add `navigator-dialog` to the `addisonk/custom-ui` shadcn registry: an N-level
drill-in dialog. The user opens a dialog, navigates *into* sub-views to edit
things, and goes *back* — an arbitrary-depth view stack inside a single Radix
Dialog. It is the registry's third component, a sibling to `survey-dialog`
(which is a *linear* multi-step form; this is *non-linear* drill-in navigation).

Replaces three half-finished PicStudio attempts (`MultiLevelDialog`,
`StackDialog`, vendored Kibo `DialogStack`) with one correct, modern component.

---

## Problem Frame

PicStudio has three navigable-dialog implementations, none shippable:

- `StackDialog` — forks the whole shadcn `dialog.tsx`; only 2 levels (outer +
  one inner); old pre-`data-slot` shadcn convention.
- `DialogStack` — vendored Kibo UI; N-level but does **not** use Radix Dialog
  (portal + plain divs), so no focus trap, no dialog role, a11y gaps.
- `MultiLevelDialog` — Oct-2024 code; framer-motion; not extracted anywhere.

Goal: one component that takes the good idea (N-level view stack with back) and
does it correctly — composes the **new `data-slot` shadcn `Dialog`** primitives
(single Radix Dialog, real focus trap), CSS animations via `tailwindcss-animate`
(no framer-motion), presentational, registry-installable.

---

## Scope

In scope:
- New component file `registry/custom-ui/navigator-dialog.tsx`.
- `registry.json` item so it installs via the registry URL.
- `README.md` usage section.

### Deferred to Follow-Up Work
- A live demo/storybook page in the registry repo (the repo has no app; browser
  verification is done by copying into a host app — see Verification).
- Per-view transition customization (custom easing/direction overrides).
- Swipe-to-go-back gesture on touch devices.

Non-goals:
- Migrating PicStudio to consume this (separate repo, separate effort).
- A form/validation layer — drill-in views own their own state; this component
  only owns navigation. Forms are `survey-dialog`'s job.

---

## Key Technical Decisions

**1. API: views registry + navigation context (not a compound component, not a
linear array).**
`survey-dialog` takes a linear `steps[]`. Drill-in is *non-linear* — view A may
navigate to B or C dynamically — so a linear array is wrong. Kibo's
compound-component approach (`<DialogStackContent index={n}>`) co[uples callers
to numeric indices. Instead: a `views` array of `{ id, title?, render }`, an
`initialView` id, and a `useNavigator()` hook exposing `navigate(id)` / `back()`.
This mirrors `survey-dialog`'s `useSurvey()` context pattern exactly — "sibling"
in shape — while fitting drill-in semantics.

**2. Single Radix Dialog, swap content by stack head.**
One `<Dialog>` / `<DialogContent>` from the new `data-slot` shadcn primitives.
The active view = `stack[stack.length - 1]`; only its `render()` mounts. This
keeps Radix's focus trap, `Esc`, scroll-lock, and `role="dialog"` correct — the
thing `DialogStack` got wrong.

**3. View stack as `string[]` of view ids.**
`navigate(id)` pushes; `back()` pops. `canGoBack = stack.length > 1`. Reset to
`[initialView]` when the dialog closes (mirrors `survey-dialog`'s reset effect).
A drill-in can revisit the same view at different depths, so the stack stores
ids positionally — it is a history stack, not a visited-set.

**4. Directional slide animation via `tailwindcss-animate`.**
Track `direction: "forward" | "back"`. Keyed remount (`key={activeViewId}`) with
`animate-in fade-in slide-in-from-right-*` forward, `slide-in-from-left-*` back —
identical mechanism to `survey-dialog`. Wrap in `motion-safe:` for
`prefers-reduced-motion`. No framer-motion dependency.

**5. Header owns the Back affordance.**
A `ChevronLeft` ghost icon-button appears left of the title only when
`canGoBack`. `≥40px` hit area. The dialog's built-in `X` close stays (closes the
whole dialog regardless of depth). Back and Close are distinct, never merged.

**6. Presentational.**
No data fetching, no `useQuery`/`useRouter`. All local UI state (`stack`,
`direction`) is presentation. Views receive nothing from the component except
navigation via `useNavigator()`; they own their own edit state and call back to
the host. `className` prop passthrough on `DialogContent` for per-project sizing
(same escape hatch added to `survey-dialog`).

---

## High-Level Technical Design

Directional guidance for review — not implementation specification.

```
NavigatorDialog (owns: open, viewStack[], direction)
 └─ <Dialog open onOpenChange>
     └─ <DialogContent className?>
         ├─ <DialogHeader>
         │   ├─ [BackButton]  ← rendered only when canGoBack; calls back()
         │   └─ <DialogTitle> = activeView.title
         ├─ NavigatorContext.Provider value={{ navigate, back, canGoBack, ... }}
         │   └─ <div key={activeView.id} className={slide-in direction}>
         │        activeView.render()      ← only the stack-head view mounts
         └─ (no footer — views render their own actions)

useNavigator() → { navigate(id), back(), canGoBack, activeViewId, stack }

navigate(id): direction="forward"; stack → [...stack, id]
back():       direction="back";    stack → stack.slice(0, -1)
close:        stack → [initialView]; direction="forward"
```

Unknown view id passed to `navigate()` → throw in dev (caught early), no-op-safe
in prod is out of scope; treat as developer error with a clear message.

---

## Implementation Units

### U1. NavigatorDialog component

**Goal:** The full component family in one registry file.

**Requirements:** Core feature — N-level drill-in dialog with back navigation.

**Dependencies:** none.

**Files:**
- `registry/custom-ui/navigator-dialog.tsx` (create)

**Approach:**
- `"use client"`. Compose `Dialog`, `DialogContent`, `DialogHeader`,
  `DialogTitle`, `DialogDescription` from `@/components/ui/dialog`; `Button`
  from `@/components/ui/button`; `ChevronLeftIcon` from `lucide-react`; `cn`
  from `@/lib/utils`.
- Exports: `NavigatorDialog` (component), `useNavigator` (hook), `NavigatorView`
  and `NavigatorDialogProps` (types).
- `NavigatorView = { id: string; title?: string; description?: string; render: () => React.ReactNode }`.
- `NavigatorDialogProps = { open; onOpenChange; views: NavigatorView[]; initialView: string; className?: string }`.
- State: `viewStack: string[]` (init `[initialView]`), `direction`.
- `navigate`/`back`/`canGoBack`/`activeViewId` per the design sketch; memoized
  context value.
- Reset `viewStack` to `[initialView]` and `direction` to `"forward"` in a
  `useEffect` on `!open` — mirror `survey-dialog` lines ~84-91.
- `DialogContent`: neutral shadcn defaults + `flex flex-col`, `max-h-[85vh]`,
  `sm:max-w-md`, `cn(..., className)` — match `survey-dialog`'s neutralized
  styling exactly so the two components are visually consistent.
- Header: `flex items-center gap-2`; conditional back `Button`
  (`variant="ghost" size="icon"`, `ChevronLeftIcon`, `aria-label="Go back"`);
  `DialogTitle` from `activeView.title`; `DialogDescription` from
  `activeView.description` when present.
- Content region: `key={activeViewId}` div, `motion-safe:animate-in
  motion-safe:fade-in`, `slide-in-from-right-4` (forward) /
  `slide-in-from-left-4` (back); scrollable `overflow-y-auto` `flex-1`.
- `useNavigator` throws a clear error if used outside provider (mirror
  `useSurvey`).
- `navigate()` with an id not in `views` throws a descriptive dev error.

**Patterns to follow:**
- `registry/custom-ui/survey-dialog.tsx` — context+hook pattern, close-reset
  effect, directional slide classes, `className` passthrough, neutralized
  `DialogContent` classes. Match its formatting (semicolons, double quotes).
- `registry/custom-ui/cell.tsx` — `data-slot` attribute convention.

**Test scenarios:**
- Covers core flow. `navigate("edit")` from the initial view: active view
  becomes `edit`, `canGoBack` true, direction `forward`.
- `back()` from a depth-2 stack: returns to previous view, `canGoBack` reflects
  remaining depth, direction `back`.
- Three-level drill-in (`A → B → C`) then two `back()` calls returns to `A`;
  stack length and `canGoBack` correct at each step.
- Revisiting the same view id at a deeper level keeps distinct stack entries
  (history stack, not a visited-set).
- Closing the dialog then reopening resets to `initialView` with empty back
  history.
- Back button is absent on the initial view, present after `navigate()`.
- `useNavigator()` outside a `NavigatorDialog` throws the documented error.
- `navigate()` with an unregistered id throws a descriptive error.
- A11y: `Esc` closes the whole dialog; focus is trapped within
  `DialogContent`; back button exposes an accessible name.

**Verification:** Component type-checks against the new `data-slot` shadcn
`Dialog`. Behavior confirmed by copying the file into a host app (huxy
`apps/web`, which has the new shadcn primitives) behind a throwaway demo route,
then driving forward/back/close with the browser — the same preview path used
for `survey-dialog`. The registry repo itself has no app to run.

**Test expectation note:** custom-ui ships no test runner or CI. "Test
scenarios" above are the behaviors the browser-driven verification must exercise;
they are not automated unit tests (none exist in this repo — see Risks).

### U2. Registry entry

**Goal:** `navigator-dialog` installs via the registry URL.

**Requirements:** Registry distribution.

**Dependencies:** U1.

**Files:**
- `registry.json` (modify)

**Approach:** Add a third item after `survey-dialog`, schema identical to
existing items: `name: "navigator-dialog"`, `type: "registry:ui"`,
`title: "Navigator Dialog"`, description; `dependencies: ["lucide-react"]`;
`registryDependencies: ["dialog", "button"]`; one `files` entry mapping
`registry/custom-ui/navigator-dialog.tsx` →
`components/custom-ui/navigator-dialog.tsx`.

**Patterns to follow:** the existing `survey-dialog` item in `registry.json`.

**Test scenarios:** none — declarative manifest. Verified by JSON validity and
that the `files.path` matches U1's created file.

**Test expectation: none** — config-only change.

**Verification:** `registry.json` parses as valid JSON; the new item mirrors the
`survey-dialog` item's shape; `files.path` resolves to the U1 file.

### U3. README documentation

**Goal:** A `Navigator Dialog` section in `README.md`.

**Requirements:** Discoverability/usage docs.

**Dependencies:** U1.

**Files:**
- `README.md` (modify)

**Approach:** Add a section after `Survey Dialog`, same shape as the existing
ones: one-line description, a `tsx` usage example showing a `views` array with a
drill-in (`navigate("edit-name")`) and a `useNavigator()` call inside a view,
and a note that views own their own state while the dialog owns navigation.

**Patterns to follow:** the `Survey Dialog` and `Cell` sections of `README.md`.

**Test scenarios:** none — documentation.

**Test expectation: none** — docs-only change.

**Verification:** The example imports the real exported names from U1 and
compiles mentally against the U1 API; section ordering matches the registry.

---

## System-Wide Impact

- **Registry consumers:** purely additive — a new third item. No change to
  `cell` or `survey-dialog`. Existing installs unaffected.
- **External contract:** the component's exported names (`NavigatorDialog`,
  `useNavigator`, `NavigatorView`, `NavigatorDialogProps`) become a public API
  the moment the PR merges — naming is hard to change later, so U1 must get the
  exported surface right the first time.

---

## Risks & Mitigations

- **No test runner / CI in `custom-ui`.** The repo has no automated tests and no
  CI workflow. *Mitigation:* verification is browser-driven in a host app
  (huxy), as done for `survey-dialog`; test scenarios above define exactly what
  that pass must exercise. LFG's CI-watch step will find no checks and skip.
- **shadcn `Dialog` version drift.** The component composes the host project's
  `dialog`/`button` — if a consumer is on the old pre-`data-slot` shadcn, slots
  differ. *Mitigation:* `registryDependencies` pulls the current shadcn
  `dialog`/`button`; document the new-shadcn assumption in the README.
- **Animated remount + focus.** Keyed remount of the view could drop focus mid-
  drill. *Mitigation:* Radix `DialogContent` retains the focus trap across
  children swaps; verify focus lands sensibly after `navigate()`/`back()` in the
  browser pass.

---

## Verification Strategy

1. Type-check the component against huxy's new-shadcn `Dialog`/`Button` by
   copying it into `apps/web/components/custom-ui/` behind a throwaway
   `app/test/navigator-demo` route (public route; same approach as the
   `survey-dialog` preview).
2. Drive the demo with the browser: drill in two levels, edit, `back()` twice,
   confirm directional animation, confirm `Esc`/`X` close from depth, confirm
   the back button appears/disappears correctly.
3. Remove the throwaway huxy files after verification (they are not part of
   either product).
4. Open the PR against `addisonk/custom-ui`.
