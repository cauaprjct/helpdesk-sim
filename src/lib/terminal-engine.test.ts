import { describe, expect, it } from "vitest";
import { runCommand } from "./terminal-engine";
import { SCENARIOS, machine } from "@/content/scenarios";
import type { MachineState } from "@/content/types";

/**
 * Testes do motor do terminal.
 *
 * O motor é a peça que sustenta a credibilidade do simulador: se a saída não
 * for a que o Windows daria, o treino ensina errado. Estes testes travam três
 * coisas distintas:
 *
 *  1. FIDELIDADE — os rótulos e mensagens exatos do Windows 10 pt-BR. São os
 *     detalhes que já estiveram errados uma vez ("NetBIOS over Tcpip", timeout
 *     no lugar de "Host de destino inacessível") e que ninguém percebe olhando.
 *  2. CAUSALIDADE — a saída tem que decorrer do estado da máquina, não de um
 *     texto fixo. É a diferença entre simulador e screenshot.
 *  3. CONTRATO COM O CONTEÚDO — todo comando que um laboratório cobra como
 *     evidência tem que ser produzível naquele cenário. Renomear um rótulo do
 *     motor pode quebrar o placar de um lab em silêncio.
 */

/** Saída como texto único, para casar por trecho. */
function out(cmd: string, s: MachineState): string {
  return runCommand(cmd, s).lines.join("\n");
}

/** Roda uma sequência levando o estado de um comando para o próximo. */
function session(cmds: string[], start: MachineState) {
  let state = start;
  const outputs: string[] = [];
  for (const c of cmds) {
    const r = runCommand(c, state);
    state = r.next;
    outputs.push(r.lines.join("\n"));
  }
  return { state, outputs, last: outputs[outputs.length - 1] };
}

/**
 * Casa `Rótulo . . . . : valor` sem depender da largura exata do
 * preenchimento — o alinhamento é detalhe de formatação, o par
 * rótulo/valor é o contrato.
 */
function field(label: string, value = ""): RegExp {
  const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${esc(label)}[. ]*: ${esc(value)}`);
}

function scenario(id: string) {
  const found = SCENARIOS.find((s) => s.id === id);
  if (!found) throw new Error(`cenário inexistente: ${id}`);
  return found;
}

/* ====================================================== invariantes ====== */

describe("contrato da função", () => {
  it("não muta o estado recebido", () => {
    // Todo componente guarda o estado no React e conta com isso: se o motor
    // mutasse o objeto, o React não veria mudança e a tela mentiria.
    const s = machine({ elevated: true, dnsCacheStale: true, dnsStaleIp: "10.10.10.60" });
    const antes = JSON.stringify(s);

    runCommand("ipconfig /release", s);
    runCommand("ipconfig /flushdns", s);
    runCommand("net stop spooler", s);
    runCommand("gpupdate /force", s);
    runCommand("net use Z: \\\\dc01\\Financeiro", s);

    expect(JSON.stringify(s)).toBe(antes);
  });

  it("devolve um objeto novo, não o mesmo por referência", () => {
    const s = machine();
    expect(runCommand("hostname", s).next).not.toBe(s);
  });

  it("copia as coleções em profundidade suficiente para não vazar escrita", () => {
    const s = machine({ elevated: true });
    const r = runCommand("net use Z: \\\\dc01\\Financeiro", s);
    expect(r.next.mappedDrives).not.toBe(s.mappedDrives);
  });

  it("comando vazio não produz saída nem conta como evidência", () => {
    const r = runCommand("   ", machine());
    expect(r.lines).toEqual([]);
    expect(r.matched).toBeNull();
  });

  it("cls pede limpeza de tela", () => {
    expect(runCommand("cls", machine()).clear).toBe(true);
  });

  it("comando inexistente responde como o cmd responde", () => {
    const texto = out("fdisk", machine());
    expect(texto).toContain("'fdisk' não é reconhecido como um comando interno");
    expect(texto).toContain("ou externo, um programa operável ou um arquivo em lotes.");
  });

  it("normaliza espaço repetido e caixa alta", () => {
    const a = out("IPCONFIG    /ALL", machine());
    const b = out("ipconfig /all", machine());
    expect(a).toBe(b);
  });
});

/* ========================================================= ipconfig ====== */

describe("ipconfig", () => {
  it("estação saudável mostra IP, máscara e gateway", () => {
    const texto = out("ipconfig", machine());
    expect(texto).toMatch(field("Endereço IPv4", "10.10.10.112"));
    expect(texto).toMatch(field("Máscara de Sub-rede", "255.255.255.0"));
    expect(texto).toMatch(field("Gateway Padrão", "10.10.10.1"));
  });

  it("sem cabo mostra mídia desconectada e nenhum endereço", () => {
    const texto = out("ipconfig", machine({ linkUp: false }));
    expect(texto).toMatch(field("Estado da mídia", "mídia desconectada"));
    expect(texto).not.toContain("Endereço IPv4");
  });

  it("APIPA usa o rótulo próprio do Windows e máscara /16", () => {
    // O Windows não chama de "Endereço IPv4" o endereço que ele mesmo gerou.
    // Reconhecer esse rótulo é o que separa "sem DHCP" de "IP errado".
    const texto = out("ipconfig", machine({ ip: "169.254.87.13" }));
    expect(texto).toMatch(
      field("Endereço IPv4 de Configuração Automática", "169.254.87.13"),
    );
    expect(texto).not.toMatch(field("Endereço IPv4", "169.254.87.13"));
    // APIPA é sempre 255.255.0.0, mesmo que o estado diga outra coisa.
    expect(texto).toMatch(field("Máscara de Sub-rede", "255.255.0.0"));
    expect(texto).toMatch(field("Gateway Padrão", ""));
  });

  describe("/all", () => {
    it("traz host, MAC, DHCP e DNS", () => {
      const texto = out("ipconfig /all", machine());
      expect(texto).toMatch(field("Nome do host", "PC-FIN-07"));
      expect(texto).toMatch(field("Endereço Físico", "00-15-5D-3A-1C-04"));
      expect(texto).toMatch(field("DHCP Habilitado", "Sim"));
      expect(texto).toMatch(field("Servidor DHCP", "10.10.10.10"));
      expect(texto).toMatch(field("Servidores DNS", "10.10.10.10"));
    });

    it("escreve NetBIOS em Tcpip, não 'over Tcpip'", () => {
      // Erro de tradução que já esteve no motor. É o tipo de detalhe que
      // desmonta a credibilidade de quem conhece a ferramenta.
      const texto = out("ipconfig /all", machine());
      expect(texto).toMatch(field("NetBIOS em Tcpip", "Habilitado"));
      expect(texto).not.toContain("NetBIOS over Tcpip");
    });

    it("alinha o segundo servidor DNS sem repetir o rótulo", () => {
      const texto = out("ipconfig /all", machine({ dns: ["10.10.10.10", "8.8.8.8"] }));
      expect(texto).toMatch(field("Servidores DNS", "10.10.10.10"));
      expect(texto).toMatch(/^\s+8\.8\.8\.8$/m);
    });

    it("marca (Duplicado) quando há conflito de IP", () => {
      const texto = out("ipconfig /all", machine({ ipConflict: true }));
      expect(texto).toContain("10.10.10.112(Duplicado)");
      expect(texto).not.toContain("(Preferencial)");
    });

    it("marca (Preferencial) quando não há conflito", () => {
      expect(out("ipconfig /all", machine())).toContain("10.10.10.112(Preferencial)");
    });

    it("IP fixo não exibe concessão nem servidor DHCP", () => {
      const texto = out("ipconfig /all", machine({ dhcpEnabled: false, dhcpServer: null }));
      expect(texto).toMatch(field("DHCP Habilitado", "Não"));
      expect(texto).not.toContain("Concessão Obtida");
      expect(texto).not.toContain("Servidor DHCP");
    });

    it("sem cabo não inventa endereço nem concessão", () => {
      const texto = out("ipconfig /all", machine({ linkUp: false }));
      expect(texto).toMatch(field("Estado da mídia", "mídia desconectada"));
      expect(texto).toMatch(field("Endereço Físico", "00-15-5D-3A-1C-04"));
      expect(texto).not.toContain("Concessão Obtida");
    });
  });

  describe("/release e /renew", () => {
    it("release devolve o endereço e deixa a máquina sem IP", () => {
      const r = runCommand("ipconfig /release", machine());
      expect(r.next.ip).toBeNull();
    });

    it("renew com DHCP no ar entrega o endereço da concessão", () => {
      const s = machine({ ip: null, dhcpLeaseIp: "10.10.10.150" });
      const r = runCommand("ipconfig /renew", s);
      expect(r.next.ip).toBe("10.10.10.150");
      expect(r.lines.join("\n")).toMatch(field("Endereço IPv4", "10.10.10.150"));
    });

    it("renew sem servidor DHCP cai em APIPA e diz por quê", () => {
      const r = runCommand("ipconfig /renew", machine({ dhcpServer: null }));
      expect(r.next.ip).toMatch(/^169\.254\./);
      expect(r.lines.join("\n")).toContain(
        "Ocorreu um erro ao renovar a interface Ethernet: não foi possível contatar",
      );
    });

    it("renew em máquina de IP fixo é recusado pelo Windows", () => {
      // Não é erro de rede: o adaptador não participa de DHCP. Confundir os
      // dois manda o técnico investigar o servidor errado.
      const r = runCommand("ipconfig /renew", machine({ dhcpEnabled: false }));
      expect(r.lines.join("\n")).toContain(
        "A operação falhou porque nenhum adaptador está no estado permitido para",
      );
      expect(r.next.ip).toBe("10.10.10.112");
    });

    it("renew sem cabo avisa da mídia antes de falar de DHCP", () => {
      const texto = out("ipconfig /renew", machine({ linkUp: false }));
      expect(texto).toContain("Nenhuma operação pode ser executada em Ethernet enquanto ela tiver sua");
      expect(texto).not.toContain("servidor DHCP");
    });
  });

  it("/flushdns limpa o cache e reporta êxito", () => {
    const s = machine({ dnsCacheStale: true, dnsStaleIp: "10.10.10.60" });
    const r = runCommand("ipconfig /flushdns", s);
    expect(r.next.dnsCacheStale).toBe(false);
    expect(r.next.dnsStaleIp).toBeNull();
    expect(r.lines.join("\n")).toContain(
      "O cache do Resolvedor de DNS foi liberado com êxito.",
    );
  });

  it("/displaydns sem cache sujo diz que não há o que exibir", () => {
    expect(out("ipconfig /displaydns", machine())).toContain(
      "Não foi possível exibir o Cache do Resolvedor de DNS.",
    );
  });

  it("opção desconhecida não finge que funcionou", () => {
    const r = runCommand("ipconfig /registerdns", machine());
    expect(r.matched).toBeNull();
    expect(r.lines.join("\n")).toContain("Opção não suportada neste laboratório");
  });
});

/* ============================================================= ping ====== */

describe("ping", () => {
  it("loopback responde mesmo sem cabo — é teste da pilha, não da rede", () => {
    const texto = out("ping 127.0.0.1", machine({ linkUp: false, ip: null }));
    expect(texto).toContain("Resposta de 127.0.0.1: bytes=32");
    expect(texto).toContain("Perdidos = 0");
  });

  it("sem endereço utilizável a transmissão falha antes de sair da máquina", () => {
    const texto = out("ping 8.8.8.8", machine({ linkUp: false, ip: null }));
    expect(texto).toContain("PING: falha na transmissão. Erro geral.");
    expect(texto).toContain("Recebidos = 0");
  });

  it("sem rota é a própria máquina que responde, e o pacote conta como recebido", () => {
    // Sutileza real do Windows: "Host de destino inacessível" vem do próprio
    // host, então aparece 4 recebidos e 0% de perda. Quem espera 100% de perda
    // lê a saída errado.
    const texto = out("ping 8.8.8.8", machine({ gatewayReachable: false }));
    expect(texto).toContain("Resposta de 10.10.10.112: Host de destino inacessível.");
    expect(texto).toContain("Recebidos = 4, Perdidos = 0 (0% de");
  });

  it("caminho existe e ninguém responde é timeout, não inacessível", () => {
    const texto = out("ping 8.8.8.8", machine({ internetReachable: false }));
    expect(texto).toContain("Esgotado o tempo limite do pedido.");
    expect(texto).not.toContain("Host de destino inacessível");
    expect(texto).toContain("Perdidos = 4 (100% de");
  });

  it("host da sub-rede que não existe não responde só por estar na faixa", () => {
    // Antes, qualquer endereço da sub-rede respondia — o que contradizia os
    // cenários onde o servidor está fora.
    const texto = out("ping 10.10.10.77", machine());
    expect(texto).toContain("Host de destino inacessível.");
  });

  it("host da sub-rede que está no ar responde", () => {
    expect(out("ping 10.10.10.20", machine())).toContain(
      "Resposta de 10.10.10.20: bytes=32",
    );
  });

  it("ping por nome imprime o nome e o endereço resolvido", () => {
    // É a prova visual de que o DNS respondeu, e qual endereço ele deu.
    expect(out("ping intranet.lab.local", machine())).toContain(
      "Disparando intranet.lab.local [10.10.10.10] com 32 bytes de dados:",
    );
  });

  it("sem DNS funcionando o ping por nome falha na resolução, não na rede", () => {
    const texto = out("ping intranet.lab.local", machine({ dnsWorking: false }));
    expect(texto).toContain(
      "A solicitação ping não pôde encontrar o host intranet.lab.local.",
    );
  });

  it("APIPA não resolve nome", () => {
    const texto = out("ping google.com", machine({ ip: "169.254.87.13" }));
    expect(texto).toContain("não pôde encontrar o host google.com");
  });

  it("sem alvo mostra o uso e não conta evidência", () => {
    const r = runCommand("ping", machine());
    expect(r.matched).toBeNull();
    expect(r.lines.join("\n")).toContain("Uso: ping <ip ou nome>");
  });

  describe("rótulo de evidência distingue o alvo", () => {
    const s = machine();
    it.each([
      ["ping 127.0.0.1", "ping loopback"],
      ["ping 10.10.10.1", "ping gateway"],
      ["ping 10.10.10.20", "ping host local"],
      ["ping 8.8.8.8", "ping internet"],
      ["ping google.com", "ping nome"],
    ])("%s => %s", (cmd, label) => {
      expect(runCommand(cmd, s).matched).toBe(label);
    });
  });
});

/* ============================================== DNS: cache x servidor ==== */

describe("cache de DNS velho", () => {
  // O cenário inteiro depende desta separação: o `ping` obedece o cache do
  // cliente, o `nslookup` fala com o servidor. A divergência entre os dois É
  // o diagnóstico. Se o motor perder isso, o cenário passa a se contradizer.
  const cen = scenario("dns-cache-velho");
  const velho = cen.initial.dnsStaleIp!;

  it("o cenário realmente começa com cache sujo", () => {
    expect(cen.initial.dnsCacheStale).toBe(true);
    expect(velho).toBeTruthy();
    expect(velho).not.toBe("10.10.10.10");
  });

  it("ping por nome vai para o endereço velho", () => {
    expect(out("ping intranet.lab.local", cen.initial)).toContain(
      `intranet.lab.local [${velho}]`,
    );
  });

  it("nslookup devolve o endereço certo, porque ignora o cache do cliente", () => {
    const texto = out("nslookup intranet.lab.local", cen.initial);
    // Casa a linha de RESPOSTA, não a do servidor consultado — as duas usam o
    // rótulo `Address:` e aqui as duas valem 10.10.10.10.
    expect(texto).toMatch(/Nome:\s+intranet\.lab\.local\nAddress:\s+10\.10\.10\.10/);
    expect(texto).not.toContain(velho);
  });

  it("displaydns mostra o registro velho guardado", () => {
    const texto = out("ipconfig /displaydns", cen.initial);
    expect(texto).toContain("intranet.lab.local");
    expect(texto).toMatch(field("Registro (Host)", velho));
  });

  it("depois do flushdns o ping passa a ir para o endereço certo", () => {
    const { last } = session(
      ["ping intranet.lab.local", "ipconfig /flushdns", "ping intranet.lab.local"],
      cen.initial,
    );
    expect(last).toContain("intranet.lab.local [10.10.10.10]");
    expect(last).not.toContain(velho);
  });
});

describe("nslookup", () => {
  it("identifica o servidor pelo nome quando é o DC conhecido", () => {
    const texto = out("nslookup intranet", machine());
    expect(texto).toContain("Servidor:  dc01.lab.local");
    expect(texto).toContain("Não é resposta autoritativa:");
  });

  it("servidor desconhecido aparece como UnKnown, como no Windows", () => {
    expect(out("nslookup intranet", machine({ dns: ["8.8.8.8"] }))).toContain(
      "Servidor:  UnKnown",
    );
  });

  it("servidor que não responde produz No response from server", () => {
    expect(out("nslookup intranet", machine({ dnsWorking: false }))).toContain(
      "não encontrou intranet: No response from server",
    );
  });

  it("sem servidor DNS configurado não há a quem perguntar", () => {
    expect(out("nslookup intranet", machine({ dns: [] }))).toContain(
      "*** Não é possível encontrar o nome do servidor padrão",
    );
  });
});

describe("tracert", () => {
  it("mostra o gateway como primeiro salto e chega ao destino", () => {
    const texto = out("tracert 8.8.8.8", machine());
    expect(texto).toContain("10.10.10.1");
    expect(texto).toContain("Rastreamento concluído.");
  });

  it("com o link do provedor fora, para depois do gateway", () => {
    const texto = out("tracert 8.8.8.8", machine({ internetReachable: false }));
    expect(texto).toContain("10.10.10.1");
    expect(texto).toContain("Esgotado o tempo limite do pedido.");
  });

  it("sem gateway o primeiro salto já informa inacessível", () => {
    expect(out("tracert 8.8.8.8", machine({ gatewayReachable: false }))).toContain(
      "informa: Host de destino inacessível.",
    );
  });
});

/* ========================================================== net use ====== */

describe("net use", () => {
  it("lista vazia usa a frase exata do Windows", () => {
    const texto = out("net use", machine({ mappedDrives: {} }));
    expect(texto).toContain("Não existem entradas na lista.");
    expect(texto).not.toContain("Não há entradas");
  });

  it("lista o que está mapeado", () => {
    const texto = out("net use", machine());
    expect(texto).toContain("Z:");
    expect(texto).toContain("\\\\dc01\\Financeiro");
    expect(texto).toContain("Microsoft Windows Network");
  });

  it("mapeia uma unidade quando o servidor responde", () => {
    const r = runCommand("net use W: \\\\dc01\\Compras", machine({ mappedDrives: {} }));
    expect(r.next.mappedDrives["W:"]).toBe("\\\\dc01\\Compras");
    expect(r.lines.join("\n")).toContain("O comando foi concluído com êxito.");
  });

  it("servidor fora do ar dá erro 53, não erro de permissão", () => {
    // Erro 53 é caminho de rede; 5 é permissão. Trocar os dois manda o
    // técnico mexer em ACL quando o problema é rota.
    const semDc = machine({ liveHosts: ["10.10.10.1"] });
    const texto = out("net use W: \\\\dc01\\Compras", semDc);
    expect(texto).toContain("Erro do sistema 53.");
    expect(texto).toContain("O caminho da rede não foi encontrado.");
  });

  it("o servidor da LAN é alcançado sem depender do gateway", () => {
    // Está na mesma sub-rede: o gateway só entra para sair dela. Confundir os
    // dois faz o técnico culpar o roteador por um servidor derrubado — e
    // vice-versa.
    const semGateway = machine({ gatewayReachable: false, internetReachable: false });
    expect(out("net use W: \\\\dc01\\Compras", semGateway)).toContain(
      "O comando foi concluído com êxito.",
    );
  });

  it("remove o mapeamento com /delete", () => {
    const r = runCommand("net use Z: /delete", machine());
    expect(r.next.mappedDrives["Z:"]).toBeUndefined();
  });
});

/* ========================================================== serviço ====== */

describe("serviço e elevação", () => {
  const cen = scenario("spooler-travado");

  it("o cenário começa com o Spooler parado e fila presa", () => {
    expect(cen.initial.stoppedServices).toContain("Spooler");
    expect(cen.initial.printQueue).toBeGreaterThan(0);
  });

  it("sc query reflete o estado real do serviço", () => {
    expect(out("sc query spooler", cen.initial)).toContain("ESTADO                   : 1  PARADO");
    expect(out("sc query spooler", machine())).toContain("ESTADO                   : 4  EM_EXECUÇÃO");
  });

  // O cenário já entrega prompt elevado, porque o chamado diz que o técnico
  // abriu como administrador. Aqui o prompt comum é forçado de propósito.
  const semElevacao = { ...cen.initial, elevated: false };

  it("o cenário entrega prompt elevado, como o chamado descreve", () => {
    expect(cen.initial.elevated).toBe(true);
  });

  it("mexer em serviço sem elevação é acesso negado", () => {
    const texto = out("net start spooler", semElevacao);
    expect(texto).toContain("Erro do sistema 5.");
    expect(texto).toContain("Acesso negado.");
  });

  it("sem elevação o serviço continua parado", () => {
    expect(runCommand("net start spooler", semElevacao).next.stoppedServices).toContain(
      "Spooler",
    );
  });

  it("com elevação inicia o serviço e destrava a fila", () => {
    const r = runCommand("net start spooler", cen.initial);
    expect(r.next.stoppedServices).not.toContain("Spooler");
    expect(r.next.printQueue).toBe(0);
    expect(r.lines.join("\n")).toContain("foi iniciado com êxito.");
  });

  it("iniciar serviço que já roda avisa em vez de mentir", () => {
    expect(out("net start spooler", machine({ elevated: true }))).toContain(
      "O serviço solicitado já foi iniciado.",
    );
  });

  it("parar serviço já parado avisa em vez de mentir", () => {
    expect(out("net stop spooler", { ...cen.initial, elevated: true })).toContain(
      "O serviço não foi iniciado.",
    );
  });

  it("parar um serviço que roda muda o estado", () => {
    const r = runCommand("net stop spooler", machine({ elevated: true }));
    expect(r.next.stoppedServices).toContain("Spooler");
  });
});

/* ============================================================= GPO ======= */

describe("política de grupo", () => {
  it("gpresult usa a OU do estado, não uma OU fixa", () => {
    // Já esteve fixo em "Financeiro" e contradizia cenários de outros setores.
    const texto = out("gpresult /r", machine({ ou: "Compras", user: "bruno.dias" }));
    expect(texto).toContain("CN=bruno.dias,OU=Compras,DC=lab,DC=local");
    expect(texto).not.toContain("OU=Financeiro");
  });

  it("gpupdate sem alcançar o controlador falha e diz por quê", () => {
    // Chamado de GPO costuma ser chamado de rede disfarçado.
    const s = machine({ liveHosts: ["10.10.10.1"], gpoApplied: false });
    const r = runCommand("gpupdate /force", s);
    expect(r.lines.join("\n")).toContain(
      "A atualização da política de computador falhou. Não foi possível localizar",
    );
    // Falhou é falhou: não pode marcar a política como aplicada.
    expect(r.next.gpoApplied).toBe(false);
  });

  it("gpupdate bem-sucedido aplica a GPO e mapeia a unidade do setor", () => {
    const s = machine({ gpoApplied: false, mappedDrives: {}, ou: "Compras" });
    const r = runCommand("gpupdate /force", s);
    expect(r.next.gpoApplied).toBe(true);
    expect(r.next.mappedDrives["Z:"]).toBe("\\\\dc01\\Compras");
  });

  it("fora do domínio não há política a aplicar", () => {
    expect(out("gpresult /r", machine({ domain: null }))).toContain(
      "INFO: a máquina não faz parte de um domínio.",
    );
  });
});

/* =========================================================== nível 2 ==== */

describe("confiança com o domínio", () => {
  const cen = scenario("confianca-quebrada");

  it("o cenário começa com o canal seguro quebrado", () => {
    expect(cen.initial.trustBroken).toBe(true);
  });

  it("nltest /sc_verify aponta o erro do canal seguro", () => {
    const texto = out("nltest /sc_verify:lab.local", cen.initial);
    expect(texto).toContain("ERRO: 0x415 NERR_SetupNotJoined");
    expect(texto).toContain("Verificação da confiança: Falhou");
  });

  it("máquina saudável verifica com êxito", () => {
    expect(out("nltest /sc_verify:lab.local", machine())).toContain(
      "Verificação da confiança: Êxito",
    );
  });

  it("com o DC fora do ar o erro é de domínio inexistente, não de confiança", () => {
    // Os dois derrubam o logon, mas o conserto é oposto: um é rede/servidor,
    // o outro é a conta de computador da estação.
    const texto = out("nltest /sc_verify:lab.local", machine({ liveHosts: ["10.10.10.1"] }));
    expect(texto).toContain("ERROR_NO_SUCH_DOMAIN");
    expect(texto).not.toContain("NERR_SetupNotJoined");
  });

  it("klist não mostra ticket quando a confiança está quebrada", () => {
    expect(out("klist", cen.initial)).toContain(
      "Contagem de tíquetes armazenados em cache: 0",
    );
  });

  it("redefinir a senha da conta de computador exige elevação", () => {
    const semElevacao = { ...cen.initial, elevated: false };
    expect(out("Reset-ComputerMachinePassword", semElevacao)).toContain("Acesso negado.");
    expect(runCommand("Reset-ComputerMachinePassword", semElevacao).next.trustBroken).toBe(
      true,
    );
  });

  it("sem alcançar o DC não tenta redefinir — manda olhar a rede primeiro", () => {
    const texto = out("Reset-ComputerMachinePassword", {
      ...cen.initial,
      liveHosts: ["10.10.10.1"],
    });
    expect(texto).toContain("Não foi possível contatar um controlador de");
  });

  it("com elevação conserta a confiança, e o nltest confirma", () => {
    // O ciclo completo do cenário: diagnosticar, consertar, provar.
    const { state, last } = session(
      ["Reset-ComputerMachinePassword", "nltest /sc_verify:lab.local"],
      cen.initial,
    );
    expect(state.trustBroken).toBe(false);
    expect(last).toContain("Verificação da confiança: Êxito");
  });
});

describe("relógio e Kerberos", () => {
  const cen = scenario("hora-kerberos");

  it("o cenário começa fora da tolerância de 300s", () => {
    expect(Math.abs(cen.initial.timeSkewSeconds)).toBeGreaterThan(300);
  });

  it("w32tm mostra a diferença e avisa da tolerância do Kerberos", () => {
    const texto = out("w32tm /query /status", cen.initial);
    expect(texto).toContain(`Diferença medida contra a origem:`);
    expect(texto).toContain("AVISO: diferença acima da tolerância do Kerberos (300s por padrão).");
    expect(texto).toContain("Última hora de sincronização com êxito: não sincronizado");
  });

  it("dentro da tolerância não há aviso", () => {
    const texto = out("w32tm /query /status", machine({ timeSkewSeconds: 12 }));
    expect(texto).not.toContain("AVISO");
    expect(texto).toContain("Diferença medida contra a origem: +12s");
  });

  it("o deslocamento raiz é campo do protocolo e não acompanha o desvio local", () => {
    // Já foi derivado do skew por engano — dois números diferentes com nomes
    // parecidos. Aqui fica travado.
    const a = out("w32tm /query /status", machine({ timeSkewSeconds: 0 }));
    const b = out("w32tm /query /status", machine({ timeSkewSeconds: 4000 }));
    expect(a).toContain("Deslocamento raiz: 0.0312500s");
    expect(b).toContain("Deslocamento raiz: 0.0312500s");
  });

  it("resync zera a diferença quando o DC responde", () => {
    const r = runCommand("w32tm /resync", cen.initial);
    expect(r.next.timeSkewSeconds).toBe(0);
    expect(r.lines.join("\n")).toContain("O comando foi concluído com êxito.");
  });

  it("resync sem a fonte de hora não conserta nem mente", () => {
    const r = runCommand(
      "w32tm /resync",
      machine({ timeSkewSeconds: 900, liveHosts: ["10.10.10.1"] }),
    );
    expect(r.next.timeSkewSeconds).toBe(900);
    expect(r.lines.join("\n")).toContain(
      "O computador não ressincronizou porque nenhum dado de hora estava disponível.",
    );
  });

  it("relógio fora da tolerância derruba o ticket Kerberos", () => {
    expect(out("klist", cen.initial)).toContain(
      "Contagem de tíquetes armazenados em cache: 0",
    );
  });

  it("máquina saudável tem ticket em cache", () => {
    const texto = out("klist", machine());
    expect(texto).toContain("Contagem de tíquetes armazenados em cache: 2");
    expect(texto).toContain("krbtgt/LAB.LOCAL");
  });
});

describe("permissão", () => {
  const cen = scenario("permissao-negar");

  it("o cenário tem uma ACL com negação explícita", () => {
    expect(cen.initial.acl).toBeTruthy();
    expect(cen.initial.acl!.entries.some((e) => e.deny)).toBe(true);
  });

  it("icacls marca a entrada de negação", () => {
    expect(out(`icacls ${cen.initial.acl!.path}`, cen.initial)).toContain("(DENY)");
  });

  it("icacls fecha com a contagem de arquivos processados", () => {
    expect(out("icacls C:\\Dados", cen.initial)).toContain(
      "Processados 1 arquivos; falha ao processar 0 arquivos",
    );
  });

  it("sem ACL no cenário o comando responde acesso negado", () => {
    const texto = out("icacls C:\\Dados", machine());
    expect(texto).toContain("Acesso negado.");
    expect(texto).toContain("falha ao processar 1 arquivos");
  });

  it("whoami mostra domínio\\usuário em minúsculas", () => {
    expect(out("whoami", machine())).toContain("lab\\ana.souza");
  });

  it("fora do domínio o whoami usa o nome da máquina", () => {
    expect(out("whoami", machine({ domain: null }))).toContain("pc-fin-07\\ana.souza");
  });
});

describe("escopo DHCP", () => {
  const cen = scenario("dhcp-escopo-esgotado");

  it("o cenário expõe um escopo sem endereço livre", () => {
    expect(cen.initial.dhcpScope).toBeTruthy();
    expect(cen.initial.dhcpScope!.free).toBe(0);
  });

  it("a estatística mostra 100% em uso e avisa do esgotamento", () => {
    const texto = out("Get-DhcpServerv4ScopeStatistics", cen.initial);
    expect(texto).toContain("100");
    expect(texto).toContain("AVISO: escopo esgotado.");
  });

  it("escopo com folga não emite aviso", () => {
    const s = machine({
      dhcpScope: {
        scopeId: "10.10.10.0",
        start: "10.10.10.100",
        end: "10.10.10.200",
        inUse: 50,
        free: 51,
      },
    });
    expect(out("Get-DhcpServerv4ScopeStatistics", s)).not.toContain("AVISO");
  });

  it("cenário sem servidor exposto diz isso, em vez de inventar número", () => {
    expect(out("Get-DhcpServerv4ScopeStatistics", machine())).toContain(
      "Este cenário não expõe o servidor DHCP.",
    );
  });
});

/* ============================================ contrato com o conteúdo ==== */

/** Comandos que um técnico plausivelmente tentaria, para sondar o motor. */
function probes(s: MachineState): string[] {
  const localHost =
    s.printerIp ?? s.liveHosts.find((h) => h !== s.gateway) ?? "10.10.10.20";
  return [
    "ipconfig",
    "ipconfig /all",
    "ipconfig /release",
    "ipconfig /renew",
    "ipconfig /flushdns",
    "ipconfig /displaydns",
    "ping 127.0.0.1",
    `ping ${s.gateway}`,
    `ping ${localHost}`,
    "ping 8.8.8.8",
    "ping intranet.lab.local",
    "tracert 8.8.8.8",
    "nslookup intranet.lab.local",
    "getmac",
    "arp -a",
    "net use",
    "net use W: \\\\dc01\\Compras",
    "sc query spooler",
    "net start spooler",
    "net stop spooler",
    "gpupdate /force",
    "gpresult /r",
    "hostname",
    "whoami",
    "nltest /sc_verify:lab.local",
    "nltest /dsgetdc:lab.local",
    "klist",
    "w32tm /query /status",
    "w32tm /resync",
    "Reset-ComputerMachinePassword",
    "icacls C:\\Dados",
    "Get-DhcpServerv4ScopeStatistics",
  ];
}

describe("todo comando cobrado como evidência é produzível no cenário", () => {
  // O laboratório mostra um placar de evidência com `expectedCommands`. Se um
  // rótulo do motor mudar, o placar de algum lab nunca fecha e ninguém percebe
  // — o aluno é que fica achando que errou.
  it.each(SCENARIOS.map((s) => [s.id, s] as const))("%s", (_id, cen) => {
    const alcancados = new Set(
      probes(cen.initial)
        .map((c) => runCommand(c, cen.initial).matched)
        .filter((m): m is string => m !== null),
    );
    const faltando = cen.expectedCommands.filter((c) => !alcancados.has(c));
    expect(faltando).toEqual([]);
  });
});

describe("help", () => {
  it("lista os comandos que o motor de fato reconhece", () => {
    const texto = out("help", machine());
    for (const c of ["ipconfig /all", "nslookup", "sc query", "klist", "icacls"]) {
      expect(texto).toContain(c);
    }
  });

  it("responde a ajuda e ? também", () => {
    expect(out("ajuda", machine())).toBe(out("help", machine()));
    expect(out("?", machine())).toBe(out("help", machine()));
  });
});
