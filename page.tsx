"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, useApi, type BookStatus, type Library } from "@/lib/api";
import { PageHeader } from "@/components/author-bits";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/states";
import { cn, STATUS_LABEL } from "@/lib/utils";

const TABS = [
  { key: "books", label: "Lista de leitura" },
  { key: "authors", label: "Autores" },
  { key: "recommendations", label: "Descobertas" },
] as const;

export default function LibraryPage() {
  const { data, error, loading, reload } = useApi<Library>("/library");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("books");
  const [statusFilter, setStatusFilter] = useState<BookStatus | "">("");
  const [opError, setOpError] = useState<string | null>(null);

  async function op(path: string, init: RequestInit) {
    setOpError(null);
    try { await api(path, init); reload(); } catch (e) { setOpError((e as Error).message); }
  }

  const books = (data?.books ?? []).filter((b) => !statusFilter || b.status === statusFilter);

  return (
    <>
      <PageHeader eyebrow="03 · Meu Universo Literário" title="Sua biblioteca de descobertas">
        Tudo o que você guardou fica salvo no banco, associado a este navegador.
      </PageHeader>

      <div role="tablist" className="flex gap-6 border-b border-rule">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                  className={cn("-mb-px cursor-pointer border-b-2 pb-2 text-lg", tab === t.key ? "border-accent" : "border-transparent text-ink-2 hover:text-accent")}>
            {t.label} <span className="num text-xs text-muted">{data ? data[t.key].length : ""}</span>
          </button>
        ))}
      </div>

      {loading && !data && <LoadingBlock lines={5} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {opError && <p role="alert" className="mt-4 text-accent">{opError}</p>}

      {data && tab === "books" && (
        <section role="tabpanel">
          <div className="mt-5 flex gap-2">
            {(["", "want_to_read", "reading", "read"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                      className={cn("cursor-pointer border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider", statusFilter === s ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink")}>
                {s ? STATUS_LABEL[s] : "Todos"}
              </button>
            ))}
          </div>
          {books.length === 0 ? (
            <EmptyState title="Nenhum livro aqui ainda">Abra o perfil de um autor e clique em “Quero ler” numa obra.</EmptyState>
          ) : (
            <ul className="mt-6 divide-y divide-rule border-y border-rule">
              {books.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 py-4">
                  {b.work.cover_url ? <img src={b.work.cover_url} alt="" className="h-16 w-11 border border-rule object-cover" /> : <div className="h-16 w-11 bg-paper-2" />}
                  <div className="min-w-48 flex-1">
                    <p className="font-display text-xl leading-tight">{b.work.title}</p>
                    <Link href={`/authors/${b.author_id}`} className="link text-ink-2">{b.author_name}</Link>
                  </div>
                  <label className="flex items-center gap-2">
                    <span className="sr-only">Status de leitura</span>
                    <select value={b.status} onChange={(e) => op(`/library/books/${b.work.id}`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) })}
                            className="h-9 border border-rule bg-card px-2">
                      {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <button aria-label="Remover livro" className="cursor-pointer text-muted hover:text-accent"
                          onClick={() => op(`/library/books/${b.work.id}`, { method: "DELETE" })}><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {data && tab === "authors" && (
        <section role="tabpanel">
          {data.authors.length === 0 ? (
            <EmptyState title="Nenhum autor salvo">Use “Salvar autor” no perfil de qualquer escritor.</EmptyState>
          ) : (
            <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.authors.map((x) => (
                <li key={x.id} className="flex items-start justify-between gap-3 border-t-2 border-ink pt-3">
                  <div>
                    <Link href={`/authors/${x.author.id}`} className="font-display text-2xl hover:text-accent">{x.author.name}</Link>
                    <p className="num text-xs text-muted">salvo em {new Date(x.created_at).toLocaleDateString("pt-BR")}</p>
                    <Link href={`/authors/${x.author.id}/matches`} className="eyebrow mt-2 block hover:text-accent">Ver afinidades →</Link>
                  </div>
                  <button aria-label={`Remover ${x.author.name}`} className="cursor-pointer text-muted hover:text-accent"
                          onClick={() => op(`/library/authors/${x.author.id}`, { method: "DELETE" })}><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {data && tab === "recommendations" && (
        <section role="tabpanel">
          {data.recommendations.length === 0 ? (
            <EmptyState title="Nenhuma descoberta guardada">No Author Match ou no Reading DNA, clique em “Guardar” numa recomendação.</EmptyState>
          ) : (
            <ul className="mt-6 divide-y divide-rule border-y border-rule">
              {data.recommendations.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex-1">
                    <Link href={`/authors/${r.recommended.id}`} className="font-display text-2xl hover:text-accent">{r.recommended.name}</Link>
                    <p className="text-sm text-ink-2">
                      {r.context === "author_match" && r.source_author ? (
                        <>via Author Match de <Link className="link" href={`/compare/${r.source_author.id}/${r.recommended.id}`}>{r.source_author.name}</Link></>
                      ) : r.profile_id ? (
                        <>via <Link className="link" href={`/reading-dna/${r.profile_id}`}>Reading DNA</Link></>
                      ) : r.context}
                      {r.score !== null && <span className="num text-muted"> · score {r.score.toFixed(2)}</span>}
                    </p>
                  </div>
                  <button aria-label="Remover descoberta" className="cursor-pointer text-muted hover:text-accent"
                          onClick={() => op(`/library/recommendations/${r.id}`, { method: "DELETE" })}><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
