# Arquitetura

Como este projeto é construído, por que ele é construído assim, e como mexer nele sem
quebrar o que já está garantido.

Os outros dois documentos cobrem coisas diferentes: [`PRODUCT.md`](./PRODUCT.md) é a verdade
de produto (para quem, com que promessa, o que não pode ser inventado) e
[`DESIGN.md`](./DESIGN.md) é o sistema visual. Este arquivo é o código.

---

## Em cinco minutos

O site é estático. Não existe backend, banco de dados nem login: o Next gera HTML para todas
as rotas em tempo de build, e o único estado que persiste fica no `localStorage` do
visitante.

Três peças sustentam tudo:

| Peça | Onde | O que é |
|---|---|---|
| **Motor de terminal** | `src/lib/terminal-engine.ts` | Uma função pura que recebe um comando e um estado de máquina, e devolve a saída que o Windows daria — mais o estado seguinte |
| **Conteúdo como dado** | `src/content/*.ts` | Aulas, questões, cenários e chamados são objetos TypeScript tipados, não JSX |
| **Componentes burros** | `src/components/*.tsx` | Renderizam o conteúdo e guardam estado de interface. Não contêm conteúdo |

A consequência prática: adicionar uma aula é escrever um objeto. Adicionar um laboratório é
declarar um estado inicial de máquina. Nenhuma das duas coisas exige tocar em componente.

---

## O motor de terminal

É a peça que carrega a credibilidade do produto. Se a saída não é a que o Windows daria, o
treino ensina o técnico a reconhecer algo que não existe.

### A assinatura

```ts
runCommand(raw: string, state: MachineState): CommandResult

interface CommandResult {
  lines: string[];        // a saída, linha por linha
  next: MachineState;     // o estado depois do comando
  matched: string | null; // rótulo canônico, para o placar de evidência
  clear?: boolean;        // cls / clear
}
```

Três propriedades importam:

**É pura.** Não faz I/O, não lê relógio, não sorteia. O mesmo par (comando, estado) devolve
sempre a mesma coisa. Isso é o que a torna testável sem navegador — e é por isso que existem
96 testes só para ela.

**Não muta a entrada.** O estado recebido é copiado antes de qualquer escrita, inclusive as
coleções (`dns`, `liveHosts`, `mappedDrives`, `stoppedServices`). Os componentes guardam o
estado no React e dependem disso: mutação silenciosa faria o React não ver mudança e a tela
mentiria. Há teste travando essa invariante.

**Alguns comandos escrevem no estado.** `ipconfig /release` zera o endereço; `/renew` pede um
novo ao DHCP e falha se não houver servidor; `/flushdns` limpa o cache sujo; `net use` mapeia
unidade; `net start/stop` mexe em serviço; `gpupdate /force` aplica a política e mapeia a
unidade do setor; `w32tm /resync` acerta o relógio; `Reset-ComputerMachinePassword` conserta
o canal seguro com o domínio. É isso que separa simulador de captura de tela.

### `MachineState`

Definido em `src/content/types.ts`. Descreve uma estação: identidade (host, usuário, domínio,
OU, MAC), rede (link, IP, máscara, gateway, DNS, DHCP), o que está no ar (`liveHosts`,
`gatewayReachable`, `internetReachable`, `dnsWorking`), estação (unidades mapeadas, serviços
parados, fila de impressão, prompt elevado) e o que o nível 2 precisa (canal seguro,
desvio de relógio, escopo DHCP, ACL).

Duas modelagens não óbvias, e as duas existem porque a versão anterior se contradizia:

**Cache de DNS do cliente é separado do servidor.** Com `dnsCacheStale`, o `ping` por nome vai
para `dnsStaleIp` e o `nslookup` devolve o endereço **certo** — porque `nslookup` consulta o
servidor e não lê o cache da máquina. A divergência entre os dois É o diagnóstico. A versão
antiga fazia os dois concordarem, o que contradizia o próprio debrief do cenário.

**`liveHosts` decide quem responde na sub-rede.** Antes, qualquer endereço da faixa respondia
ao ping — inclusive um servidor que o cenário dizia estar fora do ar. E daí sai uma regra que
derrubou duas premissas erradas minhas quando os testes foram escritos: **o controlador de
domínio é alcançado sem o gateway**, porque está na mesma sub-rede. O gateway só entra para
sair dela. Quem derruba o acesso ao DC é o host sair de `liveHosts`, não o roteador cair.

### Fidelidade

Os rótulos e mensagens foram conferidos contra a saída real de um **Windows 10 pt-BR, build
19045**. Isso corrigiu invenções reais: "NetBIOS over Tcpip" no lugar de "NetBIOS em Tcpip",
"Não há entradas" no lugar de "Não existem entradas na lista", e timeout onde o Windows
devolve "Host de destino inacessível".

O detalhe mais revelador está no `ping` sem rota: quem responde é a **própria máquina**, então
a estatística mostra 4 recebidos e 0% de perda. Quem espera 100% de perda lê a saída errado.

> **Regra:** string nova no motor precisa do mesmo tratamento. Se você não tem a saída real
> daquele comando naquela situação, não escreva o comando — a alternativa honesta é não ter o
> comando.

### O limite, que é conteúdo e não lacuna

`ipconfig` devolve saída **idêntica** para cabo partido, porta de switch morta e placa de rede
com defeito. O motor não vai separar os três, e não deveria: quem separa é substituição
física. O laboratório `placa-rede-queimada` existe para ensinar exatamente isso, e por isso o
briefing dele chega com cabo e porta já testados.

---

## Quem é dono de qual estado

Decisão que evita a maior classe de bug nesta base:

**O `Console` guarda o log e o histórico. O estado da máquina é de quem o usa.**

`src/components/Console.tsx` é um componente só, consumido pelo laboratório
(`LabRunner`) e pelo terminal livre (`Sandbox`). Ele não é dono do `MachineState` porque
quem reage a ele é o pai: o laboratório precisa marcar evidência, o sandbox precisa desenhar
o painel de estado ao vivo.

Para zerar o console, o pai **troca a `key`** — o componente remonta e log, histórico e
posição no histórico vão junto. É mais simples e mais confiável que um método de limpeza.

Para o pai executar um comando (os atalhos do sandbox), há um `ref` imperativo
(`ConsoleHandle` com `run` e `focus`), usando `ref` como prop, que é o idioma do React 19. O
`useImperativeHandle` é declarado **sem lista de dependências** de propósito: um handle
memoizado executaria contra o estado da renderização anterior.

### Progresso

`src/lib/progress.ts`, em `localStorage`, chave `helpdesk-sim:v1`. Guarda tentativas, aulas
lidas e a fila de revisão. Sem servidor e sem login é decisão de produto, não limitação.

`saveAttempt` recebe **os erros e os acertos**. Isso não é redundante: sem os acertos nada sai
da fila de revisão, ela cresce para sempre, e a questão já dominada continua voltando — que é
exatamente o que desqualificaria um modo de revisão. Essa era um bug real: o código só
adicionava, apesar do comentário prometer que acerto removia.

---

## Ordem das alternativas

Ao escrever os exercícios, a resposta certa saiu **em primeiro lugar em todos** — 64 questões,
12 diagnósticos de laboratório e 8 escolhas de chamado na época em que foi descoberto. É vício
de autoria: escreve-se a resposta e depois inventam-se os distratores. O efeito era que dava
para gabaritar o produto inteiro clicando sempre na primeira opção, sem ler nada.

`src/lib/shuffle.ts` redistribui, e a ordem é **determinística por id**:

- As páginas são pré-renderizadas. Sorteio em tempo de render daria um HTML no servidor e
  outro no cliente, e a hidratação do React acusaria divergência.
- Refazer o exercício incrementa a rodada e muda a ordem — isso acontece depois da hidratação,
  então é seguro.

As **letras na tela seguem a posição** (A, B, C, D de cima para baixo), não o id da
alternativa: depois de embaralhar os dois não coincidem, e mostrar "C, A, D, B" pareceria
defeito. O atalho de teclado do questionário mapeia posição, não id.

Um detalhe que só apareceu medindo: a primeira versão usava `% (i + 1)` sobre os bits baixos
do gerador congruente, e a primeira posição ficou com **42%** das respostas certas em vez de
25%. Bits baixos de LCG são periódicos. Escalar pelo intervalo inteiro usa os bits altos, e a
distribuição fechou perto do esperado. Há teste medindo isso com 4000 amostras.

---

## Rotas

Todas estáticas. `/aula`, `/lab`, `/quiz` e `/chamado` usam `generateStaticParams` a partir do
conteúdo, então uma aula nova vira uma página nova sem tocar em roteamento.

| Rota | O que é |
|---|---|
| `/` | Capa. Ponto de entrada para quem não vem estudar |
| `/treino` | Painel: trilhas por nível, progresso, links fora das trilhas |
| `/aula/[lessonId]` | Aula |
| `/lab/[scenarioId]` | Laboratório: chamado, console, evidência, diagnóstico |
| `/quiz/[quizId]` | Questionário |
| `/chamado/[ticketId]` | Triagem de chamado |
| `/terminal` | Terminal livre, sem pré-requisito, com o estado da máquina à vista |
| `/revisao` | Fila de revisão: o que você errou, fora do contexto de origem |

---

## Testes

`npm test` — **172 testes** em três arquivos, sem DOM e sem navegador. Rodam em Node porque o
que eles testam é TypeScript puro.

| Arquivo | Testes | O que trava |
|---|---|---|
| `src/lib/terminal-engine.test.ts` | 112 | Fidelidade das mensagens, causalidade entre estado e saída, pureza da função, e o contrato com o conteúdo |
| `src/content/content.test.ts` | 45 | Coerência que o tipo não pega, referências entre exercícios, e as contagens da capa |
| `src/lib/shuffle.test.ts` | 15 | Determinismo e distribuição |

Três testes valem destaque porque pegam bug que ninguém veria lendo:

**Todo comando cobrado como evidência é produzível no cenário.** Cada laboratório declara
`expectedCommands`, e o placar de evidência compara com os rótulos que o motor devolve.
Renomear um rótulo no motor quebrava o placar de algum lab em silêncio — e o aluno é que ficava
achando que errou.

**As contagens da capa conferem com o conteúdo real.** `N1_INVENTORY` anuncia números na
primeira tela. Eles já ficaram atrás uma vez; num portfólio esse é o pior tipo de erro, porque
é conferível em dois cliques.

**A resposta modelo passa no próprio critério.** Os passos de anotação exigem que o aluno
mencione certos pontos. Se a resposta modelo não passasse nesse critério, o critério seria
inatingível e o aluno reprovaria por uma régua torta.

### O que os testes NÃO garantem

Sejamos explícitos, porque suíte verde dá falsa sensação de cobertura:

- **Nada de visual.** Contraste, layout, foco e responsividade foram medidos no navegador e
  estão registrados em `DESIGN.md`, mas não há teste automatizado disso.
- **Nada de interface.** Não há teste de componente nem end-to-end. Os fluxos foram
  verificados dirigindo o navegador, e o registro está em `DESIGN.md`.
- **A veracidade técnica do conteúdo.** Nenhum teste sabe se uma explicação está certa. Isso
  depende de revisão humana e de conferência contra a saída real do Windows.

---

## Como adicionar conteúdo

Conteúdo é dado. Em todos os casos os testes vão cobrar as invariantes — rode `npm test`
antes de considerar pronto.

### Uma aula

1. Escreva um `Lesson` em `src/content/lessons.ts` e inclua no array `LESSONS`.
2. `id` precisa ser slug (`[a-z0-9-]`): ele vai para a URL.
3. `level` tem que estar em `AVAILABLE_LEVELS`.
4. `blocks` aceita `h`, `p`, `term`, `table`, `cmd`, `steps`, `callout`. Em `p` e em vários
   outros, `**negrito**` e `` `código` `` são interpretados.
5. Linha de tabela tem que ter o mesmo número de células do cabeçalho.
6. `nextQuizId` e `nextLabIds` precisam apontar para coisas que existem — link morto aqui é
   404 para quem termina de ler.

### Um laboratório

1. Escreva um `Scenario` em `src/content/scenarios.ts` e inclua em `SCENARIOS`.
2. Use o helper `machine({ ... })` como base e quebre só o que o cenário quebra. Não monte um
   `MachineState` do zero: a base é compartilhada com o sandbox e com os testes justamente
   para os três não divergirem em silêncio.
3. O estado inicial tem que ser coerente consigo mesmo, e há teste conferindo: sem link não
   existe endereço obtido do DHCP; se o gateway responde, ele está em `liveHosts`; cache sujo
   exige `dnsStaleIp`; internet no ar exige gateway no ar.
4. `expectedCommands` usa os rótulos canônicos que o motor devolve em `matched` — não o texto
   digitado. `ping` tem rótulos por alvo: `ping loopback`, `ping gateway`, `ping host local`,
   `ping internet`, `ping nome`.
5. Exatamente **um** diagnóstico com `correct: true`, no mínimo três no total, e **todos** com
   `why` — inclusive os errados. Descartar a hipótese errada é metade do treino.
6. Referencie o cenário em `nextLabIds` de alguma aula. Cenário órfão é trabalho que ninguém
   encontra, e há teste reprovando isso.

### Um questionário

1. Escreva um `Quiz` em `src/content/quizzes.ts` e inclua em `QUIZZES`.
2. Cada questão: no mínimo três alternativas, exatamente uma correta, `why` em **todas** e um
   `takeaway`.
3. `area` da questão tem que ser igual à `area` do quiz.
4. Id de questão é único no projeto inteiro — a fila de revisão guarda id de questão sem o
   quiz de origem.
5. Não se preocupe com a posição da resposta certa: o embaralhamento resolve. Também não
   existe teste exigindo que ela fique em primeiro lugar.

### Uma triagem de chamado

1. Escreva um `Ticket` em `src/content/tickets.ts` e inclua em `TICKETS`.
2. Registre em `TICKETS_BY_LESSON` sob a aula da trilha dele. Isso não é opcional: define onde
   o chamado aparece no painel e para onde vai o botão "reler a aula". Há teste garantindo que
   todo chamado tem trilha e que nenhum aparece em duas.
3. Passo `choice`: exatamente uma opção correta, `why` em todas.
4. Passo `order`: `correctOrder` tem que conter exatamente os ids de `items`, nem um a mais nem
   um a menos, senão o passo é impossível.
5. Passo `note`: cada item de `mustMention` precisa de `aliases`, e a `modelAnswer` tem que
   passar no próprio critério.

### Uma área nova

Acrescente o valor em `Area` e o rótulo em `AREA_LABEL`, os dois em `src/content/types.ts`. O
TypeScript aponta o que falta a partir daí.

### Um comando novo no motor

1. Confirme a saída real, naquela situação, num Windows pt-BR. Sem isso, não adicione.
2. Derive a saída do `MachineState`. Se o comando precisa de informação que o estado não tem,
   acrescente o campo — e cuide para que os cenários existentes continuem coerentes.
3. Se o comando escreve no estado, escreva **na cópia** (`s`), nunca no parâmetro.
4. Escolha um rótulo `matched` e use-o nos `expectedCommands` dos cenários que o cobram.
5. Adicione à lista do `help`, senão o comando existe e ninguém descobre.
6. Escreva teste para a saída e para a mudança de estado.

---

## O que não fazer

- **Inventar mensagem do Windows.** É a única forma de o produto mentir sem ninguém notar.
- **Colocar conteúdo dentro de componente.** Já aconteceu com o mapa de chamado por trilha, que
  vivia no `Dashboard`: chamado sem trilha virava exercício órfão e nada acusava.
- **Mutar o `MachineState`** recebido pelo motor.
- **Publicar tabela de código de bipe de POST.** É definida pelo fabricante da BIOS e pelo
  modelo da placa; uma tabela "universal" treinaria alguém a trocar a peça errada com
  confiança.
- **Atualizar contagem em um lugar só.** `src/content/cover.ts`, `PRODUCT.md`, `DESIGN.md` e
  `README.md` têm números. Os da capa têm teste; a prosa dos outros três, não.
- **Escrever cenário de N2 que um N1 resolveria.** Se resolve, está mal escrito — o N2 recebe
  o que foi escalado, com o óbvio já descartado no briefing.
