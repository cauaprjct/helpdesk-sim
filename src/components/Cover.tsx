import Link from "next/link";
import { ArrowRight, ExternalLink, Github, Linkedin, SquareTerminal } from "lucide-react";
import {
  AUTHOR,
  isCmdLine,
  LINKS,
  N1_INVENTORY,
  PROMPT,
  ROADMAP,
  TRANSCRIPT,
} from "@/content/cover";
import ThemeToggle from "./ThemeToggle";
import { ButtonLink, Chip } from "./ui";
import { cn } from "@/lib/cn";

/**
 * Capa. A forma é o limiar de entrada de uma estação em domínio: um campo de
 * console ocupando a tela e, sobre ele, o bloco de identidade com uma ação
 * primária — o mesmo gesto de entrar no computador de manhã, que é onde o
 * trabalho de suporte N1 começa e de onde vem o chamado mais comum de todos.
 *
 * O retrato do Cauã ainda não existe. O lugar dele é o bloco de assinatura no
 * pé do limiar; até a foto existir, nada de avatar vazio ali.
 */
export default function Cover() {
  return (
    <>
      {/* ================================================ limiar de entrada */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        {/* O chão é console: é a única superfície escura que o sistema permite,
            e aqui ela carrega uma transcrição real em vez de textura. */}
        <div className="console absolute inset-0 -z-10" aria-hidden="true">
          <div className="h-full overflow-hidden px-5 py-4 text-[12px] leading-relaxed sm:px-8 sm:text-[13px]">
            {TRANSCRIPT.map((line, i) => (
              <pre
                key={i}
                /* Sem opacidade no texto: o véu já atenua, e `/85` derrubava a
                   transcrição para 4.09:1. */
                className={cn(
                  "console-line-in -mx-2 px-2 whitespace-pre",
                  isCmdLine(line)
                    ? "bg-console-ink/[0.055] text-console-ink"
                    : "text-console-ink",
                )}
                style={{ animationDelay: `${Math.min(i * 22, 900)}ms` }}
              >
                {line || " "}
              </pre>
            ))}
            <pre className="-mx-2 px-2 whitespace-pre text-console-accent">
              {PROMPT}
              <span className="caret text-console-ink">▌</span>
            </pre>
          </div>
          {/* Véu de legibilidade em duas camadas, sem função de cor exótica:
              atenuação uniforme + fechamento para baixo, onde o bloco claro se
              apoia e onde a transcrição não precisa mais ser lida. */}
          <div className="absolute inset-0 bg-console/45" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-console" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6">
          <header className="flex items-center justify-end">
            <ThemeToggle tone="console" />
          </header>

          <div className="flex flex-1 flex-col justify-center gap-6 py-10">
            <div className="w-full max-w-xl rounded-xl border border-line bg-surface p-7 shadow-[var(--shadow-lift)] sm:p-9">
              <h1 className="text-3xl font-semibold sm:text-[2.125rem]">
                Treino de suporte técnico
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Aulas, terminal simulado e triagem de chamado, do N1 ao N2 — o que
                uma vaga de técnico de informática cobra de verdade, e não o que
                uma ementa diz que ela cobra.
              </p>

              {/* Duas ações, e a segunda é o terminal: entrar no treino é um
                  compromisso, e quem chega só para ver o que é isto precisa de
                  uma porta sem compromisso nenhum. O portfólio desceu para o
                  bloco de assinatura, que é onde "quem fez" já mora. */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ButtonLink href="/treino">
                  Entrar no treino
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink tone="secondary" href="/terminal">
                  <SquareTerminal className="size-4" aria-hidden="true" />
                  Abrir o terminal
                </ButtonLink>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                O terminal abre direto, sem cadastro e sem aula antes.
              </p>

              {/* Assinatura. É aqui que o retrato entra quando existir. */}
              <div className="mt-8 border-t border-line pt-6">
                <p className="font-medium">{AUTHOR.name}</p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {AUTHOR.roles} · {AUTHOR.place}
                </p>
                {/* py-1.5 e gap-y-1 para o alvo de toque passar de 24px de
                    altura e os links não se encostarem quando a lista quebra. */}
                <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <li>
                    <a
                      href={LINKS.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 font-medium text-accent hover:underline"
                    >
                      Portfólio
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a
                      href={LINKS.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 text-ink-soft transition-colors hover:text-accent"
                    >
                      <Github className="size-4" aria-hidden="true" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href={LINKS.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 text-ink-soft transition-colors hover:text-accent"
                    >
                      <Linkedin className="size-4" aria-hidden="true" />
                      LinkedIn
                    </a>
                  </li>
                </ul>

                {/* A ressalva vive dentro do bloco. Solta no pé da tela ela
                    colidia com a transcrição, ilegível nos dois. */}
                <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                  Laboratório de treino, não ambiente de produção. Sem login e
                  sem servidor: o progresso fica no seu navegador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== o que é isto */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">
            Feito a partir de vagas reais, não de ementa
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            O conteúdo saiu dos requisitos que se repetem em{" "}
            <strong className="font-semibold text-ink">
              30 vagas de técnico de informática e suporte mapeadas no Rio de
              Janeiro
            </strong>{" "}
            — LinkedIn, Indeed, InfoJobs, Catho, Gupy e Vagas.com. O que aparecia
            em quase todas virou aula; o que aparecia como teste prático virou
            laboratório.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            O terminal não é maquete. Cada cenário carrega um estado de máquina, e
            os comandos alteram esse estado: com o DHCP fora,{" "}
            <code className="rounded border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.88em]">
              ipconfig /renew
            </code>{" "}
            falha e o endereço continua em 169.254; num cache de DNS velho,{" "}
            <code className="rounded border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.88em]">
              ipconfig /flushdns
            </code>{" "}
            conserta de verdade e a consulta seguinte passa a resolver.
          </p>
          <p className="mt-5">
            <Link
              href="/terminal"
              className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
            >
              Testar isso agora, num terminal solto
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </div>

        <ul className="mt-12 max-w-3xl divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {N1_INVENTORY.map((item) => (
            <li key={item.label} className="flex gap-5 px-5 py-4 sm:gap-7 sm:px-6">
              <span
                className="w-8 shrink-0 pt-0.5 text-right font-mono text-lg text-accent tabular-nums"
                aria-hidden="true"
              >
                {item.count}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">
                  <span className="sr-only">{item.count} </span>
                  {item.label}
                </span>
                <span className="mt-1 block max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ========================================================= roteiro */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:pb-24">
        <h2 className="text-2xl font-semibold">Os três níveis</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          Suporte técnico é organizado em níveis, e o treino segue a mesma divisão.
          N1 e N2 estão prontos. O N2 não é o N1 mais difícil: é outro trabalho —
          recebe o que foi escalado, mexe em servidor e responde por causa raiz. O
          N3 está no roteiro e fica marcado como tal até ser construído.
        </p>

        <ul className="mt-8 max-w-3xl divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {ROADMAP.map((step) => {
            const live = step.status === "disponível";
            return (
              <li
                key={step.level}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 sm:px-6"
              >
                <span className="w-8 shrink-0 font-mono text-lg text-ink">
                  {step.level}
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink-soft">
                  {step.what}
                </span>
                {live ? (
                  <Link
                    href="/treino"
                    className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-accent hover:underline"
                  >
                    abrir
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <Chip tone="neutral">{step.status}</Chip>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ======================================================= fechamento */}
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-5 py-10">
          <div>
            <p className="font-medium">{AUTHOR.name}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {AUTHOR.roles} · {AUTHOR.place}
            </p>
          </div>
          <ul className="flex flex-wrap items-center gap-x-6 text-sm">
            <li>
              <a
                href={LINKS.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 py-1.5 font-medium text-accent hover:underline"
              >
                Portfólio
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noreferrer"
                className="inline-block py-1.5 text-ink-soft transition-colors hover:text-accent"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-block py-1.5 text-ink-soft transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <Link
                href="/treino"
                className="inline-block py-1.5 text-ink-soft transition-colors hover:text-accent"
              >
                Treino
              </Link>
            </li>
            <li>
              <Link
                href="/terminal"
                className="inline-block py-1.5 text-ink-soft transition-colors hover:text-accent"
              >
                Terminal
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
