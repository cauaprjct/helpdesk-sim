"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcw, ShieldCheck, ShieldOff } from "lucide-react";
import type { MachineState } from "@/content/types";
import {
  SANDBOX_PRESETS,
  estacaoRows,
  redeRows,
  type SandboxPreset,
  type StateRow,
} from "@/content/sandbox";
import Console, { type ConsoleHandle } from "./Console";
import PageNav from "./PageNav";
import { Button, Chip, Panel, PanelHeader } from "./ui";
import { cn } from "@/lib/cn";

/**
 * Terminal livre.
 *
 * Existe para quem chega de fora — recrutador, colega de TI, curioso — poder
 * usar a peça central em dez segundos, sem ler aula nem responder nada.
 *
 * A decisão de projeto é mostrar o ESTADO ao lado do console. No laboratório o
 * estado é escondido e descobri-lo é o exercício; aqui ele fica à vista, porque
 * o que se quer demonstrar é o mecanismo: comando lê estado, alguns comandos
 * escrevem nele, e a saída muda por causa disso — não por script.
 */

function bannerFor(p: SandboxPreset): string[] {
  return [
    "Microsoft Windows [versão 10.0.19045.5011]",
    "(c) Microsoft Corporation. Todos os direitos reservados.",
    "",
    `Máquina carregada: ${p.label}.`,
    "Digite `help` para ver os comandos, ou clique num atalho abaixo.",
    "",
  ];
}

export default function Sandbox() {
  const [preset, setPreset] = useState<SandboxPreset>(SANDBOX_PRESETS[0]);
  const [state, setState] = useState<MachineState>(SANDBOX_PRESETS[0].state);
  /** Trocar a chave remonta o console: log limpo a cada máquina nova. */
  const [runId, setRunId] = useState(0);
  const consoleRef = useRef<ConsoleHandle>(null);

  function load(p: SandboxPreset) {
    setPreset(p);
    setState(p.state);
    setRunId((n) => n + 1);
  }

  function reset() {
    load(preset);
  }

  function toggleElevation() {
    setState((s) => ({ ...s, elevated: !s.elevated }));
    consoleRef.current?.focus();
  }

  // O que mudou desde que a máquina foi carregada. É o que prova que o estado
  // é vivo, então vale destacar.
  const inicial = useMemo(
    () => ({
      estacao: estacaoRows(preset.state),
      rede: redeRows(preset.state),
    }),
    [preset],
  );
  const atual = { estacao: estacaoRows(state), rede: redeRows(state) };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:py-10">
      <PageNav label="Capa" href="/" />

      {/* O console é o argumento desta página, então o texto acima dele fica no
          mínimo: um parágrafo. A ressalva de que nada executa de verdade desceu
          para debaixo do console, onde ela é relevante e não atrasa a chegada. */}
      <header className="mt-4 border-b border-line pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Terminal livre</h1>
          <Chip tone="accent">sem cadastro</Chip>
        </div>
        <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-soft">
          Escolha uma máquina quebrada e investigue no prompt. Sem pergunta e sem
          gabarito — é o motor dos laboratórios, solto. A saída de cada comando
          vem do estado ao lado, e alguns comandos alteram esse estado.
        </p>
      </header>

      {/* ================================================= seletor de máquina */}
      <section className="mt-5" aria-labelledby="maquinas">
        <h2 id="maquinas" className="field-label">
          Máquina
        </h2>
        {/* Sem separador entre grupos: as pastilhas quebram de linha e o
            traço acabava caindo no meio de um grupo, sinalizando errado. Os
            rótulos já dizem a que cada máquina se refere. */}
        <div
          className="mt-2.5 flex flex-wrap gap-1.5"
          role="radiogroup"
          aria-labelledby="maquinas"
        >
          {SANDBOX_PRESETS.map((p) => {
            const on = p.id === preset.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={on}
                onClick={() => load(p)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  "transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-out-quart",
                  on
                    ? "border-accent bg-accent text-surface"
                    : "border-line-2 bg-surface text-ink-soft hover:border-accent-line hover:bg-accent-soft hover:text-ink",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-start gap-2.5">
          <Chip tone="neutral" className="mt-0.5">
            {preset.group}
          </Chip>
          <p className="max-w-[70ch] text-sm leading-relaxed text-ink-soft">
            {preset.note}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* =========================================================== console */}
        <section aria-label="Terminal simulado" className="min-w-0">
          <Console
            key={runId}
            ref={consoleRef}
            state={state}
            onState={setState}
            banner={bannerFor(preset)}
            badge="terminal livre"
          />

          <p className="mt-1.5 max-w-[70ch] text-xs leading-relaxed text-ink-soft">
            Nada é executado de verdade: o motor interpreta o comando e responde o
            que um Windows 10 em português responderia naquela situação.
          </p>

          <div className="mt-5">
            <h2 className="field-label">Atalhos para este defeito</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {preset.suggest.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => consoleRef.current?.run(c)}
                  className={cn(
                    "rounded border border-line-2 bg-surface px-2 py-1 font-mono text-xs text-ink-soft",
                    "transition-colors duration-[var(--dur-fast)]",
                    "hover:border-accent-line hover:bg-accent-soft hover:text-accent",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-ink-soft">
              Na ordem, esses quatro contam a história do defeito. Mas o prompt
              aceita qualquer comando da lista do <code>help</code>.
            </p>
          </div>
        </section>

        {/* ==================================================== estado ao vivo */}
        <aside className="space-y-5">
          <Panel className="overflow-hidden">
            <PanelHeader>
              <p className="field-label">A estação</p>
              <span className="ml-auto font-mono text-2xs text-ink-soft">
                o que os comandos leem
              </span>
            </PanelHeader>
            <StateList rows={atual.estacao} base={inicial.estacao} />
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader>
              <p className="field-label">A rede</p>
              <span className="ml-auto font-mono text-2xs text-ink-soft">
                o que ela não vê
              </span>
            </PanelHeader>
            <StateList rows={atual.rede} base={inicial.rede} />
            <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
              No laboratório este quadro é escondido: descobrir esses valores
              pela resposta dos comandos é o exercício.
            </p>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader>
              <p className="field-label">Prompt</p>
            </PanelHeader>
            <div className="p-4">
              <Button
                tone="secondary"
                className="w-full"
                onClick={toggleElevation}
                aria-pressed={state.elevated}
              >
                {state.elevated ? (
                  <ShieldCheck className="size-4" aria-hidden="true" />
                ) : (
                  <ShieldOff className="size-4" aria-hidden="true" />
                )}
                {state.elevated ? "Administrador" : "Usuário comum"}
              </Button>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">
                Mexer em serviço ou redefinir a conta de computador exige prompt
                elevado. Alterne e rode <code>net start spooler</code> nos dois
                modos para ver a diferença.
              </p>
            </div>
          </Panel>

          <Button tone="ghost" className="-ml-2" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Recarregar a máquina
          </Button>
        </aside>
      </div>
    </div>
  );
}

/**
 * Lista de campo e valor. O que mudou em relação ao estado carregado ganha
 * marca — é o sinal de que o comando escreveu no estado, não só imprimiu texto.
 */
function StateList({ rows, base }: { rows: StateRow[]; base: StateRow[] }) {
  const original = new Map(base.map((r) => [r.label, r.value]));
  return (
    <dl className="divide-y divide-line">
      {rows.map((r) => {
        const mudou = original.get(r.label) !== r.value;
        return (
          <div key={r.label} className="flex items-baseline gap-3 px-4 py-1.5">
            <dt className="w-[8.5rem] shrink-0 font-mono text-2xs tracking-wide text-ink-soft">
              {r.label}
            </dt>
            <dd
              className={cn(
                "min-w-0 flex-1 font-mono text-xs break-words",
                mudou ? "font-semibold text-accent" : "text-ink",
              )}
            >
              {r.value}
              {mudou && (
                <>
                  <span
                    className="ml-1.5 inline-block size-1.5 translate-y-[-1px] rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span className="sr-only"> (alterado pelos comandos)</span>
                </>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
