# Sistema visual — Treino de suporte técnico

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
- **Nada de rótulo acima de título.** Na página de aula o metadado (nível, área, tempo de
  leitura) fica **abaixo** do `h1`, como assinatura. Antes havia uma pastilha "Aula" em
  cima, que é a forma clássica de eyebrow e é proibida sem exceção.
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

### Onde `.field-label` pode aparecer

`.field-label` é mono, 11px e caixa alta. Ele existe para o vocabulário de **ordem de
serviço**: nomear um campo discreto de dado. Nada além disso.

| Permitido | Proibido |
|---|---|
| `Quem`, `Setor`, `Relato`, `Chamado #id` | Cabeçalho de tabela de aula |
| `Evidência`, `Resultado`, `Triagem concluída` | Título de índice ou de seção |
| Cabeçalho de painel de dado | Frase de instrução em prosa |

Fora dessa lista é **mono como fantasia técnica**, e o custo é real: 11px em caixa alta lê
pior que 12px em sans. Rótulo de prosa usa `text-xs font-semibold text-ink-soft`.

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
  primária `Entrar no treino`, secundária `Abrir o terminal`, e a assinatura no pé do bloco.
  Opaco, nunca vidro.
- **A segunda ação é o terminal, não o portfólio.** Entrar no treino é um compromisso; quem
  chega só para ver o que é isto precisa de uma porta sem compromisso nenhum, e o terminal é
  o que convence em dez segundos quem entende de TI. O portfólio desceu para o bloco de
  assinatura, ao lado de GitHub e LinkedIn — que é onde "quem fez" já mora — e segue no
  rodapé. Três botões na mesma fileira achatavam a hierarquia.
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

Números na capa são conferidos contra o código e o CSV, nunca estimados. N1 e N2 aparecem
como disponíveis, com link para o treino; **só o N3** leva pastilha `planejado`, e o texto
diz explicitamente que ele ainda não existe.

## O terminal livre (`/terminal`)

Mesma peça, moldura oposta à do laboratório. O laboratório **esconde** o estado da máquina,
porque descobri-lo pela resposta dos comandos é o exercício. Aqui o estado fica **à vista**,
ao lado do console, porque o que se demonstra é o mecanismo: comando lê estado, alguns
comandos escrevem nele, e a saída muda por causa disso — não por roteiro.

- O painel de estado separa **"a estação"** (o que os comandos leem) de **"a rede"** (o que
  ela não vê e só infere). Essa divisão é o desenho do motor exposto de propósito.
- Campo cujo valor saiu do estado carregado ganha **acento e um ponto**. É a prova visível
  de que o console escreveu no estado, e não só imprimiu texto.
- A elevação é **interruptor**, não propriedade do cenário: rodar `net start spooler` nos
  dois modos e comparar é a lição, e ela só existe se der para alternar.
- Texto acima do console fica no mínimo — um parágrafo. A ressalva de que nada executa de
  verdade desceu para debaixo do console, onde é relevante e não atrasa a chegada.
- **Sem separador entre grupos de máquina.** As pastilhas quebram de linha, e o traço
  acabava caindo no meio de um grupo, sinalizando errado. A categoria da máquina escolhida
  aparece como pastilha ao lado da descrição.

O console em si virou componente único (`Console.tsx`), consumido pelo laboratório e pelo
terminal livre. Duplicado, histórico, rolagem e acessibilidade seriam corrigidos em um lado
e esquecidos no outro. Ele guarda o log e o histórico; o estado da máquina é do pai, porque
é o pai que reage a ele. Para zerar, o pai troca a `key`.

## Ordem das alternativas

A alternativa correta foi escrita **primeiro em 100% dos exercícios** — 64 questões, 12
diagnósticos e 8 escolhas de chamado. É vício de autoria: escreve-se a resposta certa e
depois inventam-se os distratores. O efeito é que dava para gabaritar o produto inteiro
clicando sempre na primeira opção, sem ler nada.

A ordem passou a ser embaralhada em `src/lib/shuffle.ts`, e **determinística pelo id**: as
páginas são pré-renderizadas, então sorteio em tempo de render daria um HTML no servidor e
outro no cliente. Refazer o exercício incrementa a rodada e muda a ordem, o que também evita
decorar posição.

As **letras na tela seguem a posição** (A, B, C, D de cima para baixo), não o id da
alternativa — depois de embaralhar os dois não coincidem, e mostrar "C, A, D, B" pareceria
defeito. O atalho de teclado passou a mapear posição, não id.

Detalhe que só apareceu medindo: a primeira versão usava `% (i + 1)` sobre os bits baixos do
gerador congruente, e a primeira posição ficou com **42%** das respostas certas em vez de
25%. Bits baixos de LCG são periódicos. Escalar pelo intervalo inteiro usa os bits altos, e
a distribuição fechou em 25/14/19/25.

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
- Contagens da capa conferidas no código: **10 aulas, 13 laboratórios, 5 triagens de chamado
  e 72 questões** (N1 com 6/9/5/48, N2 com 4/4/0/24). O número de vagas mapeadas é **30**,
  o que o CSV de origem tem com `vaga_ativa=sim`.
- **Trilha de hardware, verificada na interface:** o painel do N1 passou a listar seis
  trilhas; a aula renderiza nove seções, três tabelas e o bloco de bancada; o laboratório
  `placa-rede-queimada` fecha a evidência em 2/2 com `ipconfig /all` e `getmac`, e o `getmac`
  lista o endereço físico informando mídia desconectada — que é a evidência que descarta
  "placa desabilitada". A triagem de bancada roda ponta a ponta em 5/5, com ordenação de seis
  itens. Zero erro de console.
- **Suíte automatizada: 172 testes** (`npm test`), em três arquivos — motor do terminal,
  coerência do conteúdo, embaralhamento. Cobre a fidelidade das mensagens do Windows, a
  causalidade entre estado e saída, referências de aula para quiz e laboratório, e as
  contagens da capa contra o conteúdo real.
- **Terminal livre, medido no navegador:** carregar "Cache de DNS velho", rodar
  `ping intranet.lab.local` → vai para 10.10.10.60; `nslookup` → devolve 10.10.10.10, o
  certo; `ipconfig /flushdns` → o campo `cache de DNS sujo` muda de `sim (10.10.10.60)` para
  `não` **e acende destacado**. Elevação: `net start spooler` como usuário comum dá
  `Erro do sistema 5 / Acesso negado`; alternando para administrador o serviço sobe, os
  campos `serviços parados`, `fila de impressão` e `prompt elevado` mudam juntos.
- **Ordem das alternativas, medida na interface:** clicar sempre na primeira alternativa no
  quiz `redes-n1` acertou **3 de 10 (30%)**, contra 100% antes. Letras exibidas seguem
  A B C D. Zero erro de console, sem divergência de hidratação.

> Contagem em documentação envelhece calada. Ao adicionar aula, laboratório ou questão,
> atualize `src/content/cover.ts`, o `PRODUCT.md` e este arquivo no mesmo commit — os três
> já mentiram uma vez por terem ficado para trás. As contagens da capa agora têm teste, mas
> a prosa destes dois arquivos não tem.
