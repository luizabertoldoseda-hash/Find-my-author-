"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { api, type AuthorSummary } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIER_LABEL, years } from "@/lib/utils";

export function TierBadge({ tier }: { tier: string | null }) {
  if (!tier || tier === "mid") return null;
  return <Badge variant="tier">{TIER_LABEL[tier]}</Badge>;
}

export function Tags({ items, variant = "default", max = 6 }: { items: string[]; variant?: "default" | "shared" | "accent" | "second"; max?: number }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, max).map((t) => <Badge key={t} variant={variant}>{t}</Badge>)}
    </div>
  );
}

export function AuthorCard({ a, footer }: { a: AuthorSummary; footer?: React.ReactNode }) {
  return (
    <article className="flex h-full flex-col border-t-2 border-ink pt-3">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/authors/${a.id}`} className="font-display text-2xl leading-tight hover:text-accent">{a.name}</Link>
        <TierBadge tier={a.popularity_tier} />
      </div>
      <p className="num mt-1 text-xs text-muted">
        {years(a.birth_year, a.death_year) ?? "datas não informadas"} · {a.n_works} obra{a.n_works === 1 ? "" : "s"} no corpus
      </p>
      <div className="mt-3"><Tags items={a.genres} max={3} /></div>
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </article>
  );
}

/** Botão "salvar" genérico para a biblioteca (POST). */
export function SaveButton({ path, body, label = "Salvar", savedLabel = "Salvo" }: { path: string; body: object; label?: string; savedLabel?: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  return (
    <Button
      variant={state === "saved" ? "default" : "outline"}
      size="sm"
      disabled={state === "saving"}
      onClick={async () => {
        setState("saving");
        try { await api(path, { method: "POST", body: JSON.stringify(body) }); setState("saved"); }
        catch { setState("error"); }
      }}
      aria-live="polite"
    >
      {state === "saved" ? <BookmarkCheck /> : <Bookmark />}
      {state === "saved" ? savedLabel : state === "error" ? "Erro — tentar de novo" : label}
    </Button>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="rule-strong pt-6 pb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl md:text-6xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-lg text-ink-2">{children}</div>}
    </header>
  );
}
