# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primária (lidera a capa):** recrutador ou gestor de TI avaliando Cauã Alves para vaga de
técnico de informática / suporte N1 ou N2 no Rio de Janeiro. Chega por link no currículo, no
LinkedIn ou no portfólio, em geral no meio de uma triagem, com pouco tempo e nenhuma
disposição para explorar. Precisa entender em segundos o que é aquilo e que foi construído
por alguém que sabe o que está fazendo.

**Secundária:** quem estuda para vaga de técnico/suporte N1 e usa o treino de verdade —
aulas, laboratórios e triagem de chamado.

**Usuário original:** o próprio Cauã, preparando-se para processo seletivo de suporte
enquanto mantém a frente de dados/automação como freelancer.

## Product Purpose

Treinar as três coisas que uma vaga de suporte N1 cobra e que não se aprendem lendo:
vocabulário de service desk, leitura de saída de comando no diagnóstico de rede, e o
processo de atendimento de chamado (categorizar, priorizar, escalar, registrar).

Sucesso tem duas faces, e as duas contam: o estudante chega na entrevista sabendo
responder "um usuário liga sem internet, o que você faz?"; o recrutador fecha a aba
convencido de que quem construiu aquilo entrega software.

## Positioning

O terminal não é maquete. É uma máquina de estados: cada cenário carrega um estado real de
máquina (link, IP, DHCP, DNS, GPO, serviços) e os comandos **alteram esse estado** —
`ipconfig /renew` falha e mantém o APIPA quando o DHCP está fora, `ipconfig /flushdns`
conserta de verdade o cenário de cache velho, `gpupdate /force` faz a unidade `Z:`
reaparecer no `net use`. Saída em português, no formato real do Windows.

Segundo diferencial: o conteúdo não saiu de ementa de curso. Saiu dos requisitos que se
repetem em **30 vagas reais mapeadas no Rio de Janeiro** (LinkedIn, Indeed, InfoJobs,
Catho, Gupy, Vagas.com), documentadas em `../mapeamento-empresas-ti/index.csv` — 30 linhas
de dados, todas com `vaga_ativa=sim`. O número foi conferido no arquivo; qualquer texto de
capa que cite outro valor está desatualizado.

Terceiro: ensina antes de cobrar. Aula → laboratório → questionário, nessa ordem.

## Operating Context

- O estudante usa em casa, à noite, em desktop Windows, com o browser em metade da tela.
- As ferramentas que ele vai encontrar no emprego são GLPI, console do Active Directory,
  Event Viewer, acesso remoto por AnyDesk/TeamViewer — o vocabulário do produto é o
  desses ambientes.
- O recrutador abre no meio de uma triagem, muitas vezes no celular.
- Tudo em português do Brasil, incluindo a saída simulada dos comandos.

## Capabilities and Constraints

- Site estático (Next.js na Vercel). **Sem backend, sem login, sem banco.**
- Progresso e preferência de tema ficam em `localStorage`: resposta, nota e fila de revisão
  não saem da máquina do usuário.
- **Medição de acesso existe.** Vercel Web Analytics (visita e página) e Speed Insights (Core
  Web Vitals de gente real), os dois sem cookie e sem identificar pessoa. Isso obrigou a
  reescrever a copy: o site dizia "nada sai da sua máquina", e com métrica ligada isso passou
  a ser falso. Hoje ele afirma o que é verdade — **resposta e progresso ficam no navegador; o
  que sai é contagem de acesso**. Métrica silenciosa contradizendo a promessa da capa seria
  pior que não ter métrica.
- **N1** — 6 aulas (redes, help desk, estação Windows, impressão, hardware e bancada,
  domínio/AD), 9 laboratórios, 5 triagens de chamado, 48 questões.
- **N2** — 4 aulas (identidade e confiança, permissão a fundo, DHCP/DNS no servidor,
  problema e mudança), 4 laboratórios, 24 questões.
- Total: 10 aulas, 13 laboratórios, 5 triagens, 72 questões.
- **Hardware e bancada** existe porque é o requisito mais repetido nas 30 vagas mapeadas
  depois de Windows — "manutenção de hardware (PCs, notebooks, impressoras)", "montagem e
  manutenção de microcomputadores", "atividades de IMAC (instalação, movimentação, adição,
  mudança de equipamentos)", "controle de inventário de TI". A trilha não ensina a montar
  um PC: ensina hipótese antes de peça, IMAC, patrimônio e o que só parece ser físico.
  Duas das cinco triagens são de bancada (laudo de defeito e movimentação de equipamento).
- **Fora das trilhas, duas superfícies sem pré-requisito:**
  - `/terminal` — terminal livre. 13 estados de máquina para escolher, sem chamado, sem
    diagnóstico e sem placar, com o estado da máquina à vista ao lado do console. Existe
    para quem chega de fora poder usar a peça central em dez segundos. É o link a colar em
    LinkedIn e portfólio.
  - `/revisao` — as questões erradas de qualquer trilha voltam misturadas, fora do contexto
    de origem. Sai da fila só o que for acertado.
- **A alternativa correta é redistribuída na tela.** No conteúdo-fonte ela foi escrita
  primeiro em 100% dos exercícios (64 questões, 12 diagnósticos, 8 escolhas de chamado) —
  vício de autoria que permitia gabaritar tudo clicando sempre na primeira opção. A ordem é
  embaralhada de forma determinística pelo id, e refazer muda a ordem. Determinística porque
  as páginas são estáticas: sorteio em tempo de render divergiria na hidratação.
- O N2 **não** é o N1 mais difícil. É outro trabalho: os cenários chegam escalados, com o
  briefing dizendo o que o N1 já testou e descartou, e a resposta nunca está na conta do
  usuário nem na rede. Cenário de N2 que pudesse ser resolvido por um N1 está mal escrito.
- **O N3 está planejado e não existe.** Qualquer menção a ele é roteiro, nunca recurso
  disponível.
- Comandos simulados hoje: família `ipconfig` (incluindo `/displaydns`), `ping`, `tracert`,
  `nslookup`, `getmac`, `arp`, `net use`, `sc query`, `net start/stop`, `gpupdate`,
  `gpresult`, `hostname`, `whoami` e, no N2, `nltest`, `klist`, `w32tm`,
  `Reset-ComputerMachinePassword`, `icacls`, `Get-DhcpServerv4ScopeStatistics`.
- Operação em serviço exige `elevated: true`. Os cenários que precisam disso já entregam o
  prompt elevado, e o briefing diz que ele foi aberto como administrador; onde não há, o
  "Erro 5, Acesso negado" é conteúdo, não defeito. No terminal livre a elevação é um
  interruptor, justamente para a diferença ficar visível nos dois modos.
- **Alcance na LAN não depende do gateway.** O controlador de domínio está na mesma
  sub-rede: quem derruba o acesso a ele é o próprio host sair do ar, não o roteador. O
  gateway só entra para sair da sub-rede. Confundir os dois faz o técnico culpar o
  equipamento errado, nos dois sentidos.
- **O limite do terminal é conteúdo, não lacuna.** `ipconfig` devolve a mesma saída para
  cabo partido, porta de switch morta e placa de rede com defeito — e o laboratório
  `placa-rede-queimada` existe para ensinar exatamente isso: o que separa as três é
  substituição física, que vem de fora do prompt. Por isso o briefing dele chega com cabo e
  porta já testados. Cenário de hardware que fingisse ser diagnosticável só por comando
  estaria mentindo sobre o ofício.
- **Nada de tabela de código de bipe.** Bipe de POST é definido pelo fabricante da BIOS e
  pelo modelo da placa; publicar uma tabela "universal" ensinaria o técnico a trocar a peça
  errada com confiança. O conteúdo ensina a anotar o padrão exato e consultar o modelo.
- **Fidelidade da saída:** os rótulos e mensagens do motor foram conferidos contra a saída
  real de um Windows 10 pt-BR (build 19045). Qualquer string nova precisa do mesmo
  tratamento — inventar mensagem de erro do Windows ensina o técnico a reconhecer algo que
  não existe.

## Brand Commitments

- Assinatura, textual e obrigatória: **"Cauã Alves — Desenvolvedor & Técnico de
  Informática, Rio de Janeiro"**.
- Portfólio (destino principal do recrutador): https://portifolio-caua.vercel.app/
- GitHub: https://github.com/cauaprjct · LinkedIn:
  https://www.linkedin.com/in/cau%C3%A3-alves-0975a129b/
- **Não há foto do Cauã disponível.** Ele pretende ter uma. Até existir, a capa não usa
  retrato nem placeholder de avatar — o lugar dela fica documentado, não ocupado.
- Nunca mencionar uso de IA na construção.

## Evidence on Hand

- **Real e usável:** o próprio produto (o motor de terminal é demonstrável ao vivo em
  `/terminal`, sem cadastro); o mapeamento de 30 vagas em
  `../mapeamento-empresas-ti/index.csv`; a contagem de conteúdo do N1 e do N2; a suíte de
  **168 testes** (`npm test`), que cobre a fidelidade da saída do motor, a coerência do
  conteúdo e a redistribuição das alternativas.
- **A capa não pode mentir sobre os números.** As contagens anunciadas em `N1_INVENTORY`
  são verificadas por teste contra o conteúdo real. Elas já ficaram atrás uma vez; num
  portfólio esse é o pior tipo de erro, porque é conferível em dois cliques.
- **Existe fora deste repositório e fica fora do produto por decisão:** um diagnóstico de
  conhecimento pessoal que originou a lista de assuntos. O resultado dele **não** aparece em
  nenhuma superfície nem nesta documentação: a audiência primária é recrutador, e a origem
  nas 30 vagas mapeadas dá a mesma credibilidade sem o custo de publicar o placar de quem
  está se candidatando.
- **Não existe e não pode ser inventado:** depoimento de usuário, número de usuários,
  aprovação em processo seletivo, qualquer métrica de uso, foto.

## Product Principles

1. **Provar, não afirmar.** O produto tem um motor demonstrável; mostrar valendo é sempre
   melhor que descrever. É por isso que existe uma porta sem pré-requisito para ele.
2. **Ensinar antes de cobrar.** Nenhuma cobrança sem a explicação disponível antes dela.
3. **O exercício não pode ter atalho.** Se dá para acertar sem ler — pela posição da
   alternativa, pelo tamanho do texto, por eliminação boba — o exercício está quebrado,
   mesmo que o conteúdo esteja certo.
4. **Honestidade sobre o que é laboratório.** O treino não finge ser experiência de
   produção, e a página não finge que o N3 existe.
5. **Vocabulário do trabalho real.** Chamado, evidência, escalonamento, ordem de serviço —
   os termos vêm das vagas, não de gamificação.
6. **Nada de dado do usuário.** Sem login e sem banco é decisão de produto, não limitação a
   esconder. Medição de acesso é a única exceção, ela é anônima, e está escrita na capa — o
   que não pode acontecer é medir calado enquanto a copy promete o contrário.

## Accessibility & Inclusion

- Contraste verificado por medição no navegador nos dois temas: corpo de texto ≥ 4.5:1,
  nenhuma falha nas rotas existentes. Opacidade em texto pequeno é proibida.
- Navegação por teclado em tudo que é operável, com foco visível; o questionário tem
  atalho por letra.
- `prefers-reduced-motion` zera animação **mantendo o conteúdo visível**.
- Tema claro/escuro/sistema, porque o uso real é noturno.
