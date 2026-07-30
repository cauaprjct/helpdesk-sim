"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Eye, RotateCcw, SquareTerminal, X } from "lucide-react";
import type { Scenario } from "@/content/types";
import { LESSONS } from "@/content/lessons";
import { runCommand } from "@/lib/terminal-engine";
import { saveAttempt } from "@/lib/progress";
import PageNav from "./PageNav";
import { Button, ButtonLink, Chip } from "./ui";
import { cn } from "@/lib/cn";

interface Line {
  kind: "cmd" | "out";
  text: string;
}

const BANNER: Line[] = [
  { kind: "out", text: "Microsoft Windows [versão 10.0.19045.5011]" },
  { kind: "out", text: "(c) Microsoft Corporation. Todos os direitos reservados." },
  { kind: "out", text: "" },
  { kind: "out", text: "Digite `help` para ver os comandos disponíveis." },
  { kind: "out", text: "" },
];

export default function LabRunner({ scenario }: { scenario: Scenario }) {
  const lesson = LESSONS.find((l) => (l.nextLabIds ?? []).includes(scenario.id));

  const [state, setState] = useState(scenario.initial);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histPos, setHistPos] = useState<number | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [hintOpen, setHintOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  const prompt = `C:\\Users\\${state.user}>`;

  function submit(raw: string) {
    const cmd = raw.trim();
    const res = runCommand(cmd, state);

    if (res.clear) {
      setLines([]);
      setInput("");
      return;
    }

    setLines((prev) => [
      ...prev,
      { kind: "cmd" as const, text: `${prompt}${cmd}` },
      ...res.lines.map((l) => ({ kind: "out" as const, text: l })),
    ]);
    setState(res.next);
    if (res.matched) setUsed((prev) => new Set(prev).add(res.matched!));
    if (cmd) setHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistPos(null);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextPos = histPos === null ? 0 : Math.min(histPos + 1, history.length - 1);
      if (history[nextPos] !== undefined) {
        setHistPos(nextPos);
        setInput(history[nextPos]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos === null) return;
      const nextPos = histPos - 1;
      if (nextPos < 0) {
        setHistPos(null);
        setInput("");
      } else {
        setHistPos(nextPos);
        setInput(history[nextPos]);
      }
    }
  }

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
    setLines(BANNER);
    setUsed(new Set());
    setPicked(null);
    setHintOpen(false);
    setInput("");
    inputRef.current?.focus();
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
          {/* A borda própria é o que mantém o console legível como objeto
              separado no tema escuro, onde a sombra não aparece. */}
          <div className="console overflow-hidden rounded-lg border border-console-line shadow-[var(--shadow-console)]">
            <div className="flex items-center gap-2 border-b border-console-line bg-console-2 px-4 py-2">
              <SquareTerminal
                className="size-3.5 text-console-dim"
                aria-hidden="true"
              />
              <span className="text-2xs tracking-wide text-console-dim">
                {state.hostname}
                {state.domain ? `.${state.domain}` : ""} — Prompt de Comando
              </span>
              <span className="ml-auto text-2xs text-console-dim">simulado</span>
            </div>

            <div
              ref={logRef}
              className="scrollbar-console h-[clamp(340px,52vh,560px)] overflow-y-auto px-4 py-3 text-[13px] leading-relaxed"
              role="log"
              aria-live="polite"
              aria-label="Saída do terminal"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((l, i) => (
                <pre
                  key={i}
                  className={cn(
                    "-mx-2 px-2 whitespace-pre-wrap break-words",
                    l.kind === "cmd"
                      ? "bg-console-ink/[0.055] font-medium text-console-ink"
                      : "text-console-ink/90",
                  )}
                >
                  {l.text || " "}
                </pre>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-console-line px-4 py-3 text-[13px]">
              <label htmlFor="cmd" className="shrink-0 text-console-accent">
                {prompt}
              </label>
              <input
                id="cmd"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck={false}
                placeholder="ipconfig /all"
                /* placeholder também precisa dos 4.5:1 — sem opacidade aqui */
                className="min-w-0 flex-1 bg-transparent font-mono text-console-ink caret-console-accent outline-none placeholder:text-console-dim"
                aria-describedby="cmd-help"
              />
            </div>
          </div>
          <p id="cmd-help" className="mt-2 font-mono text-2xs text-ink-soft">
            enter executa · ↑ repete o último · help lista tudo · cls limpa
          </p>
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
          {scenario.diagnoses.map((d) => {
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
