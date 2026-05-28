import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const cellVariants = cva(
  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-[color,box-shadow,background-color,border-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost: "border border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        muted:
          "border border-transparent bg-muted text-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  }
);

function Cell({
  className,
  asChild = false,
  variant = "ghost",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cellVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(cellVariants({ variant }), className)}
      data-slot="cell"
      data-variant={variant}
      {...props}
    />
  );
}

function CellStart({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0", className)}
      data-slot="cell-start"
      {...props}
    />
  );
}

function CellContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      data-slot="cell-content"
      {...props}
    />
  );
}

function CellLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground text-xs uppercase tracking-wide",
        className
      )}
      data-slot="cell-label"
      {...props}
    />
  );
}

function CellTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("truncate font-medium text-sm", className)}
      data-slot="cell-title"
      {...props}
    />
  );
}

function CellDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("truncate text-muted-foreground text-sm", className)}
      data-slot="cell-description"
      {...props}
    />
  );
}

function CellNote({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="cell-note"
      {...props}
    />
  );
}

function CellEnd({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0", className)}
      data-slot="cell-end"
      {...props}
    />
  );
}

function CellSkeleton({ className }: { className?: string }) {
  return (
    <Cell className={className}>
      <CellStart>
        <Skeleton className="size-10 rounded-full" />
      </CellStart>
      <CellContent className="gap-1.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CellContent>
    </Cell>
  );
}

export {
  Cell,
  CellStart,
  CellContent,
  CellLabel,
  CellTitle,
  CellDescription,
  CellNote,
  CellEnd,
  CellSkeleton,
  cellVariants,
};
