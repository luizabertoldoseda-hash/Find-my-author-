import { AlertTriangle, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/lib/api";

export function LoadingBlock({ lines = 4, label = "Carregando" }: { lines?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-6">
      <Skeleton className="h-8 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError | Error; onRetry?: () => void }) {
  const status = "status" in error ? (error as ApiError).status : 0;
  return (
    <div role="alert" className="my-8 border-l-4 border-accent bg-accent-soft/50 px-6 py-5">
      <p className="eyebrow flex items-center gap-2 text-accent">
        <AlertTriangle className="size-3.5" /> {status === 404 ? "Não encontrado" : status ? `Erro ${status}` : "Sem conexão"}
      </p>
      <p className="mt-2">{error.message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="my-8 border border-dashed border-rule px-6 py-10 text-center">
      <BookOpen className="mx-auto size-6 text-muted" />
      <p className="mt-3 font-display text-xl">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-ink-2">{children}</div>}
    </div>
  );
}
