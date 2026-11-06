import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function years(b?: number | null, d?: number | null) {
  if (!b && !d) return null;
  return `${b ?? "?"}–${d ?? "?"}`;
}

export const pct = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? "—" : `${(v * 100).toFixed(digits)}%`;

export const TIER_LABEL: Record<string, string> = {
  lesser_known: "Menos conhecido",
  mid: "Intermediário",
  canonical: "Canônico",
};

export const STATUS_LABEL: Record<string, string> = {
  want_to_read: "Quero ler",
  reading: "Lendo",
  read: "Lido",
};
