"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, RotateCcw, X } from "lucide-react";
import type { Ticket, TriageStep } from "@/content/types";
import { lessonForTicket } from "@/content/tickets";
import { saveAttempt } from "@/lib/progress";
import { shuffleFor } from "@/lib/shuffle";
import PageNav from "./PageNav";
import { Button, ButtonLink, Chip, Meter } from "./ui";
import { cn } from "@/lib/cn";

export default function TicketTriage({ ticket }: { ticket: Ticket }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  /** Aula da trilha a que este chamado pertence, não uma aula fixa. */
  const aulaDeApoio = lessonForTicket(ticket.id);

  const step = ticket.steps[index];
  const total = ticket.steps.length;
  const score = Object.values(results).filter(Boolean).length;
  const done = results[step?.id] !== undefined;

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }
    saveAttempt({ ref: `chamado:${ticket.id}`, kind: "chamado", score, total });
    setFinished(true);
  }

  function restart() {
    setIndex(0);
    setResults({});
    setFinished(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <PageNav />

      {/* ------------------------------------------------- ordem de serviço */}
      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-sunken px-4 py-2">
          <p className="field-label">Chamado #{ticket.id}</p>
          <p className="font-mono text-2xs text-ink-soft">aberto {ticket.openedAt}</p>
        </div>
        <div className="px-5 py-4">
          <h1 className="text-xl font-semibold">{ticket.title}</h1>
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="field-label pt-0.5">Quem</dt>
              <dd>{ticket.reporter}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="field-label pt-0.5">Setor</dt>
              <dd>{ticket.sector}</dd>
            </div>
          </dl>
          <p className="mt-4 max-w-[64ch] leading-relaxed text-ink-soft">{ticket.body}</p>
        </div>
      </div>

      {!finished ? (
        <>
          <div className="mt-7 flex items-center justify-between text-sm">
            <span className="font-mono text-xs text-ink-soft">
              etapa {index + 1}/{total}
            </span>
            {/* Verde só quando há acerto E nenhuma etapa concluída ficou de
                fora — antes "0 acertos" saía em verde na primeira etapa. */}
            <Chip
              tone={
                score > 0 && score === index + (done ? 1 : 0) ? "ok" : "neutral"
              }
            >
              {score} {score === 1 ? "acerto" : "acertos"}
            </Chip>
          </div>
          <Meter
            value={index + 1}
            max={total}
            label="Progresso da triagem"
            className="mt-2"
          />

          <div className="mt-8">
            <StepView
              key={step.id}
              step={step}
              onComplete={(correct) =>
                setResults((prev) => ({ ...prev, [step.id]: correct }))
              }
            />
          </div>

          <div className="mt-8">
            <Button onClick={next} disabled={!done}>
              {index + 1 === total ? "Encerrar chamado" : "Próxima etapa"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-7">
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="field-label">Triagem concluída</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-semibold">
                {score}
                <span className="text-ink-soft">/{total}</span>
              </p>
              <Chip tone={score === total ? "ok" : "warn"}>
                {score === total ? "sem furo" : "revisar"}
              </Chip>
            </div>
            <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-ink-soft">
              {ticket.debrief}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button tone="secondary" onClick={restart}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Refazer
            </Button>
            {aulaDeApoio && (
              <ButtonLink tone="secondary" href={`/aula/${aulaDeApoio}`}>
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
    </div>
  );
}

/* ------------------------------------------------------------- etapas --- */

function StepView({
  step,
  onComplete,
}: {
  step: TriageStep;
  onComplete: (correct: boolean) => void;
}) {
  if (step.kind === "choice") return <ChoiceStep step={step} onComplete={onComplete} />;
  if (step.kind === "order") return <OrderStep step={step} onComplete={onComplete} />;
  return <NoteStep step={step} onComplete={onComplete} />;
}

function StepHead({ question, help }: { question: string; help?: string }) {
  return (
    <>
      <h2 className="max-w-[56ch] text-lg font-semibold">{question}</h2>
      {help && <p className="mt-1.5 max-w-[62ch] text-sm text-ink-soft">{help}</p>}
    </>
  );
}

function ChoiceStep({
  step,
  onComplete,
}: {
  step: Extract<TriageStep, { kind: "choice" }>;
  onComplete: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const revealed = picked !== null;

  /**
   * A opção correta foi escrita primeiro em todas as etapas de escolha. Sem
   * redistribuir, a triagem se resolve clicando sempre na primeira. Ordem
   * determinística pelo id da etapa, para não divergir na hidratação.
   */
  const options = useMemo(() => shuffleFor(step.options, step.id), [step]);

  function choose(id: string) {
    if (revealed) return;
    setPicked(id);
    onComplete(!!step.options.find((o) => o.id === id)?.correct);
  }

  return (
    <div>
      <StepHead question={step.question} help={step.help} />
      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {options.map((o) => {
          const isPicked = picked === o.id;
          const showRight = revealed && o.correct;
          const showWrong = revealed && isPicked && !o.correct;
          return (
            <li
              key={o.id}
              className={cn(
                showRight && "bg-ok-soft",
                showWrong && "bg-bad-soft",
                revealed && !showRight && !showWrong && "opacity-55",
              )}
            >
              <button
                onClick={() => choose(o.id)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-[var(--dur-fast)]",
                  !revealed && "hover:bg-sunken",
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
                  <span className="block max-w-[60ch] text-sm">{o.label}</span>
                  {revealed && (isPicked || o.correct) && (
                    <span className="reveal-answer mt-2 block max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                      {o.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OrderStep({
  step,
  onComplete,
}: {
  step: Extract<TriageStep, { kind: "order" }>;
  onComplete: (correct: boolean) => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const complete = order.length === step.items.length;
  const correct = checked && order.join() === step.correctOrder.join();

  function toggle(id: string) {
    if (checked) return;
    setOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div>
      <StepHead question={step.question} help={step.help} />

      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {step.items.map((item) => {
          const pos = order.indexOf(item.id);
          const rightPos = step.correctOrder.indexOf(item.id);
          const isRight = checked && pos === rightPos;
          return (
            <li
              key={item.id}
              className={cn(checked && (isRight ? "bg-ok-soft" : "bg-bad-soft"))}
            >
              <button
                onClick={() => toggle(item.id)}
                disabled={checked}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[var(--dur-fast)]",
                  !checked && "hover:bg-sunken",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded font-mono text-xs transition-colors duration-[var(--dur-fast)]",
                    pos >= 0
                      ? checked
                        ? isRight
                          ? "bg-ok text-surface"
                          : "bg-bad text-surface"
                        : "bg-accent text-surface"
                      : "border border-line-2 text-ink-soft",
                  )}
                  aria-hidden="true"
                >
                  {pos >= 0 ? pos + 1 : "·"}
                </span>
                <span className="min-w-0 flex-1 text-sm">{item.label}</span>
                {checked && !isRight && (
                  <span className="shrink-0 font-mono text-2xs text-ink-soft">
                    era {rightPos + 1}º
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!checked ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            disabled={!complete}
            onClick={() => {
              setChecked(true);
              onComplete(order.join() === step.correctOrder.join());
            }}
          >
            Conferir ordem
          </Button>
          <Button tone="ghost" onClick={() => setOrder([])}>
            Limpar
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "reveal-answer mt-5 rounded-lg border p-4",
            correct ? "border-ok-line bg-ok-soft" : "border-warn-line bg-warn-soft",
          )}
        >
          <p className="text-sm font-semibold">
            {correct ? "Ordem correta." : "Ordem diferente da esperada."}
          </p>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ink">{step.why}</p>
        </div>
      )}
    </div>
  );
}

function NoteStep({
  step,
  onComplete,
}: {
  step: Extract<TriageStep, { kind: "note" }>;
  onComplete: (correct: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const hits = step.mustMention.map((m) => ({
    ...m,
    found: m.aliases.some((a) =>
      normalized.includes(a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
    ),
  }));
  const found = hits.filter((h) => h.found).length;

  return (
    <div>
      <StepHead question={step.question} help={step.help} />

      <label htmlFor="nota" className="sr-only">
        Registro do chamado
      </label>
      <textarea
        id="nota"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={checked}
        rows={7}
        placeholder="Escreva como se outro técnico fosse ler amanhã, sem falar com você."
        className={cn(
          "mt-5 w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed",
          "outline-none transition-colors duration-[var(--dur-fast)]",
          "focus:border-accent-line focus:bg-accent-soft/40 disabled:opacity-70",
        )}
      />

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-sunken px-4 py-2">
          <p className="text-xs font-semibold text-ink-soft">
            O registro deveria cobrir
          </p>
          <span className="font-mono text-2xs text-ink-soft">
            {found}/{step.mustMention.length}
          </span>
        </div>
        <ul className="px-4 py-3">
          {hits.map((h) => (
            <li key={h.key} className="flex items-center gap-2.5 py-1 text-sm">
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-[3px] border transition-colors duration-[var(--dur-fast)]",
                  h.found
                    ? "border-ok bg-ok text-surface"
                    : checked
                      ? "border-bad bg-bad text-surface"
                      : "border-line-2",
                )}
                aria-hidden="true"
              >
                {h.found ? (
                  <Check className="draw-check size-3" strokeWidth={3} />
                ) : checked ? (
                  <X className="size-3" strokeWidth={3} />
                ) : null}
              </span>
              <span className={h.found ? "text-ink" : "text-ink-soft"}>{h.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {!checked ? (
        <Button
          className="mt-5"
          disabled={text.trim().length < 20}
          onClick={() => {
            setChecked(true);
            onComplete(found >= Math.ceil(step.mustMention.length * 0.6));
          }}
        >
          Conferir registro
        </Button>
      ) : (
        <div className="reveal-answer mt-5 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line bg-sunken px-4 py-2">
            <p className="text-xs font-semibold text-ink-soft">
              Registro de referência
            </p>
          </div>
          <div className="px-4 py-3.5">
            <p className="max-w-[64ch] text-sm leading-relaxed text-ink-soft">
              {step.modelAnswer}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              A conferência é por palavra-chave, então é aproximada. O que vale é
              comparar o seu texto com este e ver o que ficou de fora.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
