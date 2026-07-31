import type { MachineState, Scenario } from "./types";

/**
 * Cada cenário é um chamado real com uma máquina em estado quebrado.
 * O treino é: diagnosticar pelo terminal ANTES de responder qual é a causa.
 */

/**
 * Estado base: uma estação saudável do domínio. Cada cenário quebra uma coisa
 * a partir daqui.
 *
 * Exportado porque o sandbox de terminal e os testes do motor montam estado em
 * cima da MESMA base. Se cada um tivesse a sua, os três iam divergir em
 * silêncio e o teste deixaria de provar algo sobre o que roda no site.
 */
export function machine(over: Partial<MachineState> = {}): MachineState {
  return {
    hostname: "PC-FIN-07",
    user: "ana.souza",
    domain: "lab.local",
    ou: "Financeiro",
    mac: "00-15-5D-3A-1C-04",
    linkUp: true,
    ip: "10.10.10.112",
    mask: "255.255.255.0",
    gateway: "10.10.10.1",
    dns: ["10.10.10.10"],
    dhcpServer: "10.10.10.10",
    dhcpEnabled: true,
    dhcpLeaseIp: "10.10.10.112",
    gatewayReachable: true,
    internetReachable: true,
    dnsWorking: true,
    dnsCacheStale: false,
    dnsStaleIp: null,
    /** DC/DNS/DHCP e o servidor de aplicação: quem de fato responde na LAN. */
    liveHosts: ["10.10.10.1", "10.10.10.10", "10.10.10.20"],
    ipConflict: false,
    mappedDrives: { "Z:": "\\\\dc01\\Financeiro" },
    gpoApplied: true,
    stoppedServices: [],
    elevated: false,
    printerIp: null,
    printQueue: 0,
    trustBroken: false,
    timeSkewSeconds: 0,
    dhcpScope: null,
    acl: null,
    ...over,
  };
}

const midiaDesconectada: Scenario = {
  id: "midia-desconectada",
  title: "Uma máquina sem rede, o resto do setor normal",
  area: "redes",
  reporter: "Ana Souza · Financeiro",
  briefing:
    "Cheguei hoje e meu computador não abre nada da rede. O do meu colega ao lado está funcionando normal.",
  initial: machine({ linkUp: false, ip: null, mappedDrives: {}, gpoApplied: false }),
  expectedCommands: ["ipconfig /all", "ping loopback"],
  hint: "Comece pelo estado da placa antes de acusar serviço de rede. E teste a pilha da própria máquina com `ping 127.0.0.1` — se ela responde, o problema não é o Windows.",
  diagnoses: [
    {
      id: "fisico",
      label: "Camada física: cabo solto/partido ou porta do switch morta",
      correct: true,
      why: "Certo. 'Mídia desconectada' significa que a placa não vê link nenhum — não é IP, não é DHCP, não é DNS. Nem chega a existir endereço. Ação: testar outro cabo e outra porta do switch.",
    },
    {
      id: "dhcp",
      label: "O servidor DHCP caiu",
      why: "Se fosse DHCP, a placa teria link e o Windows geraria um 169.254.x.x. Sem link, nem a tentativa de pedir IP acontece.",
    },
    {
      id: "dns",
      label: "DNS configurado errado",
      why: "DNS quebrado ainda mostraria IP válido e responderia ping por IP. Aqui não existe endereço nenhum.",
    },
    {
      id: "provedor",
      label: "Link do provedor caiu",
      why: "Link do provedor derrubaria o setor inteiro, e o colega ao lado está funcionando. Escopo de uma máquina nunca aponta para fora.",
    },
  ],
  debrief:
    "Escopo de uma máquina só, e 'mídia desconectada' no ipconfig: isso fecha o diagnóstico na camada física em 10 segundos. Repare que `ipconfig /renew` aqui devolve erro dizendo que o cabo está desconectado — o próprio Windows te entrega a resposta.",
};

/**
 * O irmão do `midia-desconectada`, com a MESMA saída de terminal e causa
 * diferente. É de propósito: a lição é que `ipconfig` não separa cabo de porta
 * de placa, e o que separa é substituição. Por isso o briefing chega com o
 * teste físico já feito — igual a um chamado que volta da bancada.
 */
const placaRedeQueimada: Scenario = {
  id: "placa-rede-queimada",
  title: "Sem link depois de trocar cabo e porta",
  area: "hardware",
  reporter: "Diego Nunes · Almoxarifado",
  briefing:
    "Teve queda de energia ontem. Hoje esse PC não pega rede. Já troquei o cabo por um novo, mudei de porta no switch, e liguei o notebook na mesma porta com o mesmo cabo: o notebook navega normal.",
  initial: machine({
    hostname: "PC-ALM-07",
    user: "diego.nunes",
    ou: "Almoxarifado",
    mac: "00-15-5D-7C-42-9B",
    linkUp: false,
    ip: null,
    mappedDrives: {},
    gpoApplied: false,
  }),
  expectedCommands: ["ipconfig /all", "getmac"],
  hint: "A saída aqui é idêntica à de um cabo partido — e o cabo já foi trocado. Use o `getmac` para responder outra pergunta: o adaptador ainda **existe** para o Windows, ou desapareceu?",
  diagnoses: [
    {
      id: "placa",
      label: "Placa de rede da estação com defeito",
      correct: true,
      why: "Certo. O adaptador aparece com endereço físico e sem link, o cabo foi substituído, a porta foi trocada e outro equipamento funciona nessa mesma porta com esse mesmo cabo. Sobrou a placa. Ação: placa de rede USB ou PCIe como contorno imediato, e registrar a troca no inventário.",
    },
    {
      id: "cabo-porta",
      label: "Cabo partido ou porta do switch morta",
      why: "Seria o primeiro palpite — e o chamado já eliminou os dois: cabo novo, outra porta, e o notebook navegando na mesma porta com o mesmo cabo. Repetir teste já feito é o jeito mais rápido de perder a confiança de quem abriu o chamado.",
    },
    {
      id: "desabilitada",
      label: "Placa desabilitada no Windows",
      why: "Adaptador desabilitado **não aparece** na saída do `ipconfig`, e o `getmac` não listaria o endereço físico dele. Aqui ele aparece, com MAC, informando mídia desconectada — então está habilitado e sem link.",
    },
    {
      id: "dhcp",
      label: "A estação não está conseguindo endereço do DHCP",
      why: "Sem link não existe nem a tentativa de pedir endereço. Falha de DHCP com link presente produziria 169.254.x.x; aqui não há endereço nenhum, e o motivo é anterior a isso.",
    },
  ],
  debrief:
    "Este cenário existe para mostrar um limite: **`ipconfig` não distingue cabo, porta e placa** — a saída é a mesma nos três casos. Quem fecha o diagnóstico é a substituição, e ela vem de fora do terminal. Repare a ordem que o chamado seguiu: trocou o cabo (elimina o cabo), trocou a porta (elimina a porta), ligou outro equipamento na mesma porta e cabo (elimina o trecho até o switch). Cada passo eliminou uma hipótese sem gastar peça — e sobrou uma. Detalhe de campo: queda de energia é a origem clássica disso, e vale conferir se o resto da máquina passou ilesa. Sobre o contorno: placa USB resolve hoje; a decisão entre trocar a placa, a placa-mãe ou a máquina depende da idade do equipamento e do que o inventário diz sobre a garantia.",
};

const dhcpCaiu: Scenario = {
  id: "dhcp-caiu",
  title: "Setor inteiro com 169.254",
  area: "redes",
  reporter: "Marcos Lima · Comercial (3 pessoas)",
  briefing:
    "Ninguém aqui no Comercial consegue acessar o sistema nem a internet. São três máquinas, todas ao mesmo tempo, começou depois do almoço.",
  initial: machine({
    hostname: "PC-COM-03",
    user: "marcos.lima",
    ou: "Comercial",
    ip: "169.254.87.13",
    dhcpServer: null,
    // Sem DHCP não vem servidor DNS nenhum: o campo fica vazio de verdade.
    dns: [],
    gatewayReachable: false,
    internetReachable: false,
    dnsWorking: false,
    mappedDrives: {},
    gpoApplied: false,
  }),
  expectedCommands: ["ipconfig /all", "ipconfig /renew"],
  hint: "Leia o endereço com atenção — o Windows usa um rótulo diferente quando o endereço foi ele mesmo que inventou. Depois tente renovar.",
  diagnoses: [
    {
      id: "dhcp",
      label: "O serviço DHCP não está respondendo (ou o escopo esgotou)",
      correct: true,
      why: "Certo. APIPA em várias máquinas ao mesmo tempo = ninguém está conseguindo falar com o DHCP. O `/renew` confirma: 'não foi possível contatar o servidor DHCP'. Ação: verificar o serviço DHCP no servidor e se a faixa de IPs não esgotou.",
    },
    {
      id: "cabo",
      label: "Cabos soltos nas três máquinas",
      why: "Causa individual não explica sintoma simultâneo em três máquinas. E se fosse cabo, apareceria 'mídia desconectada', não 169.254.",
    },
    {
      id: "dns",
      label: "DNS fora do ar",
      why: "Com DNS quebrado você ainda teria IP válido e conseguiria ping por IP. Aqui o problema é anterior: não há endereço utilizável.",
    },
    {
      id: "provedor",
      label: "Link do provedor caiu",
      why: "O link caindo não impede o DHCP interno de entregar IP. Você veria IP normal e internet fora — não APIPA.",
    },
  ],
  debrief:
    "169.254 é sempre a mesma leitura: 'não consegui falar com o DHCP'. O que muda o diagnóstico é o escopo — em UMA máquina suspeite do caminho dela (cabo, porta); em VÁRIAS, suspeite do DHCP ou do switch que atende o grupo.",
};

const dnsServidorErrado: Scenario = {
  id: "dns-servidor-errado",
  title: "Tem rede, mas nenhum site abre",
  area: "redes",
  reporter: "Ana Souza · Financeiro",
  briefing:
    "A internet não funciona. Mas é estranho, porque o sistema interno pelo IP eu consigo acessar. Nenhum site abre pelo nome.",
  initial: machine({
    dns: ["10.10.10.99"],
    dnsWorking: false,
  }),
  expectedCommands: ["ipconfig /all", "ping internet", "ping nome", "nslookup"],
  hint: "Compare `ping 8.8.8.8` com `ping google.com`. A diferença nas duas mensagens é o diagnóstico.",
  diagnoses: [
    {
      id: "dns",
      label: "Servidor DNS configurado está errado ou fora do ar",
      correct: true,
      why: "Certo. Alcançar por IP e falhar por nome isola a falha na resolução. O `ipconfig /all` mostra DNS 10.10.10.99, que não é o DC (10.10.10.10), e o nslookup responde 'No response from server'. Ação: apontar o DNS correto.",
    },
    {
      id: "gateway",
      label: "Gateway errado",
      why: "Com gateway errado o `ping 8.8.8.8` não sairia da rede local — e ele responde normalmente.",
    },
    {
      id: "firewall",
      label: "Firewall do Windows bloqueando o navegador",
      why: "Firewall daria falha por porta ou aplicativo, não a mensagem 'não pôde encontrar o host', que é assinatura de resolução de nome.",
    },
    {
      id: "cabo",
      label: "Cabo com defeito",
      why: "Cabo ruim não deixaria o ping por IP responder com 0% de perda.",
    },
  ],
  debrief:
    "Grave o par: `ping 8.8.8.8` funciona + `ping google.com` falha = DNS. E note a mensagem — 'não pôde encontrar o host' (falha de nome) é diferente de 'esgotado o tempo limite' (achou o endereço, não obteve resposta). Ler qual das duas apareceu já resolve metade do chamado.",
};

/**
 * Cenário reescrito. A versão anterior fazia o `nslookup` FALHAR antes do
 * flushdns, o que é tecnicamente errado: o nslookup consulta o servidor direto e
 * não lê o cache do cliente. É exatamente por isso que ele serve para separar
 * "cache local sujo" de "servidor errado" — e o debrief dizia isso enquanto a
 * simulação fazia o contrário.
 *
 * Agora: o cache guarda o IP antigo (10.10.10.20, que morreu), então o `ping` por
 * nome vai para lá e volta inacessível, enquanto o `nslookup` já devolve o IP
 * novo. A divergência entre os dois É o diagnóstico.
 */
const dnsCacheVelho: Scenario = {
  id: "dns-cache-velho",
  title: "Um site interno abre a versão errada",
  area: "redes",
  reporter: "Paula Reis · RH",
  briefing:
    "O endereço da intranet mudou de servidor ontem, avisaram por e-mail. Na minha máquina continua tentando o antigo e dá erro. No celular pelo Wi-Fi funciona.",
  initial: machine({
    hostname: "PC-RH-02",
    user: "paula.reis",
    ou: "RH",
    // O servidor DNS está saudável e já publica o endereço novo.
    dnsWorking: true,
    // Mas o cache local ainda aponta para o servidor antigo, que foi desligado.
    dnsCacheStale: true,
    dnsStaleIp: "10.10.10.20",
    liveHosts: ["10.10.10.1", "10.10.10.10"],
  }),
  expectedCommands: ["ping nome", "nslookup", "ipconfig /displaydns", "ipconfig /flushdns"],
  hint: "Compare para onde o `ping intranet.lab.local` vai com o endereço que o `nslookup intranet.lab.local` devolve. Se os dois discordam, a pergunta é: quem está mentindo?",
  diagnoses: [
    {
      id: "cache",
      label: "Cache de DNS da máquina com registro velho",
      correct: true,
      why: "Certo. O `nslookup` devolve 10.10.10.10 — o endereço novo, direto do servidor. Mas o `ping` por nome vai para 10.10.10.20 e volta inacessível, porque a resolução do cliente usa o cache, e lá ainda está o registro antigo. O `ipconfig /displaydns` mostra a entrada suja. Corrige com `ipconfig /flushdns` — rode e teste o ping de novo.",
    },
    {
      id: "dns-errado",
      label: "Servidor DNS configurado está errado",
      why: "O `ipconfig /all` mostra DNS 10.10.10.10, o próprio controlador de domínio, e o `nslookup` responde certo. O servidor está correto e saudável.",
    },
    {
      id: "navegador",
      label: "Cache do navegador",
      why: "Suspeita razoável e vale testar depois — mas o `ping` também erra o endereço, e o ping não usa navegador. A falha está numa camada abaixo.",
    },
    {
      id: "servidor",
      label: "O servidor novo da intranet caiu",
      why: "Não: `ping 10.10.10.10` responde. O que não responde é o 10.10.10.20, o servidor antigo, que foi desligado justamente por causa da mudança.",
    },
  ],
  debrief:
    "A lição vale a aula inteira: `nslookup` fala com o SERVIDOR, `ping` obedece ao CACHE do cliente. Quando os dois discordam, o problema é local — e `ipconfig /flushdns` resolve. Quando os dois concordam e estão errados, o problema é o servidor. Esse par separa as duas causas em dez segundos.",
};

const linkProvedor: Scenario = {
  id: "link-provedor",
  title: "Empresa toda sem internet, rede interna funcionando",
  area: "redes",
  reporter: "Recepção · relato de vários setores",
  briefing:
    "Ninguém consegue abrir site nenhum. Mas o sistema interno e as pastas compartilhadas estão funcionando normal.",
  initial: machine({
    internetReachable: false,
    dnsWorking: false,
  }),
  // Agora o placar distingue o alvo: pingar só o gateway não prova nada aqui.
  expectedCommands: ["ipconfig /all", "ping gateway", "ping internet", "tracert"],
  hint: "Suba a escada um degrau por vez: primeiro o gateway, depois um IP fora da empresa. Onde ela quebra?",
  diagnoses: [
    {
      id: "link",
      label: "Saída para a internet: link do provedor ou o roteador de borda",
      correct: true,
      why: "Certo. IP válido, gateway responde, rede interna funciona — mas nada passa do gateway para fora. O tracert morre no primeiro salto depois dele. Ação: verificar o modem/roteador de borda e, confirmado, acionar a operadora com essa evidência.",
    },
    {
      id: "dhcp",
      label: "DHCP fora do ar",
      why: "As máquinas têm IP válido da faixa da empresa, não APIPA. O DHCP está entregando normalmente.",
    },
    {
      id: "dns",
      label: "Só o DNS caiu",
      why: "Suspeita razoável, mas teste: `ping 8.8.8.8` por IP também falha. Se fosse apenas DNS, o ping por IP passaria.",
    },
    {
      id: "estacao",
      label: "Problema na estação do usuário",
      why: "Escopo é a empresa inteira. Nada que seja da estação individual explica isso.",
    },
  ],
  debrief:
    "Esse é o caso em que o N1 acerta ao escalar — mas escala com evidência: 'IP válido, gateway responde, ping 8.8.8.8 falha, tracert para no salto seguinte ao gateway'. Chegar assim no provedor é diferente de ligar dizendo 'está sem internet'.",
};

const gpoUnidadeZ: Scenario = {
  id: "gpo-unidade-z",
  title: "Sumiu a unidade Z: do usuário",
  area: "ad",
  reporter: "Ana Souza · Financeiro",
  briefing:
    "Sempre tive uma pasta Z: no meu computador com os arquivos do setor. Hoje ela não aparece mais. A internet está funcionando.",
  initial: machine({
    mappedDrives: {},
    gpoApplied: false,
  }),
  expectedCommands: ["net use", "gpresult", "gpupdate"],
  hint: "A rede está boa, então o problema não é chegar no servidor. O que mais poderia criar essa unidade automaticamente todo dia — e como você vê se isso rodou?",
  diagnoses: [
    {
      id: "gpo",
      label: "A política de grupo que mapeia a unidade não foi aplicada nesta sessão",
      correct: true,
      why: "Certo. `net use` mostra a lista vazia e `gpresult /r` mostra que a GPO do setor não consta. `gpupdate /force` reaplica e a unidade volta. Rode os três neste terminal e veja a Z: reaparecer.",
    },
    {
      id: "permissao",
      label: "O usuário perdeu permissão na pasta",
      why: "Possível em outro cenário — mas aí a unidade apareceria com erro de acesso ao abrir, não desapareceria da lista. Vale checar o grupo dele depois.",
    },
    {
      id: "rede",
      label: "Problema de rede",
      why: "A rede está sã: IP válido, gateway e internet respondendo. Se fosse rede, o `net use` daria erro 53 (caminho não encontrado).",
    },
    {
      id: "servidor",
      label: "O servidor de arquivos caiu",
      why: "Servidor fora do ar daria erro ao tentar mapear manualmente. Teste: `net use Z: \\\\dc01\\Financeiro` funciona, então o servidor está de pé.",
    },
  ],
  debrief:
    "Dois comandos resolvem e são resposta direta de entrevista em ambiente com domínio: `gpupdate /force` reaplica as políticas, `gpresult /r` mostra quais foram aplicadas e de qual controlador. Mapear na mão com `net use` resolve o sintoma na hora, mas some no próximo logon — o certo é fazer a GPO aplicar.",
};

const ipConflito: Scenario = {
  id: "ip-conflito",
  title: "Rede caindo e voltando na mesma máquina",
  area: "redes",
  reporter: "Rafael Dias · Almoxarifado",
  briefing:
    "Meu computador fica entrando e saindo da rede o dia todo. Funciona um pouco, depois trava, depois volta. Já reiniciei três vezes.",
  initial: machine({
    hostname: "PC-ALM-01",
    user: "rafael.dias",
    ou: "Almoxarifado",
    ip: "10.10.10.50",
    dhcpEnabled: false,
    dhcpServer: null,
    dhcpLeaseIp: "10.10.10.50",
    ipConflict: true,
    gatewayReachable: false,
    internetReachable: false,
    dnsWorking: false,
    mappedDrives: {},
    gpoApplied: false,
  }),
  expectedCommands: ["ipconfig /all", "ping gateway"],
  hint: "O `ipconfig /all` tem dois campos que contam a história inteira: um diz de onde veio o endereço, o outro diz o que a rede achou dele.",
  diagnoses: [
    {
      id: "conflito",
      label: "Conflito de IP: outra máquina usa o mesmo endereço",
      correct: true,
      why: "Certo. O `ipconfig /all` mostra 'DHCP Habilitado: Não' — alguém digitou IP fixo na mão — e o endereço marcado como (Duplicado), que é o Windows dizendo que encontrou outra máquina com ele. Nesse estado o Windows desabilita o endereço, e é por isso que o `ping` no gateway volta 'Host de destino inacessível'. O usuário descreve como intermitente porque em alguns momentos a outra máquina está desligada e a rede volta.",
    },
    {
      id: "cabo",
      label: "Cabo mal crimpado causando perda de pacote",
      why: "Boa suspeita para intermitência, e vale checar depois — mas o `ipconfig /all` já entrega a causa antes de você ir à bancada.",
    },
    {
      id: "dhcp",
      label: "DHCP entregando endereços repetidos",
      why: "O DHCP não é o culpado aqui: essa máquina não está usando DHCP. O IP foi digitado na mão.",
    },
    {
      id: "placa",
      label: "Placa de rede com defeito",
      why: "Trocar peça é a última hipótese, não a primeira. Aqui a configuração explica o sintoma inteiro.",
    },
  ],
  debrief:
    "O outro sinal, que não aparece no terminal: o Windows mostra aviso de conflito de endereço na área de notificação e registra no Visualizador de Eventos. Correção: devolver a máquina para DHCP, ou — se ela realmente precisa de endereço fixo, como impressora e servidor — criar uma reserva por MAC no servidor DHCP. Reserva dá o mesmo resultado e mantém o controle centralizado. Repare que `ipconfig /renew` aqui é recusado: máquina com IP fixo não participa de DHCP.",
};

const spoolerTravado: Scenario = {
  id: "spooler-travado",
  title: "Ninguém do setor imprime, e a fila não anda",
  area: "impressao",
  reporter: "Marcos Lima · Comercial (2 pessoas)",
  briefing:
    "A impressora do Comercial parou. Mandei três documentos e ficaram parados na fila, e a Júlia também tentou e não saiu. A impressora está ligada e sem erro no painel. Você já abriu o prompt como administrador.",
  initial: machine({
    hostname: "PC-COM-05",
    user: "marcos.lima",
    ou: "Comercial",
    ip: "10.10.10.115",
    printerIp: "10.10.10.30",
    printQueue: 3,
    // A impressora responde na rede: o problema não é chegar até ela.
    liveHosts: ["10.10.10.1", "10.10.10.10", "10.10.10.20", "10.10.10.30"],
    // O serviço de spool caiu — é o que prende a fila.
    stoppedServices: ["Spooler"],
    // O chamado já diz que ele abriu prompt elevado: sem isso não dá para
    // mexer em serviço, e essa parte já foi ensinada na aula.
    elevated: true,
  }),
  expectedCommands: ["ping host local", "sc query", "net start"],
  hint: "A impressora está de pé e responde. Então a pergunta é: quem devia estar empurrando a fila para ela, e será que esse alguém está rodando?",
  diagnoses: [
    {
      id: "spooler",
      label: "O serviço Spooler de Impressão está parado",
      correct: true,
      why: "Certo. O `ping` na impressora responde, então rede e equipamento estão bem. O `sc query spooler` mostra ESTADO: 1 PARADO — sem o spool ninguém imprime e a fila não anda. `net start spooler` sobe o serviço e libera a fila. Rode os três aqui e veja.",
    },
    {
      id: "rede",
      label: "A impressora perdeu o endereço na rede",
      why: "Teste: `ping 10.10.10.30` responde com 0% de perda. Se ela tivesse perdido o endereço, ou estivesse fora, você veria 'Host de destino inacessível'.",
    },
    {
      id: "driver",
      label: "O driver de impressão corrompeu nas duas máquinas",
      why: "Driver não corrompe em duas máquinas na mesma hora, e driver ruim normalmente imprime lixo ou dá erro no aplicativo — não prende a fila inteira do setor.",
    },
    {
      id: "toner",
      label: "Acabou o toner ou o papel",
      why: "O chamado já diz que o painel está sem erro. Impressora sem papel ou sem toner avisa no painel, e é a primeira coisa a conferir antes de abrir o terminal.",
    },
  ],
  debrief:
    "Ordem que funciona em chamado de impressão: painel do equipamento, depois rede, depois fila, e só então serviço. E o serviço tem procedimento próprio — **parar** o Spooler, apagar o conteúdo de `C:\\Windows\\System32\\spool\\PRINTERS` e **iniciar** de novo. Tentar apagar o arquivo de spool com o serviço rodando não funciona, e é o erro clássico. Note também que mexer em serviço exige prompt de administrador: sem elevação o Windows devolve Erro 5, Acesso negado.",
};

/* ============================================================= nível 2 === */

const confiancaQuebrada: Scenario = {
  id: "confianca-quebrada",
  title: "«A relação de confiança entre esta estação e o domínio falhou»",
  area: "ad",
  reporter: "Escalado pelo N1 · estação do Comercial",
  briefing:
    "O N1 escalou: a usuária não loga com a conta de domínio e a tela mostra 'A relação de confiança entre esta estação de trabalho e o domínio principal falhou'. Ele já confirmou que a rede está boa e que a conta dela está normal no AD, e logou localmente para te entregar a máquina. Você está num prompt elevado.",
  initial: machine({
    hostname: "PC-COM-11",
    user: "julia.matos",
    ou: "Comercial",
    ip: "10.10.10.121",
    trustBroken: true,
    mappedDrives: {},
    gpoApplied: false,
    elevated: true,
  }),
  expectedCommands: ["nltest", "klist", "reset-machinepassword"],
  hint: "Existe um comando que testa exatamente a confiança entre a máquina e o domínio, e devolve êxito ou falha em uma linha. Comece confirmando que é isso, e não rede — o `nltest /dsgetdc` separa as duas coisas.",
  diagnoses: [
    {
      id: "canal",
      label: "A conta de computador da estação perdeu o canal seguro com o domínio",
      correct: true,
      why: "Certo. Isso não é a conta da usuária: é a conta da MÁQUINA no AD. Cada estação tem uma senha própria, renovada a cada 30 dias, e ela desincroniza quando a máquina volta de um restore de imagem, fica muito tempo desligada, ou alguém recriou o objeto no AD. O `nltest /sc_verify:lab.local` responde 'Verificação da confiança: Falhou'. Conserto sem tirar do domínio: `Reset-ComputerMachinePassword` em prompt elevado. Rode aqui e confirme com o nltest de novo.",
    },
    {
      id: "senha-usuaria",
      label: "A senha da usuária expirou",
      why: "O N1 já conferiu a conta no AD, e a mensagem é sobre a estação, não sobre credencial. Senha expirada produz outra tela, pedindo troca.",
    },
    {
      id: "rede",
      label: "A estação não está alcançando o controlador de domínio",
      why: "Suspeita correta de se levantar, e é o primeiro teste: `nltest /dsgetdc:lab.local` encontra o dc01 normalmente. Se não encontrasse, o erro seria 0x54b e o caminho seria rede, não confiança.",
    },
    {
      id: "reinstalar",
      label: "Precisa remover do domínio e ingressar de novo",
      why: "É o ritual mais executado e quase sempre desnecessário: derruba o perfil do usuário, exige reboot duplo e recria o objeto no AD. Só se justifica quando o reset da senha da conta de computador falha.",
    },
  ],
  debrief:
    "Guarde a distinção, porque é exatamente o que separa N1 de N2 aqui: existe a conta do USUÁRIO e existe a conta da MÁQUINA, e as duas têm senha. Essa mensagem é sempre sobre a segunda. E o conserto elegante é `Reset-ComputerMachinePassword`, não o desingressa-e-reingressa que a internet ensina — o ritual antigo funciona, mas cobra caro em perfil e em tempo de parada.",
};

const horaKerberos: Scenario = {
  id: "hora-kerberos",
  title: "Depois da troca da placa-mãe, ninguém loga naquela máquina",
  area: "ad",
  reporter: "Escalado pelo N1 · estação do Almoxarifado",
  briefing:
    "Trocamos a placa-mãe ontem. Hoje a máquina liga, tem rede, alcança o servidor, mas nenhuma conta de domínio entra — dá erro de credencial mesmo com a senha certa. O N1 já resetou a senha da usuária duas vezes, sem efeito. Prompt elevado disponível.",
  initial: machine({
    hostname: "PC-ALM-04",
    user: "rafael.dias",
    ou: "Almoxarifado",
    ip: "10.10.10.134",
    // Bateria da placa nova zerada: relógio 47 minutos atrasado.
    timeSkewSeconds: -2820,
    mappedDrives: {},
    gpoApplied: false,
    elevated: true,
  }),
  expectedCommands: ["w32tm /query", "klist", "w32tm /resync"],
  hint: "Rede boa, servidor alcançável, senha certa, e ainda assim a credencial é recusada. O Kerberos tem uma exigência que não é de rede nem de senha — e ela costuma quebrar justamente depois de mexer em hardware.",
  diagnoses: [
    {
      id: "hora",
      label: "O relógio da estação está fora da tolerância do Kerberos",
      correct: true,
      why: "Certo. O Kerberos usa o horário como parte da prova de autenticidade e recusa ticket com diferença acima de 5 minutos — o padrão é 300 segundos. A placa-mãe nova veio com a bateria e o relógio zerados, e a máquina ficou 47 minutos atrasada. O `w32tm /query /status` mostra a diferença; o `klist` mostra zero ticket em cache. Corrige com `w32tm /resync`.",
    },
    {
      id: "senha",
      label: "A senha da usuária está errada mesmo",
      why: "O N1 já resetou duas vezes sem efeito, e o erro atinge qualquer conta na máquina — não é credencial individual.",
    },
    {
      id: "confianca",
      label: "A relação de confiança da estação quebrou",
      why: "Boa hipótese vizinha, e vale testar: `nltest /sc_verify:lab.local` volta com Êxito. Quando é confiança, a mensagem na tela é específica sobre isso.",
    },
    {
      id: "placa",
      label: "A placa-mãe nova está com defeito",
      why: "Ela está funcionando: a máquina liga, tem rede e alcança o servidor. O que ela trouxe foi um efeito colateral de configuração, não um defeito.",
    },
  ],
  debrief:
    "Essa é a quarta causa de falha de logon, e quase ninguém sabe dela: além de conta bloqueada, desabilitada e senha expirada, existe **hora fora de sincronia**. A pista é sempre a mesma — aconteceu depois de mexer em hardware, depois de um restore de máquina virtual, ou depois de a máquina ficar meses desligada. Em ambiente de domínio a hora é hierárquica: as estações sincronizam com o controlador, e o controlador com uma fonte externa. Máquina que não sincroniza com o DC vira problema de autenticação, não de relógio.",
};

const permissaoNegar: Scenario = {
  id: "permissao-negar",
  title: "Usuária está no grupo certo e continua sem acessar a pasta",
  area: "windows",
  reporter: "Escalado pelo N1 · Financeiro",
  briefing:
    "O N1 já colocou a usuária no grupo GRP_Financeiro_Escrita, já confirmou que ela saiu e entrou de novo para pegar o grupo, e a pasta continua negando acesso. Ele conferiu que outras pessoas do mesmo grupo entram normalmente.",
  initial: machine({
    hostname: "PC-FIN-09",
    user: "ana.souza",
    ou: "Financeiro",
    ip: "10.10.10.119",
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
  expectedCommands: ["icacls", "whoami"],
  hint: "Liste a ACL da pasta e leia entrada por entrada. Existe um tipo de permissão que não soma com as outras: ele vence todas.",
  diagnoses: [
    {
      id: "negar",
      label: "Existe um Negar em outro grupo do qual ela também faz parte",
      correct: true,
      why: "Certo. O `icacls` mostra `LAB\\GRP_Estagiarios:(DENY)(W,Rc)`. Permissões de Permitir se **acumulam** entre grupos, mas **Negar vence Permitir** sempre. Ela está no grupo de escrita e também no de estagiários, então o Negar anula. Correção: tirar ela do grupo que tem o Negar, ou — melhor — revisar por que existe um Negar explícito ali, porque Negar é quase sempre sinal de permissão mal desenhada.",
    },
    {
      id: "grupo-nao-aplicou",
      label: "O grupo novo ainda não foi aplicado no token dela",
      why: "É a causa mais comum e por isso a primeira a descartar — mas o N1 já fez ela sair e entrar, o que renova o token. Se fosse isso, teria resolvido.",
    },
    {
      id: "share",
      label: "A permissão de compartilhamento está mais restritiva que a NTFS",
      why: "Vale conferir e é a pergunta clássica do N1 — mas aqui o acesso é local na pasta e o `icacls` já mostra a causa dentro da própria NTFS.",
    },
    {
      id: "heranca",
      label: "A herança de permissão foi quebrada na pasta",
      why: "Herança quebrada aparece quando a pasta não recebe o que o pai concede. Aqui a entrada do grupo de escrita está presente e correta; o problema é outra entrada, ativa e explícita.",
    },
  ],
  debrief:
    "Três regras de NTFS que resolvem quase todo chamado de permissão. Um: **Permitir acumula** — se a pessoa está em três grupos, ela ganha a soma. Dois: **Negar vence** qualquer Permitir, mesmo que venha de um grupo só. Três: permissão **explícita** na pasta prevalece sobre a **herdada** do pai. Na prática, use Negar o mínimo possível: ele cria exatamente esse chamado, em que tudo parece certo e nada funciona. E o caminho gráfico para chegar na mesma resposta é a aba Segurança, botão Avançado, aba Acesso Efetivo.",
};

const dhcpEscopoEsgotado: Scenario = {
  id: "dhcp-escopo-esgotado",
  title: "Metade do andar em 169.254 e o serviço DHCP está de pé",
  area: "redes",
  reporter: "Escalado pelo N1 · dois setores",
  briefing:
    "O N1 escalou dizendo que várias máquinas estão com 169.254, mas o serviço DHCP no servidor está rodando e outras estações pegaram IP normalmente. Você está no servidor.",
  initial: machine({
    hostname: "DC01",
    user: "administrador",
    ou: "TI",
    ip: "10.10.10.10",
    dhcpScope: {
      scopeId: "10.10.10.0",
      start: "10.10.10.100",
      end: "10.10.10.150",
      inUse: 51,
      free: 0,
    },
    elevated: true,
  }),
  expectedCommands: ["get-dhcpscope", "ipconfig /all"],
  hint: "O serviço estar rodando não significa que ele tem o que entregar. Olhe o escopo, não o serviço.",
  diagnoses: [
    {
      id: "escopo",
      label: "O escopo esgotou: não há endereço livre para conceder",
      correct: true,
      why: "Certo. O `Get-DhcpServerv4ScopeStatistics` mostra InUse 51, Free 0, 100% em uso. A faixa 10.10.10.100–150 dá 51 endereços, e a rede cresceu além disso — celular, notebook de visitante e impressora consomem concessão igual. O serviço está saudável; o estoque acabou. Por isso as estações caem em APIPA.",
    },
    {
      id: "servico",
      label: "O serviço DHCP precisa ser reiniciado",
      why: "Reiniciar não cria endereço. O serviço está rodando e concedendo para quem já tem concessão válida — o que falta é espaço na faixa.",
    },
    {
      id: "rede",
      label: "Problema de rede entre as estações e o servidor",
      why: "Se fosse rede, as outras estações do mesmo trecho também não pegariam IP. E o N1 já confirmou que algumas pegaram normalmente.",
    },
    {
      id: "conflito",
      label: "Conflito de IP na rede",
      why: "Conflito afeta endereços específicos e aparece como (Duplicado) no ipconfig da máquina afetada. Não produz APIPA em massa.",
    },
  ],
  debrief:
    "Três saídas, em ordem de qualidade. A rápida: **reduzir o tempo de concessão** — se está em 8 dias, baixar para 8 horas devolve endereço de quem só passou pelo escritório. A estrutural: **ampliar o escopo**, por exemplo 10.10.10.100–200, conferindo que a faixa ampliada não colide com endereço fixo nem com reserva. A definitiva: **separar redes** — visitante em Wi-Fi próprio, com escopo próprio, em vez de disputar a faixa da estação de trabalho. E uma prática que evita o chamado: reserve por MAC o que precisa de endereço estável (impressora, servidor) e mantenha essas reservas **fora** da faixa dinâmica.",
};

export const SCENARIOS: Scenario[] = [
  midiaDesconectada,
  placaRedeQueimada,
  dhcpCaiu,
  dnsServidorErrado,
  dnsCacheVelho,
  linkProvedor,
  gpoUnidadeZ,
  ipConflito,
  spoolerTravado,
  confiancaQuebrada,
  horaKerberos,
  permissaoNegar,
  dhcpEscopoEsgotado,
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
