"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Quiz } from "@/content/types";
import { allQuestions } from "@/content/quizzes";
import { getWrongQuestions } from "@/lib/progress";
import PageNav from "./PageNav";
import QuizRunner from "./QuizRunner";
import { ButtonLink, Chip } from "./ui";

/**
 * Revisão do que você errou.
 *
 * A fila já era alimentada a cada questionário — só não existia tela para ela.
 * Aqui as questões erradas de qualquer trilha voltam misturadas, e sair da fila
 * exige acertar: é o `saveAttempt` que remove o id quando a resposta vem certa.
 *
 * Misturar as trilhas é de propósito. Responder dentro do questionário de DNS
 * já entrega que o assunto é DNS; fora de contexto é que se descobre se você
 * sabe ou se estava seguindo a deixa.
 */

/** Teto por rodada, para a sessão ter fim visível. */
const POR_RODADA = 12;

type Estado =
  | { fase: "carregando" }
  | { fase: "vazia" }
  | { fase: "pronta"; quiz: Quiz; naFila: number };

export default function Review() {
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  // localStorage só existe depois da montagem: a página é estática.
  useEffect(() => {
    const fila = new Set(getWrongQuestions());
    const pool = allQuestions().filter((q) => fila.has(q.id));

    if (pool.length === 0) {
      setEstado({ fase: "vazia" });
      return;
    }

    const sorteadas = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, POR_RODADA);

    setEstado({
      fase: "pronta",
      naFila: pool.length,
      quiz: {
        id: "revisao",
        title: "Revisão",
        // A área do conjunto não é usada na tela; cada questão carrega a sua.
        area: sorteadas[0].area,
        summary: "Questões que você errou, fora do contexto original.",
        questions: sorteadas,
      },
    });
  }, []);

  if (estado.fase === "carregando") {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <PageNav label="Treino" />
        <p className="mt-10 text-sm text-ink-soft">Lendo a fila…</p>
      </div>
    );
  }

  if (estado.fase === "vazia") {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <PageNav label="Treino" />
        <div className="mt-8 rounded-lg border border-line bg-surface p-6">
          <CheckCircle2 className="size-5 text-ok" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-semibold">Fila de revisão vazia</h1>
          <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
            Toda questão errada num questionário entra aqui e só sai quando você
            acerta. Como não há nada na fila, ou você ainda não respondeu nada
            neste navegador, ou acertou tudo.
          </p>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            A fila fica salva só nesta máquina, no navegador. O que você
            respondeu não é enviado para servidor nenhum.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/treino">Ir para o treino</ButtonLink>
            <ButtonLink tone="secondary" href="/terminal">
              Abrir o terminal livre
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {estado.naFila > estado.quiz.questions.length && (
        <div className="mx-auto w-full max-w-3xl px-5 pt-6">
          <Chip tone="warn">
            {estado.naFila} na fila — esta rodada traz {estado.quiz.questions.length}
          </Chip>
        </div>
      )}
      <QuizRunner quiz={estado.quiz} />
    </>
  );
}
