"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clock,
  Key,
  ListChecks,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { AREA_LABEL, type Lesson, type LessonBlock } from "@/content/types";
import { getQuiz } from "@/content/quizzes";
import { getScenario } from "@/content/scenarios";
import { isLessonRead, markLessonRead } from "@/lib/progress";
import PageNav from "./PageNav";
import RichText from "./RichText";
import { Button, ButtonLink } from "./ui";
import { cn } from "@/lib/cn";

/** `1. O mapa físico` -> `mapa-fisico` */
function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Termos consecutivos viram uma única lista de definição, em vez de virar
 * uma pilha de cartões idênticos.
 */
type Group =
  | { kind: "terms"; items: Extract<LessonBlock, { kind: "term" }>[] }
  | { kind: "block"; block: LessonBlock };

function group(blocks: LessonBlock[]): Group[] {
  const out: Group[] = [];
  for (const block of blocks) {
    if (block.kind === "term") {
      const last = out[out.length - 1];
      if (last?.kind === "terms") last.items.push(block);
      else out.push({ kind: "terms", items: [block] });
    } else {
      out.push({ kind: "block", block });
    }
  }
  return out;
}

export default function LessonView({ lesson }: { lesson: Lesson }) {
  const [read, setRead] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(
    () =>
      lesson.blocks
        .filter((b): b is Extract<LessonBlock, { kind: "h" }> => b.kind === "h")
        .map((b) => ({ id: slug(b.text), text: b.text })),
    [lesson.blocks],
  );

  const groups = useMemo(() => group(lesson.blocks), [lesson.blocks]);

  useEffect(() => {
    setRead(isLessonRead(lesson.id));
  }, [lesson.id]);

  /* progresso de leitura + seção corrente */
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const start = el.offsetTop;
      const height = el.offsetHeight - window.innerHeight;
      const pos = window.scrollY - start;
      setScrolled(height > 0 ? Math.min(1, Math.max(0, pos / height)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-72px 0px -70% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const quiz = lesson.nextQuizId ? getQuiz(lesson.nextQuizId) : undefined;
  const labs = (lesson.nextLabIds ?? [])
    .map((id) => getScenario(id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <>
      {/* progresso de leitura — a única barra fixa da página */}
      <div
        className="fixed inset-x-0 top-0 z-[var(--z-sticky)] h-0.5 origin-left bg-accent transition-transform duration-75"
        style={{ transform: `scaleX(${scrolled})` }}
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-[62rem] gap-12 px-5 py-8 lg:py-12">
        {/* ================================================= índice lateral */}
        {sections.length > 0 && (
          <nav
            aria-label="Seções da aula"
            className="sticky top-12 hidden h-fit w-52 shrink-0 lg:block"
          >
            {/* Título do índice: prosa, não dado. Mono maiúsculo aqui era
                fantasia técnica em cima de uma palavra comum. */}
            <p className="text-xs font-semibold text-ink-soft">Nesta aula</p>
            <ul className="mt-2 space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      "block rounded py-1 text-sm transition-colors duration-[var(--dur-fast)]",
                      activeSection === s.id
                        ? "font-medium text-accent"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {s.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* ========================================================= artigo */}
        <article
          ref={articleRef}
          className="prose-lesson min-w-0 flex-1 lg:max-w-[38rem]"
        >
          <PageNav className="mb-6" />

          {/* O título vem primeiro. A pastilha "Aula" com o tempo de leitura
              ficava ACIMA dele, e rótulo em cima de título é proibido no
              sistema — virou assinatura logo abaixo, que é onde metadado de
              leitura pertence. */}
          <header className="border-b border-line pb-7">
            <h1 className="text-3xl font-semibold">{lesson.title}</h1>
            <p className="mt-3 text-lg text-ink-soft">{lesson.summary}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-ink-soft">
              <span>
                Nível {lesson.level} · {AREA_LABEL[lesson.area]}
              </span>
              <span aria-hidden="true" className="text-line-2">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden="true" />
                {lesson.minutes} min de leitura
              </span>
            </div>
          </header>

          <div className="mt-8 space-y-5">
            {groups.map((g, i) =>
              g.kind === "terms" ? (
                <TermList key={i} items={g.items} />
              ) : (
                <Block key={i} block={g.block} />
              ),
            )}
          </div>

          {/* -------------------------------------------- próximos passos */}
          <section className="mt-14 rounded-lg border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Depois de ler</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Aula, laboratório, questionário. Praticar antes de ser cobrado, e ser
              cobrado só no fim.
            </p>

            {labs.length > 0 && (
              <ul className="mt-5 divide-y divide-line overflow-hidden rounded-md border border-line">
                {labs.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/lab/${s.id}`}
                      className="group flex items-center gap-3 bg-surface px-4 py-2.5 transition-colors duration-[var(--dur-fast)] hover:bg-sunken"
                    >
                      <Terminal
                        className="size-4 shrink-0 text-ink-soft transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm group-hover:text-accent">
                        {s.title}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-line-2 transition-[color,transform] duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {quiz && (
                <ButtonLink href={`/quiz/${quiz.id}`}>
                  <ListChecks className="size-4" aria-hidden="true" />
                  Questionário · {quiz.questions.length} questões
                </ButtonLink>
              )}
              <Button
                tone={read ? "ghost" : "secondary"}
                disabled={read}
                onClick={() => {
                  markLessonRead(lesson.id);
                  setRead(true);
                }}
                className={read ? "text-ok-ink" : undefined}
              >
                <Check className={cn("size-4", read && "draw-check")} aria-hidden="true" />
                {read ? "Marcada como lida" : "Marcar como lida"}
              </Button>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}

/* ============================================================== termos === */

function TermList({
  items,
}: {
  items: Extract<LessonBlock, { kind: "term" }>[];
}) {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {items.map((t, i) => (
        <div key={i} className="px-5 py-4">
          <dt className="font-semibold">
            <RichText text={t.term} />
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
            <RichText text={t.def} />
          </dd>
          {t.note && (
            <dd className="mt-2.5 flex gap-2 rounded-md bg-accent-soft px-3 py-2 text-sm text-ink">
              <Key className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                <RichText text={t.note} />
              </span>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/* ============================================================== blocos === */

function Block({ block }: { block: LessonBlock }) {
  if (block.kind === "h") {
    return (
      <h2
        id={slug(block.text)}
        className="scroll-mt-20 pt-9 text-xl font-semibold first:pt-0"
      >
        {block.text}
      </h2>
    );
  }

  if (block.kind === "p") {
    return (
      <p className="leading-relaxed text-ink-soft">
        <RichText text={block.text} />
      </p>
    );
  }

  if (block.kind === "table") {
    return (
      <figure className="bleed-right">
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    /* Cabeçalho de tabela é prosa curta, não medida: sans, e
                       sem caixa alta, que a 11px atrapalhava a leitura. */
                    className="border-b border-line bg-sunken px-4 py-2.5 text-left text-xs font-semibold text-ink"
                  >
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-line last:border-0">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={cn(
                        "px-4 py-2.5 align-top",
                        c === 0 ? "text-ink" : "text-ink-soft",
                      )}
                    >
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-xs text-ink-soft">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (block.kind === "cmd") {
    return (
      <figure className="bleed-right">
        <div className="console overflow-hidden rounded-lg border border-console-line">
          {block.caption && (
            <figcaption className="border-b border-console-line px-4 py-2 text-2xs tracking-[0.04em] text-console-dim uppercase">
              {block.caption}
            </figcaption>
          )}
          <pre className="scrollbar-console overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed">
            {block.lines.join("\n")}
          </pre>
        </div>
      </figure>
    );
  }

  if (block.kind === "steps") {
    return (
      <ol className="space-y-2.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="mt-1 grid size-5 shrink-0 place-items-center rounded bg-sunken font-mono text-2xs text-ink-soft"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="leading-relaxed text-ink-soft">
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ol>
    );
  }

  // Termos normalmente são agrupados antes de chegar aqui; isolado, vira lista de um.
  if (block.kind === "term") return <TermList items={[block]} />;

  const isKey = block.tone === "key";
  return (
    <aside
      className={cn(
        "rounded-lg border p-4",
        isKey ? "border-accent-line bg-accent-soft" : "border-warn-line bg-warn-soft",
      )}
    >
      <p className="flex items-start gap-2.5 leading-relaxed">
        {isKey ? (
          <Key className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
        ) : (
          <TriangleAlert className="mt-1 size-4 shrink-0 text-warn-ink" aria-hidden="true" />
        )}
        <span className={cn(isKey ? "text-ink" : "text-warn-ink")}>
          <RichText text={block.text} />
        </span>
      </p>
    </aside>
  );
}
