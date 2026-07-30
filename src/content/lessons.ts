import type { Lesson } from "./types";

/**
 * A camada que faltava: ensinar ANTES de cobrar.
 *
 * Regra de escrita destas aulas:
 * - explicar o porquê, não só o que;
 * - mostrar o sintoma que cada conceito produz na tela, porque é assim que
 *   aparece num chamado real;
 * - toda seção termina apontando o que vai ser cobrado depois.
 */

const redesN1: Lesson = {
  id: "redes-n1",
  level: 1,
  area: "redes",
  title: "Redes para suporte N1",
  summary:
    "O mapa físico, o vocabulário de endereçamento e a sequência de diagnóstico. É o recorte exato que a vaga pede — nada de VLAN, sub-rede na mão ou roteamento.",
  minutes: 14,
  nextQuizId: "redes-n1",
  nextLabIds: [
    "midia-desconectada",
    "dhcp-caiu",
    "dns-servidor-errado",
    "dns-cache-velho",
    "link-provedor",
    "ip-conflito",
  ],
  blocks: [
    {
      kind: "p",
      text: "Isto não é um curso de redes. É o pedaço que um técnico de informática usa todo dia: entender por onde o pacote passa, ler o que o `ipconfig` mostra e isolar a falha por eliminação. Roteamento avançado, VLAN e cálculo de sub-rede ficam fora de propósito.",
    },

    { kind: "h", text: "1. O mapa físico — sem isso nenhum comando faz sentido" },
    {
      kind: "p",
      text: "Antes de decorar comando, você precisa do desenho do caminho na cabeça. Um pacote saindo do PC de um usuário até um site passa por seis camadas, e **cada uma falha de um jeito diferente**:",
    },
    {
      kind: "steps",
      items: [
        "**Placa de rede** do PC — onde o tráfego nasce. Tem um endereço físico fixo, o MAC.",
        "**Cabo ou Wi-Fi** — o meio. Cabo falha fisicamente; Wi-Fi falha por distância e interferência.",
        "**Switch** — distribui a rede dentro do prédio. Se ele cai, cai o setor inteiro.",
        "**Roteador / firewall** — a porta de saída para fora. Normalmente é ele que também entrega os IPs.",
        "**Modem / link do provedor** — a conexão que sai do prédio. Se cai, cai todo mundo.",
        "**Internet**",
      ],
    },
    {
      kind: "p",
      text: "O valor prático desse mapa é permitir diagnóstico por eliminação. Compare o **escopo** do sintoma com a camada correspondente:",
    },
    {
      kind: "table",
      head: ["Sintoma", "Escopo", "Onde olhar"],
      rows: [
        ["1 PC sem rede, resto normal", "Local", "Cabo, porta do switch, placa, IP da máquina"],
        ["1 sala ou setor sem rede", "Regional", "Switch daquele setor, access point daquela área"],
        ["Todos sem internet, rede interna ok", "Saída", "Roteador, firewall, link do provedor"],
        ["Todos sem nada", "Total", "Energia, switch principal, roteador"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "A primeira pergunta de qualquer chamado de rede é: isso afeta 1 pessoa ou todo mundo? A resposta já elimina metade das causas antes de você testar qualquer coisa.",
    },
    {
      kind: "p",
      text: "Repare que é a mesma pergunta que você já faz em impressora e em sistema. O que costuma faltar é aplicar com o mapa físico na cabeça, e é isso que faz alguém culpar o provedor quando o Wi-Fi caiu em uma sala só.",
    },

    { kind: "h", text: "2. Endereçamento — o vocabulário obrigatório" },
    {
      kind: "term",
      term: "IP (endereço)",
      def: "A identificação do aparelho na rede, tipo `192.168.0.15`. Dentro da mesma rede local, cada aparelho precisa de um IP único.",
      note: "Dois aparelhos com o mesmo IP = conflito, e os dois ficam instáveis.",
    },
    {
      kind: "term",
      term: "Máscara de sub-rede",
      def: "Define qual pedaço do IP identifica a rede e qual identifica o aparelho. Com `255.255.255.0`, todos que começam com `192.168.0.` estão na mesma rede e conversam direto.",
      note: "Uma máquina em 192.168.1.x com essa máscara está em outra rede e não vê as demais.",
    },
    {
      kind: "term",
      term: "Gateway",
      def: "O endereço do roteador — a porta de saída. Quando o PC quer falar com algo fora da rede local, entrega o pacote ao gateway.",
      note: "Gateway errado ou ausente: rede local funciona, internet não.",
    },
    {
      kind: "term",
      term: "DNS",
      def: "Traduz nome em IP (`google.com` → `142.250.79.14`). É a lista telefônica da rede.",
      note: "DNS quebrado é o sintoma mais enganoso: a internet 'funciona', mas nenhum site abre.",
    },
    {
      kind: "term",
      term: "DHCP",
      def: "O serviço (quase sempre no roteador ou no servidor) que entrega IP, máscara, gateway e DNS automaticamente para quem se conecta.",
      note: "Sem ele, você configuraria os quatro campos à mão em cada máquina.",
    },
    {
      kind: "term",
      term: "APIPA — a faixa 169.254.x.x",
      def: "Quando o PC pede IP ao DHCP e NÃO recebe resposta, o Windows não fica sem endereço: ele mesmo inventa um em 169.254.x.x. Esse endereço fala só com a rede local imediata e nunca dá internet.",
      note: "Ver 169.254 significa exatamente uma coisa: não consegui falar com o DHCP.",
    },
    {
      kind: "p",
      text: "APIPA é o conceito de maior retorno desta aula, porque aparece em chamado toda semana e a leitura é sempre a mesma. O que muda é a causa, nesta ordem de frequência:",
    },
    {
      kind: "steps",
      items: [
        "Cabo solto, mal crimpado ou partido",
        "Porta do switch morta, ou switch desligado",
        "Serviço DHCP do servidor/roteador caiu",
        "Faixa de IPs do DHCP esgotada (rede cheia de dispositivos)",
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Cruzando com o escopo da seção 1: 169.254 em UMA máquina aponta para o caminho dela (cabo, porta). Em VÁRIAS, aponta para o DHCP ou para o switch que atende o grupo.",
    },
    {
      kind: "p",
      text: "E existe um caso vizinho que confunde: se o cabo está desconectado, o Windows nem chega a pedir IP. Aí não aparece 169.254 — aparece **mídia desconectada**, e não existe endereço nenhum. Duas telas diferentes, dois diagnósticos diferentes.",
    },

    { kind: "h", text: "3. Os comandos, e a ordem que resolve quase tudo" },
    {
      kind: "table",
      head: ["Comando", "O que faz", "Quando usar"],
      rows: [
        ["`ipconfig`", "IP, máscara e gateway, resumido", "Primeira olhada"],
        ["`ipconfig /all`", "Tudo: + DNS, MAC, DHCP, concessão", "Diagnóstico de verdade"],
        ["`ipconfig /release`", "Devolve o IP obtido do DHCP", "Antes de renovar"],
        ["`ipconfig /renew`", "Pede um IP novo ao DHCP", "Corrigir 169.254 ou IP errado"],
        ["`ipconfig /flushdns`", "Limpa o cache de DNS da máquina", "Site não abre, ou abre versão antiga"],
        ["`ping <ip ou nome>`", "Testa se alcança um destino", "Teste básico de alcance"],
        ["`tracert <destino>`", "Mostra o caminho salto por salto", "Descobrir ONDE o caminho quebra"],
        ["`ipconfig /displaydns`", "Mostra o que está guardado no cache", "Provar que o cache está sujo"],
        ["`nslookup <nome>`", "Pergunta ao servidor DNS direto", "Confirmar se o problema é DNS"],
        ["`ping 127.0.0.1`", "Testa a pilha TCP/IP da própria máquina", "Descartar o Windows antes da rede"],
        ["`getmac`", "Endereço MAC das placas", "Cadastrar máquina, reserva no DHCP"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Detalhe que quase ninguém sabe e vale ponto: **o `nslookup` não usa o cache da máquina**, ele pergunta ao servidor direto. O `ping`, sim, obedece ao cache. Então quando os dois discordam — nslookup devolve um IP e o ping vai para outro — o problema é o cache local, e `ipconfig /flushdns` resolve. Quando os dois concordam e estão errados, o problema é o servidor.",
    },
    {
      kind: "p",
      text: "Agora a parte que vale mais que a tabela. Existe uma sequência de quatro passos, e cada passo elimina uma camada diferente:",
    },
    {
      kind: "cmd",
      caption: "A sequência de diagnóstico de 'não tenho internet'",
      lines: [
        "1) ipconfig /all        -> tenho endereço válido?",
        "                           169.254 ou vazio: pare aqui, é DHCP/cabo.",
        "",
        "2) ping <gateway>       -> alcanço meu roteador?",
        "                           falhou: problema local (cabo, switch, placa).",
        "",
        "3) ping 8.8.8.8         -> saio para a internet por IP?",
        "                           falhou: link do provedor ou roteador de borda.",
        "",
        "4) ping google.com      -> resolvo nomes?",
        "                           passo 3 ok e este falhou: é DNS.",
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Decore este par: ping por IP funciona + ping por nome falha = DNS. É a pergunta de entrevista mais previsível da área, e a resposta cabe em uma frase.",
    },
    {
      kind: "callout",
      tone: "warn",
      text: "E saiba a ressalva, porque ela te diferencia: **ping que falha não é veredito absoluto.** ICMP — o protocolo que o ping usa — costuma ser bloqueado por firewall, e servidor que não responde a ping pode estar perfeitamente de pé atendendo na porta dele. Quando o ping falha mas o serviço parece vivo, o teste certo é a **porta**: `Test-NetConnection <host> -Port 443` no PowerShell. Dizer isso numa entrevista mostra que você entende o limite da própria ferramenta.",
    },
    {
      kind: "p",
      text: "As mensagens do próprio `ping` também são diagnóstico, e muita gente ignora. Compare:",
    },
    {
      kind: "cmd",
      caption: "Duas falhas que parecem iguais e não são",
      lines: [
        "C:\\>ping google.com",
        "A solicitação ping não pôde encontrar o host google.com.",
        "   -> nem chegou a disparar pacote: falhou em TRADUZIR o nome. DNS.",
        "",
        "C:\\>ping 8.8.8.8",
        "Esgotado o tempo limite do pedido.",
        "   -> sabia para onde ir, mandou, e ninguem respondeu. Caminho/link.",
        "",
        "C:\\>ping 10.10.10.99",
        "Resposta de 10.10.10.112: Host de destino inacessivel.",
        "   -> quem respondeu foi a SUA maquina: nao existe rota para la.",
        "      Note que o IP que responde e o seu, nao o do destino.",
      ],
    },
    {
      kind: "p",
      text: "São três mensagens diferentes para três causas diferentes, e a terceira engana muita gente porque parece resposta — mas quem respondeu foi a sua própria máquina dizendo que não sabe o caminho. Repare também que o `ping` por nome imprime o IP entre colchetes: `Disparando google.com [142.250.79.14]`. Esse colchete é a prova de que o DNS resolveu, e para qual endereço.",
    },

    { kind: "h", text: "4. Wi-Fi e cabeamento" },
    {
      kind: "p",
      text: "**2.4 GHz vs 5 GHz** é um troca-troca: 2.4 GHz alcança mais longe e atravessa parede melhor, mas é lento e congestionado — micro-ondas, telefone sem fio e o Wi-Fi de todos os vizinhos estão nessa faixa. 5 GHz é rápido e limpo, mas morre na parede de concreto.",
    },
    {
      kind: "p",
      text: "Quando o Wi-Fi cai só numa área, as causas prováveis são distância do access point, obstáculo (concreto, laje, armário de metal, espelho, elevador), interferência de canal, ou excesso de dispositivos no mesmo AP. A solução típica em empresa é **adicionar access point, mudar o canal ou reposicionar** — não trocar de provedor.",
    },
    {
      kind: "term",
      term: "Cabo direto (straight-through)",
      def: "Mesma pinagem nas duas pontas. É o que se usa em 95% dos casos: PC↔switch, switch↔roteador. No Brasil o padrão de mercado é T568B.",
    },
    {
      kind: "term",
      term: "Cabo crossover",
      def: "Pinagem invertida numa ponta, criado para ligar equipamentos iguais direto (PC↔PC). Hoje é praticamente obsoleto, porque equipamento moderno tem auto-MDI/MDIX e se ajusta sozinho.",
    },
    {
      kind: "callout",
      tone: "warn",
      text: "A pegadinha do cabeamento: 'qualquer ordem funciona, desde que seja igual nas duas pontas'. Dá link, sim — mas os fios são trançados em pares específicos para cancelar interferência. Embaralhado, o cabo perde pacote, não atinge gigabit e falha em trecho longo. É o defeito que volta como chamado semanas depois e é o mais difícil de achar.",
    },
    {
      kind: "cmd",
      caption: "Ordem T568B, da esquerda para a direita com o clipe para baixo",
      lines: [
        "1 branco-laranja   5 branco-azul",
        "2 laranja          6 verde",
        "3 branco-verde     7 branco-marrom",
        "4 azul             8 marrom",
      ],
    },
    {
      kind: "p",
      text: "Categorias: **Cat5e** vai a 1 Gbps e resolve escritório. **Cat6** chega a 10 Gbps só em trecho curto, até cerca de 55 m. **Cat6a** sustenta 10 Gbps nos 100 m inteiros. O limite de **100 metros por trecho** vale para todas — na prática 90 m de cabo fixo mais 10 m de patch cord nas duas pontas. Acima disso precisa de switch no meio.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Leia isto uma vez, sem tentar decorar. Depois vá para os laboratórios: lá você provoca cada sintoma desta aula e vê a tela real. Ver o 169.254 aparecer na sua frente fixa melhor que reler dez vezes. O questionário vem por último, para conferir o que ficou.",
    },
  ],
};

const helpdeskConceitos: Lesson = {
  id: "helpdesk-conceitos",
  level: 1,
  area: "helpdesk",
  title: "Conceitos de help desk",
  summary:
    "Incidente vs requisição, ciclo de vida do chamado, prioridade, SLA, escalonamento e o vocabulário que aparece nas vagas. Não depende de máquina nenhuma.",
  minutes: 12,
  nextQuizId: "helpdesk-conceitos",
  nextLabIds: [],
  blocks: [
    {
      kind: "p",
      text: "Esta é a parte que separa 'sei mexer em computador' de 'sei trabalhar num service desk'. É teoria de processo, e é o que o entrevistador pergunta — porque habilidade técnica ele descobre na prática, mas conduta de atendimento ele precisa ouvir.",
    },

    { kind: "h", text: "1. Incidente, requisição e problema" },
    {
      kind: "term",
      term: "Incidente",
      def: "Algo que funcionava parou, ou está degradado. 'A impressora não imprime', 'o sistema está lento', 'não consigo logar'. O objetivo é RESTAURAR o serviço, rápido, aceitando solução de contorno se preciso.",
    },
    {
      kind: "term",
      term: "Requisição de serviço",
      def: "O usuário quer algo novo ou uma mudança prevista. 'Preciso de acesso à pasta do Financeiro', 'instala o AutoCAD', 'criar usuário para o novo funcionário'. O objetivo é CUMPRIR o pedido, com aprovação quando houver.",
      note: "Requisição de acesso quase sempre exige aprovação do gestor. Conceder porque o usuário pediu, sem aprovação, é erro grave.",
    },
    {
      kind: "term",
      term: "Problema",
      def: "A causa raiz por trás de incidentes que se repetem. Isso é território de N2/N3.",
      note: "15 chamados de lentidão no mesmo setor = 15 incidentes e 1 problema.",
    },
    {
      kind: "callout",
      tone: "key",
      text: "A distinção importa porque incidente e requisição têm SLA diferente, fila diferente e procedimento diferente. Confundir os dois faz você tratar pedido de acesso com pressa de emergência, e emergência com burocracia de pedido.",
    },

    { kind: "h", text: "2. Ciclo de vida do chamado" },
    {
      kind: "steps",
      items: [
        "**Registro** — todo atendimento gera chamado, inclusive o que foi pedido no corredor.",
        "**Categorização** — hardware, software, rede, acesso, impressão. Errar categoria destrói o relatório do mês.",
        "**Priorização** — impacto × urgência (próxima seção).",
        "**Diagnóstico** — coletar informação, testar, tentar reproduzir.",
        "**Resolução ou escalonamento**.",
        "**Encerramento com validação do usuário** — fecha quando ELE confirma.",
        "**Documentação** — o que resolveu vira artigo de base de conhecimento.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Se não está no sistema, não aconteceu. Atendimento sem registro não conta no seu volume, não vira histórico e não vira conhecimento — e se o problema voltar, ninguém sabe o que já foi tentado.",
    },
    {
      kind: "p",
      text: "O passo 6 é o mais desrespeitado. Fechar chamado por conta própria, porque você acha que resolveu, é a causa número 1 de reabertura — e reabertura estraga justamente o indicador que você queria proteger fechando rápido.",
    },

    { kind: "h", text: "3. Prioridade = impacto × urgência" },
    {
      kind: "p",
      text: "**Impacto** é quantas pessoas ou quão crítico o processo: 1 usuário < 1 setor < empresa toda. **Urgência** é o quanto pode esperar: faturamento fechando hoje é mais urgente que relatório mensal. Cruzando os dois:",
    },
    {
      kind: "table",
      head: ["", "Urgência alta", "Urgência média", "Urgência baixa"],
      rows: [
        ["**Impacto alto** (empresa/setor)", "Crítica", "Alta", "Média"],
        ["**Impacto médio** (grupo)", "Alta", "Média", "Baixa"],
        ["**Impacto baixo** (1 usuário)", "Média", "Baixa", "Baixa"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Armadilha clássica de entrevista: 'o diretor pediu para trocar o mouse dele e ao mesmo tempo o servidor de arquivos caiu'. A resposta é o servidor. Cargo do solicitante NÃO é critério de priorização — impacto é. O que você faz com a hierarquia é comunicar o prazo, não inverter a fila.",
    },
    {
      kind: "p",
      text: "E o inverso também é erro: atender por ordem de chegada. Fila cronológica ignora impacto, e é assim que um chamado de periférico deixa quarenta pessoas paradas.",
    },

    { kind: "h", text: "4. SLA e indicadores" },
    {
      kind: "term",
      term: "SLA",
      def: "Service Level Agreement, o acordo de nível de serviço: os prazos combinados para cada prioridade.",
    },
    {
      kind: "p",
      text: "Existem **dois relógios diferentes**, e confundi-los é comum: o *tempo de primeira resposta* (em quanto tempo alguém assume o chamado) e o *tempo de solução* (em quanto tempo está resolvido). Uma ordem de grandeza típica:",
    },
    {
      kind: "table",
      head: ["Prioridade", "1ª resposta", "Solução"],
      rows: [
        ["Crítica", "15 min", "4 h"],
        ["Alta", "1 h", "8 h"],
        ["Média", "4 h", "24 h"],
        ["Baixa", "8 h", "40 h"],
      ],
      caption: "Números ilustrativos — cada empresa define os seus.",
    },
    {
      kind: "term",
      term: "Pausa de SLA",
      def: "Congelar a contagem do prazo enquanto o chamado depende de terceiro: usuário não responde, peça em compra, fornecedor analisando.",
      note: "Saber pausar corretamente é o que impede seu indicador de afundar por atraso que não é seu.",
    },
    {
      kind: "term",
      term: "FCR (First Call Resolution)",
      def: "Percentual resolvido no primeiro contato, sem escalar. Indicador favorito de gestor de N1.",
    },
    {
      kind: "term",
      term: "Backlog",
      def: "Os chamados abertos acumulados.",
    },

    { kind: "h", text: "5. N1, N2, N3 e escalonamento" },
    {
      kind: "table",
      head: ["Nível", "O que faz"],
      rows: [
        ["**N1**", "Primeiro atendimento, roteiro conhecido: senha, acesso, impressora, Office, hardware básico, conectividade. Resolve o volume."],
        ["**N2**", "O que exige conhecimento mais profundo ou acesso administrativo: servidor, rede, sistema interno."],
        ["**N3**", "Especialista, fabricante ou desenvolvimento."],
      ],
    },
    {
      kind: "p",
      text: "Escalonamento **funcional** é passar para quem sabe mais. Escalonamento **hierárquico** é acionar o gestor, quando há risco de SLA ou conflito. São coisas diferentes.",
    },
    {
      kind: "callout",
      tone: "key",
      text: "A pergunta é sempre 'quando você escala?'. Três gatilhos legítimos: esgotei o que está no meu escopo e no roteiro; falta permissão que eu não tenho; o SLA está em risco. Fora deles, escalar é empurrar trabalho.",
    },
    {
      kind: "p",
      text: "E existe a metade que quase ninguém treina: **o que vai no chamado antes de escalar**. O N2 precisa do relato do usuário, do que você já testou, do resultado de cada teste e do que você descartou. Escalar sem isso faz o N2 recomeçar do zero, e é o comportamento mais criticado num N1.",
    },
    {
      kind: "cmd",
      caption: "Escalonamento bem escrito, como referência de forma",
      lines: [
        "Sistema X indisponível para todos os usuários de três setores desde ~14:00.",
        "Reproduzi de duas estações diferentes: mesma falha.",
        "Rede sã (IP válido, gateway e DNS respondendo) e o servidor responde ao ping",
        "-- descartei rede e estação. O serviço da aplicação não sobe e não tenho",
        "acesso administrativo a ele.",
        "Impacto: três setores parados, Financeiro com pagamento a fechar hoje.",
        "Usuários já comunicados. Encaminho para atuação no serviço da aplicação.",
      ],
    },

    { kind: "h", text: "6. Vocabulário que aparece nas vagas" },
    {
      kind: "table",
      head: ["Termo", "O que é"],
      rows: [
        ["**IMAC**", "Install, Move, Add, Change — instalar, mover, adicionar e alterar estações. Aparece literal em vaga de suporte."],
        ["**Onboarding**", "Chegada de funcionário: criar usuário, e-mail, grupos, máquina, licença, acessos."],
        ["**Offboarding**", "Saída: desabilitar (nunca deletar), preservar dados, remover de grupos, liberar licença, recolher equipamento."],
        ["**Inventário / ativo de TI**", "Controle de quem está com qual equipamento e número de série."],
        ["**Service desk vs help desk**", "Help desk resolve incidente; service desk é o ponto único de contato e inclui requisição, mudança e catálogo."],
        ["**Catálogo de serviços**", "A lista do que a TI oferece, com o prazo de cada item."],
        ["**Base de conhecimento (KB)**", "Artigo com sintoma, causa, passo a passo e a quem se aplica."],
        ["**ITIL**", "O conjunto de boas práticas de onde vem todo esse vocabulário."],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Não pague certificação ITIL agora. Conhecer os termos desta aula cobre a faixa das vagas de técnico e suporte N1; a certificação só faz diferença bem mais adiante.",
    },

    { kind: "h", text: "7. Os três estados de 'não consigo entrar'" },
    {
      kind: "p",
      text: "Vale isolar isto porque é o chamado mais comum e onde mais se perde tempo por pressa. 'Não consigo logar' tem três causas com correção diferente:",
    },
    {
      kind: "table",
      head: ["Estado", "O que é", "Correção"],
      rows: [
        ["**Bloqueada**", "Excesso de tentativas de senha errada", "Desbloquear a conta"],
        ["**Desabilitada**", "Alguém desativou, geralmente por desligamento ou afastamento", "Reabilitar — e perguntar por que foi desabilitada"],
        ["**Senha expirada**", "Política de validade venceu", "Resetar com troca no próximo logon"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Resetar senha de conta apenas bloqueada não resolve, e cria trabalho para quem só errou a digitação. Ler a mensagem da tela e conferir o estado da conta custa 30 segundos e evita reabertura.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Depois de ler, vá para a triagem de chamados. Lá você aplica isto num chamado real, decidindo categoria, prioridade, ordem de diagnóstico e o texto do registro. O questionário confere o vocabulário.",
    },
  ],
};

const dominioBasico: Lesson = {
  id: "dominio-basico",
  level: 1,
  area: "ad",
  title: "Ambiente com domínio: AD, GPO e unidade de rede",
  summary:
    "O que muda quando a empresa tem um domínio: usuário centralizado, política de grupo, unidade mapeada. Aparece nas vagas mais fortes do mapeamento.",
  minutes: 10,
  nextQuizId: "dominio-basico",
  nextLabIds: ["gpo-unidade-z"],
  blocks: [
    {
      kind: "p",
      text: "Numa casa, cada PC tem seus próprios usuários. Numa empresa com domínio, existe um servidor central que guarda os usuários, os grupos e as regras — e cada estação consulta ele. Entender essa diferença é o que separa suporte doméstico de suporte corporativo, e é a experiência que costuma faltar em quem vem de manutenção autônoma.",
    },

    { kind: "h", text: "1. As peças" },
    {
      kind: "term",
      term: "Active Directory (AD)",
      def: "O serviço de diretório da Microsoft: o banco central de usuários, grupos, computadores e políticas da empresa.",
    },
    {
      kind: "term",
      term: "Controlador de domínio (DC)",
      def: "O servidor que roda o AD. É quem autentica o logon de todo mundo.",
      note: "Um DC nunca usa DHCP — ele tem IP fixo, porque as estações precisam encontrá-lo sempre no mesmo lugar.",
    },
    {
      kind: "term",
      term: "OU (Unidade Organizacional)",
      def: "A pasta que organiza objetos dentro do AD: normalmente uma por setor (Financeiro, Comercial, TI) mais uma de Desligados.",
      note: "A OU importa porque política de grupo se aplica por OU.",
    },
    {
      kind: "term",
      term: "Grupo",
      def: "Conjunto de usuários que compartilham permissão, tipo `GRP_Financeiro_Escrita`.",
      note: "Regra de ouro: permissão sempre por grupo, nunca por usuário. Por usuário vira bagunça impossível de auditar.",
    },
    {
      kind: "term",
      term: "GPO (Política de Grupo)",
      def: "Regra aplicada automaticamente às máquinas ou usuários de uma OU: papel de parede padrão, unidade de rede mapeada, bloqueio do Painel de Controle, política de senha.",
    },
    {
      kind: "p",
      text: "O AD depende de DNS para funcionar — é por DNS que a estação descobre onde está o controlador de domínio. Por isso, num ambiente com domínio, DNS apontando para o lugar errado quebra muito mais que sites: quebra logon, GPO e unidade mapeada.",
    },

    { kind: "h", text: "2. Como um técnico administra isso" },
    {
      kind: "p",
      text: "Ninguém senta no console do servidor. O padrão é instalar o **RSAT** na própria estação e administrar de lá, pelos consoles gráficos: `dsa.msc` para usuários e computadores, `gpmc.msc` para política de grupo, mais os consoles de DHCP e DNS.",
    },
    {
      kind: "table",
      head: ["Tarefa de N1", "Onde se faz"],
      rows: [
        ["Resetar senha, marcar troca no próximo logon", "Usuários e Computadores do AD"],
        ["Desbloquear conta travada por tentativas", "Usuários e Computadores do AD"],
        ["Criar usuário do novo funcionário (onboarding)", "Usuários e Computadores do AD"],
        ["Desabilitar e mover para OU de Desligados (offboarding)", "Usuários e Computadores do AD"],
        ["Conceder acesso a pasta de setor", "Adicionar ao grupo — nunca na permissão direto"],
        ["Ver e reaplicar políticas", "`gpresult /r` e `gpupdate /force` na estação"],
      ],
    },

    { kind: "h", text: "3. Os comandos que aparecem em entrevista" },
    {
      kind: "cmd",
      caption: "Diagnóstico de 'sumiu a minha unidade Z:'",
      lines: [
        "C:\\>net use              -> lista as unidades de rede mapeadas.",
        "                            Lista vazia = a GPO não aplicou.",
        "",
        "C:\\>gpresult /r          -> mostra QUAIS GPOs foram aplicadas,",
        "                            de qual controlador e quando.",
        "",
        "C:\\>gpupdate /force      -> reaplica tudo agora, sem esperar o ciclo.",
        "",
        "C:\\>net use Z: \\\\dc01\\Financeiro",
        "                         -> mapeia na mão, só nesta máquina.",
        "                            Resolve o sintoma AGORA.",
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "A diferença entre resolver o sintoma e resolver a causa: mapear na mão com `net use` devolve a pasta ao usuário em 10 segundos, e é legítimo para desbloquear o trabalho dele. O mapeamento manual até persiste — o próprio comando avisa 'Novas conexões serão lembradas'. O problema é que ele vale **só naquela máquina** e fica fora do controle da TI: se o usuário sentar em outra estação, não tem Z:; e ninguém depois vai saber por que aquela máquina tem um mapeamento que as outras não têm. Faça os dois, e registre a causa.",
    },
    {
      kind: "p",
      text: "Um detalhe que confunde: se a máquina não alcança o controlador de domínio (sem rede, com 169.254, ou gateway fora), o `gpupdate` falha dizendo que não localizou um controlador. Ou seja, chamado de GPO pode ser chamado de rede disfarçado — e a sequência de quatro passos da aula de redes resolve antes.",
    },

    { kind: "h", text: "4. Permissão de pasta: os dois cadeados" },
    {
      kind: "p",
      text: "Pasta compartilhada em rede tem **duas** camadas de permissão, e a efetiva é sempre a mais restritiva das duas:",
    },
    {
      kind: "table",
      head: ["Camada", "Onde fica", "Serve para"],
      rows: [
        ["Compartilhamento", "Aba Compartilhamento da pasta", "Quem acessa pela rede"],
        ["NTFS", "Aba Segurança da pasta", "Quem acessa de qualquer forma, inclusive local"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Se o compartilhamento dá Leitura e o NTFS dá Modificar, o usuário só lê. É a pergunta de permissão mais comum em teste técnico, e a resposta é: vale o mais restritivo.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Faça o laboratório da unidade Z: — ele te dá o terminal de uma estação em domínio para rodar `net use`, `gpresult /r` e `gpupdate /force` e ver a unidade reaparecer. Depois, para valer de verdade, monte o domínio em máquina virtual seguindo o Módulo C do plano: criar usuário, resetar senha e ver a GPO aplicar num cliente real é o que nenhum simulador entrega.",
    },
  ],
};

const windowsEstacao: Lesson = {
  id: "windows-estacao",
  level: 1,
  area: "windows",
  title: "A estação Windows: onde olhar quando algo quebra",
  summary:
    "Visualizador de Eventos, serviços, elevação, inicialização e perfil. É o que você usa quando o chamado não é de rede — e é a maior parte deles.",
  minutes: 13,
  nextQuizId: "windows-estacao",
  nextLabIds: [],
  blocks: [
    {
      kind: "p",
      text: "Chamado de rede tem roteiro fechado e você já tem o dele. O resto — 'está lento', 'travou', 'sumiu meu arquivo', 'abriu com outro nome' — é diagnóstico de estação, e aqui o roteiro é outro: descobrir **quando** começou, **o que mudou** e **o que o próprio Windows registrou**.",
    },

    { kind: "h", text: "1. Os consoles que resolvem" },
    {
      kind: "p",
      text: "Tudo abaixo abre digitando o nome na busca do menu Iniciar ou em Executar (`Win+R`). Decorar esses nomes é o que faz você parecer rápido — e ser.",
    },
    {
      kind: "table",
      head: ["Abre com", "O que é", "Quando salva o chamado"],
      rows: [
        ["`eventvwr.msc`", "Visualizador de Eventos", "Descobrir o que aconteceu e a que hora"],
        ["`services.msc`", "Serviços", "Serviço parado: spool, DHCP, antivírus"],
        ["`taskmgr`", "Gerenciador de Tarefas", "O que está consumindo CPU, disco ou RAM"],
        ["`devmgmt.msc`", "Gerenciador de Dispositivos", "Driver com erro, dispositivo não reconhecido"],
        ["`diskmgmt.msc`", "Gerenciamento de Disco", "Partição, letra de unidade, disco novo"],
        ["`compmgmt.msc`", "Gerenciamento do Computador", "Junta vários dos anteriores num só lugar"],
        ["`lusrmgr.msc`", "Usuários e Grupos Locais", "Conta local, grupo Administradores (não existe no Home)"],
        ["`appwiz.cpl`", "Programas e Recursos", "Desinstalar, ver o que foi instalado e quando"],
        ["`msconfig`", "Configuração do Sistema", "Inicialização em modo diagnóstico"],
        ["`sysdm.cpl`", "Propriedades do Sistema", "Nome da máquina, domínio, variáveis, memória virtual"],
        ["`optionalfeatures`", "Recursos do Windows", "Ativar recurso, instalar RSAT"],
      ],
    },

    { kind: "h", text: "2. Visualizador de Eventos — a única testemunha" },
    {
      kind: "p",
      text: "O usuário nunca sabe dizer a hora nem a mensagem. O Windows sabe as duas. É por isso que este console é a ferramenta mais subestimada do suporte: ele transforma 'travou de manhã' em 'desligamento inesperado às 09:14'.",
    },
    {
      kind: "p",
      text: "Três logs importam. **Sistema** para hardware, driver, disco e desligamento. **Aplicativo** para programa que fechou sozinho. **Segurança** para logon, tentativa falha e bloqueio de conta.",
    },
    {
      kind: "table",
      head: ["Evento", "Onde", "O que significa"],
      rows: [
        ["**6008**", "Sistema", "O desligamento anterior foi inesperado — queda de energia, travamento ou botão"],
        ["**41**", "Sistema", "A máquina reiniciou sem desligar direito (Kernel-Power)"],
        ["**7000 / 7031**", "Sistema", "Um serviço não iniciou, ou terminou de forma inesperada"],
        ["**4624**", "Segurança", "Logon bem-sucedido"],
        ["**4625**", "Segurança", "Falha de logon — senha errada, conta desabilitada"],
        ["**4740**", "Segurança", "Conta bloqueada por excesso de tentativas"],
        ["**1001**", "Aplicativo", "Relatório de erro do Windows: um programa quebrou"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "O jeito de usar não é sair rolando a lista. É **filtrar por período**: clique em Filtrar Log Atual, marque só Erro e Crítico, e limite às últimas 24 horas. Você quer os poucos eventos da hora que o usuário citou, não os dez mil do mês.",
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Cuidado com a conclusão fácil: o log de Sistema tem Aviso e Erro **o tempo todo** em máquina perfeitamente saudável. Achar um erro não prova que ele é a causa. O que dá valor ao achado é a coincidência de horário com o sintoma relatado.",
    },

    { kind: "h", text: "3. Serviço e elevação" },
    {
      kind: "term",
      term: "Serviço",
      def: "Programa que roda em segundo plano, sem janela, geralmente iniciando com o Windows. Spooler de Impressão, Cliente DNS, Área de Trabalho Remota e o agente do antivírus são serviços.",
      note: "Tipo de inicialização: Automático · Automático (Início Atrasado) · Manual · Desabilitado.",
    },
    {
      kind: "p",
      text: "Mexer em serviço é operação administrativa. Do prompt comum o Windows recusa com **Erro do sistema 5 — Acesso negado**, e é aí que muita gente trava sem entender. A saída é abrir o Prompt de Comando ou o PowerShell **como administrador**.",
    },
    {
      kind: "cmd",
      caption: "Conferir e mexer em serviço pelo prompt",
      lines: [
        "C:\\>sc query spooler        -> ESTADO: 4 EM_EXECUCAO ou 1 PARADO",
        "",
        "C:\\>net stop spooler        -> para (precisa de prompt elevado)",
        "C:\\>net start spooler       -> inicia",
        "",
        "Sem elevacao:",
        "Erro do sistema 5.",
        "Acesso negado.",
      ],
    },
    {
      kind: "term",
      term: "UAC (Controle de Conta de Usuário)",
      def: "A caixa que pergunta 'deseja permitir que este aplicativo faça alterações?'. Existe porque mesmo uma conta de administrador roda sem privilégio até você confirmar.",
      note: "Desativar o UAC 'para não incomodar' é pedido comum de usuário e resposta errada de técnico.",
    },

    { kind: "h", text: "4. 'Meu computador está lento'" },
    {
      kind: "p",
      text: "É o chamado mais vago que existe, e o erro é começar formatando. Antes de qualquer coisa, transforme a reclamação em fato com quatro perguntas: **lento em quê** (abrir programa, abrir arquivo, navegar), **desde quando**, **o tempo todo ou em horário certo**, e **mudou algo antes disso**.",
    },
    {
      kind: "steps",
      items: [
        "**Gerenciador de Tarefas, aba Desempenho.** Disco em 100% com pouca CPU é o padrão de HD mecânico no fim da vida ou de indexação rodando. Memória no limite com disco em uso é falta de RAM.",
        "**Aba Inicializar.** Programa demais subindo com o Windows deixa o logon arrastado por minutos.",
        "**Espaço livre em C:.** Disco de sistema quase cheio degrada tudo, porque o Windows precisa de espaço para arquivo de paginação e atualização.",
        "**Saúde do disco.** SSD e HD avisam antes de morrer; ferramenta de fabricante ou leitura de SMART mostra setor realocado e horas de uso.",
        "**Temperatura e ventilação.** Máquina engasgando sob carga, com cooler barulhento, costuma ser sujeira e pasta térmica velha — e isso é bancada, não software.",
        "**Antivírus e varredura.** Duas soluções de segurança na mesma máquina brigam entre si e comem a CPU.",
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Troca de HD por SSD é a intervenção com melhor retorno em máquina de escritório, e provavelmente a recomendação mais útil que você vai dar no cargo. Saber dizer isso com o dado do Gerenciador de Tarefas na mão é diferente de dizer por hábito.",
    },

    { kind: "h", text: "5. Perfil de usuário" },
    {
      kind: "p",
      text: "Sintoma típico: a pessoa loga e cai numa área de trabalho vazia, sem os atalhos e sem os arquivos dela. Quase sempre é **perfil temporário** — o Windows não conseguiu carregar o perfil e criou um descartável, que perde tudo no logoff.",
    },
    {
      kind: "p",
      text: "O que fazer: não deixe a pessoa trabalhar nesse perfil, porque o que ela salvar ali evapora. Avise, e trate a causa — normalmente disco cheio, perfil corrompido ou a estação sem conseguir falar com o controlador de domínio no momento do logon. Os arquivos do perfil antigo continuam em `C:\\Usuários\\<nome>`, e é de lá que você recupera.",
    },
    {
      kind: "table",
      head: ["Sintoma", "Primeiro palpite"],
      rows: [
        ["Área de trabalho vazia, avisa 'perfil temporário'", "Perfil corrompido ou disco cheio"],
        ["'Sumiu meu arquivo do Desktop'", "Perfil diferente, ou OneDrive movendo a pasta"],
        ["Cada logon demora vários minutos", "Perfil grande, GPO pesada, ou disco no limite"],
        ["'Não consigo salvar em C:'", "Permissão, ou pasta protegida do sistema"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Antes de qualquer intervenção que mexa em perfil, disco ou reinstalação: **backup dos dados do usuário**. Não existe desculpa aceitável para perder arquivo de alguém, e é o tipo de erro que custa o emprego em vez de render aprendizado.",
    },

    { kind: "h", text: "6. Reparo de sistema, na ordem certa" },
    {
      kind: "p",
      text: "Do menos para o mais invasivo. Pular etapa é o que transforma um chamado de meia hora num dia perdido.",
    },
    {
      kind: "cmd",
      caption: "Sequência de reparo",
      lines: [
        "1) Reiniciar de verdade  -> muita coisa e sessao suja, nao defeito.",
        "",
        "2) sfc /scannow          -> verifica e repara arquivos de sistema.",
        "                            Precisa de prompt elevado.",
        "",
        "3) DISM /Online /Cleanup-Image /RestoreHealth",
        "                         -> repara a imagem que o sfc usa como fonte.",
        "                            Use quando o sfc nao conseguir corrigir.",
        "",
        "4) Restauracao do Sistema -> volta driver e configuracao a um ponto",
        "                            anterior. Nao mexe em arquivo pessoal.",
        "",
        "5) Reinstalar / resetar  -> ultimo recurso, com backup feito e",
        "                            combinado com o usuario.",
      ],
    },
    {
      kind: "p",
      text: "E existe o atalho que resolve o Windows que não inicia: segurar **Shift** ao clicar em Reiniciar abre o ambiente de recuperação (WinRE), com Modo de Segurança, Restauração do Sistema e prompt. O F8 do Windows 7 não funciona mais por padrão — é a pegadinha de quem aprendeu na época errada.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Esta aula não tem laboratório de terminal porque as ferramentas dela são gráficas e estão na sua própria máquina. Faça de verdade: abra o `eventvwr.msc`, filtre Erro nas últimas 24 horas e leia o que aparecer. Depois abra o `services.msc` e ache o Spooler de Impressão. Cinco minutos ali valem mais que reler a tabela.",
    },
  ],
};

const impressao: Lesson = {
  id: "impressao",
  level: 1,
  area: "impressao",
  title: "Impressão: o chamado mais frequente depois de senha",
  summary:
    "Fila, spool, driver e impressora de rede. Tem procedimento fixo, e é onde o técnico novo mais perde tempo tentando na ordem errada.",
  minutes: 9,
  nextQuizId: "impressao",
  nextLabIds: ["spooler-travado"],
  blocks: [
    {
      kind: "p",
      text: "Impressão parece assunto menor e ocupa uma fatia enorme da fila de qualquer service desk. A boa notícia é que tem roteiro curto e quase sempre a mesma causa. A má é que a maioria tenta na ordem errada e mexe em driver antes de olhar o painel do equipamento.",
    },

    { kind: "h", text: "1. Como o documento chega no papel" },
    {
      kind: "steps",
      items: [
        "O aplicativo manda imprimir.",
        "O **driver** traduz aquilo para a linguagem da impressora.",
        "O **Spooler de Impressão** — um serviço do Windows — guarda o trabalho em disco, em `C:\\Windows\\System32\\spool\\PRINTERS`, e enfileira.",
        "O trabalho segue para a impressora: por rede (IP), por USB, ou por uma **fila compartilhada** em outra máquina ou servidor de impressão.",
        "A impressora imprime.",
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Esse caminho já te dá o diagnóstico por escopo: se **uma** pessoa não imprime e as outras sim, olhe a estação dela (driver, fila local). Se **o setor todo** para, olhe o que é compartilhado: a impressora, o spool do servidor de impressão, ou a rede até ela.",
    },

    { kind: "h", text: "2. A ordem que resolve" },
    {
      kind: "steps",
      items: [
        "**Painel do equipamento.** Papel, toner, atolamento, tampa aberta, modo offline. Resolve boa parte dos chamados e custa cinco segundos — e é humilhante descobrir isso depois de mexer em serviço.",
        "**A impressora responde na rede?** `ping` no IP dela. Não responde: é rede ou o equipamento, não é Windows.",
        "**A fila.** Documento preso segurando os seguintes; tente cancelar pela fila primeiro.",
        "**O serviço.** Se a fila não obedece, aí sim é Spooler.",
        "**Driver**, e só então. Reinstalar driver é a última hipótese, não a primeira.",
        "**Página de teste** e confirmação com quem abriu o chamado.",
      ],
    },
    {
      kind: "cmd",
      caption: "O procedimento do Spooler tem ordem própria",
      lines: [
        "1) net stop spooler                     (prompt de administrador)",
        "2) apagar o conteudo de:",
        "   C:\\Windows\\System32\\spool\\PRINTERS",
        "3) net start spooler",
        "",
        "sc query spooler   -> confere o estado antes e depois",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Tentar apagar o arquivo de spool com o serviço rodando **não funciona** — o arquivo está em uso. É o erro clássico, e a pessoa conclui que 'não deu' quando só fez na ordem trocada. Pare o serviço, limpe, suba de novo.",
    },
    {
      kind: "p",
      text: "Repare também que reiniciar o Spooler derruba a impressão de **todos** os trabalhos daquela máquina por alguns segundos. Num servidor de impressão isso afeta a empresa: avise antes, ou faça fora do horário de pico.",
    },

    { kind: "h", text: "3. Sintomas e primeiro palpite" },
    {
      kind: "table",
      head: ["Sintoma", "Primeiro palpite"],
      rows: [
        ["Fila cresce e nada sai, impressora responde ao ping", "Spooler parado ou travado"],
        ["Documento fica em 'Excluindo' para sempre", "Arquivo de spool preso — pare o serviço e limpe"],
        ["Só uma pessoa não imprime, o resto sim", "Driver ou fila da estação dela"],
        ["Setor todo parou de uma vez", "Impressora, spool do servidor de impressão, ou rede do trecho"],
        ["Sai página com caracteres estranhos", "Driver errado para o modelo"],
        ["Imprime cortado ou fora de posição", "Configuração de papel, ou driver genérico no lugar do correto"],
        ["Sumiu a impressora da lista do usuário", "GPO de implantação de impressora não aplicou"],
        ["Impressora mudou de IP e ninguém imprime", "IP dinâmico onde devia haver reserva por MAC"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Impressora e servidor merecem **reserva por MAC no DHCP**, não IP fixo digitado no painel do equipamento. O resultado é o mesmo e o controle fica centralizado — quando alguém trocar a faixa da rede, você não precisa visitar cada impressora.",
    },

    { kind: "h", text: "4. Vocabulário que aparece na vaga" },
    {
      kind: "term",
      term: "Servidor de impressão",
      def: "Máquina que hospeda as filas compartilhadas. As estações imprimem nele, e ele fala com as impressoras.",
      note: "Se ele para, o setor inteiro para — mesmo com todas as impressoras saudáveis.",
    },
    {
      kind: "term",
      term: "Impressora de rede vs compartilhada",
      def: "De rede: a estação fala direto com o IP da impressora. Compartilhada: a estação fala com uma fila em outra máquina (`\\\\servidor\\impressora`), que fala com o equipamento.",
      note: "Muda onde você investiga e onde a permissão é aplicada.",
    },
    {
      kind: "term",
      term: "Contador de páginas",
      def: "O total impresso por equipamento. É o número que a empresa usa para cobrança de contrato de outsourcing de impressão.",
      note: "Aparece em vaga como 'controle de impressão' ou 'gestão de outsourcing'.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Faça o laboratório: você chega num setor parado, com a impressora respondendo e a fila presa, e tem que descobrir por quê usando `ping`, `sc query` e `net start`. Depois a triagem do chamado de impressora treina a parte de processo — categoria, prioridade e registro.",
    },
  ],
};

/* ============================================================== nível 2 ===
   O N2 não é "o N1 com mais anos". É outro tipo de trabalho: recebe o que foi
   escalado, mexe em servidor, e responde por causa raiz em vez de só restaurar
   o serviço. Cada aula daqui parte de um chamado que chegou escalado.
   ======================================================================== */

const n2Identidade: Lesson = {
  id: "n2-identidade",
  level: 2,
  area: "ad",
  title: "Identidade e confiança: por que o logon falha quando tudo parece certo",
  summary:
    "Conta de máquina, Kerberos, hora e replicação. É onde o N1 empaca, porque o problema não está na conta do usuário.",
  minutes: 14,
  nextQuizId: "n2-identidade",
  nextLabIds: ["confianca-quebrada", "hora-kerberos"],
  blocks: [
    {
      kind: "p",
      text: "O N1 tem três estados de conta na cabeça: bloqueada, desabilitada, senha expirada. Quando o logon falha e nenhum dos três explica, o chamado sobe para você. E quase sempre a resposta está numa destas quatro coisas, nenhuma delas relacionada à conta do usuário.",
    },

    { kind: "h", text: "1. A máquina também tem conta, e também tem senha" },
    {
      kind: "p",
      text: "Isto é o conceito que mais falta em quem vem do N1. Quando uma estação ingressa no domínio, o AD cria um **objeto de computador** com senha própria, que o Windows renova sozinho a cada 30 dias. Essa senha é o que sustenta o **canal seguro** entre a estação e o controlador.",
    },
    {
      kind: "term",
      term: "«A relação de confiança entre esta estação de trabalho e o domínio principal falhou»",
      def: "A senha da conta de computador na estação não bate com a que está no AD. O logon de domínio para de funcionar naquela máquina, para todos os usuários.",
      note: "Não é a conta do usuário. Resetar a senha dele dez vezes não muda nada.",
    },
    {
      kind: "p",
      text: "Quando isso acontece: a máquina voltou de um restore de imagem ou de snapshot de máquina virtual e regrediu para uma senha antiga; ficou desligada mais tempo que a vida do histórico de senha; alguém apagou e recriou o objeto no AD; ou existem duas máquinas com o mesmo nome disputando o mesmo objeto.",
    },
    {
      kind: "cmd",
      caption: "Diagnóstico e conserto, sem tirar do domínio",
      lines: [
        "nltest /dsgetdc:lab.local     -> a maquina ACHA um controlador?",
        "                                 Se falhar com 0x54b, o problema e rede/DNS.",
        "",
        "nltest /sc_verify:lab.local   -> a CONFIANCA esta de pe?",
        "                                 'Verificacao da confianca: Falhou' fecha o caso.",
        "",
        "Reset-ComputerMachinePassword -> redefine a senha da conta de computador.",
        "                                 PowerShell elevado. Nao precisa reboot duplo.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "O ritual que a internet ensina — remover do domínio, reiniciar, ingressar de novo, reiniciar — funciona e cobra caro: derruba o perfil do usuário, dois reboots de parada, e recria o objeto no AD perdendo o que estava vinculado a ele. Use como plano B, quando o reset da senha de máquina falhar.",
    },

    { kind: "h", text: "2. Kerberos não perdoa relógio errado" },
    {
      kind: "p",
      text: "O Kerberos é o protocolo que autentica no domínio, e ele usa o **horário** como parte da prova de que o pedido é legítimo. Diferença acima de **5 minutos** — 300 segundos, o padrão — e o ticket é recusado. O sintoma na tela fala de credencial, e é por isso que engana: parece senha errada e não é.",
    },
    {
      kind: "p",
      text: "A pista é sempre contextual. Aconteceu **depois de mexer em hardware** (placa-mãe nova, bateria da BIOS morta), **depois de restaurar uma máquina virtual** de um snapshot antigo, ou depois de a máquina ficar meses desligada. Se o relato tem uma dessas frases, teste a hora antes de qualquer outra coisa.",
    },
    {
      kind: "cmd",
      caption: "Hora e ticket",
      lines: [
        "w32tm /query /status   -> mostra a origem e a diferenca medida.",
        "klist                  -> tickets em cache. Zero ticket = nao autenticou.",
        "w32tm /resync          -> forca ressincronizar com a fonte do dominio.",
      ],
    },
    {
      kind: "p",
      text: "Em domínio a hora é **hierárquica**: as estações sincronizam com o controlador que tem o papel de servidor de tempo, e esse controlador sincroniza com uma fonte externa. Estação apontando para fonte de internet em vez do DC é erro de configuração que gera esse chamado de forma intermitente.",
    },

    { kind: "h", text: "3. Replicação entre controladores" },
    {
      kind: "p",
      text: "Empresa com mais de um controlador replica as mudanças entre eles. Enquanto a replicação não completa, existe uma janela em que **a resposta depende de qual DC atendeu**: você reseta a senha, o usuário tenta logar, cai no outro controlador que ainda tem a senha antiga, e falha.",
    },
    {
      kind: "table",
      head: ["Sintoma", "Leitura"],
      rows: [
        ["Reset de senha 'não pegou', mas depois funciona sozinho", "Latência de replicação"],
        ["Usuário loga numa filial e não noutra", "Replicação parada entre sites"],
        ["Conta desbloqueada continua bloqueada", "O bloqueio replica; confira em qual DC você agiu"],
        ["Objeto criado não aparece para todos", "Replicação atrasada ou com erro"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "Quando o resultado é inconsistente entre tentativas, pare de repetir a ação e descubra **em qual controlador** cada tentativa caiu. `nltest /dsgetdc:lab.local` responde isso na estação. No servidor, `repadmin /replsummary` mostra se a replicação está saudável.",
    },

    { kind: "h", text: "4. Política de senha e de bloqueio" },
    {
      kind: "p",
      text: "O N1 desbloqueia conta. O N2 responde pela política que causa os bloqueios — e a diferença entre as duas posições é saber que uma política mal calibrada é a causa raiz de um volume enorme de chamado repetido.",
    },
    {
      kind: "table",
      head: ["Parâmetro", "O que faz", "Efeito prático"],
      rows: [
        ["Limite de bloqueio", "Quantas tentativas erradas até travar", "Muito baixo = fila cheia de desbloqueio"],
        ["Duração do bloqueio", "Quanto tempo fica travada", "Zero = só destrava manualmente, e é chamado garantido"],
        ["Zerar contador após", "Janela em que as tentativas somam", "Curto demais nunca trava; longo demais trava por acúmulo"],
        ["Validade máxima da senha", "Prazo para trocar", "Prazo curto gera pico de chamado no mesmo dia do mês"],
        ["Histórico de senha", "Quantas senhas antigas ele lembra", "Impede reciclar a mesma senha"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Uma causa de bloqueio que parece fantasma: **credencial velha guardada**. Celular com senha antiga do e-mail, unidade de rede mapeada com credencial salva, ou tarefa agendada rodando com senha expirada tentam autenticar sozinhas em loop e bloqueiam a conta minutos depois de cada desbloqueio. Se a mesma pessoa bloqueia várias vezes por dia, procure o dispositivo, não o usuário. O evento **4740** no controlador diz de qual máquina veio a tentativa.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Os dois laboratórios desta trilha são exatamente os dois chamados que chegam escalados: a relação de confiança quebrada e o relógio fora de sincronia. Nos dois, a rede está boa e a conta do usuário está normal — o que treina a parte difícil, que é não repetir o teste que o N1 já fez.",
    },
  ],
};

const n2Permissao: Lesson = {
  id: "n2-permissao",
  level: 2,
  area: "windows",
  title: "Permissão a fundo: quando está tudo certo e nada funciona",
  summary:
    "Acumulação, Negar, herança e acesso efetivo. O chamado de permissão que o N1 não resolve é sempre um destes quatro.",
  minutes: 12,
  nextQuizId: "n2-permissao",
  nextLabIds: ["permissao-negar"],
  blocks: [
    {
      kind: "p",
      text: "O N1 sabe a regra do mais restritivo entre compartilhamento e NTFS. Isso resolve o caso simples. O que sobe para o N2 é o caso em que a pessoa está no grupo certo, o compartilhamento está liberado, e ela continua sem acessar — e aí a resposta está dentro da própria NTFS.",
    },

    { kind: "h", text: "1. As quatro regras que decidem tudo" },
    {
      kind: "steps",
      items: [
        "**Permitir acumula.** Se a pessoa está em três grupos, ela recebe a soma do que os três permitem. Leitura num grupo mais Escrita noutro resulta em ler e escrever.",
        "**Negar vence Permitir.** Um único Negar, vindo de qualquer grupo, anula todos os Permitir. É a regra que cria o chamado impossível.",
        "**Explícito prevalece sobre herdado.** Permissão marcada na própria pasta ganha da que desceu da pasta pai — inclusive um Permitir explícito ganhando de um Negar herdado.",
        "**A permissão efetiva é calculada no logon.** O token do usuário carrega os grupos dele naquele momento; entrar num grupo novo só vale depois de sair e entrar de novo.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Consequência da regra 2, e é o motivo de quase todo chamado escalado de permissão: **use Negar o mínimo possível.** Ele parece o jeito rápido de tirar acesso de alguém, e vira uma armadilha invisível que ninguém lembra que existe. Para tirar acesso, remova do grupo que permite.",
    },

    { kind: "h", text: "2. Como ler isso na prática" },
    {
      kind: "cmd",
      caption: "Pelo prompt e pela interface",
      lines: [
        "icacls C:\\Dados\\Financeiro     -> lista a ACL. (DENY) marca o Negar.",
        "whoami /groups                  -> de quais grupos o token atual faz parte.",
        "",
        "Pela interface, o caminho mais direto:",
        "  Propriedades da pasta > Seguranca > Avancado > aba Acesso Efetivo",
        "  Escolha o usuario e ele calcula o resultado final, ja considerando",
        "  acumulacao, Negar e heranca.",
      ],
    },
    {
      kind: "p",
      text: "A aba **Acesso Efetivo** é a ferramenta mais subutilizada do Windows em suporte. Ela responde a pergunta que o usuário faz — 'por que eu não consigo?' — em vez de te obrigar a montar a conta de cabeça.",
    },

    { kind: "h", text: "3. Herança" },
    {
      kind: "term",
      term: "Herança",
      def: "Por padrão, uma pasta recebe as permissões da pasta acima dela. Novas subpastas nascem com o que o pai concede.",
      note: "Quebrar a herança copia o estado atual e congela: mudanças no pai deixam de descer.",
    },
    {
      kind: "p",
      text: "Herança quebrada produz um sintoma característico: você concede acesso na pasta raiz do setor, confirma que está lá, e **uma subpasta específica continua negando**. É a subpasta que parou de escutar o pai. O `icacls` mostra isso porque as entradas dela não têm a marca de herdada.",
    },
    {
      kind: "table",
      head: ["Sintoma", "Causa provável"],
      rows: [
        ["Está no grupo, saiu e entrou, e continua negado", "Negar em outro grupo"],
        ["Acessa a pasta do setor mas não uma subpasta", "Herança quebrada na subpasta"],
        ["Consegue abrir e não consegue salvar", "Permitir de Leitura sem Escrita, ou share em Leitura"],
        ["Só ela não acessa; o resto do grupo sim", "Ela está num grupo extra que tem Negar"],
        ["Ninguém acessa depois de uma mudança", "Herança removida na raiz, ou grupo tirado por engano"],
        ["Vê a pasta e não vê o conteúdo", "Permissão de listar sem ler, ou ABE escondendo"],
      ],
    },

    { kind: "h", text: "4. Desenho que evita o chamado" },
    {
      kind: "p",
      text: "Permissão bem desenhada é a diferença entre um servidor de arquivos administrável e um pesadelo. O padrão consagrado é dar permissão sempre a **grupo**, nunca a usuário, e criar um grupo por **tipo de acesso** — não por pessoa e não por pasta.",
    },
    {
      kind: "cmd",
      caption: "Convenção que se sustenta com o tempo",
      lines: [
        "GRP_Financeiro_Leitura    -> abre e le",
        "GRP_Financeiro_Escrita    -> le, cria e altera",
        "GRP_Financeiro_Total      -> inclui apagar e mudar permissao",
        "",
        "Usuario entra no grupo. A pasta nunca conhece o usuario.",
        "Auditar fica trivial: olhar o grupo responde quem tem acesso.",
      ],
    },
    {
      kind: "term",
      term: "ABE (Enumeração Baseada em Acesso)",
      def: "Recurso do servidor de arquivos que esconde da listagem as pastas às quais a pessoa não tem acesso, em vez de mostrar e negar ao abrir.",
      note: "Reduz chamado de curiosidade e conversa do tipo 'por que existe uma pasta que eu não abro?'.",
    },
    {
      kind: "callout",
      tone: "key",
      text: "Antes de mexer em permissão de pasta compartilhada, anote o estado atual — `icacls C:\\Dados\\Financeiro > antes.txt` leva dois segundos e te salva de um chamado de indisponibilidade que você mesmo criou. Mudança de permissão é mudança, e mudança pede como voltar atrás.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "O laboratório desta trilha é o caso clássico: usuária no grupo certo, N1 já descartou o óbvio, e um Negar escondido em outro grupo derrubando tudo. Você resolve lendo a ACL.",
    },
  ],
};

const n2DhcpDns: Lesson = {
  id: "n2-dhcp-dns",
  level: 2,
  area: "redes",
  title: "DHCP e DNS pelo lado do servidor",
  summary:
    "Escopo, concessão, reserva, zona, registro e envelhecimento. O N1 lê o sintoma na estação; o N2 abre o servidor.",
  minutes: 13,
  nextQuizId: "n2-dhcp-dns",
  nextLabIds: ["dhcp-escopo-esgotado"],
  blocks: [
    {
      kind: "p",
      text: "No N1 você aprendeu a ler `169.254` na estação e a suspeitar do DHCP. No N2 você abre o DHCP e responde por que ele não entregou — e a resposta mais comum não é 'o serviço caiu'.",
    },

    { kind: "h", text: "1. Anatomia de um escopo" },
    {
      kind: "term",
      term: "Escopo",
      def: "A faixa de endereços que o servidor pode distribuir numa rede, com máscara, gateway e DNS que acompanham.",
      note: "10.10.10.100 até 10.10.10.150 são 51 endereços. Não 50, e não 100.",
    },
    {
      kind: "term",
      term: "Concessão (lease)",
      def: "O empréstimo do endereço por um prazo. A estação renova na metade do prazo; se não renovar, o endereço volta para o estoque quando vence.",
      note: "Prazo longo em rede com muita gente de passagem é o que esgota escopo.",
    },
    {
      kind: "term",
      term: "Reserva",
      def: "Vínculo entre um MAC e um endereço: aquele equipamento sempre recebe o mesmo IP, mas continua sendo o DHCP quem entrega.",
      note: "É o certo para impressora e servidor — melhor que digitar IP fixo no equipamento.",
    },
    {
      kind: "term",
      term: "Exclusão",
      def: "Pedaço da faixa que o servidor não deve distribuir, normalmente porque ali existem endereços configurados à mão.",
    },
    {
      kind: "p",
      text: "E as **opções** de escopo, que são o que a estação recebe junto do endereço. As três que importam: **3** é o gateway, **6** são os servidores DNS, **15** é o sufixo de domínio. Opção 6 apontando para o lugar errado produz exatamente o chamado de 'tem rede e nenhum site abre' que você já viu no N1 — só que agora a causa está no servidor, afetando todo mundo.",
    },

    { kind: "h", text: "2. Escopo esgotado" },
    {
      kind: "p",
      text: "É a causa que o N1 não consegue ver, porque do lado da estação o sintoma é idêntico a 'serviço caiu': APIPA. A diferença é que **algumas** máquinas pegam IP e outras não — quem já tinha concessão renova, quem chega novo não recebe nada.",
    },
    {
      kind: "cmd",
      caption: "Ver o estoque, não o serviço",
      lines: [
        "Get-DhcpServerv4ScopeStatistics",
        "  -> InUse, Free e PercentageInUse por escopo.",
        "     Free = 0 significa estoque zerado.",
        "",
        "Get-DhcpServerv4Lease -ScopeId 10.10.10.0",
        "  -> quem esta com cada endereco, e ate quando.",
      ],
    },
    {
      kind: "table",
      head: ["Saída", "Ordem de qualidade"],
      rows: [
        ["**Reduzir o tempo de concessão**", "Rápida. De 8 dias para 8 horas devolve endereço de quem só passou"],
        ["**Ampliar o escopo**", "Estrutural. Conferir colisão com IP fixo e com reservas"],
        ["**Separar redes**", "Definitiva. Visitante em Wi-Fi e escopo próprios"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Cuidado com a armadilha ao ampliar: se a faixa nova engolir endereços que alguém digitou à mão em impressora ou servidor, você troca escopo esgotado por conflito de IP espalhado. Amplie e crie exclusão, ou confirme que a parte alta da faixa está livre.",
    },

    { kind: "h", text: "3. DNS pelo lado do servidor" },
    {
      kind: "table",
      head: ["Conceito", "O que é"],
      rows: [
        ["**Zona direta**", "Nome → IP. É onde vivem os registros da empresa"],
        ["**Zona reversa**", "IP → nome. Usada por log, ferramenta de monitoramento e alguns serviços"],
        ["**Registro A**", "Nome de host para IPv4"],
        ["**CNAME**", "Apelido que aponta para outro nome"],
        ["**MX**", "Para onde vai o e-mail do domínio"],
        ["**Encaminhador (forwarder)**", "Para quem o servidor pergunta o que não é dele — internet"],
        ["**Envelhecimento (scavenging)**", "Limpeza automática de registro velho de máquina que sumiu"],
      ],
    },
    {
      kind: "p",
      text: "Sem envelhecimento ligado, o DNS acumula registro de máquina que não existe mais, e endereço reciclado pelo DHCP passa a resolver para o nome errado. O sintoma é desconcertante: você pinga um nome e responde uma máquina que não é aquela. Quando o relato tem essa cara, olhe registro duplicado e envelhecimento antes de qualquer outra coisa.",
    },
    {
      kind: "callout",
      tone: "key",
      text: "Regra que evita metade dos chamados de domínio: **as estações e os servidores apontam para o DNS interno, sempre.** Nunca para 8.8.8.8 direto. Quem sai para a internet é o servidor DNS interno, pelo encaminhador. Estação com DNS público configurado não encontra o controlador, e aí quebra logon, GPO e unidade mapeada — não só site.",
    },
    {
      kind: "p",
      text: "E o registro dinâmico: a estação publica o próprio nome no DNS quando pega endereço. Integrar DHCP e DNS é o que mantém isso limpo — o DHCP atualiza o registro quando entrega ou libera concessão, em vez de deixar lixo para trás.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "O laboratório te coloca **no servidor**, com o N1 dizendo que o serviço está de pé e várias máquinas em 169.254. Você tem que descobrir que o serviço estar rodando não significa que ele tem o que entregar.",
    },
  ],
};

const n2ProblemaMudanca: Lesson = {
  id: "n2-problema-mudanca",
  level: 2,
  area: "helpdesk",
  title: "Problema e mudança: a responsabilidade que muda no N2",
  summary:
    "Causa raiz, incidente maior, janela de mudança e rollback. É a parte do N2 que não é técnica e é a que mais pesa numa promoção.",
  minutes: 11,
  nextQuizId: "n2-problema-mudanca",
  nextLabIds: [],
  blocks: [
    {
      kind: "p",
      text: "A mudança de N1 para N2 não é só de dificuldade técnica. Muda a pergunta que se espera de você. Do N1 se espera **restaurar o serviço**. Do N2 se espera também **impedir que volte** — e assumir o risco de mexer em coisa que afeta muita gente.",
    },

    { kind: "h", text: "1. Incidente restaura; problema investiga" },
    {
      kind: "p",
      text: "Você já viu a distinção no N1. Aqui ela vira sua atribuição: o registro de **problema** existe para tratar a causa por trás de incidentes que se repetem, e ele corre num prazo diferente, porque investigar causa não pode competir com restaurar serviço.",
    },
    {
      kind: "table",
      head: ["", "Incidente", "Problema"],
      rows: [
        ["Objetivo", "Restaurar rápido", "Achar e eliminar a causa"],
        ["Prazo", "SLA apertado", "Prazo de investigação, sem urgência de minuto"],
        ["Sucesso", "Usuário voltou a trabalhar", "O incidente parou de acontecer"],
        ["Saída típica", "Solução de contorno", "Correção definitiva, ou mudança planejada"],
      ],
    },
    {
      kind: "term",
      term: "Solução de contorno (workaround)",
      def: "O que devolve o serviço agora, sem resolver a causa. Reiniciar o serviço, limpar a fila, mapear a unidade na mão.",
      note: "Contorno é legítimo e às vezes obrigatório. O erro é chamar contorno de solução e fechar o assunto.",
    },
    {
      kind: "term",
      term: "Erro conhecido",
      def: "Causa já identificada, com contorno documentado, esperando correção definitiva.",
      note: "É o que permite o N1 resolver em dois minutos o que antes escalava.",
    },
    {
      kind: "callout",
      tone: "key",
      text: "O indicador que mede se você está fazendo isso: **chamado recorrente caindo**. Um N2 que só apaga incêndio mantém o volume estável. Um N2 que trata causa esvazia a própria fila — e é isso que aparece numa avaliação.",
    },

    { kind: "h", text: "2. Análise de causa raiz, sem misticismo" },
    {
      kind: "p",
      text: "Causa raiz não é adivinhar melhor. É seguir a cadeia de 'por quê' até chegar em algo que você pode mudar. A técnica dos **cinco porquês** é literalmente isso, e funciona porque obriga a não parar no primeiro culpado.",
    },
    {
      kind: "cmd",
      caption: "Cinco porquês, num caso real",
      lines: [
        "A impressora do Comercial travou de novo.",
        "  Por que? A fila encheu e o spool travou.",
        "  Por que? Um documento corrompido ficou preso.",
        "  Por que? O driver generico nao trata o PDF daquele sistema.",
        "  Por que? A impressora foi instalada com driver generico.",
        "  Por que? Nao existe padrao de instalacao de impressora documentado.",
        "",
        "Causa raiz: falta de padrao. Correcao: padronizar e documentar,",
        "nao 'limpar a fila mais rapido na proxima vez'.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      text: "Duas armadilhas. A primeira é parar cedo e culpar o usuário — 'ele mandou o arquivo errado' encerra a investigação sem mudar nada. A segunda é ir longe demais e cair em causa que você não controla, tipo 'a empresa não investe em TI': verdadeiro, inútil como ação. Pare no último elo que está no seu alcance.",
    },

    { kind: "h", text: "3. Incidente maior" },
    {
      kind: "p",
      text: "Quando a parada é grande, o trabalho técnico é metade. A outra metade é **comunicação**, e é nela que a TI ganha ou perde credibilidade.",
    },
    {
      kind: "steps",
      items: [
        "**Declarar.** Nomear como incidente maior muda a régua: reúne gente, autoriza interromper o resto e dispensa você de responder chamado individual.",
        "**Um responsável pela comunicação**, separado de quem está com a mão no problema. Quem investiga não consegue avisar cinquenta pessoas.",
        "**Aviso com o que se sabe e a hora do próximo aviso.** 'Estamos apurando, novo informe às 15h30' vale mais que silêncio, e vale mais que promessa de prazo que você não tem.",
        "**Registrar a linha de tempo enquanto acontece.** Ninguém reconstrói isso depois com precisão.",
        "**Encerrar formalmente**, avisando que voltou, e só então abrir o registro de problema para a causa.",
        "**Pós-morte sem caça às bruxas.** O que falhou no sistema, não quem errou. Culpa faz a informação parar de aparecer.",
      ],
    },

    { kind: "h", text: "4. Mudança: o que o N2 passa a poder quebrar" },
    {
      kind: "p",
      text: "No N1 quase tudo que você faz é reversível e afeta uma pessoa. No N2 você mexe em GPO, permissão de pasta, escopo de DHCP, registro de DNS — coisas que afetam todos de uma vez. Por isso existe processo de mudança, e ele não é burocracia inventada: é o que evita que uma alteração de dois cliques pare a empresa.",
    },
    {
      kind: "table",
      head: ["Elemento", "Para que serve"],
      rows: [
        ["**Janela de manutenção**", "Fazer fora do horário em que a parada machuca"],
        ["**Plano de rollback**", "Como voltar atrás. Se você não sabe voltar, não está pronto para aplicar"],
        ["**Teste antes**", "Aplicar numa OU de teste, numa máquina, num grupo pequeno"],
        ["**Aprovação (CAB)**", "Alguém além de você concordou com o risco"],
        ["**Comunicação prévia**", "Quem vai sentir precisa saber antes, não descobrir"],
        ["**Registro do que mudou**", "Quando algo quebrar semana que vem, é aqui que se olha primeiro"],
      ],
    },
    {
      kind: "callout",
      tone: "key",
      text: "A pergunta que resume tudo, e que vale levar para a entrevista: **'como eu volto atrás?'** Se a resposta não existir, a mudança não está pronta — independente de quão simples ela pareça. Exportar a GPO antes de editar, salvar a ACL antes de mexer, anotar o escopo antes de ampliar. Dois segundos cada, e é o que separa quem opera com rede de segurança de quem opera na sorte.",
    },
    {
      kind: "p",
      text: "E existe a **mudança emergencial**, que é real e legítima: o sistema está parado, a correção é conhecida, não dá para esperar reunião. A diferença é que ela é registrada e aprovada **depois**, não que ela dispensa registro. Emergência não é desculpa para não haver rastro.",
    },

    { kind: "h", text: "O que fazer agora" },
    {
      kind: "p",
      text: "Esta trilha não tem laboratório porque o que ela treina é julgamento, não comando. O questionário cobre as decisões: quando declarar incidente maior, quando parar de investigar causa, o que exigir antes de aplicar uma mudança, e o que fazer quando o contorno resolve e a causa continua lá.",
    },
  ],
};

export const LESSONS: Lesson[] = [
  redesN1,
  helpdeskConceitos,
  windowsEstacao,
  impressao,
  dominioBasico,
  n2Identidade,
  n2Permissao,
  n2DhcpDns,
  n2ProblemaMudanca,
];

export function lessonsByLevel(level: 1 | 2 | 3): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export const AVAILABLE_LEVELS: (1 | 2 | 3)[] = [1, 2];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
