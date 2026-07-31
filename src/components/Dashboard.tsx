"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  ListChecks,
  Repeat,
  Terminal,
  Ticket as TicketIcon,
  Trash2,
} from "lucide-react";
import { LESSONS } from "@/content/lessons";
import { getQuiz } from "@/content/quizzes";
import { getScenario } from "@/content/scenarios";
import { TICKETS, TICKETS_BY_LESSON } from "@/content/tickets";
import { AREA_LABEL } from "@/content/types";
import { getProgress, resetAll, type ProgressState } from "@/lib/progress";
import { cn } from "@/lib/cn";
import ThemeToggle from "./ThemeToggle";
import { Button, Chip, Meter, Panel } from "./ui";

const LEVEL_NOTE: Record<number, string> = {
  1: "Atendimento ao usuário: rede, estação, impressão e chamado.",
  2: "O que chega escalado: servidor, identidade, permissão e causa raiz.",
};

export default function Dashboard() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [activeId, setActiveId] = useState(LESSONS[0].id);

  const levelLessons = LESSONS.filter((l) => l.level === level);

  /** Ao trocar de nível, cair na primeira trilha dele. */
  function pickLevel(next: 1 | 2) {
    setLevel(next);
    const first = LESSONS.find((l) => l.level === next);
    if (first) setActiveId(first.id);
  }

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener("helpdesk-sim:progress", load);
    return () => window.removeEventListener("helpdesk-sim:progress", load);
  }, []);

  const best = useMemo(() => {
    const attempts = progress?.attempts ?? [];
    return (ref: string) => {
      const list = attempts.filter((a) => a.ref === ref);
      if (list.length === 0) return null;
      return list.reduce((b, a) => (a.score / a.total > b.score / b.total ? a : b));
    };
  }, [progress]);

  /** Quantos exercícios da trilha já foram concluídos com acerto total. */
  function trackStats(lessonId: string) {
    const lesson = LESSONS.find((l) => l.id === lessonId)!;
    const refs = [
      ...(lesson.nextLabIds ?? []).map((id) => `lab:${id}`),
      ...(TICKETS_BY_LESSON[lessonId] ?? []).map((id) => `chamado:${id}`),
      ...(lesson.nextQuizId ? [`quiz:${lesson.nextQuizId}`] : []),
    ];
    const done = refs.filter((ref) => {
      const b = best(ref);
      return b ? b.score === b.total : false;
    }).length;
    const read = progress?.readLessons.includes(lessonId) ? 1 : 0;
    return { done: done + read, total: refs.length + 1 };
  }

  /** Fila de revisão: erro de qualquer trilha, sem servidor. */
  const wrongCount = progress?.wrongQuestions.length ?? 0;

  const active = LESSONS.find((l) => l.id === activeId) ?? levelLessons[0];
  const quiz = active.nextQuizId ? getQuiz(active.nextQuizId) : undefined;
  const labs = (active.nextLabIds ?? [])
    .map((id) => getScenario(id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const tickets = (TICKETS_BY_LESSON[active.id] ?? [])
    .map((id) => TICKETS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const lessonRead = progress?.readLessons.includes(active.id) ?? false;

  /** Progresso do nível corrente, não do produto todo. */
  const overall = levelLessons.reduce(
    (acc, l) => {
      const s = trackStats(l.id);
      return { done: acc.done + s.done, total: acc.total + s.total };
    },
    { done: 0, total: 0 },
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-10 lg:py-12">
      {/* ================================================== trilho lateral */}
      <nav
        aria-label="Trilhas de treino"
        className="lg:sticky lg:top-12 lg:h-fit lg:w-60 lg:shrink-0"
      >
        {/* Sem rótulo acima do título: o título carrega o próprio peso, e ele
            é o caminho de volta para a capa. */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4 text-ink-soft" aria-hidden="true" />
          Treino de suporte
        </Link>

        {/* Seletor de nível: N1 e N2 são públicos e conteúdos diferentes, não
            dificuldade crescente do mesmo assunto. */}
        <div
          role="radiogroup"
          aria-label="Nível de suporte"
          className="mt-4 inline-flex items-center gap-0.5 rounded-md border border-line bg-sunken p-0.5"
        >
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={level === n}
              onClick={() => pickLevel(n)}
              className={cn(
                "rounded px-3 py-1 font-mono text-xs transition-colors duration-[var(--dur-fast)]",
                level === n
                  ? "bg-surface text-accent shadow-[var(--shadow-panel)]"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              N{n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">{LEVEL_NOTE[level]}</p>

        <div className="mt-4">
          {progress && (
            <Meter
              value={overall.done}
              max={overall.total}
              label="Progresso geral"
            />
          )}
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="font-mono text-xs text-ink-soft">
              {progress ? `${overall.done}/${overall.total} concluídos` : ""}
            </p>
            <ThemeToggle />
          </div>
        </div>

        <ul className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {levelLessons.map((l, i) => {
            const s = trackStats(l.id);
            const isActive = l.id === active.id;
            return (
              <li key={l.id} className="shrink-0 lg:shrink">
                <button
                  onClick={() => setActiveId(l.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "w-full rounded-md border px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)]",
                    isActive
                      ? "border-accent-line bg-accent-soft"
                      : "border-transparent hover:bg-sunken",
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "font-mono text-2xs",
                        isActive ? "text-accent" : "text-ink-soft",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm leading-snug",
                        isActive ? "font-medium text-ink" : "text-ink-soft",
                      )}
                    >
                      {l.title}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 pl-5">
                    <span className="h-0.5 w-10 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${(s.done / s.total) * 100}%` }}
                      />
                    </span>
                    <span className="font-mono text-2xs text-ink-soft">
                      {s.done}/{s.total}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ------------------------------------------- fora das trilhas ---
            Duas coisas que não pertencem a nenhuma trilha: o terminal solto e
            a fila de revisão, que junta erro de todas elas. */}
        <div className="mt-6 border-t border-line pt-5">
          <p className="field-label">Fora das trilhas</p>
          <ul className="mt-2">
            <li>
              <Link
                href="/terminal"
                className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-soft transition-colors duration-[var(--dur-fast)] hover:bg-sunken hover:text-ink"
              >
                <Terminal
                  className="size-3.5 shrink-0 transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
                Terminal livre
              </Link>
            </li>
            <li>
              <Link
                href="/revisao"
                className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-soft transition-colors duration-[var(--dur-fast)] hover:bg-sunken hover:text-ink"
              >
                <Repeat
                  className="size-3.5 shrink-0 transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
                Revisão
                {wrongCount > 0 && (
                  <span className="ml-auto font-mono text-2xs text-warn-ink">
                    {wrongCount}
                    <span className="sr-only"> questões na fila</span>
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </div>

        {progress && (progress.attempts.length > 0 || progress.readLessons.length > 0) && (
          <div className="mt-8 hidden border-t border-line pt-5 lg:block">
            <p className="text-xs text-ink-soft">
              Progresso só neste navegador. Sem servidor, sem login.
            </p>
            <Button
              tone="ghost"
              className="mt-2 -ml-2 text-xs"
              onClick={() => {
                resetAll();
                setProgress(getProgress());
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Apagar progresso
            </Button>
          </div>
        )}
      </nav>

      {/* ========================================================= conteúdo */}
      <div className="min-w-0 flex-1">
        <header className="border-b border-line pb-6">
          <Chip tone="neutral">{AREA_LABEL[active.area]}</Chip>
          <h1 className="mt-3 text-3xl font-semibold">{active.title}</h1>
          <p className="mt-3 max-w-[62ch] text-ink-soft">{active.summary}</p>
        </header>

        <ol className="mt-8">
          {/* --------------------------------------------------- 1. aula */}
          <Step
            n={1}
            title="Ler a aula"
            aside={
              lessonRead ? (
                <Chip tone="ok">
                  <Check className="size-3" aria-hidden="true" />
                  lida
                </Chip>
              ) : (
                <Chip tone="neutral">{active.minutes} min</Chip>
              )
            }
            last={false}
          >
            <Row
              standalone
              href={`/aula/${active.id}`}
              icon={<BookOpen className="size-4" aria-hidden="true" />}
              title={active.title}
              sub="Conceito, vocabulário e o sintoma que cada um produz na tela"
            />
          </Step>

          {/* ----------------------------------------------- 2. praticar */}
          {(labs.length > 0 || tickets.length > 0) && (
            <Step
              n={2}
              title={
                labs.length > 0
                  ? "Praticar no terminal"
                  : "Praticar a triagem do chamado"
              }
              aside={
                <Chip tone="neutral">
                  {labs.length + tickets.length} exercícios
                </Chip>
              }
              last={false}
            >
              <Panel className="overflow-hidden">
                <ul>
                  {labs.map((s) => {
                    const b = best(`lab:${s.id}`);
                    return (
                      <li key={s.id} className="border-b border-line last:border-0">
                        <Row
                          href={`/lab/${s.id}`}
                          icon={<Terminal className="size-4" aria-hidden="true" />}
                          title={s.title}
                          sub={s.briefing}
                          meta={`${s.expectedCommands.length} cmd`}
                          chip={
                            b ? (
                              b.score ? (
                                <Chip tone="ok">
                                  <Check className="size-3" aria-hidden="true" />
                                  resolvido
                                </Chip>
                              ) : (
                                <Chip tone="warn">reaberto</Chip>
                              )
                            ) : null
                          }
                        />
                      </li>
                    );
                  })}
                  {tickets.map((t) => {
                    const b = best(`chamado:${t.id}`);
                    return (
                      <li key={t.id} className="border-b border-line last:border-0">
                        <Row
                          href={`/chamado/${t.id}`}
                          icon={<TicketIcon className="size-4" aria-hidden="true" />}
                          title={t.title}
                          sub={t.body}
                          meta={t.sector}
                          chip={
                            b ? (
                              b.score === b.total ? (
                                <Chip tone="ok">
                                  <Check className="size-3" aria-hidden="true" />
                                  {b.score}/{b.total}
                                </Chip>
                              ) : (
                                <Chip tone="warn">
                                  {b.score}/{b.total}
                                </Chip>
                              )
                            ) : null
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </Step>
          )}

          {/* ------------------------------------------------- 3. testar */}
          {quiz && (
            <Step
              n={3}
              title="Conferir o que ficou"
              aside={(() => {
                const b = best(`quiz:${quiz.id}`);
                if (!b) return <Chip tone="neutral">{quiz.questions.length} questões</Chip>;
                const ok = b.score === b.total;
                return (
                  <Chip tone={ok ? "ok" : "warn"}>
                    {ok && <Check className="size-3" aria-hidden="true" />}
                    {b.score}/{b.total}
                  </Chip>
                );
              })()}
              last
            >
              <Row
                standalone
                href={`/quiz/${quiz.id}`}
                icon={<ListChecks className="size-4" aria-hidden="true" />}
                title={quiz.title}
                sub={
                  lessonRead
                    ? "Alternativa errada também tem explicação"
                    : "Você ainda não leu a aula — dá para vir direto, mas aí é prova, não estudo"
                }
                subTone={lessonRead ? "soft" : "warn"}
              />
            </Step>
          )}
        </ol>
      </div>
    </div>
  );
}

/* =============================================================== etapa === */

function Step({
  n,
  title,
  aside,
  last,
  children,
}: {
  n: number;
  title: string;
  aside?: React.ReactNode;
  last: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-10 pb-8 last:pb-0">
      {/* fio que liga as etapas: a sequência é real, então merece o traço */}
      {!last && (
        <span
          aria-hidden="true"
          className="absolute top-8 left-[13px] h-[calc(100%-2rem)] w-px bg-line"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 grid size-[27px] place-items-center rounded-full border border-line-2 bg-surface font-mono text-xs text-ink-soft"
      >
        {n}
      </span>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </li>
  );
}

/* ============================================================== linha === */

/**
 * Só o link. Quem chama decide se envolve em `<li>` — antes isto renderizava
 * um `<li>` sempre, o que aninhava lista dentro da etapa e quebrava a
 * hidratação.
 */
function Row({
  href,
  icon,
  title,
  sub,
  meta,
  chip,
  standalone,
  subTone = "soft",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  meta?: string;
  chip?: React.ReactNode;
  standalone?: boolean;
  subTone?: "soft" | "warn";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 px-4 py-3.5 transition-colors duration-[var(--dur-fast)] hover:bg-sunken",
        standalone &&
          "rounded-lg border border-line bg-surface shadow-[var(--shadow-panel)]",
      )}
    >
      <span className="mt-0.5 text-ink-soft transition-colors group-hover:text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium group-hover:text-accent">{title}</span>
          {chip}
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-sm",
            subTone === "warn" ? "text-warn-ink" : "text-ink-soft",
          )}
        >
          {sub}
        </span>
      </span>
      {meta && (
        <span className="mt-0.5 hidden shrink-0 font-mono text-2xs text-ink-soft sm:block">
          {meta}
        </span>
      )}
      <ChevronRight
        className="mt-0.5 size-4 shrink-0 text-line-2 transition-[color,transform] duration-[var(--dur-fast)] ease-out-quart group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden="true"
      />
    </Link>
  );
}
