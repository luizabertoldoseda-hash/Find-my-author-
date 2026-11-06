import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[0.8rem] leading-5", {
  variants: {
    variant: {
      default: "border border-rule text-ink-2",
      shared: "bg-ink text-paper",
      accent: "bg-accent-soft text-accent",
      second: "bg-second-soft text-second",
      tier: "border border-accent text-accent font-mono text-[0.65rem] uppercase tracking-[0.12em]",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
