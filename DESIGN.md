# Sistema visual — Treino de suporte N1

Verdade de produto em `PRODUCT.md`. Tokens em `src/app/globals.css`, primitivas em
`src/components/ui.tsx`.

Duas superfícies, dois registros:

| Rota | Superfície | Registro |
|---|---|---|
| `/` | Capa | **marca** — o design é a coisa que persuade |
| `/treino` e internas | App | **produto** — o design serve a tarefa |

O mundo visual é um só. A capa não introduz paleta, tipo ou material novo; ela usa o
mesmo vocabulário em composição diferente.

## A decisão central

A cena que decidiu o tema: 21h, em casa, desktop com o browser em metade da tela. A pessoa
lê 14 minutos de texto sobre DHCP e depois digita comandos num console. Isso força duas
coisas: prosa confortável de ler por muito tempo, e o console tendo que parecer o
**objeto de estudo**, não parte da decoração.

Daí a assinatura:

> A interface é **clara e institucional** — parecida com as ferramentas que ele vai usar
> no trabalho (GLPI, console do AD, Event Viewer) — e o terminal é o **único objeto
> escuro** da tela. O contraste entre os dois é a identidade do produto.

Consequência prática: nada mais no site é escuro. Bloco de comando dentro de uma aula
usa a mesma superfície de console, porque é o mesmo tipo de coisa. Se algo escuro
aparecer que não seja terminal, o sistema está sendo violado.

## Cor

OKLCH em tudo. Estratégia **restrained**: neutros levemente tingidos para o azul da marca
mais um acento, que aparece em ação primária, seleção corrente e estado — nunca como
decoração.

| Papel | Token | Uso |
|---|---|---|
| Canvas | `bg` | fundo da página · branco frio, chroma 0.004 para o azul |
| Painel | `surface` | conteúdo |
| Rebaixado | `sunken` | cabeçalho de painel, badge, campo de contexto |
| Console | `console`, `console-2`, `console-line`, `console-ink`, `console-dim`, `console-accent` | terminal e bloco de comando |
| Linha | `line`, `line-2` | divisória e borda de controle |
| Texto | `ink`, `ink-soft` | **dois tons, os dois passam 4.5:1** |
| Acento | `accent`, `accent-hi`, `accent-soft`, `accent-line` | ação primária, seleção, foco |
| Estado | `ok` / `warn` / `bad`, cada um com `-soft` (fundo), `-line` (borda), `-ink` (texto) | resultado, alerta, erro |

**A regra que mais importa aqui:** cada estado tem um token `-ink` próprio porque âmbar e
verde na luminosidade do ícone não passam contraste como texto. Texto de alerta usa
`warn-ink` sobre `warn-soft`, nunca `warn`.

**Nunca aplicar opacidade em texto pequeno.** Foi o que derrubou o contraste na primeira
passada (`text-ink-soft/70` = 3.57:1). Estado se comunica por peso, por ícone ou por
fundo — não por desbotamento.

Não existe creme, areia, bege ou papel. O canvas é branco frio com chroma na direção do
próprio azul da marca.

### Tema escuro

Claro é o tema onde a assinatura funciona melhor, mas o uso real é de madrugada, então o
escuro existe. Escolha em três estados — claro / sistema / escuro — persistida em
`localStorage` e aplicada por `data-theme` no `<html>`. Um script inline no `<head>`
(`layout.tsx`) pinta antes do primeiro frame; sem ele a página abre clara e pisca.

No escuro a assinatura muda de natureza: o console deixa de ser o **único** objeto escuro
e passa a ser o **mais fundo**. A hierarquia vira profundidade —
console `0.155` < rail `0.225` < bg `0.235` < sunken `0.245` < surface `0.275` — e o
console ganha **borda própria** (`console-line`), porque no escuro a sombra não aparece e
sem contorno ele se dissolve no fundo. Isso enfraquece um pouco a identidade; é o preço
consciente de poder estudar à noite.

Só os tokens de cor e as duas sombras trocam entre temas. Nenhum componente tem lógica de
tema, e nenhuma cor está escrita direto no JSX — por isso a troca é uma linha de CSS.

## Tipografia

Superfamília **IBM Plex**, par no eixo sans/mono:

- `font-sans` — IBM Plex Sans: prosa, títulos, rótulos, botões.
- `font-mono` — IBM Plex Mono: console, etiqueta de campo, comando, dado, contador.

O Plex carrega voz de ferramenta corporativa de TI, que é o mundo do assunto. Mono não é
enfeite: só aparece onde o conteúdo é literalmente máquina (comando, IP, contagem,
etiqueta de formulário).

Escala **fixa em rem**, razão ~1.2, de `text-2xs` (11px) a `text-3xl` (30px). Sem `clamp`
fluido — registro de produto, DPI constante, e título fluido encolhendo dentro de uma
coluna fica pior, não melhor.

Medida de leitura: a **coluna** é a medida (~74ch em `lg`), não o parágrafo. Tabela e
bloco de console sangram para a margem direita (`.bleed-right`), então a prosa fica
estreita para ler e o dado fica largo para consultar.

## Layout

- Painel: **um** tipo de superfície (`Panel` + `PanelHeader`), em vez de cada seção
  inventar sua caixa.
- Lista antes de grade de cards. Sete laboratórios são sete linhas de uma lista com
  status à direita, não sete cartões iguais.
- Trilha lateral fixa no desktop, tabs com rolagem horizontal no mobile.
- **Seletor de nível (N1 / N2)** no topo do trilho, com uma linha explicando o que muda.
  É um `radiogroup`, não abas de dificuldade: N1 e N2 são conteúdos diferentes, e a frase
  ao lado diz isso ("atendimento ao usuário" vs "o que chega escalado"). Trocar de nível
  cai na primeira trilha dele, e o medidor de progresso passa a ser **do nível corrente** —
  progresso somado entre níveis não significaria nada.
- Etapas numeradas com fio de ligação: a numeração é permitida porque a sequência é real
  (aula → laboratório → questionário) e a ordem carrega informação.
- Escala semântica de z-index: `--z-rail` → `--z-sticky` → `--z-overlay` → `--z-toast`.

## Movimento

`--dur-fast` 130ms para estado de controle, `--dur` 200ms para revelação,
`--dur-slow` 320ms para a marca de conferido. Curvas `ease-out-quart` e `ease-out-expo`.

Três momentos, todos comunicando estado:

1. `draw-check` — o visto é **desenhado** por `clip-path` quando uma evidência é
   satisfeita. É o feedback do laboratório.
2. `reveal-answer` — explicação aparece com deslocamento mínimo ao responder.
3. Barra de progresso de leitura na aula, ligada ao scroll.

Sem sequência de entrada por seção, sem fade-rise no scroll. `prefers-reduced-motion`
zera as animações **mantendo o conteúdo visível** — nada de revelação que trave em
navegador headless.

## Componentes

`src/components/ui.tsx`: `Button` / `ButtonLink` (4 tons, todos os estados incluindo
disabled), `Chip` (5 tons, vocabulário de status de chamado), `Panel`, `PanelHeader`,
`Meter`. Um vocabulário só — se o botão de ação tiver duas aparências, uma está errada.

`PageNav` é a barra das páginas internas: link de volta para `/treino` à esquerda,
conteúdo opcional e controle de tema à direita. Existe para navegação e tema estarem
sempre no mesmo lugar, em vez de cada tela inventar o seu.

`ThemeToggle` aceita `tone="surface" | "console"`, porque o controle aparece nos dois
materiais e cada um exige sua própria faixa de contraste.

Caminho de volta: internas → `/treino` (via `PageNav`) → `/` (o título do trilho lateral é
o link para a capa).

## Publicação

Repositório: https://github.com/cauaprjct/helpdesk-sim · projeto Vercel `helpdesk-sim`,
domínio `helpdesk-sim-seven.vercel.app` — o mesmo citado no README e na capa. Trocar de
domínio exige atualizar os dois.

Commits assinam como `134816351+cauaprjct@users.noreply.github.com` nos dois caminhos
(git local e API do GitHub), para não publicar e-mail real no histórico e manter uma
identidade só. O `.gitattributes` fixa LF, porque sem isso editar em Windows marca o
arquivo inteiro como alterado e esconde a mudança real no diff.

## A capa (`/`)

Forma: **o limiar de logon de uma estação em domínio.** Entrar no treino é o mesmo gesto
de logar na máquina de manhã — que é onde o trabalho de N1 começa e de onde sai o chamado
mais comum de todos ("não consigo entrar no computador"). Recusa o hero centrado com
grade de cards de recurso.

- O **chão é console**: campo escuro em tela cheia com a transcrição do cenário
  `dhcp-caiu`, reproduzida do motor real e condensada para caber. Isso não fura a regra do
  material escuro — é console, o material escuro autorizado, promovido a página inteira.
- Sobre ele, à esquerda, o **bloco de identidade**: título, uma linha de oferta, ação
  primária `Entrar no treino`, secundária para o portfólio, e a assinatura no pé do bloco.
  Opaco, nunca vidro.
- **Véu de legibilidade em duas camadas** em vez de opacidade no texto: atenuação uniforme
  (`bg-console/45`) mais fechamento nos 45% de baixo, onde o bloco se apoia.
- Dentro do campo de console o **anel de foco troca para `console-accent`** — o acento
  normal é escuro demais ali (2.6:1) e o anel desaparecia.
- O `ThemeToggle` tem `tone="console"`. Classe no wrapper não alcançava os botões internos
  e os ícones ficavam em 2:1: **tom de superfície é responsabilidade do componente**, não
  de quem chama.
- **Sem retrato.** O lugar da foto é o bloco de assinatura; até ela existir não há avatar
  nem placeholder. Quando houver, entra ali à esquerda do nome.
- Movimento: a transcrição chega linha por linha (`console-line-in`, CSS puro com delay
  escalonado, `aria-hidden`, terminando em opacidade 1) e o caret pisca. Nenhum conteúdo
  real depende de animação para existir.

Números na capa são conferidos contra o código e o CSV, nunca estimados. N2 e N3 aparecem
com pastilha `planejado` e a frase explícita de que só o N1 existe.

## Proibido neste projeto

- Grade de cards idênticos.
- *Eyebrow* minúsculo em maiúsculas acima de cada seção. Existe **um** rótulo de marca no
  trilho lateral; isso é voz, repetir por seção é gramática de IA.
- Borda lateral colorida como acento.
- Texto com gradiente, glassmorphism decorativo.
- Fonte de display em rótulo, botão ou dado.
- Opacidade em texto pequeno.
- Superfície escura que não seja console.

## Verificado

- Contraste medido no browser resolvendo `oklch` via canvas, em `/`, `/aula`, `/lab`,
  `/quiz` e `/chamado`, inclusive nos estados revelados.
  - **Claro:** prosa 6.9:1 · definição 7.5:1 · tabela 7.5:1 · console 14.6:1 ·
    título 15.4:1. Nenhuma falha.
  - **Escuro:** varredura de todo elemento com texto próprio nas cinco rotas, nos estados
    revelados. Nenhuma falha.
- Sem estouro horizontal em 390px em todas as rotas, capa incluída.
- Sem erro de hidratação no console do navegador.
- Troca de tema persiste e sobrevive ao recarregamento, sem piscar.
- **Capa, após revisão de acabamento** — quatro bloqueantes achados e corrigidos, todos
  remedidos no navegador (claro / escuro):
  - ícones do seletor de tema sobre o console: 2.03:1 → **5.31 / 6.26**
  - anel de foco dentro do console: 2.60:1 → **7.33 / 7.98**
  - transcrição, que tinha `text-console-ink/85`: 4.09:1 → **14.62 / 15.93**
  - ressalva em mono 11px → sans 13px; opacidade em texto pequeno: **nenhuma ocorrência**
  - alvos de toque: nenhum abaixo de 24px além do link de pular conteúdo, que cresce ao
    receber foco
- Detector mecânico do skill sobre os arquivos alterados: **zero achados**.
- Contagens da capa conferidas no código: 3 aulas, 7 laboratórios, 3 chamados, 20
  questões. O número de vagas foi corrigido de 26 para **30**, que é o que
  `../mapeamento-empresas-ti/index.csv` tem com `vaga_ativa=sim`.
