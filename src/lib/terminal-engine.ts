import type { MachineState } from "@/content/types";

/**
 * Motor do terminal simulado.
 *
 * Não executa nada: interpreta o comando e devolve a saída que o Windows daria
 * PARA AQUELE ESTADO de máquina.
 *
 * FIDELIDADE: rótulos, mensagens e formatos conferidos contra a saída real de um
 * Windows 10 pt-BR (build 19045). Onde a versão anterior inventava texto, foi
 * corrigido — "NetBIOS em Tcpip" (não "over Tcpip"), "Não existem entradas na
 * lista" (não "Não há entradas"), o cabeçalho do `nslookup` começando pela linha
 * de autoridade, e "Host de destino inacessível" no lugar de timeout quando não
 * existe rota.
 */

export interface CommandResult {
  lines: string[];
  next: MachineState;
  /** comando canônico reconhecido, para o placar de evidência */
  matched: string | null;
  clear?: boolean;
}

/** Coluna em que o Windows alinha os dois-pontos na saída do ipconfig. */
const PAD = 44;

function field(label: string, value = ""): string {
  const base = `${label} `;
  let leader = "";
  while (base.length + leader.length < PAD) leader += ". ";
  return `   ${base}${leader}: ${value}`;
}

function isApipa(ip: string | null): boolean {
  return !!ip && ip.startsWith("169.254.");
}

function isLoopback(ip: string): boolean {
  return ip.startsWith("127.");
}

function isIpLiteral(target: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(target);
}

function sameSubnet(ip: string, myIp: string | null, mask: string): boolean {
  if (!myIp) return false;
  const n = mask === "255.255.0.0" ? 2 : 3;
  return ip.split(".").slice(0, n).join(".") === myIp.split(".").slice(0, n).join(".");
}

/* --------------------------------------------------------------- nomes --- */

const NAME_TABLE: Record<string, string> = {
  dc01: "10.10.10.10",
  "dc01.lab.local": "10.10.10.10",
  intranet: "10.10.10.10",
  "intranet.lab.local": "10.10.10.10",
  "erp.lab.local": "10.10.10.20",
  "google.com": "142.250.79.14",
  "www.google.com": "142.250.79.14",
  "microsoft.com": "20.70.246.20",
  "dns.google": "8.8.8.8",
};

/** O que o SERVIDOR DNS responde. */
function resolveFromServer(name: string): string {
  return NAME_TABLE[name.toLowerCase()] ?? "142.250.79.14";
}

/**
 * O que a PILHA DO CLIENTE usa — e é isso que o `ping` obedece. Com registro
 * velho no cache, vai para o endereço antigo.
 */
function resolveForClient(name: string, s: MachineState): string | null {
  const known = NAME_TABLE[name.toLowerCase()] !== undefined;
  if (s.dnsCacheStale && s.dnsStaleIp && known) return s.dnsStaleIp;
  if (!s.dnsWorking) return null;
  return resolveFromServer(name);
}

/** Resolver exige placa com endereço utilizável e servidor configurado. */
function canResolve(s: MachineState): boolean {
  return s.linkUp && !!s.ip && !isApipa(s.ip) && s.dns.length > 0;
}

/* ------------------------------------------------------------ ipconfig --- */

function adapterHeader(): string[] {
  return ["", "Adaptador Ethernet Ethernet:", ""];
}

function ipconfigShort(s: MachineState): string[] {
  const out = ["", "Configuração de IP do Windows", "", ...adapterHeader()];

  if (!s.linkUp) {
    out.push(field("Estado da mídia", "mídia desconectada"));
    out.push(field("Sufixo DNS específico de conexão"));
    out.push("");
    return out;
  }

  out.push(field("Sufixo DNS específico de conexão", s.domain ?? ""));
  if (s.ip && isApipa(s.ip)) {
    // O Windows usa rótulo PRÓPRIO para endereço que ele mesmo gerou.
    out.push(field("Endereço IPv4 de Configuração Automática", s.ip));
    out.push(field("Máscara de Sub-rede", "255.255.0.0"));
    out.push(field("Gateway Padrão"));
  } else if (s.ip) {
    out.push(field("Endereço IPv4", s.ip));
    out.push(field("Máscara de Sub-rede", s.mask));
    out.push(field("Gateway Padrão", s.gateway));
  } else {
    out.push(field("Endereço IPv4", ""));
    out.push(field("Máscara de Sub-rede", ""));
    out.push(field("Gateway Padrão", ""));
  }
  out.push("");
  return out;
}

function ipconfigAll(s: MachineState): string[] {
  const out = [
    "",
    "Configuração de IP do Windows",
    "",
    field("Nome do host", s.hostname),
    field("Sufixo DNS primário", s.domain ?? ""),
    field("Tipo de nó", "híbrido"),
    field("Roteamento de IP ativado", "não"),
    field("Proxy WINS ativado", "não"),
  ];
  if (s.domain) out.push(field("Lista de pesquisa de sufixo DNS", s.domain));
  out.push(...adapterHeader());

  if (!s.linkUp) {
    out.push(field("Estado da mídia", "mídia desconectada"));
    out.push(field("Sufixo DNS específico de conexão"));
    out.push(field("Descrição", "Realtek PCIe GbE Family Controller"));
    out.push(field("Endereço Físico", s.mac));
    out.push(field("DHCP Habilitado", s.dhcpEnabled ? "Sim" : "Não"));
    out.push(field("Configuração Automática Habilitada", "Sim"));
    out.push("");
    return out;
  }

  out.push(field("Sufixo DNS específico de conexão", s.domain ?? ""));
  out.push(field("Descrição", "Realtek PCIe GbE Family Controller"));
  out.push(field("Endereço Físico", s.mac));
  out.push(field("DHCP Habilitado", s.dhcpEnabled ? "Sim" : "Não"));
  out.push(field("Configuração Automática Habilitada", "Sim"));

  if (s.ip && isApipa(s.ip)) {
    out.push(
      field("Endereço IPv4 de Configuração Automática", `${s.ip}(Preferencial)`),
    );
    out.push(field("Máscara de Sub-rede", "255.255.0.0"));
    out.push(field("Gateway Padrão"));
  } else if (s.ip) {
    out.push(
      field("Endereço IPv4", `${s.ip}(${s.ipConflict ? "Duplicado" : "Preferencial"})`),
    );
    out.push(field("Máscara de Sub-rede", s.mask));
    if (s.dhcpEnabled && s.dhcpServer) {
      out.push(field("Concessão Obtida", "quinta-feira, 30 de julho de 2026 08:31:43"));
      out.push(field("Concessão Expira", "quinta-feira, 30 de julho de 2026 17:31:37"));
    }
    out.push(field("Gateway Padrão", s.gateway));
    if (s.dhcpEnabled) out.push(field("Servidor DHCP", s.dhcpServer ?? ""));
  } else {
    out.push(field("Endereço IPv4", ""));
    out.push(field("Máscara de Sub-rede", ""));
    out.push(field("Gateway Padrão", ""));
  }

  if (s.dns.length === 0) {
    out.push(field("Servidores DNS", ""));
  } else {
    s.dns.forEach((d, i) => {
      out.push(i === 0 ? field("Servidores DNS", d) : `${" ".repeat(PAD + 5)}${d}`);
    });
  }

  out.push(field("NetBIOS em Tcpip", "Habilitado"));
  out.push("");
  return out;
}

/* ---------------------------------------------------------------- ping --- */

type Reach =
  | { kind: "ok"; local: boolean }
  /** sem rota: quem responde é a própria máquina */
  | { kind: "unreachable" }
  /** achou o caminho, ninguém respondeu */
  | { kind: "timeout" }
  /** placa sem endereço utilizável */
  | { kind: "transmit" };

function reach(ip: string, s: MachineState): Reach {
  // Loopback responde sempre, inclusive sem cabo: é teste da pilha, não da rede.
  if (isLoopback(ip)) return { kind: "ok", local: true };
  if (!s.linkUp || !s.ip) return { kind: "transmit" };
  if (ip === s.ip) return { kind: "ok", local: true };

  if (sameSubnet(ip, s.ip, s.mask)) {
    if (ip === s.gateway) {
      return s.gatewayReachable ? { kind: "ok", local: true } : { kind: "unreachable" };
    }
    return s.liveHosts.includes(ip)
      ? { kind: "ok", local: true }
      : { kind: "unreachable" };
  }

  // Fora da sub-rede exige gateway. Sem ele não existe rota.
  if (isApipa(s.ip) || !s.gatewayReachable) return { kind: "unreachable" };
  return s.internetReachable ? { kind: "ok", local: false } : { kind: "timeout" };
}

function pingStats(dest: string, sent: number, received: number): string[] {
  const lost = sent - received;
  const pct = Math.round((lost / sent) * 100);
  return [
    "",
    `Estatísticas do Ping para ${dest}:`,
    `    Pacotes: Enviados = ${sent}, Recebidos = ${received}, Perdidos = ${lost} (${pct}% de`,
    "             perda),",
  ];
}

function pingLines(target: string, s: MachineState): string[] {
  const literal = isIpLiteral(target);

  if (!literal && (!canResolve(s) || !resolveForClient(target, s))) {
    return [
      `A solicitação ping não pôde encontrar o host ${target}. Verifique o nome e tente`,
      "novamente.",
      "",
    ];
  }

  const dest = literal ? target : resolveForClient(target, s)!;
  // O Windows imprime o nome pedido E o IP resolvido — é a prova do DNS.
  const shown = literal ? dest : `${target} [${dest}]`;
  const r = reach(dest, s);

  if (r.kind === "transmit") {
    return [
      "",
      `Disparando ${shown} com 32 bytes de dados:`,
      ...Array(4).fill("PING: falha na transmissão. Erro geral."),
      ...pingStats(dest, 4, 0),
      "",
    ];
  }

  if (r.kind === "unreachable") {
    // Quem responde é a própria máquina, e o pacote CONTA como recebido.
    return [
      "",
      `Disparando ${shown} com 32 bytes de dados:`,
      ...Array(4).fill(`Resposta de ${s.ip}: Host de destino inacessível.`),
      ...pingStats(dest, 4, 4),
      "",
    ];
  }

  if (r.kind === "timeout") {
    return [
      "",
      `Disparando ${shown} com 32 bytes de dados:`,
      ...Array(4).fill("Esgotado o tempo limite do pedido."),
      ...pingStats(dest, 4, 0),
      "",
    ];
  }

  const t = r.local ? "tempo<1ms" : "tempo=22ms";
  const ttl = r.local ? "TTL=128" : "TTL=112";
  return [
    "",
    `Disparando ${shown} com 32 bytes de dados:`,
    ...Array(4).fill(`Resposta de ${dest}: bytes=32 ${t} ${ttl}`),
    ...pingStats(dest, 4, 4),
    "Aproximar um número redondo de vezes em milissegundos:",
    r.local
      ? "    Mínimo = 0ms, Máximo = 0ms, Média = 0ms"
      : "    Mínimo = 19ms, Máximo = 22ms, Média = 20ms",
    "",
  ];
}

/** Rótulo do placar de evidência: o alvo importa, não só o comando. */
function pingLabel(target: string, s: MachineState): string {
  if (!isIpLiteral(target)) return "ping nome";
  if (isLoopback(target)) return "ping loopback";
  if (target === s.gateway) return "ping gateway";
  if (sameSubnet(target, s.ip ?? s.gateway, s.mask)) return "ping host local";
  return "ping internet";
}

/* ------------------------------------------------------------- tracert --- */

function tracertLines(target: string, s: MachineState): string[] {
  const literal = isIpLiteral(target);
  if (!literal && (!canResolve(s) || !resolveForClient(target, s))) {
    return [`Não é possível resolver o nome do sistema de destino ${target}.`, ""];
  }
  const dest = literal ? target : resolveForClient(target, s)!;
  const head = dest === "8.8.8.8" ? `dns.google [${dest}]` : dest;
  const out = ["", `Rastreando a rota para ${head}`, "com no máximo 30 saltos:", ""];

  if (!s.linkUp || !s.ip) {
    out.push("Não é possível encontrar a rota para o host de destino.", "");
    return out;
  }
  if (isApipa(s.ip) || !s.gatewayReachable) {
    out.push(`  1  ${s.ip}  informa: Host de destino inacessível.`);
    out.push("", "Rastreamento concluído.", "");
    return out;
  }
  out.push(`  1    <1 ms    <1 ms    <1 ms  ${s.gateway} `);
  if (!s.internetReachable) {
    out.push("  2     *        *        *     Esgotado o tempo limite do pedido.");
    out.push("  3     *        *        *     Esgotado o tempo limite do pedido.");
    out.push("", "Rastreamento concluído.", "");
    return out;
  }
  out.push("  2     9 ms    10 ms    21 ms  c9110949.virtua.com.br [201.17.9.73] ");
  out.push("  3    18 ms    17 ms    19 ms  100.64.0.1 ");
  out.push(`  4    22 ms    21 ms    22 ms  ${dest} `);
  out.push("", "Rastreamento concluído.", "");
  return out;
}

/* ------------------------------------------------------------ nslookup --- */

function nslookupLines(name: string, s: MachineState): string[] {
  const server = s.dns[0];
  if (!server) {
    return ["", "*** Não é possível encontrar o nome do servidor padrão", ""];
  }
  const serverName = server === "10.10.10.10" ? "dc01.lab.local" : "UnKnown";

  const noAnswer = !s.linkUp || !s.ip || isApipa(s.ip) || !s.dnsWorking;
  if (noAnswer) {
    return [
      "",
      `*** ${serverName} não encontrou ${name}: No response from server`,
      `Servidor:  ${serverName}`,
      `Address:  ${server}`,
      "",
    ];
  }

  // O nslookup fala com o SERVIDOR, não com o cache do cliente. Por isso ele
  // devolve o endereço certo mesmo quando o ping por nome está indo para o
  // endereço velho — e é essa divergência que denuncia cache sujo.
  return [
    "",
    "Não é resposta autoritativa:",
    `Servidor:  ${serverName}`,
    `Address:  ${server}`,
    "",
    `Nome:    ${name}`,
    `Address:  ${resolveFromServer(name)}`,
    "",
  ];
}

function displayDnsLines(s: MachineState): string[] {
  const out = ["", "Configuração de IP do Windows", ""];
  if (s.dnsCacheStale && s.dnsStaleIp) {
    out.push(
      "    intranet.lab.local",
      "    ----------------------------------------",
      "    Nome do Registro. . . . . : intranet.lab.local",
      "    Tipo de Registro. . . . . : 1",
      "    Tempo de Vida . . . . . . : 1893",
      "    Comprimento dos Dados . . : 4",
      "    Seção . . . . . . . . . . : Resposta",
      `    Registro (Host) . . . . . : ${s.dnsStaleIp}`,
      "",
    );
  } else {
    out.push("    Não foi possível exibir o Cache do Resolvedor de DNS.", "");
  }
  return out;
}

/* ------------------------------------------------------------- net use --- */

function netUseList(s: MachineState): string[] {
  const entries = Object.entries(s.mappedDrives);
  if (entries.length === 0) {
    return ["Novas conexões serão lembradas.", "", "Não existem entradas na lista.", ""];
  }
  const out = [
    "Novas conexões serão lembradas.",
    "",
    "",
    "Status       Local     Remoto                             Rede",
    "",
    "-".repeat(79),
  ];
  for (const [drive, path] of entries) {
    out.push(`OK           ${drive.padEnd(10)}${path.padEnd(35)}Microsoft Windows Network`);
  }
  out.push("O comando foi concluído com êxito.", "");
  return out;
}

/** O servidor de arquivos só atende se o host estiver de fato alcançável. */
function fileServerUp(s: MachineState): boolean {
  return reach("10.10.10.10", s).kind === "ok";
}

/* ------------------------------------------------------------- serviço --- */

const SERVICE_NAMES: Record<string, string> = {
  spooler: "Spooler",
  "spooler de impressão": "Spooler",
  dnscache: "Dnscache",
  dhcp: "Dhcp",
};

function serviceKey(input: string): string | null {
  const k = input.toLowerCase().trim();
  return SERVICE_NAMES[k] ?? (k ? input.trim() : null);
}

function isStopped(s: MachineState, svc: string): boolean {
  return s.stoppedServices.some((x) => x.toLowerCase() === svc.toLowerCase());
}

/** `sc query` é como se confere estado de serviço sem sair do prompt. */
function scQueryLines(s: MachineState, svc: string): string[] {
  const stopped = isStopped(s, svc);
  return [
    "",
    `NOME_DO_SERVIÇO: ${svc}`,
    `        TIPO                     : 110  WIN32_OWN_PROCESS (interativo)`,
    stopped
      ? "        ESTADO                   : 1  PARADO"
      : "        ESTADO                   : 4  EM_EXECUÇÃO",
    stopped
      ? "                                        (NÃO_PODE_PARAR, NÃO_PODE_PAUSAR)"
      : "                                        (PODE_PARAR, NÃO_PODE_PAUSAR)",
    "        WIN32_EXIT_CODE          : 0  (0x0)",
    "        SERVICE_EXIT_CODE        : 0  (0x0)",
    "        CHECKPOINT               : 0x0",
    "        WAIT_HINT                : 0x0",
    "",
  ];
}

/* ------------------------------------------------------------- nível 2 --- */

/** `nltest /sc_verify` é o teste direto do canal seguro com o domínio. */
function nltestLines(s: MachineState, arg: string): string[] {
  if (!s.domain) {
    return ["", "A máquina não está em domínio.", ""];
  }
  const dom = s.domain.split(".")[0].toUpperCase();

  if (arg.startsWith("/dsgetdc")) {
    if (!fileServerUp(s)) {
      return [
        "",
        `Falha ao obter o controlador de domínio para ${s.domain}`,
        "Status: 0x54b ERROR_NO_SUCH_DOMAIN",
        "",
      ];
    }
    return [
      "",
      `           DC: \\\\dc01.${s.domain}`,
      "      Endereço: \\\\10.10.10.10",
      "     Sinalizadores: PDC GC DS LDAP KDC TIMESERV WRITABLE",
      `   Nome do domínio: ${s.domain}`,
      "O comando foi concluído com êxito",
      "",
    ];
  }

  // /sc_verify
  if (s.trustBroken) {
    return [
      "",
      `Sinalizadores: 0`,
      `Domínio confiável: ${dom}`,
      "Status do canal seguro do NetLogon do domínio confiável:",
      "     ERRO: 0x415 NERR_SetupNotJoined",
      "Verificação da confiança: Falhou",
      "",
      "O comando foi concluído com um erro",
      "",
    ];
  }
  if (!fileServerUp(s)) {
    return [
      "",
      `Domínio confiável: ${dom}`,
      "Status do canal seguro do NetLogon do domínio confiável:",
      "     ERRO: 0x54b ERROR_NO_SUCH_DOMAIN",
      "Verificação da confiança: Falhou",
      "",
      "O comando foi concluído com um erro",
      "",
    ];
  }
  return [
    "",
    `Sinalizadores: b0 HAS_IP  HAS_TIMESERV`,
    `Domínio confiável: ${dom}`,
    "Status do canal seguro do NetLogon do domínio confiável:",
    `     Canal seguro: \\\\dc01.${s.domain}`,
    "Verificação da confiança: Êxito",
    "",
    "O comando foi concluído com êxito",
    "",
  ];
}

function w32tmLines(s: MachineState, arg: string, resync: boolean): { lines: string[]; fixed: boolean } {
  if (resync) {
    if (!fileServerUp(s)) {
      return {
        lines: [
          "Enviando comando de ressincronização para o computador local",
          "O computador não ressincronizou porque nenhum dado de hora estava disponível.",
          "",
        ],
        fixed: false,
      };
    }
    return {
      lines: [
        "Enviando comando de ressincronização para o computador local",
        "O comando foi concluído com êxito.",
        "",
      ],
      fixed: true,
    };
  }

  const skew = s.timeSkewSeconds;
  const sign = skew >= 0 ? "+" : "-";
  return {
    lines: [
      "",
      "Indicador de salto: 0(sem aviso)",
      "Estrato: 3 (referência secundária - sincr. por (S)NTP)",
      "Precisão: -23 (119.209ns por tique)",
      // Campo do protocolo, sem relação com o desvio local — não derivar de skew.
      "Deslocamento raiz: 0.0312500s",
      "Dispersão da raiz: 0.4290000s",
      "ID de referência: 0x0A0A0A0A (endereço IP de origem: 10.10.10.10)",
      `Última hora de sincronização com êxito: ${
        Math.abs(skew) > 300 ? "não sincronizado" : "30/07/2026 08:31:52"
      }`,
      "Origem: dc01.lab.local",
      `Intervalo de sondagem: 10 (1024s)`,
      "",
      `Diferença medida contra a origem: ${sign}${Math.abs(skew)}s`,
      ...(Math.abs(skew) > 300
        ? [
            "",
            "AVISO: diferença acima da tolerância do Kerberos (300s por padrão).",
            "Autenticação de domínio vai falhar enquanto isso não for corrigido.",
          ]
        : []),
      "",
    ],
    fixed: false,
  };
}

/** `klist` mostra os tickets Kerberos em cache — leitura de N2. */
function klistLines(s: MachineState): string[] {
  if (!s.domain) return ["", "A máquina não está em domínio.", ""];
  if (s.trustBroken || Math.abs(s.timeSkewSeconds) > 300) {
    return [
      "",
      "Cache de tickets Kerberos atual:",
      "",
      "Contagem de tíquetes armazenados em cache: 0",
      "",
      "Sem ticket concedido: a autenticação com o domínio não está funcionando.",
      "",
    ];
  }
  const dom = s.domain.toUpperCase();
  return [
    "",
    "Cache de tickets Kerberos atual:",
    "",
    "Contagem de tíquetes armazenados em cache: 2",
    "",
    `#0>     Cliente: ${s.user} @ ${dom}`,
    `        Servidor: krbtgt/${dom} @ ${dom}`,
    "        Tipo de criptografia KerbTicket: AES-256-CTS-HMAC-SHA1-96",
    "        Hora de início: 30/07/2026 08:31:55 (local)",
    "        Hora de término: 30/07/2026 18:31:55 (local)",
    "",
  ];
}

/** `icacls` lê a lista de controle de acesso de uma pasta. */
function icaclsLines(s: MachineState, path: string): string[] {
  if (!s.acl) {
    return ["", `${path} Acesso negado.`, "", "Processados 0 arquivos; falha ao processar 1 arquivos", ""];
  }
  const out = [""];
  s.acl.entries.forEach((e, i) => {
    const mark = e.deny ? "(DENY)" : "";
    const prefix = i === 0 ? s.acl!.path : " ".repeat(s.acl!.path.length);
    out.push(`${prefix} ${e.principal}:${mark}(${e.rights})`);
  });
  out.push("", "Processados 1 arquivos; falha ao processar 0 arquivos", "");
  return out;
}

/** Estatística de escopo DHCP, do lado do servidor. */
function dhcpScopeLines(s: MachineState): string[] {
  if (!s.dhcpScope) {
    return [
      "",
      "Get-DhcpServerv4ScopeStatistics : Falha ao obter estatísticas do escopo.",
      "Este cenário não expõe o servidor DHCP.",
      "",
    ];
  }
  const { scopeId, start, end, inUse, free } = s.dhcpScope;
  const total = inUse + free;
  const pct = total > 0 ? Math.round((inUse / total) * 1000) / 10 : 0;
  return [
    "",
    "ScopeId      StartRange     EndRange       InUse  Free   PercentageInUse",
    "-------      ----------     --------       -----  ----   ---------------",
    `${scopeId.padEnd(13)}${start.padEnd(15)}${end.padEnd(15)}${String(inUse).padEnd(7)}${String(free).padEnd(7)}${pct}`,
    "",
    ...(free === 0
      ? [
          "AVISO: escopo esgotado. Novas concessões serão recusadas e as estações",
          "vão cair em 169.254.x.x até haver endereço livre.",
          "",
        ]
      : []),
  ];
}

/* ----------------------------------------------------------------- API --- */

const HELP = [
  "",
  "Comandos disponíveis neste laboratório:",
  "",
  "  ipconfig                 IP, máscara e gateway (resumido)",
  "  ipconfig /all            tudo: + DNS, MAC, DHCP, concessão",
  "  ipconfig /release        devolve o IP obtido do DHCP",
  "  ipconfig /renew          pede um IP novo ao DHCP",
  "  ipconfig /flushdns       limpa o cache de DNS da máquina",
  "  ipconfig /displaydns     mostra o que está guardado nesse cache",
  "  ping <ip|nome>           testa se alcança um destino",
  "  ping 127.0.0.1           testa a pilha TCP/IP da própria máquina",
  "  tracert <ip|nome>        mostra o caminho salto por salto",
  "  nslookup <nome>          pergunta ao servidor DNS (ignora o cache local)",
  "  getmac                   endereço físico das placas",
  "  arp -a                   vizinhos vistos na rede local",
  "  net use                  unidades de rede mapeadas",
  "  net use Z: \\\\dc01\\Setor   mapeia uma unidade",
  "  sc query <serviço>       estado do serviço (ex.: sc query spooler)",
  "  net start <serviço>      inicia um serviço — exige prompt de administrador",
  "  net stop <serviço>       para um serviço — exige prompt de administrador",
  "  gpupdate /force          reaplica as políticas de grupo",
  "  gpresult /r              mostra quais GPOs foram aplicadas",
  "  hostname                 nome da máquina",
  "  whoami                   usuário logado",
  "  cls                      limpa a tela",
  "",
  "Nível 2:",
  "  nltest /sc_verify:lab.local   testa o canal seguro com o domínio",
  "  nltest /dsgetdc:lab.local     qual controlador a máquina encontra",
  "  klist                         tickets Kerberos em cache",
  "  w32tm /query /status          sincronia de relógio (Kerberos depende)",
  "  w32tm /resync                 força ressincronizar a hora",
  "  Reset-ComputerMachinePassword redefine a conta de computador no domínio",
  "  icacls <pasta>                lista a ACL da pasta",
  "  Get-DhcpServerv4ScopeStatistics   uso do escopo DHCP",
  "",
  "Dica: a ordem que resolve quase tudo é",
  "  ipconfig /all  ->  ping <gateway>  ->  ping 8.8.8.8  ->  ping google.com",
  "",
];

export function runCommand(raw: string, state: MachineState): CommandResult {
  const cmd = raw.trim().replace(/\s+/g, " ");
  const lower = cmd.toLowerCase();
  const s: MachineState = {
    ...state,
    dns: [...state.dns],
    liveHosts: [...state.liveHosts],
    mappedDrives: { ...state.mappedDrives },
    stoppedServices: [...state.stoppedServices],
  };

  if (cmd === "") return { lines: [], next: s, matched: null };

  if (lower === "cls" || lower === "clear") {
    return { lines: [], next: s, matched: null, clear: true };
  }

  if (lower === "help" || lower === "ajuda" || lower === "?") {
    return { lines: HELP, next: s, matched: null };
  }

  if (lower === "hostname") {
    return { lines: [s.hostname, ""], next: s, matched: "hostname" };
  }

  if (lower === "whoami") {
    const who = s.domain
      ? `${s.domain.split(".")[0]}\\${s.user}`
      : `${s.hostname}\\${s.user}`;
    return { lines: [who.toLowerCase(), ""], next: s, matched: "whoami" };
  }

  if (lower === "getmac" || lower === "getmac /v") {
    return {
      lines: [
        "",
        "Endereço físico     Nome de transporte",
        "=================== ==========================================================",
        `${s.mac}   ${
          s.linkUp
            ? "\\Device\\Tcpip_{6847E957-24FC-497E-8DB1-67DCAA1A0326}"
            : "Mídia desconectada"
        }`,
        "",
      ],
      next: s,
      matched: "getmac",
    };
  }

  if (lower === "arp -a") {
    if (!s.linkUp || !s.ip) {
      return {
        lines: ["", "Nenhuma entrada ARP encontrada.", ""],
        next: s,
        matched: "arp",
      };
    }
    const rows: string[] = [];
    if (s.gatewayReachable) {
      rows.push(`  ${s.gateway.padEnd(22)}ec-be-dd-ab-db-6b     dinâmico`);
    }
    for (const h of s.liveHosts) {
      if (h === s.gateway) continue;
      rows.push(`  ${h.padEnd(22)}00-15-5d-00-0a-10     dinâmico`);
    }
    const bcast = `${s.ip.split(".").slice(0, 3).join(".")}.255`;
    rows.push(`  ${bcast.padEnd(22)}ff-ff-ff-ff-ff-ff     estático`);
    rows.push(`  ${"224.0.0.22".padEnd(22)}01-00-5e-00-00-16     estático`);
    return {
      lines: [
        "",
        `Interface: ${s.ip} --- 0x7`,
        "  Endereço IP           Endereço físico       Tipo",
        ...rows,
        "",
      ],
      next: s,
      matched: "arp",
    };
  }

  /* ------------------------------------------------------------ ipconfig */

  if (lower === "ipconfig") {
    return { lines: ipconfigShort(s), next: s, matched: "ipconfig" };
  }

  if (lower === "ipconfig /all") {
    return { lines: ipconfigAll(s), next: s, matched: "ipconfig /all" };
  }

  if (lower === "ipconfig /release" || lower === "ipconfig /renew") {
    const renew = lower.endsWith("renew");

    if (renew && !s.linkUp) {
      return {
        lines: [
          "",
          "Configuração de IP do Windows",
          "",
          "Nenhuma operação pode ser executada em Ethernet enquanto ela tiver sua",
          "mídia desconectada.",
          "",
        ],
        next: s,
        matched: "ipconfig /renew",
      };
    }

    // Máquina com IP fixo não participa de DHCP: o Windows recusa a operação.
    if (!s.dhcpEnabled) {
      return {
        lines: [
          "",
          "Configuração de IP do Windows",
          "",
          "A operação falhou porque nenhum adaptador está no estado permitido para",
          "esta operação.",
          "",
        ],
        next: s,
        matched: renew ? "ipconfig /renew" : "ipconfig /release",
      };
    }

    if (!renew) {
      s.ip = null;
      return {
        lines: [
          "",
          "Configuração de IP do Windows",
          "",
          ...adapterHeader(),
          field("Sufixo DNS específico de conexão"),
          field("Endereço IPv6 de link local", "fe80::b242:988:bd62:ba8d%7"),
          field("Gateway Padrão"),
          "",
        ],
        next: s,
        matched: "ipconfig /release",
      };
    }

    if (!s.dhcpServer) {
      s.ip = "169.254.87.13";
      return {
        lines: [
          "",
          "Configuração de IP do Windows",
          "",
          "Ocorreu um erro ao renovar a interface Ethernet: não foi possível contatar",
          "o servidor DHCP. Tempo limite da solicitação esgotado.",
          "",
        ],
        next: s,
        matched: "ipconfig /renew",
      };
    }

    s.ip = s.dhcpLeaseIp;
    return { lines: ipconfigShort(s), next: s, matched: "ipconfig /renew" };
  }

  if (lower === "ipconfig /flushdns") {
    if (s.dnsCacheStale) {
      s.dnsCacheStale = false;
      s.dnsStaleIp = null;
    }
    return {
      lines: [
        "",
        "Configuração de IP do Windows",
        "",
        "O cache do Resolvedor de DNS foi liberado com êxito.",
        "",
      ],
      next: s,
      matched: "ipconfig /flushdns",
    };
  }

  if (lower === "ipconfig /displaydns") {
    return { lines: displayDnsLines(s), next: s, matched: "ipconfig /displaydns" };
  }

  if (lower.startsWith("ipconfig")) {
    return {
      lines: ["", "Opção não suportada neste laboratório. Digite `help`.", ""],
      next: s,
      matched: null,
    };
  }

  /* ---------------------------------------------------------------- ping */

  if (lower.startsWith("ping")) {
    const target = cmd
      .split(" ")
      .slice(1)
      .filter((p) => !p.startsWith("-"))[0];
    if (!target) {
      return { lines: ["", "Uso: ping <ip ou nome>", ""], next: s, matched: null };
    }
    return { lines: pingLines(target, s), next: s, matched: pingLabel(target, s) };
  }

  if (lower.startsWith("tracert")) {
    const target = cmd.split(" ").filter((p) => !p.startsWith("-"))[1];
    if (!target) {
      return { lines: ["", "Uso: tracert <ip ou nome>", ""], next: s, matched: null };
    }
    return { lines: tracertLines(target, s), next: s, matched: "tracert" };
  }

  if (lower.startsWith("nslookup")) {
    const target = cmd.split(" ")[1] ?? (s.domain ?? "lab.local");
    return { lines: nslookupLines(target, s), next: s, matched: "nslookup" };
  }

  /* ------------------------------------------------------------- net use */

  if (lower === "net use") {
    return { lines: netUseList(s), next: s, matched: "net use" };
  }

  if (lower.startsWith("net use ")) {
    const parts = cmd.split(" ");
    const drive = parts[2];
    const path = parts[3];

    if (drive && parts.includes("/delete")) {
      delete s.mappedDrives[drive.toUpperCase()];
      return {
        lines: [`${drive.toUpperCase()} foi excluído com êxito.`, ""],
        next: s,
        matched: "net use",
      };
    }
    if (!drive || !path) {
      return {
        lines: ["", "Uso: net use Z: \\\\dc01\\Financeiro", ""],
        next: s,
        matched: null,
      };
    }
    if (!fileServerUp(s)) {
      return {
        lines: [
          "Erro do sistema 53.",
          "",
          "O caminho da rede não foi encontrado.",
          "",
        ],
        next: s,
        matched: "net use",
      };
    }
    s.mappedDrives[drive.toUpperCase()] = path;
    return { lines: ["O comando foi concluído com êxito.", ""], next: s, matched: "net use" };
  }

  /* ------------------------------------------------------------- nível 2 */

  if (lower.startsWith("nltest")) {
    const arg = cmd.split(" ").slice(1).join(" ").toLowerCase();
    if (!arg) {
      return {
        lines: ["", "Uso: nltest /sc_verify:lab.local  ou  nltest /dsgetdc:lab.local", ""],
        next: s,
        matched: null,
      };
    }
    return { lines: nltestLines(s, arg), next: s, matched: "nltest" };
  }

  if (lower.startsWith("w32tm")) {
    const resync = lower.includes("/resync");
    const status = lower.includes("/query");
    if (!resync && !status) {
      return {
        lines: ["", "Uso: w32tm /query /status   ou   w32tm /resync", ""],
        next: s,
        matched: null,
      };
    }
    const r = w32tmLines(s, lower, resync);
    if (r.fixed) s.timeSkewSeconds = 0;
    return { lines: r.lines, next: s, matched: resync ? "w32tm /resync" : "w32tm /query" };
  }

  if (lower === "klist") {
    return { lines: klistLines(s), next: s, matched: "klist" };
  }

  /**
   * Reingressar a estação sem sair do domínio: é o conserto do canal seguro,
   * e evita o velho ritual de tirar do domínio e colocar de novo.
   */
  if (lower.startsWith("reset-computermachinepassword")) {
    if (!s.domain) {
      return { lines: ["", "A máquina não está em domínio.", ""], next: s, matched: null };
    }
    if (!fileServerUp(s)) {
      return {
        lines: [
          "Reset-ComputerMachinePassword : Não foi possível contatar um controlador de",
          "domínio. Verifique a rede antes de tentar de novo.",
          "",
        ],
        next: s,
        matched: "reset-machinepassword",
      };
    }
    if (!s.elevated) {
      return {
        lines: [
          "Reset-ComputerMachinePassword : Acesso negado.",
          "",
          "Abra o PowerShell como administrador.",
          "",
        ],
        next: s,
        matched: "reset-machinepassword",
      };
    }
    s.trustBroken = false;
    return {
      lines: [
        "",
        "Senha da conta de computador redefinida no domínio.",
        "Confirme com: nltest /sc_verify:" + s.domain,
        "",
      ],
      next: s,
      matched: "reset-machinepassword",
    };
  }

  if (lower.startsWith("icacls")) {
    const path = cmd.split(" ")[1] ?? (s.acl?.path ?? "C:\\Dados");
    return { lines: icaclsLines(s, path), next: s, matched: "icacls" };
  }

  if (lower.startsWith("get-dhcpserverv4scope")) {
    return { lines: dhcpScopeLines(s), next: s, matched: "get-dhcpscope" };
  }

  if (lower.startsWith("sc query")) {
    const raw = cmd.split(" ").slice(2).join(" ");
    const svc = serviceKey(raw);
    if (!svc) {
      return { lines: ["", "Uso: sc query <serviço>  (ex.: sc query spooler)", ""], next: s, matched: null };
    }
    return { lines: scQueryLines(s, svc), next: s, matched: "sc query" };
  }

  if (lower.startsWith("net start") || lower.startsWith("net stop")) {
    const raw = cmd.split(" ").slice(2).join(" ");
    const svc = serviceKey(raw);
    if (!svc) {
      return { lines: ["", "Uso: net start <serviço>", ""], next: s, matched: null };
    }
    // Serviço é operação administrativa: sem elevação o Windows recusa, e essa
    // é uma lição de campo, não um detalhe.
    if (!s.elevated) {
      return {
        lines: [
          "Erro do sistema 5.",
          "",
          "Acesso negado.",
          "",
          "Dica: serviço se mexe em prompt aberto como administrador.",
          "",
        ],
        next: s,
        matched: lower.startsWith("net start") ? "net start" : "net stop",
      };
    }
    const isStart = lower.startsWith("net start");
    const key = svc.toLowerCase();
    const isSpooler = key === "spooler";

    if (isStart) {
      if (!isStopped(s, svc)) {
        return {
          lines: [
            `O serviço solicitado já foi iniciado.`,
            "",
            "Mais ajuda disponível ao digitar NET HELPMSG 2182.",
            "",
          ],
          next: s,
          matched: "net start",
        };
      }
      s.stoppedServices = s.stoppedServices.filter((x) => x.toLowerCase() !== key);
      // Subir o Spooler com a pasta de spool limpa é o que destrava a fila.
      if (isSpooler) s.printQueue = 0;
      return {
        lines: [
          `O serviço ${svc} está sendo iniciado.`,
          `O serviço ${svc} foi iniciado com êxito.`,
          "",
        ],
        next: s,
        matched: "net start",
      };
    }

    if (isStopped(s, svc)) {
      return {
        lines: [
          "O serviço não foi iniciado.",
          "",
          "Mais ajuda disponível ao digitar NET HELPMSG 3521.",
          "",
        ],
        next: s,
        matched: "net stop",
      };
    }
    s.stoppedServices = [...s.stoppedServices, svc];
    return {
      lines: [
        `O serviço ${svc} está sendo interrompido.`,
        `O serviço ${svc} foi interrompido com êxito.`,
        "",
      ],
      next: s,
      matched: "net stop",
    };
  }

  /* ---------------------------------------------------------------- GPO */

  if (lower === "gpupdate /force" || lower === "gpupdate") {
    if (!s.domain) {
      return {
        lines: ["", "A máquina não está em domínio. Nada a atualizar.", ""],
        next: s,
        matched: "gpupdate",
      };
    }
    // GPO precisa alcançar o controlador de domínio — chamado de GPO pode ser
    // chamado de rede disfarçado.
    if (!fileServerUp(s)) {
      return {
        lines: [
          "",
          "Atualizando a política...",
          "",
          "A atualização da política de computador falhou. Não foi possível localizar",
          "um controlador de domínio para o domínio.",
          "",
        ],
        next: s,
        matched: "gpupdate",
      };
    }
    s.gpoApplied = true;
    if (!s.mappedDrives["Z:"]) s.mappedDrives["Z:"] = `\\\\dc01\\${s.ou}`;
    return {
      lines: [
        "",
        "Atualizando a política...",
        "",
        "A atualização da política de computador foi concluída com êxito.",
        "A atualização da política de usuário foi concluída com êxito.",
        "",
      ],
      next: s,
      matched: "gpupdate",
    };
  }

  if (lower.startsWith("gpresult")) {
    if (!s.domain) {
      return {
        lines: ["", "INFO: a máquina não faz parte de um domínio.", ""],
        next: s,
        matched: "gpresult",
      };
    }
    const dcParts = s.domain.split(".").map((p) => `DC=${p}`).join(",");
    return {
      lines: [
        "",
        "Ferramenta de resultados de política de grupo v2.0 do Sistema operacional",
        "Microsoft (R) Windows (R)",
        "",
        `Dados RSOP para ${s.domain.split(".")[0].toUpperCase()}\\${s.user} em ${s.hostname} : modo de log`,
        "--------------------------------------------------------------------",
        "",
        "CONFIGURAÇÕES DO COMPUTADOR",
        "------------------------------",
        `    CN=${s.hostname},OU=Estacoes,${dcParts}`,
        "    Última vez em que a política de grupo foi aplicada: 30/07/2026 em 08:32:11",
        "    A política de grupo foi aplicada de:                dc01.lab.local",
        "",
        "    Objetos de política de grupo aplicados",
        "    ---------------------------------------",
        "        Default Domain Policy",
        ...(s.gpoApplied ? ["        GPO-Padrao-Estacoes"] : []),
        "",
        "CONFIGURAÇÕES DO USUÁRIO",
        "-------------------------",
        `    CN=${s.user},OU=${s.ou},${dcParts}`,
        "",
        "    Objetos de política de grupo aplicados",
        "    ---------------------------------------",
        s.gpoApplied ? `        GPO-${s.ou}-UnidadeZ` : "        N/A",
        "",
      ],
      next: s,
      matched: "gpresult",
    };
  }

  return {
    lines: [
      `'${cmd.split(" ")[0]}' não é reconhecido como um comando interno`,
      "ou externo, um programa operável ou um arquivo em lotes.",
      "",
      "Digite `help` para ver o que existe neste laboratório.",
      "",
    ],
    next: s,
    matched: null,
  };
}
