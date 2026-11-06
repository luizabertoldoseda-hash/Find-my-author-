import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-accent",
        accent: "bg-accent text-paper hover:bg-ink",
        outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
        ghost: "text-ink-2 hover:text-accent",
      },
      size: { default: "h-10 px-5", sm: "h-8 px-3", lg: "h-12 px-7", icon: "size-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
