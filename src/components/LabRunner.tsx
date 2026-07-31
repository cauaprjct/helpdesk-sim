"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Eye, RotateCcw, X } from "lucide-react";
import type { Scenario } from "@/content/types";
import { LESSONS } from "@/content/lessons";
import { saveAttempt } from "@/lib/progress";
import { shuffleFor } from "@/lib/shuffle";
import Console from "./Console";
import PageNav from "./PageNav";
import { Button, ButtonLink, Chip } from "./ui";
import { cn } from "@/lib/cn";

export default function LabRunner({ scenario }: { scenario: Scenario }) {
  const lesson = LESSONS.find((l) => (l.nextLabIds ?? []).includes(scenario.id));

  const [state, setState] = useState(scenario.initial);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [hintOpen, setHintOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  /** Trocar a chave do console remonta e zera o log junto com o cenário. */
  const [runId, setRunId] = useState(0);

  /**
   * O diagnóstico correto foi escrito primeiro em todos os doze cenários. Sem
   * redistribuir, o laboratório se resolve escolhendo a primeira opção sem
   * abrir o terminal — o oposto do que ele treina. Determinístico por id para
   * não divergir na hidratação; refazer muda a ordem.
   */
  const diagnoses = useMemo(
    () => shuffleFor(scenario.diagnoses, scenario.id, runId),
    [scenario, runId],
  );

  const evidence = scenario.expectedCommands.filter((c) => used.has(c));
  const answered = picked !== null;
  const pickedOption = scenario.diagnoses.find((d) => d.id === picked);
  const gotIt = !!pickedOption?.correct;

  function answer(id: string) {
    if (answered) return;
    setPicked(id);
    const correct = scenario.diagnoses.find((d) => d.id === id)?.correct;
    saveAttempt({
      ref: `lab:${scenario.id}`,
      kind: "lab",
      score: correct ? 1 : 0,
      total: 1,
    });
  }

  function reset() {
    setState(scenario.initial);
    setUsed(new Set());
    setPicked(null);
    setHintOpen(false);
    setRunId((n) => n + 1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:py-10">
      <PageNav />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-5">
        <h1 className="text-2xl font-semibold">{scenario.title}</h1>
        {lesson && (
          <Link
            href={`/aula/${lesson.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            <BookOpen className="size-3.5" aria-hidden="true" />
            Aula: {lesson.title}
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_296px]">
        {/* ================================================ console (a peça) */}
        <section aria-label="Terminal simulado" className="min-w-0">
          <Console
            key={runId}
            state={state}
            onState={setState}
            onMatched={(label) => setUsed((prev) => new Set(prev).add(label))}
          />
        </section>

        {/* ============================================ ordem de serviço */}
        <aside className="space-y-5">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line bg-sunken px-4 py-2">
              <p className="field-label">Chamado aberto</p>
            </div>
            <dl className="divide-y divide-line text-sm">
              <div className="flex gap-3 px-4 py-2.5">
                <dt className="field-label w-20 shrink-0 pt-0.5">Quem</dt>
                <dd className="min-w-0 flex-1">{scenario.reporter}</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="field-label">Relato</dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">
                  {scenario.briefing}
                </dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line bg-sunken px-4 py-2">
              <p className="field-label">Evidência</p>
              <span className="font-mono text-2xs text-ink-soft">
                {evidence.length}/{scenario.expectedCommands.length}
              </span>
            </div>
            <ul className="px-4 py-3">
              {scenario.expectedCommands.map((c) => {
                const done = used.has(c);
                return (
                  <li key={c} className="flex items-center gap-2.5 py-1">
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-[3px] border transition-colors duration-[var(--dur-fast)]",
                        done ? "border-ok bg-ok text-surface" : "border-line-2",
                      )}
                      aria-hidden="true"
                    >
                      {done && <Check className="draw-check size-3" strokeWidth={3} />}
                    </span>
                    {/* Sem opacidade em texto pequeno: o estado é o quadradinho
                        e o peso, não o desbotamento — isso derruba contraste. */}
                    <span
                      className={cn(
                        "font-mono text-xs",
                        done ? "font-medium text-ink" : "text-ink-soft",
                      )}
                    >
                      {c}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-line px-4 py-2.5 text-xs text-ink-soft">
              Diagnosticar sem rodar comando é chute.
            </p>
          </div>

          <div>
            {hintOpen ? (
              <p className="rounded-lg border border-warn-line bg-warn-soft p-4 text-sm text-warn-ink">
                {scenario.hint}
              </p>
            ) : (
              <Button tone="secondary" className="w-full" onClick={() => setHintOpen(true)}>
                <Eye className="size-4" aria-hidden="true" />
                Mostrar dica
              </Button>
            )}
          </div>

          <Button tone="ghost" className="-ml-2" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reiniciar cenário
          </Button>
        </aside>
      </div>

      {/* ==================================================== diagnóstico */}
      <section className="mt-12 max-w-3xl" aria-label="Diagnóstico">
        <h2 className="text-lg font-semibold">Qual é a causa?</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Responda depois de ter evidência no terminal, não antes.
        </p>

        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {diagnoses.map((d) => {
            const isPicked = picked === d.id;
            const showRight = answered && d.correct;
            const showWrong = answered && isPicked && !d.correct;
            return (
              <li
                key={d.id}
                className={cn(
                  showRight && "bg-ok-soft",
                  showWrong && "bg-bad-soft",
                  answered && !showRight && !showWrong && "opacity-55",
                )}
              >
                <button
                  onClick={() => answer(d.id)}
                  disabled={answered}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-[var(--dur-fast)]",
                    !answered && "hover:bg-sunken",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                      showRight && "border-ok bg-ok text-surface",
                      showWrong && "border-bad bg-bad text-surface",
                      !showRight && !showWrong && "border-line-2",
                    )}
                    aria-hidden="true"
                  >
                    {showRight && <Check className="size-3" strokeWidth={3} />}
                    {showWrong && <X className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{d.label}</span>
                    {answered && (isPicked || d.correct) && (
                      <span className="reveal-answer mt-2 block max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                        {d.why}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className="reveal-answer mt-6">
            <div
              className={cn(
                "rounded-lg border p-5",
                gotIt ? "border-ok-line bg-ok-soft" : "border-warn-line bg-warn-soft",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={gotIt ? "ok" : "warn"}>
                  {gotIt ? "resolvido" : "reaberto"}
                </Chip>
                <p className="text-sm font-semibold">
                  {gotIt
                    ? evidence.length === scenario.expectedCommands.length
                      ? "Acertou, e com evidência completa."
                      : "Acertou — mas rode os comandos que faltaram e confirme na saída."
                    : "Errou. Leia a explicação e reinicie para investigar de novo."}
                </p>
              </div>
              <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ink">
                {scenario.debrief}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button tone="secondary" onClick={reset}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Refazer
              </Button>
              {lesson && (
                <ButtonLink tone="secondary" href={`/aula/${lesson.id}`}>
                  <BookOpen className="size-4" aria-hidden="true" />
                  Reler a aula
                </ButtonLink>
              )}
              <ButtonLink tone="ghost" href="/">
                Painel
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
