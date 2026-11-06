import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, label, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <select
        className={cn("h-9 min-w-40 border border-rule bg-card px-2 text-[0.95rem] focus:border-ink focus:outline-none", className)}
        {...props}
      />
    </label>
  );
}
