"use client";

import * as React from "react";
import { ChevronLeftIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface NavigatorRenderProps {
  navigate: (viewId: string) => void;
  back: () => void;
  canGoBack: boolean;
  activeViewId: string;
  stack: readonly string[];
}

const NavigatorContext = React.createContext<NavigatorRenderProps | null>(null);

export function useNavigator() {
  const context = React.useContext(NavigatorContext);

  if (!context) {
    throw new Error("useNavigator must be used within a NavigatorDialog");
  }

  return context;
}

export interface NavigatorView {
  /** Unique id referenced by `initialView` and `navigate()`. */
  id: string;
  /** Short label centered in the fixed navigation bar. */
  name: string;
  /** Standard shadcn dialog title rendered below the navigation bar. */
  title: React.ReactNode;
  /** Optional standard shadcn dialog description rendered below the title. */
  description?: React.ReactNode;
  /** Body content rendered below the shadcn dialog header. */
  render: (navigator: NavigatorRenderProps) => React.ReactNode;
  /** Optional actions rendered in a shadcn DialogFooter. */
  footer?: (navigator: NavigatorRenderProps) => React.ReactNode;
}

export interface NavigatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views: NavigatorView[];
  /** Id of the view shown first and restored when the dialog closes. */
  initialView: string;
  /** Merged onto `DialogContent` for project-specific sizing. */
  className?: string;
}

export function NavigatorDialog({
  open,
  onOpenChange,
  views,
  initialView,
  className,
}: NavigatorDialogProps) {
  const [stack, setStack] = React.useState<string[]>([initialView]);
  const [direction, setDirection] = React.useState<"forward" | "back">(
    "forward",
  );

  const activeViewId = stack[stack.length - 1];
  const activeView = views.find((view) => view.id === activeViewId);
  const canGoBack = stack.length > 1;

  React.useEffect(() => {
    if (!open) {
      setStack([initialView]);
      setDirection("forward");
    }
  }, [open, initialView]);

  const navigate = React.useCallback(
    (viewId: string) => {
      if (!views.some((view) => view.id === viewId)) {
        throw new Error(
          `NavigatorDialog: no view registered with id "${viewId}"`,
        );
      }

      setDirection("forward");
      setStack((prev) => [...prev, viewId]);
    },
    [views],
  );

  const back = React.useCallback(() => {
    if (stack.length <= 1) return;

    setDirection("back");
    setStack((prev) => prev.slice(0, -1));
  }, [stack.length]);

  const contextValue = React.useMemo<NavigatorRenderProps>(
    () => ({ navigate, back, canGoBack, activeViewId, stack }),
    [navigate, back, canGoBack, activeViewId, stack],
  );

  if (!activeView) {
    throw new Error(
      `NavigatorDialog: no view registered with id "${activeViewId}"`,
    );
  }

  const footer = activeView.footer?.(contextValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-custom-ui="navigator-dialog"
        showCloseButton={false}
        {...(!activeView.description ? { "aria-describedby": undefined } : {})}
        className={cn(
          "flex h-[80svh] max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[32rem]",
          className,
        )}
      >
        <NavigatorContext.Provider value={contextValue}>
          <div
            className="relative flex h-11 shrink-0 items-center justify-center border-b px-12"
            data-slot="navigator-dialog-bar"
          >
            {canGoBack && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={back}
                aria-label="Go back"
                className="absolute top-1.5 left-2 size-8 rounded-sm [&_svg]:size-4"
              >
                <ChevronLeftIcon />
              </Button>
            )}
            <div className="absolute inset-x-12 top-1/2 truncate -translate-y-1/2 text-center text-sm leading-5 font-medium">
              {activeView.name}
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close"
                className="absolute top-1.5 right-2 size-8 rounded-sm text-muted-foreground hover:text-foreground [&_svg]:size-4"
              >
                <XIcon />
              </Button>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle>{activeView.title}</DialogTitle>
              {activeView.description && (
                <DialogDescription>{activeView.description}</DialogDescription>
              )}
            </DialogHeader>
            <div
              key={activeViewId}
              className={cn(
                "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
                direction === "forward"
                  ? "motion-safe:slide-in-from-right-4"
                  : "motion-safe:slide-in-from-left-4",
              )}
            >
              {activeView.render(contextValue)}
            </div>
          </div>

          {footer && (
            <DialogFooter className="border-t px-6 py-4">{footer}</DialogFooter>
          )}
        </NavigatorContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
