"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api, qs, type AuthorSummary } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { cn, years } from "@/lib/utils";

/** Autocomplete de autores. onPick → ação customizada; sem onPick navega ao perfil. */
export function AuthorSearch({
  onPick, placeholder = "Um autor que você ama — ex.: Mary Shelley", exclude = [], autoFocus, className, submitToSearch,
}: {
  onPick?: (a: AuthorSummary) => void; placeholder?: string; exclude?: string[]; autoFocus?: boolean;
  className?: string; submitToSearch?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AuthorSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setItems([]); return; }
    const t = setTimeout(() => {
      api<AuthorSummary[]>(`/authors/search${qs({ q: term, limit: 8 })}`)
        .then((r) => { setItems(r.filter((a) => !exclude.includes(a.id))); setErr(null); setActive(0); })
        .catch((e) => setErr(e.message));
    }, 180);
    return () => clearTimeout(t);
  }, [q, exclude.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function pick(a: AuthorSummary) {
    setOpen(false);
    setQ("");
    if (onPick) onPick(a);
    else router.push(`/authors/${a.id}/matches`);
  }

  return (
    <div ref={box} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (items[active]) pick(items[active]);
          else if (submitToSearch && q.trim()) router.push(`/search${qs({ q: q.trim() })}`);
        }}
        className="flex items-center gap-3"
      >
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <Input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-label="Buscar autor"
        />
      </form>
      {open && q.trim() && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 w-full border border-ink bg-card shadow-[4px_4px_0_var(--color-ink)]">
          {err && <li className="px-4 py-3 text-accent">{err}</li>}
          {!err && items.length === 0 && <li className="px-4 py-3 text-muted">Nenhum autor com esse nome no corpus.</li>}
          {items.map((a, i) => (
            <li
              key={a.id}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(a); }}
              className={cn("flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2.5", i === active && "bg-paper-2")}
            >
              <span className="font-display text-lg">{a.name}</span>
              <span className="num text-xs text-muted">{years(a.birth_year, a.death_year) ?? `${a.n_works} obra(s)`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
