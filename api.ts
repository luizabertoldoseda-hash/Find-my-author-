// Cliente tipado da API (espelha hof/api/schemas.py). Sem dados falsos: tudo vem do backend.

import { useCallback, useEffect, useState } from "react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Tier = "lesser_known" | "mid" | "canonical";
export type Mode = "hybrid" | "semantic" | "metadata";
export type BookStatus = "want_to_read" | "reading" | "read";

export interface WorkSummary { id: string; title: string; cover_url: string | null; published_date: string | null; genres: string[]; n_words: number }
export interface Work extends WorkSummary {
  author_id: string; author_name: string; description: string | null; subjects: string[]; themes: string[];
  gutenberg_id: number | null; google_books_id: string | null; source_url: string | null; n_chunks_sampled: number; download_count: number | null;
}
export interface AuthorSummary {
  id: string; name: string; birth_year: number | null; death_year: number | null; popularity_tier: Tier | null;
  genres: string[]; themes: string[]; n_works: number; cover_url: string | null;
}
export interface StyleFeature { feature: string; label: string; percentile: number; raw: number }
export interface Source { source: string; source_id: string | null; url: string | null; retrieved_at: string | null }
export interface Author extends AuthorSummary {
  bio: string | null; bio_source: string | null; wikipedia_url: string | null; curation_region: string | null;
  gutenberg_downloads: number | null; subgenres: string[]; text_themes: string[]; text_theme_scores: Record<string, number>;
  keywords: string[]; style: StyleFeature[]; works: WorkSummary[]; sources: Source[];
}
export interface Page { total: number; limit: number; offset: number; items: AuthorSummary[] }
export interface Components { semantic: number | null; genre: number | null; subgenre: number | null; theme: number | null; style: number | null }
export interface Shared { genres: string[]; subgenres: string[]; themes: string[]; text_themes: string[]; keywords: string[] }
export interface Match {
  rank: number; score: number; mode: Mode; author: AuthorSummary; bio: string | null; subgenres: string[];
  representative_works: WorkSummary[]; components: Components; semantic_raw: number; semantic_percentile: number;
  shared: Shared; explanation: string; breakdown_url: string;
}
export interface MatchList { reference: AuthorSummary; mode: Mode; filters: Record<string, string | null>; weights: Record<string, number>; items: Match[] }
export interface Breakdown {
  author1: AuthorSummary; author2: AuthorSummary; hybrid_score: number | null; components: Components;
  component_labels: Record<string, string>; weights: Record<string, number>; semantic_raw: number; semantic_percentile: number;
  rank_of_2_for_1: number; rank_of_1_for_2: number; n_authors: number; shared: Shared;
  only_1: Record<string, string[]>; only_2: Record<string, string[]>;
  style: { feature: string; label: string; author1: number; author2: number; author1_raw: number; author2_raw: number }[];
  text_themes: { theme: string; author1: number; author2: number }[];
  explanation: string;
}
export interface DNARecommendation {
  rank: number; author: AuthorSummary; score: number; components: Components; semantic_raw: number;
  closest_selected: string; matched_genres: string[]; matched_themes: string[]; explanation: string;
}
export interface ReadingDNA {
  id: string; created_at: string; authors: AuthorSummary[]; method: string; recommendations: DNARecommendation[];
  profile: {
    genres: Record<string, number>; subgenres: Record<string, number>; themes: Record<string, number>; text_themes: Record<string, number>;
    keywords: string[]; style: { feature: string; label: string; value: number }[]; text_theme_z: Record<string, number>;
    cohesion: number; cohesion_percentile: number;
  };
}
export interface Library {
  authors: { id: number; author: AuthorSummary; note: string | null; created_at: string }[];
  books: { id: number; work: WorkSummary; author_id: string; author_name: string; status: BookStatus; note: string | null; created_at: string; updated_at: string }[];
  recommendations: { id: number; recommended: AuthorSummary; source_author: AuthorSummary | null; profile_id: string | null; context: string; score: number | null; note: string | null; created_at: string }[];
}
export interface Facets { genres: { value: string; count: number }[]; subgenres: { value: string; count: number }[]; themes: { value: string; count: number }[]; tiers: { value: string; count: number }[] }
export interface Stats { authors: number; works: number; chunks: number; pairs: number; lesser_known: number; model: string | null; built_at: string | null; weights: Record<string, number> }

// Identificador anônimo por navegador → cada leitor tem sua biblioteca.
function userId(): string {
  try {
    let id = localStorage.getItem("hof_user");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("hof_user", id);
    }
    return id;
  } catch {
    return "local";
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "X-User-Id": userId(), ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, `Não foi possível conectar à API em ${API_URL}. O backend está rodando?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch { /* corpo vazio */ }
    throw new ApiError(res.status, detail);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function qs(params: Record<string, string | number | null | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Hook de leitura com estados de carregamento/erro e recarga. path=null não busca. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e : new ApiError(0, String(e))))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
