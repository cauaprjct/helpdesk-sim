/**
 * Conteúdo da capa. Fica separado do JSX porque é texto de produto — quem
 * revisa a copy não deveria precisar abrir componente.
 *
 * A transcrição abaixo reproduz o cenário `dhcp-caiu` do motor em
 * `src/lib/terminal-engine.ts` — mesmo estado de máquina, mesmas mensagens.
 * Está condensada para caber na tela: o motor repete a linha de falha do ping
 * quatro vezes, aqui aparece uma. Nada foi inventado.
 */

export const PROMPT = "C:\\Users\\marcos.lima>";

export const TRANSCRIPT: string[] = [
  "Microsoft Windows [versão 10.0.19045.5011]",
  "(c) Microsoft Corporation. Todos os direitos reservados.",
  "",
  `${PROMPT}ipconfig`,
  "",
  "Configuração de IP do Windows",
  "",
  "Adaptador Ethernet Ethernet:",
  "",
  "   Sufixo DNS específico de conexão . . . . . . . : lab.local",
  "   Endereço IPv4 . . . . . . . . . . . . . . . . : 169.254.87.13",
  "   Máscara de Sub-rede . . . . . . . . . . . . . : 255.255.0.0",
  "   Gateway Padrão . . . . . . . . . . . . . . . . :",
  "",
  `${PROMPT}ping 10.10.10.1`,
  "",
  "Disparando 10.10.10.1 com 32 bytes de dados:",
  "PING: falha na transmissão. Erro geral.",
  "",
  "Estatísticas do Ping para 10.10.10.1:",
  "    Pacotes: Enviados = 4, Recebidos = 0, Perdidos = 4 (100% de perda),",
  "",
  `${PROMPT}ping 8.8.8.8`,
  "",
  "Disparando 8.8.8.8 com 32 bytes de dados:",
  "PING: falha na transmissão. Erro geral.",
  "",
  "Estatísticas do Ping para 8.8.8.8:",
  "    Pacotes: Enviados = 4, Recebidos = 0, Perdidos = 4 (100% de perda),",
  "",
  `${PROMPT}getmac`,
  "",
  "Endereço Físico     Nome de Transporte",
  "=================== ==========================================",
  "00-15-5D-3A-1C-04   \\Device\\Tcpip_{8A1F...}",
  "",
  `${PROMPT}ipconfig /renew`,
  "",
  "Configuração de IP do Windows",
  "",
  "Ocorreu um erro ao renovar a interface Ethernet: não foi possível contatar o",
  "servidor DHCP. A concessão do endereço não pôde ser renovada.",
  "",
];

/** Linha de comando digitado, para destacar como no terminal do app. */
export function isCmdLine(line: string): boolean {
  return line.startsWith(PROMPT) && line.length > PROMPT.length;
}

export const LINKS = {
  portfolio: "https://portifolio-caua.vercel.app/",
  github: "https://github.com/cauaprjct",
  linkedin: "https://www.linkedin.com/in/caua-alves-0975a129b/",
} as const;

export const AUTHOR = {
  name: "Cauã Alves",
  roles: "Desenvolvedor & Técnico de Informática",
  place: "Rio de Janeiro",
} as const;

/** Inventário do N1. Números conferidos contra o conteúdo, não estimados. */
export const N1_INVENTORY = [
  {
    count: 9,
    label: "aulas",
    detail:
      "Cinco no N1 — redes, help desk, estação Windows, impressão, domínio. Quatro no N2 — identidade, permissão, DHCP/DNS no servidor, problema e mudança.",
  },
  {
    count: 12,
    label: "laboratórios de terminal",
    detail:
      "Máquina quebrada e um console que responde ao estado dela. No N2 os cenários chegam escalados, com o N1 já tendo descartado o óbvio.",
  },
  {
    count: 3,
    label: "triagens de chamado",
    detail:
      "Categorizar, priorizar por impacto × urgência, ordenar o diagnóstico, decidir escalar e escrever o registro.",
  },
  {
    count: 64,
    label: "questões",
    detail:
      "Toda alternativa errada explica por que está errada, e a ordem das alternativas muda a cada rodada. O que você errar volta na revisão, fora do contexto original.",
  },
] as const;

export const ROADMAP = [
  {
    level: "N1",
    status: "disponível" as const,
    what: "Atendimento ao usuário: rede, estação, impressão e chamado",
  },
  {
    level: "N2",
    status: "disponível" as const,
    what: "O que chega escalado: identidade, permissão, DHCP/DNS no servidor e causa raiz",
  },
  {
    level: "N3",
    status: "planejado" as const,
    what: "Especialista: arquitetura, fornecedor e o que o N2 não resolve",
  },
] as const;
