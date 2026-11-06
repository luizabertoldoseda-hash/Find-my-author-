import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/newsreader";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Hit or Flop? — descoberta literária",
  description: "Encontre escritores que você ainda não leu a partir dos que você já ama.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:p-2">Pular para o conteúdo</a>
        <header className="mx-auto max-w-6xl px-5 pt-5 md:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-2">
            <p className="eyebrow hidden sm:block">Plataforma de descoberta literária · NLP &amp; ML</p>
            <p className="eyebrow">Corpus em domínio público</p>
          </div>
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-end md:justify-between">
            <Link href="/" className="font-display text-4xl leading-none tracking-tight md:text-5xl">
              Hit <em className="font-normal text-accent">or</em> Flop?
            </Link>
            <Nav />
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-6xl px-5 pb-24 md:px-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-10 md:px-8">
          <div className="rule pt-4 text-sm text-muted">
            Os scores medem proximidade textual e temática dentro do corpus — não qualidade literária nem sucesso comercial.
            Textos do Project Gutenberg; metadados do Open Library e Google Books.
          </div>
        </footer>
      </body>
    </html>
  );
}
