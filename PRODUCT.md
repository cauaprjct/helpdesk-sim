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
- Progresso e preferência de tema ficam em `localStorage`: nada sai da máquina do usuário.
- **N1** — 5 aulas (redes, help desk, estação Windows, impressão, domínio/AD),
  8 laboratórios, 3 triagens de chamado, 40 questões.
- **N2** — 4 aulas (identidade e confiança, permissão a fundo, DHCP/DNS no servidor,
  problema e mudança), 4 laboratórios, 24 questões.
- Total: 9 aulas, 12 laboratórios, 3 triagens, 64 questões.
- O N2 **não** é o N1 mais difícil. É outro trabalho: os cenários chegam escalados, com o
  briefing dizendo o que o N1 já testou e descartou, e a resposta nunca está na conta do
  usuário nem na rede. Cenário de N2 que pudesse ser resolvido por um N1 está mal escrito.
- **O N3 está planejado e não existe.** Qualquer menção a ele é roteiro, nunca recurso
  disponível.
- Comandos simulados hoje: família `ipconfig` (incluindo `/displaydns`), `ping`, `tracert`,
  `nslookup`, `getmac`, `arp`, `net use`, `sc query`, `net start/stop`, `gpupdate`,
  `gpresult`, `hostname`, `whoami`.
- Operação em serviço exige `elevated: true` no cenário. Só o laboratório de impressão tem,
  e o briefing dele diz explicitamente que o prompt foi aberto como administrador — nos
  outros o "Erro 5, Acesso negado" é conteúdo, não defeito.
- **Fidelidade da saída:** os rótulos e mensagens do motor foram conferidos contra a saída
  real de um Windows 10 pt-BR (build 19045). Qualquer string nova precisa do mesmo
  tratamento — inventar mensagem de erro do Windows ensina o técnico a reconhecer algo que
  não existe.

## Brand Commitments

- Assinatura, textual e obrigatória: **"Cauã Alves — Desenvolvedor & Técnico de
  Informática, Rio de Janeiro"**.
- Portfólio (destino principal do recrutador): https://portifolio-caua.vercel.app/
- GitHub: https://github.com/cauaprjct · LinkedIn:
  https://www.linkedin.com/in/caua-alves-0975a129b/
- **Não há foto do Cauã disponível.** Ele pretende ter uma. Até existir, a capa não usa
  retrato nem placeholder de avatar — o lugar dela fica documentado, não ocupado.
- Nunca mencionar uso de IA na construção.

## Evidence on Hand

- **Real e usável:** o próprio produto (o motor de terminal é demonstrável ao vivo); o
  mapeamento de 30 vagas em `../mapeamento-empresas-ti/index.csv`; a contagem de conteúdo
  do N1 e do N2.
- **Existe fora deste repositório e fica fora do produto por decisão:** um diagnóstico de
  conhecimento pessoal que originou a lista de assuntos. O resultado dele **não** aparece em
  nenhuma superfície nem nesta documentação: a audiência primária é recrutador, e a origem
  nas 30 vagas mapeadas dá a mesma credibilidade sem o custo de publicar o placar de quem
  está se candidatando.
- **Não existe e não pode ser inventado:** depoimento de usuário, número de usuários,
  aprovação em processo seletivo, qualquer métrica de uso, foto.

## Product Principles

1. **Provar, não afirmar.** O produto tem um motor demonstrável; mostrar valendo é sempre
   melhor que descrever.
2. **Ensinar antes de cobrar.** Nenhuma cobrança sem a explicação disponível antes dela.
3. **Honestidade sobre o que é laboratório.** O treino não finge ser experiência de
   produção, e a página não finge que o N3 existe.
4. **Vocabulário do trabalho real.** Chamado, evidência, escalonamento, ordem de serviço —
   os termos vêm das vagas, não de gamificação.
5. **Nada de dado do usuário.** Sem login e sem servidor é decisão de produto, não
   limitação a esconder.

## Accessibility & Inclusion

- Contraste verificado por medição no navegador nos dois temas: corpo de texto ≥ 4.5:1,
  nenhuma falha nas rotas existentes. Opacidade em texto pequeno é proibida.
- Navegação por teclado em tudo que é operável, com foco visível; o questionário tem
  atalho por letra.
- `prefers-reduced-motion` zera animação **mantendo o conteúdo visível**.
- Tema claro/escuro/sistema, porque o uso real é noturno.
