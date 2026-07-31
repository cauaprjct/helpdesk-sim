import { machine } from "./scenarios";
import type { MachineState } from "./types";

/**
 * Estados de máquina para o terminal livre.
 *
 * Diferente do laboratório: aqui não há chamado, diagnóstico nem placar. O
 * visitante escolhe um defeito e vê o que os comandos respondem. O objetivo é
 * deixar visível que a saída vem de um ESTADO, não de um texto gravado.
 *
 * Por isso os presets nascem da mesma `machine()` dos cenários: o que roda aqui
 * é literalmente o mesmo motor que roda no treino.
 */

export type SandboxGroup = "saudável" | "rede" | "estação" | "domínio" | "servidor";

export interface SandboxPreset {
  id: string;
  group: SandboxGroup;
  label: string;
  /** O que está quebrado, em uma linha. Sem enrolação e sem esconder. */
  note: string;
  /** Comandos que mostram o defeito. Viram atalhos clicáveis. */
  suggest: string[];
  state: MachineState;
}

export const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: "saudavel",
    group: "saudável",
    label: "Estação saudável",
    note: "Nada quebrado. Serve de régua: rode os mesmos comandos aqui e nos outros estados para comparar.",
    suggest: ["ipconfig /all", "ping 8.8.8.8", "nslookup intranet.lab.local", "klist"],
    state: machine(),
  },

  /* ------------------------------------------------------------- rede --- */
  {
    id: "cabo-solto",
    group: "rede",
    label: "Cabo desconectado",
    note: "Sem enlace físico. O adaptador não tem endereço e o Windows diz isso antes de qualquer coisa.",
    suggest: ["ipconfig", "ping 127.0.0.1", "ping 10.10.10.1", "getmac"],
    state: machine({ linkUp: false, ip: null }),
  },
  {
    id: "sem-dhcp",
    group: "rede",
    label: "DHCP não responde",
    note: "Sem concessão, o Windows gera um endereço sozinho — 169.254.x.x, o famoso APIPA.",
    suggest: ["ipconfig", "ipconfig /renew", "ping 10.10.10.1", "ipconfig /all"],
    state: machine({
      ip: "169.254.87.13",
      dhcpServer: null,
      gatewayReachable: false,
      internetReachable: false,
      dnsWorking: false,
    }),
  },
  {
    id: "dns-fora",
    group: "rede",
    label: "Servidor DNS fora do ar",
    note: "A rede funciona por IP e falha por nome. É a assinatura de problema de DNS.",
    suggest: [
      "ping 8.8.8.8",
      "ping intranet.lab.local",
      "nslookup intranet.lab.local",
      "ipconfig /all",
    ],
    state: machine({ dnsWorking: false }),
  },
  {
    id: "cache-velho",
    group: "rede",
    label: "Cache de DNS velho",
    note: "O servidor já tem o endereço novo, a estação ainda usa o antigo. O ping e o nslookup discordam — e é essa divergência que entrega a causa.",
    suggest: [
      "ping intranet.lab.local",
      "nslookup intranet.lab.local",
      "ipconfig /displaydns",
      "ipconfig /flushdns",
    ],
    state: machine({ dnsCacheStale: true, dnsStaleIp: "10.10.10.60" }),
  },
  {
    id: "link-caiu",
    group: "rede",
    label: "Link do provedor caído",
    note: "A rede interna está inteira; só a saída para a internet morreu. Dá para provar sem sair do prompt.",
    suggest: ["ping 10.10.10.1", "ping 8.8.8.8", "tracert 8.8.8.8", "ping 10.10.10.10"],
    state: machine({ internetReachable: false }),
  },

  /* ---------------------------------------------------------- estação --- */
  {
    id: "ip-duplicado",
    group: "estação",
    label: "Conflito de IP",
    note: "Duas máquinas com o mesmo endereço. O `ipconfig /all` marca isso de um jeito específico.",
    suggest: ["ipconfig /all", "ping 10.10.10.1", "arp -a", "ipconfig /renew"],
    state: machine({ ipConflict: true, gatewayReachable: false }),
  },
  {
    id: "spooler-parado",
    group: "estação",
    label: "Spooler de impressão parado",
    note: "A impressora responde na rede e nada sai. Três trabalhos presos na fila.",
    suggest: [
      "ping 10.10.10.30",
      "sc query spooler",
      "net start spooler",
      "sc query spooler",
    ],
    state: machine({
      hostname: "PC-COM-05",
      user: "marcos.lima",
      ou: "Comercial",
      printerIp: "10.10.10.30",
      printQueue: 3,
      liveHosts: ["10.10.10.1", "10.10.10.10", "10.10.10.20", "10.10.10.30"],
      stoppedServices: ["Spooler"],
    }),
  },
  {
    id: "sem-unidade",
    group: "estação",
    label: "Unidade de rede não mapeou",
    note: "A GPO que entrega o Z: não foi aplicada. Reaplicar resolve — e mostra na hora.",
    suggest: ["net use", "gpresult /r", "gpupdate /force", "net use"],
    state: machine({ mappedDrives: {}, gpoApplied: false }),
  },

  /* ---------------------------------------------------------- domínio --- */
  {
    id: "confianca-quebrada",
    group: "domínio",
    label: "Confiança com o domínio quebrada",
    note: "A senha da conta de computador saiu de sincronia com o domínio. É o erro de relação de confiança que trava o logon.",
    suggest: [
      "nltest /sc_verify:lab.local",
      "klist",
      "Reset-ComputerMachinePassword",
      "nltest /sc_verify:lab.local",
    ],
    state: machine({
      hostname: "PC-COM-11",
      user: "julia.matos",
      ou: "Comercial",
      trustBroken: true,
      mappedDrives: {},
      elevated: true,
    }),
  },
  {
    id: "relogio-torto",
    group: "domínio",
    label: "Relógio fora de sincronia",
    note: "47 minutos de diferença. Acima de 5 minutos o Kerberos recusa o ticket e o logon falha.",
    suggest: ["w32tm /query /status", "klist", "w32tm /resync", "klist"],
    state: machine({
      hostname: "PC-ALM-04",
      user: "rafael.dias",
      ou: "Almoxarifado",
      timeSkewSeconds: -2820,
      elevated: true,
    }),
  },
  {
    id: "acesso-negado",
    group: "domínio",
    label: "Pasta com negação explícita",
    note: "O usuário está no grupo que dá acesso e em outro que nega. Negar vence — e o `icacls` mostra onde.",
    suggest: ["whoami", "icacls C:\\Dados\\Financeiro", "net use", "gpresult /r"],
    state: machine({
      hostname: "PC-FIN-09",
      acl: {
        path: "C:\\Dados\\Financeiro",
        entries: [
          { principal: "LAB\\GRP_Financeiro_Escrita", rights: "M", deny: false },
          { principal: "LAB\\GRP_Estagiarios", rights: "W,Rc", deny: true },
          { principal: "LAB\\Administradores", rights: "F", deny: false },
          { principal: "CREATOR OWNER", rights: "F", deny: false },
        ],
      },
      elevated: true,
    }),
  },

  /* --------------------------------------------------------- servidor --- */
  {
    id: "escopo-esgotado",
    group: "servidor",
    label: "Escopo DHCP esgotado",
    note: "Visto do servidor: nenhum endereço livre. Quem chegar agora cai em APIPA.",
    suggest: [
      "Get-DhcpServerv4ScopeStatistics",
      "ipconfig /all",
      "ipconfig /renew",
      "ping 10.10.10.1",
    ],
    state: machine({
      hostname: "SRV-DHCP-01",
      user: "admin.lab",
      ou: "TI",
      elevated: true,
      dhcpScope: {
        scopeId: "10.10.10.0",
        start: "10.10.10.100",
        end: "10.10.10.150",
        inUse: 51,
        free: 0,
      },
    }),
  },
];

/* ------------------------------------------------- leitura do estado --- */

export interface StateRow {
  label: string;
  value: string;
}

function sim(v: boolean): string {
  return v ? "sim" : "não";
}

/**
 * O que a própria estação consegue enxergar de si mesma. É o que os comandos
 * do prompt leem.
 */
export function estacaoRows(s: MachineState): StateRow[] {
  return [
    { label: "host", value: s.hostname },
    { label: "usuário", value: s.user },
    { label: "domínio", value: s.domain ?? "fora do domínio" },
    { label: "OU", value: s.ou },
    { label: "prompt elevado", value: sim(s.elevated) },
    { label: "enlace", value: s.linkUp ? "conectado" : "desconectado" },
    { label: "IPv4", value: s.ip ?? "sem endereço" },
    { label: "máscara", value: s.ip ? s.mask : "—" },
    { label: "gateway", value: s.gateway },
    { label: "DNS", value: s.dns.length ? s.dns.join(", ") : "nenhum" },
    { label: "servidor DHCP", value: s.dhcpServer ?? "nenhum" },
    { label: "DHCP ligado", value: sim(s.dhcpEnabled) },
    {
      label: "unidades",
      value: Object.keys(s.mappedDrives).length
        ? Object.keys(s.mappedDrives).sort().join(", ")
        : "nenhuma",
    },
    {
      label: "serviços parados",
      value: s.stoppedServices.length ? s.stoppedServices.join(", ") : "nenhum",
    },
    { label: "fila de impressão", value: String(s.printQueue) },
  ];
}

/**
 * O que está acontecendo fora da estação. Ela NÃO lê isso diretamente — só
 * infere pela resposta dos comandos. Deixar essa coluna à vista é o ponto do
 * sandbox: no laboratório ela fica escondida, e descobrir é o exercício.
 */
export function redeRows(s: MachineState): StateRow[] {
  return [
    { label: "gateway responde", value: sim(s.gatewayReachable) },
    { label: "internet responde", value: sim(s.internetReachable) },
    { label: "DNS responde", value: sim(s.dnsWorking) },
    {
      label: "cache de DNS sujo",
      value: s.dnsCacheStale ? `sim (${s.dnsStaleIp})` : "não",
    },
    { label: "hosts no ar", value: s.liveHosts.join(", ") },
    { label: "conflito de IP", value: sim(s.ipConflict) },
    { label: "confiança do domínio", value: s.trustBroken ? "quebrada" : "íntegra" },
    { label: "desvio de relógio", value: `${s.timeSkewSeconds}s` },
    {
      label: "escopo DHCP",
      value: s.dhcpScope
        ? `${s.dhcpScope.inUse} em uso / ${s.dhcpScope.free} livres`
        : "não exposto",
    },
    { label: "ACL carregada", value: s.acl ? s.acl.path : "nenhuma" },
  ];
}
