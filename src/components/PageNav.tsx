"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/cn";

/**
 * Barra de navegação das páginas internas. Existe para o link de volta e o
 * controle de tema aparecerem sempre no mesmo lugar — vocabulário de
 * navegação consistente em vez de cada tela inventar o seu.
 */
export default function PageNav({
  label = "Treino",
  href = "/treino",
  className,
  children,
}: {
  label?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <Link
        href={href}
        className="inline-flex min-w-0 items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </Link>
      <div className="flex shrink-0 items-center gap-3">
        {children}
        <ThemeToggle />
      </div>
    </div>
  );
}
