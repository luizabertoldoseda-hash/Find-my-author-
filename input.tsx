import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full border-0 border-b-2 border-ink bg-transparent px-1 font-display text-xl placeholder:text-muted/70 focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
