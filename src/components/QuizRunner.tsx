"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, Key, RotateCcw, X } from "lucide-react";
import type { Quiz } from "@/content/types";
import { getLesson } from "@/content/lessons";
import { saveAttempt } from "@/lib/progress";
import { OPTION_LETTERS, shuffleFor } from "@/lib/shuffle";
import PageNav from "./PageNav";
import { Button, ButtonLink, Chip, Meter } from "./ui";
import { cn } from "@/lib/cn";

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  /** Refazer muda a ordem das alternativas, para não decorar posição. */
  const [round, setRound] = useState(0);

  const lesson = getLesson(quiz.id);
  const q = quiz.questions[index];
  const revealed = picked !== null;
  const total = quiz.questions.length;

  /**
   * A alternativa correta foi escrita primeiro em todas as questões. Sem
   * redistribuir, o questionário se resolve clicando sempre na primeira.
   * O embaralhamento é determinístico por id para não quebrar a hidratação da
   * página estática.
   */
  const shown = useMemo(() => shuffleFor(q.options, q.id, round), [q, round]);
  const correctCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const choose = useCallback(
    (optionId: string) => {
      if (picked !== null) return;
      const opt = q.options.find((o) => o.id === optionId);
      if (!opt) return;
      setPicked(optionId);
      setAnswers((prev) => ({ ...prev, [q.id]: !!opt.correct }));
    },
    [picked, q],
  );

  const next = useCallback(() => {
    if (picked === null) return;
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const wrongIds = quiz.questions.filter((qq) => !answers[qq.id]).map((qq) => qq.id);
    const rightIds = quiz.questions.filter((qq) => answers[qq.id]).map((qq) => qq.id);
    saveAttempt(
      { ref: `quiz:${quiz.id}`, kind: "quiz", score: correctCount, total },
      wrongIds,
      rightIds,
    );
    setFinished(true);
  }, [picked, index, total, quiz, answers, correctCount]);

  /* Atalhos de teclado: letra responde, Enter avança. */
  useEffect(() => {
    if (finished) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if (e.key === "Enter") {
        e.preventDefault();
        next();
        return;
      }
      // A letra digitada é a POSIÇÃO na tela, não o id da alternativa — depois
      // do embaralhamento os dois não coincidem mais.
      const pos = OPTION_LETTERS.indexOf(e.key.toLowerCase());
      if (pos >= 0 && pos < shown.length) {
        e.preventDefault();
        choose(shown[pos].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, shown, choose, next]);

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setFinished(false);
    setRound((n) => n + 1);
  }

  /* ------------------------------------------------------------ resultado */
  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const wrong = quiz.questions.filter((qq) => !answers[qq.id]);
    const tone = pct >= 80 ? "ok" : pct >= 50 ? "warn" : "bad";

    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <PageNav label={quiz.title} className="mb-7" />
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="field-label">Resultado</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-semibold">
              {correctCount}
              <span className="text-ink-soft">/{total}</span>
            </p>
            <Chip tone={tone}>{pct}%</Chip>
          </div>
          <Meter
            value={correctCount}
            max={total}
            label="Acertos"
            className="mt-4"
          />
          <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-ink-soft">
            {pct === 100
              ? "Gabaritou. Refaça em outro dia para confirmar que fixou, e não que memorizou a ordem."
              : pct >= 80
                ? "Bom nível. Reveja as erradas abaixo e repita o questionário amanhã."
                : "Vale reler a aula antes de repetir. Errar aqui é de graça; errar na entrevista não."}
          </p>
        </div>

        {wrong.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold">Para revisar</h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {wrong.map((qq) => {
                const right = qq.options.find((o) => o.correct);
                return (
                  <li key={qq.id} className="px-5 py-4">
                    <p className="font-medium">{qq.prompt}</p>
                    <p className="mt-2 flex items-start gap-2 text-sm text-ok-ink">
                      <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span>{right?.text}</span>
                    </p>
                    <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ink-soft">
                      {qq.takeaway}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button tone="secondary" onClick={restart}>
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
    );
  }

  /* --------------------------------------------------------------- questão */
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <PageNav label={quiz.title}>
        <span className="font-mono text-xs text-ink-soft">
          {index + 1}/{total}
        </span>
      </PageNav>

      <Meter
        value={index + 1}
        max={total}
        label="Progresso do questionário"
        className="mt-3"
      />

      <div className="mt-8">
        {q.context && (
          <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
            {q.context}
          </p>
        )}
        <h1 className="mt-4 max-w-[56ch] text-2xl font-semibold">{q.prompt}</h1>

        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {shown.map((o, i) => {
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
                  aria-pressed={isPicked}
                  className={cn(
                    "flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-colors duration-[var(--dur-fast)]",
                    !revealed && "hover:bg-sunken",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded font-mono text-xs",
                      showRight && "bg-ok text-surface",
                      showWrong && "bg-bad text-surface",
                      !showRight && !showWrong && "border border-line-2 text-ink-soft",
                    )}
                    aria-hidden="true"
                  >
                    {showRight ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : showWrong ? (
                      <X className="size-3.5" strokeWidth={3} />
                    ) : (
                      OPTION_LETTERS[i].toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block max-w-[60ch]">{o.text}</span>
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

        {revealed && (
          <p className="reveal-answer mt-5 flex items-start gap-2.5 rounded-lg border border-accent-line bg-accent-soft p-4 text-sm leading-relaxed">
            <Key className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="max-w-[62ch]">{q.takeaway}</span>
          </p>
        )}

        <div className="mt-8 flex items-center gap-4">
          <Button onClick={next} disabled={!revealed}>
            {index + 1 === total ? "Ver resultado" : "Próxima"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="font-mono text-2xs text-ink-soft">
            {revealed
              ? "enter avança"
              : `${[...OPTION_LETTERS.slice(0, shown.length)].join(" ")} responde`}
          </p>
        </div>
      </div>
    </div>
  );
}
