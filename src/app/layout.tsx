import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/**
 * Superfamília IBM Plex: sans para prosa e interface, mono para console,
 * etiquetas e dado. Par no eixo sans/mono, e o Plex carrega a voz de
 * ferramenta corporativa de TI — que é exatamente o mundo do assunto.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Treino de suporte técnico — N1 e N2",
  description:
    "Simulador de treino para técnico de informática e suporte N1/N2: aulas, terminal simulado e triagem de chamados.",
};

/**
 * Roda antes do primeiro frame para o tema já vir pintado. Sem isso a página
 * aparece clara e pisca para escuro. Mantém a mesma regra de `src/lib/theme.ts`.
 */
const THEME_BOOTSTRAP = `
try {
  var c = localStorage.getItem('helpdesk-sim:theme') || 'system';
  var dark = c === 'dark' || (c === 'system' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch (e) {
  document.documentElement.dataset.theme = 'light';
}
`.trim();

const DIRECTION_CONTRACT = `<!--
THESIS: a capa é o limiar de entrada de uma estação em domínio, não um hero de
produto: entrar no treino é o mesmo gesto de logar na máquina de manhã, que é
onde o trabalho de N1 começa. Recusa o hero centrado com grade de cards.
OWN-WORLD: mundo herdado do app — IBM Plex sans/mono, neutros frios em OKLCH, um
acento azul, e o console como única superfície escura, aqui promovido a chão de
página inteira carregando transcrição real.
STORY: o recrutador entende em segundos o que é e quem fez, e alcança o portfólio
num clique; quem estuda entra no treino pela ação primária.
FIRST VIEWPORT: campo de console em tela cheia com a transcrição do cenário de
DHCP fora; sobre ele, à esquerda, bloco claro opaco com o título, uma linha de
oferta, ação primária "Entrar no treino", secundária para o portfólio, e a
assinatura no pé do bloco.
FORM: limiar de logon de domínio — candidato 6 da lista ordenada; seed 08cb942f.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        {/* Comentário HTML de verdade: JSX comment não sobrevive ao build, e o
            contrato da direção precisa ser audível no output. */}
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-surface"
        >
          Pular para o conteúdo
        </a>
        <main id="conteudo">{children}</main>

        {/* Medição da Vercel. Web Analytics conta visita e página; Speed
            Insights mede Core Web Vitals de gente real, não de laboratório.
            Os dois são sem cookie e sem identificador de pessoa.

            Consequência que o produto teve que assumir: o site não pode mais
            dizer "nada sai da sua máquina". O que ele diz agora, e é verdade, é
            que RESPOSTA e PROGRESSO continuam só no navegador, e que o que sai
            é contagem de acesso. Métrica silenciosa contradizendo a copy seria
            o pior dos dois mundos. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
