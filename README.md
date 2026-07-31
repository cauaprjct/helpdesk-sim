# Treino de suporte técnico — N1 e N2

Simulador de treino para técnico de informática e analista de suporte, em português.
Aulas, terminal simulado e triagem de chamado.

**Ao vivo:** https://helpdesk-sim-seven.vercel.app

---

## O que é

Três formatos de treino, encadeados nessa ordem — aula, laboratório, questionário. Ensina
antes de cobrar.

| Formato | O que faz |
|---|---|
| **Aula** | Explica o conceito e, principalmente, o **sintoma que ele produz na tela** |
| **Laboratório** | Uma máquina quebrada e um console que responde ao estado dela |
| **Triagem de chamado** | Categorizar, priorizar, ordenar o diagnóstico, escalar e registrar |

Fora dessa sequência, duas telas sem pré-requisito:

| Tela | O que faz |
|---|---|
| **[Terminal livre](https://helpdesk-sim-seven.vercel.app/terminal)** | Escolhe entre 13 máquinas quebradas e investiga no prompt, com o estado da máquina à vista ao lado do console. Sem chamado, sem gabarito, sem cadastro |
| **Revisão** | As questões que você errou voltam misturadas, fora da trilha de origem. Sai da fila só o que você acerta |

**N1** cobre atendimento ao usuário: redes, conceitos de help desk, estação Windows,
impressão, hardware e bancada, e ambiente com domínio.
**N2** cobre o que chega escalado: identidade e confiança no domínio, permissão a fundo,
DHCP e DNS pelo lado do servidor, e gestão de problema e mudança.

Conteúdo atual: 10 aulas, 13 laboratórios, 5 triagens, 72 questões.

## O terminal não é maquete

É uma máquina de estados. Cada cenário carrega um estado real — link, IP, DHCP, DNS, GPO,
serviços, ACL, relógio, canal seguro com o domínio — e os comandos **alteram esse estado**.

Dá para conferir sem ler nada antes: em
**[/terminal](https://helpdesk-sim-seven.vercel.app/terminal)** o estado da máquina fica
visível ao lado do console, e o campo que um comando altera acende.

```
C:\Users\paula.reis>ping intranet.lab.local

Disparando intranet.lab.local [10.10.10.20] com 32 bytes de dados:
Resposta de 10.10.10.112: Host de destino inacessível.

C:\Users\paula.reis>nslookup intranet.lab.local

Não é resposta autoritativa:
Servidor:  dc01.lab.local
Address:  10.10.10.10

Nome:    intranet.lab.local
Address:  10.10.10.10
```

O `ping` foi para `10.10.10.20` e o `nslookup` respondeu `10.10.10.10`. A divergência é o
diagnóstico: o `nslookup` consulta o servidor direto e **não lê o cache do cliente**,
enquanto a resolução do `ping` obedece ao cache. `ipconfig /flushdns` corrige, e o `ping`
seguinte passa a ir para o endereço certo.

Outros comportamentos que o motor modela em vez de simular por cima:

- `ipconfig /renew` falha e **mantém** o APIPA quando o DHCP não responde, e é **recusado**
  quando a máquina tem IP fixo
- `ping` distingue as três falhas — host não encontrado (DNS), tempo limite esgotado
  (caminho) e host de destino inacessível (sem rota, respondido pela própria máquina)
- `net stop spooler` devolve **Erro 5, Acesso negado** sem prompt elevado
- `gpupdate /force` só aplica se a estação alcançar o controlador de domínio
- `Reset-ComputerMachinePassword` conserta o canal seguro, e o `nltest /sc_verify` seguinte
  passa a devolver êxito

### Fidelidade da saída

Rótulos e mensagens foram conferidos contra a saída real de um **Windows 10 pt-BR**
(build 19045) — o que corrigiu invenções como "NetBIOS over Tcpip" no lugar de "NetBIOS em
Tcpip", e a ausência de "Host de destino inacessível", que é a mensagem mais reveladora das
três porque quem responde é a própria máquina.

Inventar mensagem de erro do Windows ensina o técnico a reconhecer algo que não existe.

## Como o conteúdo foi escolhido

Não saiu de ementa de curso. Saiu dos requisitos que se repetem em **30 vagas reais de
técnico de informática e suporte mapeadas no Rio de Janeiro** — LinkedIn, Indeed, InfoJobs,
Catho, Gupy e Vagas.com. O que aparecia em quase todas virou aula; o que aparecia como
teste prático virou laboratório.

A trilha de **hardware e bancada** entrou por esse critério: depois de Windows, é o
requisito mais repetido no mapeamento — "manutenção de hardware (PCs, notebooks,
impressoras)", "montagem e manutenção de microcomputadores", "atividades de IMAC
(instalação, movimentação, adição, mudança de equipamentos)", "controle de inventário de
TI". Ela não ensina a montar um PC; ensina hipótese antes de peça, patrimônio, e a
reconhecer o que só parece ser defeito físico.

Duas decisões de conteúdo que valem explicar:

- **Não existe tabela de código de bipe aqui.** Bipe de POST é definido pelo fabricante da
  BIOS e pelo modelo da placa — publicar uma tabela "universal" treinaria alguém a trocar a
  peça errada com confiança. O conteúdo ensina a anotar o padrão exato e consultar o modelo.
- **Um laboratório existe para mostrar o limite do terminal.** `ipconfig` devolve a mesma
  saída para cabo partido, porta de switch morta e placa de rede com defeito. Em
  `placa-rede-queimada` o chamado chega com cabo e porta já substituídos, e a conclusão vem
  do teste físico — não do comando. Fingir que hardware se diagnostica só por prompt seria
  mentir sobre o ofício.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Vercel

Site estático: **sem backend, sem login, sem banco de dados**. Progresso e preferência de
tema ficam em `localStorage` — resposta, nota e fila de revisão não saem da máquina de quem
usa.

O site mede **acesso**: Vercel Web Analytics (visita e página) e Speed Insights (Core Web
Vitals reais), os dois sem cookie e sem identificar pessoa. Isso está dito na capa, porque
medir calado enquanto a página promete privacidade seria pior que não medir.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm test           # 168 testes, sem DOM: motor, conteúdo e embaralhamento
```

## Organização

```
src/
  app/               rotas — capa, /treino, /aula, /lab, /quiz, /chamado,
                     /terminal (livre), /revisao
  components/        Cover, Dashboard, LessonView, LabRunner, QuizRunner,
                     TicketTriage, Sandbox, Review, Console
  content/           TODO o conteúdo, tipado e separado do JSX
    lessons.ts       aulas em blocos tipados
    quizzes.ts       questões, com explicação em toda alternativa errada
    scenarios.ts     laboratórios: estado inicial + diagnósticos + debrief
    tickets.ts       triagens de chamado
    sandbox.ts       estados de máquina do terminal livre
  lib/
    terminal-engine.ts   o motor: interpreta comando e muta o estado da máquina
    shuffle.ts           ordem determinística das alternativas
    progress.ts          progresso e fila de revisão, em localStorage
```

O `Console` é um componente só, usado pelo laboratório e pelo terminal livre. Ele guarda o
log e o histórico; o estado da máquina fica com quem o usa, porque é quem reage a ele.

### Testes

O motor é função pura: `runCommand(comando, estado)` devolve as linhas e o próximo estado.
Isso o torna testável sem navegador, e é onde mora a credibilidade do projeto — se a saída
não for a que o Windows daria, o treino ensina errado.

- **`terminal-engine.test.ts`** — fidelidade das mensagens em pt-BR, causalidade entre
  estado e saída, e o contrato com o conteúdo: todo comando que um laboratório cobra como
  evidência tem que ser produzível naquele cenário.
- **`content.test.ts`** — coerência que o tipo não pega: questão sem alternativa correta,
  aula apontando para laboratório inexistente, contagem da capa atrasada em relação ao
  conteúdo.
- **`shuffle.test.ts`** — determinismo (a página é estática, então servidor e cliente
  precisam da mesma ordem) e distribuição.

Conteúdo é dado, não markup. Adicionar uma aula é escrever um objeto em `lessons.ts`;
adicionar um laboratório é declarar um `MachineState` inicial em `scenarios.ts`.

## Documentação

| Arquivo | O que cobre |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Como o código funciona, por que é assim, e como adicionar aula, laboratório, questionário, triagem ou comando sem quebrar o que já está garantido |
| [`DESIGN.md`](./DESIGN.md) | Sistema visual: cor, tipografia, componentes, decisões de tela e o que foi medido no navegador |
| [`PRODUCT.md`](./PRODUCT.md) | Verdade de produto: para quem, com que promessa, o que existe como evidência e o que não pode ser inventado |

A decisão central: a interface é clara e institucional — parecida com as ferramentas que se
usa no trabalho — e **o terminal é o único objeto escuro da tela**. O contraste entre os
dois é a identidade do produto. Tema claro, escuro e "seguir o sistema", porque o uso real
é noturno.

Acessibilidade verificada por medição no navegador nos dois temas: corpo de texto acima de
4.5:1 em todas as rotas, foco visível, navegação por teclado, e `prefers-reduced-motion`
zerando animação **sem esconder conteúdo**.

## Aviso

É laboratório de treino, não ambiente de produção, e não substitui prática em máquina real.
Para AD, GPO e DHCP de verdade, monte um domínio em máquina virtual — o simulador ensina a
ler a saída e a ordem do diagnóstico, não a administrar um servidor.

## Roteiro

- [x] N1 — atendimento ao usuário
- [x] N2 — o que chega escalado
- [ ] Backup e restauração, virtualização, VLAN e monitoramento
- [ ] N3

---

**Cauã Alves** — Desenvolvedor & Técnico de Informática, Rio de Janeiro
[Portfólio](https://portifolio-caua.vercel.app/) ·
[GitHub](https://github.com/cauaprjct) ·
[LinkedIn](https://www.linkedin.com/in/caua-alves-0975a129b/)
