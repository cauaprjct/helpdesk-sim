"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { SquareTerminal } from "lucide-react";
import type { MachineState } from "@/content/types";
import { runCommand } from "@/lib/terminal-engine";
import { cn } from "@/lib/cn";

/**
 * O console.
 *
 * É a peça central do produto e tem dois donos: o laboratório (com chamado e
 * diagnóstico em volta) e o sandbox público (sem nada em volta). Duplicado nos
 * dois, histórico, rolagem e acessibilidade seriam corrigidos em um lugar e
 * esquecidos no outro.
 *
 * Ele guarda o LOG e o HISTÓRICO; o estado da máquina é do pai, porque é o pai
 * que precisa reagir a ele — placar de evidência no lab, painel de estado no
 * sandbox. Para zerar tudo, o pai troca a `key`: remonta e limpa junto.
 */

interface Line {
  kind: "cmd" | "out";
  text: string;
}

export const WINDOWS_BANNER: string[] = [
  "Microsoft Windows [versão 10.0.19045.5011]",
  "(c) Microsoft Corporation. Todos os direitos reservados.",
  "",
  "Digite `help` para ver os comandos disponíveis.",
  "",
];

/** Permite ao pai executar um comando — os atalhos do sandbox usam isso. */
export interface ConsoleHandle {
  run: (cmd: string) => void;
  focus: () => void;
}

export default function Console({
  ref,
  state,
  onState,
  onMatched,
  banner = WINDOWS_BANNER,
  badge = "simulado",
  placeholder = "ipconfig /all",
  heightClass = "h-[clamp(340px,52vh,560px)]",
  className,
}: {
  ref?: React.Ref<ConsoleHandle>;
  state: MachineState;
  onState: (next: MachineState) => void;
  onMatched?: (label: string) => void;
  banner?: string[];
  badge?: string;
  placeholder?: string;
  heightClass?: string;
  className?: string;
}) {
  const [lines, setLines] = useState<Line[]>(() =>
    banner.map((text) => ({ kind: "out" as const, text })),
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histPos, setHistPos] = useState<number | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const helpId = useId();

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
    onState(res.next);
    if (res.matched) onMatched?.(res.matched);
    if (cmd) setHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistPos(null);
    setInput("");
  }

  // Sem lista de dependências de propósito: `submit` fecha sobre o `state`
  // desta renderização, e um handle memoizado executaria contra estado velho.
  useImperativeHandle(ref, () => ({
    run: (cmd: string) => {
      submit(cmd);
      inputRef.current?.focus();
    },
    focus: () => inputRef.current?.focus(),
  }));

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

  return (
    <>
      {/* A borda própria é o que mantém o console legível como objeto separado
          no tema escuro, onde a sombra não aparece. */}
      <div
        className={cn(
          "console overflow-hidden rounded-lg border border-console-line shadow-[var(--shadow-console)]",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-console-line bg-console-2 px-4 py-2">
          <SquareTerminal className="size-3.5 shrink-0 text-console-dim" aria-hidden="true" />
          <span className="truncate text-2xs tracking-wide text-console-dim">
            {state.hostname}
            {state.domain ? `.${state.domain}` : ""} — Prompt de Comando
            {state.elevated ? " (Administrador)" : ""}
          </span>
          <span className="ml-auto shrink-0 text-2xs text-console-dim">{badge}</span>
        </div>

        <div
          ref={logRef}
          className={cn(
            "scrollbar-console overflow-y-auto px-4 py-3 text-[13px] leading-relaxed",
            heightClass,
          )}
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
          <label htmlFor={inputId} className="shrink-0 text-console-accent">
            {prompt}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            /* placeholder também precisa dos 4.5:1 — sem opacidade aqui */
            className="min-w-0 flex-1 bg-transparent font-mono text-console-ink caret-console-accent outline-none placeholder:text-console-dim"
            aria-describedby={helpId}
          />
        </div>
      </div>
      <p id={helpId} className="mt-2 font-mono text-2xs text-ink-soft">
        enter executa · ↑ repete o último · help lista tudo · cls limpa
      </p>
    </>
  );
}
