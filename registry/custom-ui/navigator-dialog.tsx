"use client";

import * as React from "react";
import { ChevronLeftIcon, XIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Context lets drill-in views trigger navigation without prop-drilling.
interface NavigatorContextValue {
  navigate: (viewId: string) => void;
  back: () => void;
  canGoBack: boolean;
  activeViewId: string;
  stack: readonly string[];
}

const NavigatorContext = React.createContext<NavigatorContextValue | null>(null);

export function useNavigator() {
  const context = React.useContext(NavigatorContext);
  if (!context) {
    throw new Error("useNavigator must be used within a NavigatorDialog");
  }
  return context;
}

export interface NavigatorView {
  /** Unique id — referenced by `initialView` and `navigate()`. */
  id: string;
  /** Heading shown in the dialog header — also the dialog's accessible name. */
  title: string;
  /** Optional supporting text shown under the title. */
  description?: string;
  render: () => React.ReactNode;
}

export interface NavigatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views: NavigatorView[];
  /** Id of the view shown first and restored when the dialog closes. */
  initialView: string;
  /** Merged onto `DialogContent` — use to override width/height per project. */
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

  // Restore the initial view whenever the dialog is closed.
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

  const contextValue = React.useMemo<NavigatorContextValue>(
    () => ({ navigate, back, canGoBack, activeViewId, stack }),
    [navigate, back, canGoBack, activeViewId, stack],
  );

  if (!activeView) {
    throw new Error(
      `NavigatorDialog: no view registered with id "${activeViewId}"`,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="navigator-dialog"
        showCloseButton={false}
        className={cn(
          // Fixed height so the dialog never resizes between views —
          // the header stays pinned and the content scrolls instead.
          "flex h-[80svh] flex-col sm:h-[32rem] sm:max-w-md",
          className,
        )}
      >
        <NavigatorContext.Provider value={contextValue}>
          {/* Header — three zones: back (left) · title (centered) · close
              (right). Back and close are absolutely positioned so the title
              stays optically centered whether or not back is shown. */}
          <DialogHeader>
            <div className="relative flex h-10 items-center justify-center">
              {canGoBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={back}
                  aria-label="Go back"
                  className="absolute left-0 size-10 rounded-full motion-safe:animate-in motion-safe:fade-in"
                >
                  <ChevronLeftIcon className="size-5" />
                </Button>
              )}
              <DialogTitle className="text-balance px-10 text-center">
                {activeView.title}
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  className="absolute right-0 size-10 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-5" />
                </Button>
              </DialogClose>
            </div>
            {activeView.description && (
              <DialogDescription className="text-center">
                {activeView.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Active view — fixed-height scroll region; keyed remount drives
              the directional slide */}
          <ScrollArea className="-mx-6 min-h-0 flex-1">
            <div
              key={activeViewId}
              className={cn(
                "px-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
                direction === "forward"
                  ? "motion-safe:slide-in-from-right-4"
                  : "motion-safe:slide-in-from-left-4",
              )}
            >
              {activeView.render()}
            </div>
          </ScrollArea>
        </NavigatorContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
