"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/search", label: "Autores", n: "01" },
  { href: "/reading-dna", label: "Reading DNA", n: "02" },
  { href: "/library", label: "Meu Universo", n: "03" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="Principal" className="flex gap-4 overflow-x-auto md:gap-7">
      {ITEMS.map((i) => {
        const on = path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={on ? "page" : undefined}
                className={cn("group flex items-baseline gap-1.5 whitespace-nowrap border-b-2 pb-1 transition-colors",
                  on ? "border-accent text-ink" : "border-transparent text-ink-2 hover:text-accent")}>
            <span className="num text-[0.65rem] text-muted">{i.n}</span>
            <span className="text-[0.95rem] md:text-[1.05rem]">{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
