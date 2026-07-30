import type { Quiz } from "./types";

/**
 * As questões saem dos requisitos que se repetem nas 30 vagas mapeadas em
 * `../mapeamento-empresas-ti/index.csv`.
 * Cada alternativa errada tem explicação — errar aqui é o objetivo.
 */

const redesN1: Quiz = {
  id: "redes-n1",
  title: "Redes para suporte N1",
  area: "redes",
  summary:
    "Endereçamento, APIPA, DNS, escopo de falha e cabeamento. É a lacuna que aparece em praticamente toda vaga de técnico.",
  questions: [
    {
      id: "redes-apipa",
      area: "redes",
      context:
        "Você atende um chamado de 'sem internet'. Roda ipconfig e o endereço IPv4 é 169.254.10.5.",
      prompt: "O que esse endereço está te dizendo?",
      options: [
        {
          id: "a",
          text: "A máquina não conseguiu obter IP do servidor DHCP",
          correct: true,
          why: "Certo. 169.254.x.x é APIPA: quando o Windows pede IP ao DHCP e não recebe resposta, ele mesmo inventa um endereço nessa faixa. Ele fala só com a rede local imediata e nunca dá internet.",
        },
        {
          id: "b",
          text: "O IP está correto, o problema é no navegador",
          why: "Não. Nenhum IP 169.254 é utilizável para internet. Nem trocando de navegador funcionaria.",
        },
        {
          id: "c",
          text: "A máquina está com IP fixo configurado errado",
          why: "Não. Se fosse IP fixo errado, você veria o endereço que alguém digitou, não a faixa 169.254 — que só o próprio Windows gera.",
        },
        {
          id: "d",
          text: "É o IP do gateway sendo mostrado no lugar errado",
          why: "Não. Gateway aparece em campo próprio. 169.254 nunca é gateway de rede corporativa.",
        },
      ],
      takeaway:
        "169.254.x.x = 'não consegui falar com o DHCP'. Causas em ordem: cabo, porta do switch, serviço DHCP caído, faixa de IPs esgotada.",
    },
    {
      id: "redes-apipa-escopo",
      area: "redes",
      context: "Três máquinas do mesmo setor estão todas com 169.254.x.x.",
      prompt: "Qual causa fica mais provável, comparada a uma máquina só com esse sintoma?",
      options: [
        {
          id: "a",
          text: "O serviço DHCP caiu, ou o switch do setor está fora",
          correct: true,
          why: "Certo. Várias máquinas ao mesmo tempo tira o problema do cabo individual e joga para algo compartilhado: DHCP, switch do setor, ou a faixa de IPs esgotada.",
        },
        {
          id: "b",
          text: "Os três cabos se soltaram",
          why: "Improvável e é o erro de raciocínio: causa individual não explica sintoma coletivo. Só considere depois de descartar o compartilhado.",
        },
        {
          id: "c",
          text: "As três placas de rede queimaram",
          why: "Praticamente impossível ao mesmo tempo. Mesma lógica: causa individual não explica falha simultânea.",
        },
        {
          id: "d",
          text: "O provedor de internet caiu",
          why: "Não. Link do provedor caído derruba a internet, mas o DHCP interno continuaria entregando IP normal — você veria IP válido sem navegar.",
        },
      ],
      takeaway:
        "Sempre pergunte 'afeta 1 pessoa ou todo mundo?'. A resposta muda a causa provável antes de qualquer teste.",
    },
    {
      id: "redes-comando-all",
      area: "redes",
      prompt:
        "Qual comando mostra, de uma vez, IP, máscara, gateway, servidores DNS e endereço MAC?",
      options: [
        {
          id: "a",
          text: "ipconfig /all",
          correct: true,
          why: "Certo. ipconfig sozinho mostra o resumo; o /all acrescenta DNS, MAC, se o DHCP está habilitado e qual servidor entregou o IP.",
        },
        {
          id: "b",
          text: "netstat -ano",
          why: "Não. netstat lista conexões e portas em uso — útil para investigar o que está conectado, não para ver a configuração da placa.",
        },
        {
          id: "c",
          text: "systeminfo",
          why: "Mostra dados do sistema e traz alguma info de rede no fim, mas não é a ferramenta de diagnóstico de IP. Em entrevista, a resposta esperada é ipconfig /all.",
        },
        {
          id: "d",
          text: "ping -a",
          why: "Não. ping testa alcance de um destino; -a apenas tenta resolver o nome do IP alvo.",
        },
      ],
      takeaway: "ipconfig /all é sempre o primeiro comando de um chamado de rede.",
    },
    {
      id: "redes-dns",
      area: "redes",
      context:
        "O usuário diz que 'a internet não funciona'. Você testa: ping 8.8.8.8 responde normalmente, ping google.com falha com 'não pôde encontrar o host'.",
      prompt: "Onde está o problema?",
      options: [
        {
          id: "a",
          text: "No DNS",
          correct: true,
          why: "Certo. Alcançar por IP e falhar por nome isola a falha na tradução nome → IP. Confirma com nslookup, e corrige apontando um DNS válido (ou ipconfig /flushdns, se for cache velho).",
        },
        {
          id: "b",
          text: "No cabo de rede",
          why: "Não. Cabo ruim não deixaria o ping 8.8.8.8 responder.",
        },
        {
          id: "c",
          text: "No gateway",
          why: "Não. Sem gateway funcionando, o ping 8.8.8.8 não sairia da rede local.",
        },
        {
          id: "d",
          text: "No firewall do Windows",
          why: "Improvável nesse padrão. Firewall bloqueando daria falha nos dois testes, ou em portas específicas — não a mensagem 'não pôde encontrar o host', que é assinatura de DNS.",
        },
      ],
      takeaway:
        "Esse par de testes é ouro: ping por IP funciona + ping por nome falha = DNS. Vale decorar a frase.",
    },
    {
      id: "redes-sequencia",
      area: "redes",
      prompt:
        "Qual é a ordem correta de diagnóstico para 'não tenho internet'?",
      options: [
        {
          id: "a",
          text: "ipconfig /all → ping gateway → ping 8.8.8.8 → ping google.com",
          correct: true,
          why: "Certo. Cada passo elimina uma camada: tenho endereço válido? alcanço meu roteador? saio para a internet? resolvo nomes? Saber explicar isso vale mais que decorar 30 comandos.",
        },
        {
          id: "b",
          text: "Reiniciar a máquina, e se não resolver, reinstalar o Windows",
          why: "Reiniciar pode resolver por acaso, mas não é diagnóstico — e reinstalar o Windows por falta de internet é destruir a máquina do usuário sem motivo.",
        },
        {
          id: "c",
          text: "ping google.com → se falhar, trocar o cabo",
          why: "Começa pelo teste que mais mistura causas. Falhar em google.com pode ser DNS, gateway, link ou cabo — você não sabe qual, e já foi trocar peça.",
        },
        {
          id: "d",
          text: "Abrir o navegador, testar três sites e ligar para o provedor",
          why: "Escalar para o provedor sem isolar nada é o comportamento mais criticado num N1. Você precisa chegar com evidência.",
        },
      ],
      takeaway:
        "Quatro passos, quatro camadas. É a resposta pronta para 'um usuário liga sem internet, o que você faz?'.",
    },
    {
      id: "redes-gateway-dns",
      area: "redes",
      prompt: "Qual a diferença prática entre gateway e DNS?",
      options: [
        {
          id: "a",
          text: "Gateway é a porta de saída da rede; DNS traduz nome em IP",
          correct: true,
          why: "Certo. Sem gateway, o pacote não sai da rede local. Sem DNS, ele sai, mas você precisa saber o IP de cabeça.",
        },
        {
          id: "b",
          text: "Gateway é o endereço do PC; DNS é o do roteador",
          why: "Trocado e errado. O endereço do PC é o IP; o gateway normalmente É o roteador.",
        },
        {
          id: "c",
          text: "São a mesma coisa, com nomes diferentes",
          why: "Não. Costumam ser o mesmo equipamento numa rede pequena (o roteador faz os dois papéis), mas são funções distintas — e falham de formas diferentes.",
        },
        {
          id: "d",
          text: "Gateway só existe em rede Wi-Fi",
          why: "Não. Gateway existe em qualquer rede que precise sair para fora, cabeada ou sem fio.",
        },
      ],
      takeaway:
        "Gateway errado: rede local funciona, internet não. DNS errado: internet 'funciona' mas nenhum site abre.",
    },
    {
      id: "redes-wifi-sala",
      area: "redes",
      context:
        "O Wi-Fi cai só numa sala do prédio. O resto da empresa está normal.",
      prompt: "Qual a causa mais provável e a solução típica?",
      options: [
        {
          id: "a",
          text: "Cobertura de sinal naquela área — resolver com access point, canal ou reposicionamento",
          correct: true,
          why: "Certo. Sintoma restrito a uma área física aponta para distância do AP, obstáculo (parede de concreto, armário de metal, elevador) ou interferência de canal.",
        },
        {
          id: "b",
          text: "Problema no provedor de internet — abrir chamado com a operadora",
          why: "Esse é o erro clássico. Se fosse o provedor, o prédio inteiro cairia. Escopo restrito nunca aponta para link externo.",
        },
        {
          id: "c",
          text: "Vírus nas máquinas daquela sala",
          why: "Não explica um sintoma que segue a geografia da sala, e não o usuário ou a máquina.",
        },
        {
          id: "d",
          text: "Trocar o roteador principal da empresa",
          why: "Trocar equipamento que atende todo mundo por causa de uma sala é desproporcional — e provavelmente não resolve.",
        },
      ],
      takeaway:
        "2.4 GHz alcança mais e é mais lento/congestionado; 5 GHz é rápido e morre na parede. Área morta se resolve com AP, não com provedor.",
    },
    {
      id: "redes-cabo",
      area: "redes",
      prompt:
        "Você vai crimpar um cabo para ligar um PC ao switch. Que cabo é, e a ordem dos fios importa?",
      options: [
        {
          id: "a",
          text: "Cabo direto, e a ordem importa porque os pares trançados cancelam interferência",
          correct: true,
          why: "Certo. Direto (straight-through) = mesma pinagem nas duas pontas, padrão T568B no Brasil. Embaralhar os pares pode até dar link, mas perde pacote, não atinge gigabit e falha em cabo longo.",
        },
        {
          id: "b",
          text: "Cabo crossover, porque PC e switch são equipamentos diferentes",
          why: "Invertido: crossover era para equipamentos IGUAIS (PC↔PC). E hoje é obsoleto, porque equipamento moderno tem auto-MDI/MDIX.",
        },
        {
          id: "c",
          text: "Cabo direto, e qualquer ordem funciona desde que seja igual nas duas pontas",
          why: "É a pegadinha. Igual nas duas pontas dá link, sim — mas se os pares não respeitarem o trançado, o cabo perde desempenho e volta como chamado semanas depois. É o defeito mais difícil de achar.",
        },
        {
          id: "d",
          text: "Cabo crossover, e a ordem não importa",
          why: "Errado nas duas partes.",
        },
      ],
      takeaway:
        "T568B: branco-laranja, laranja, branco-verde, azul, branco-azul, verde, branco-marrom, marrom. Limite de 100 m por trecho.",
    },
    {
      id: "redes-conflito",
      area: "redes",
      context:
        "Duas máquinas foram configuradas com IP fixo 192.168.0.50, na mesma rede.",
      prompt: "O que acontece?",
      options: [
        {
          id: "a",
          text: "As duas passam a ter problema de conectividade intermitente",
          correct: true,
          why: "Certo. É conflito de IP: as duas se atrapalham, e o Windows costuma avisar. A correção é deixar uma no DHCP ou usar reserva por MAC no servidor DHCP.",
        },
        {
          id: "b",
          text: "A segunda a entrar na rede tem o endereço desabilitado pelo Windows e fica sem rede",
          why: "Essa é bem defensável e acontece: o Windows detecta o conflito, avisa e desabilita o endereço duplicado — no `ipconfig /all` ele aparece como (Duplicado). A alternativa A é a melhor resposta porque descreve o que o usuário relata no chamado, que é instabilidade: as máquinas ligam e desligam ao longo do dia, então o sintoma vai e volta em vez de ser uma queda limpa.",
        },
        {
          id: "c",
          text: "Nada, IP repetido é permitido em rede local",
          why: "Não. Dentro da mesma rede, o IP tem que ser único — é o endereço pelo qual o pacote encontra a máquina.",
        },
        {
          id: "d",
          text: "O DHCP corrige sozinho",
          why: "O DHCP não manda em quem está com IP fixo. Ele até evita distribuir o mesmo endereço, mas não reconfigura uma máquina estática.",
        },
      ],
      takeaway:
        "Impressora e servidor merecem reserva por MAC no DHCP, não IP fixo digitado na máquina — dá o mesmo resultado e centraliza o controle.",
    },
    {
      id: "redes-escopo-setor",
      area: "redes",
      context: "Um setor inteiro perdeu rede. Os outros setores estão normais.",
      prompt: "Qual camada você investiga primeiro?",
      options: [
        {
          id: "a",
          text: "O switch daquele setor, ou o access point que atende a área",
          correct: true,
          why: "Certo. Escopo regional aponta para o equipamento que atende exatamente aquele grupo — nem a máquina individual, nem o link da empresa.",
        },
        {
          id: "b",
          text: "A placa de rede de cada máquina do setor",
          why: "Causa individual para sintoma coletivo. Só desça a esse nível depois de descartar o equipamento compartilhado.",
        },
        {
          id: "c",
          text: "O link do provedor",
          why: "Link caído afetaria a empresa toda, não um setor. E a rede interna continuaria funcionando.",
        },
        {
          id: "d",
          text: "O servidor de arquivos",
          why: "Servidor fora do ar tira o acesso a pastas, não a rede inteira do setor.",
        },
      ],
      takeaway:
        "Três escopos, três camadas: 1 máquina = cabo/porta/IP · 1 setor = switch/AP · todos = link/roteador.",
    },
  ],
};

const helpdeskConceitos: Quiz = {
  id: "helpdesk-conceitos",
  title: "Conceitos de help desk",
  area: "helpdesk",
  summary:
    "Incidente vs requisição, prioridade, SLA, escalonamento e encerramento. É a parte que o entrevistador pergunta e não depende de máquina.",
  questions: [
    {
      id: "hd-incidente-requisicao",
      area: "helpdesk",
      prompt:
        "Qual destes é uma REQUISIÇÃO de serviço, e não um incidente?",
      options: [
        {
          id: "a",
          text: "'Preciso de acesso à pasta do Financeiro'",
          correct: true,
          why: "Certo. Nada quebrou: o usuário quer algo novo. Requisição normalmente exige aprovação do gestor, e é isso que muda o seu procedimento.",
        },
        {
          id: "b",
          text: "'O sistema está muito lento hoje'",
          why: "Incidente: o serviço existe e está degradado. Objetivo é restaurar, mesmo com solução de contorno.",
        },
        {
          id: "c",
          text: "'Não consigo mais logar, ontem funcionava'",
          why: "Incidente: funcionava e parou. Provavelmente senha expirada, conta bloqueada ou desabilitada.",
        },
        {
          id: "d",
          text: "'A impressora parou de imprimir'",
          why: "Incidente clássico.",
        },
      ],
      takeaway:
        "Incidente = quebrou, restaurar. Requisição = quer algo, cumprir com aprovação. Têm SLA e fila diferentes.",
    },
    {
      id: "hd-prioridade",
      area: "helpdesk",
      context:
        "Chegam dois chamados juntos: um usuário sem mouse, e o servidor de arquivos fora do ar afetando 40 pessoas.",
      prompt: "Como você prioriza, e com base em quê?",
      options: [
        {
          id: "a",
          text: "Servidor primeiro, porque prioridade é impacto × urgência",
          correct: true,
          why: "Certo. Impacto = quantas pessoas / quão crítico o processo. Urgência = o quanto pode esperar. 40 pessoas paradas ganha de um periférico.",
        },
        {
          id: "b",
          text: "Ordem de chegada, para ser justo com a fila",
          why: "Fila por ordem de chegada ignora impacto. É o erro que faz um chamado de mouse travar a empresa.",
        },
        {
          id: "c",
          text: "O do usuário primeiro, porque é rápido de resolver",
          why: "Tentador, mas 'rápido' não é critério de prioridade. Se o rápido demorar 10 min, são 40 pessoas × 10 min perdidos.",
        },
        {
          id: "d",
          text: "Pelo cargo de quem abriu",
          why: "Cargo não é critério. Se um diretor pede algo de baixo impacto, você comunica o prazo — não inverte a prioridade.",
        },
      ],
      takeaway:
        "Impacto × urgência, sempre. Cargo do solicitante entra como comunicação, nunca como critério.",
    },
    {
      id: "hd-escalonar",
      area: "helpdesk",
      prompt: "Quando você escala um chamado para o N2?",
      options: [
        {
          id: "a",
          text: "Quando esgotei meu escopo/roteiro, falta permissão que eu não tenho, ou o SLA está em risco",
          correct: true,
          why: "Certo. São os três gatilhos legítimos. Fora deles, escalar é empurrar trabalho.",
        },
        {
          id: "b",
          text: "Assim que o usuário fica irritado",
          why: "Irritação é uma questão de conduta, não critério técnico. Você acalma, resolve ou explica — escalar por isso não muda o problema.",
        },
        {
          id: "c",
          text: "Sempre que o chamado passa de 10 minutos",
          why: "Tempo sozinho não é gatilho. Muita coisa de N1 leva mais de 10 minutos e continua sendo N1.",
        },
        {
          id: "d",
          text: "Nunca — um bom N1 resolve tudo",
          why: "Falso e perigoso. Insistir em algo fora do seu acesso queima SLA e pode piorar o problema.",
        },
      ],
      takeaway:
        "Antes de escalar, registre: o que o usuário relatou, o que você testou, o resultado de cada teste, o que descartou. Sem isso, o N2 recomeça do zero.",
    },
    {
      id: "hd-fechar",
      area: "helpdesk",
      prompt: "Quando um chamado pode ser encerrado?",
      options: [
        {
          id: "a",
          text: "Quando o usuário confirma que voltou a funcionar",
          correct: true,
          why: "Certo. Encerramento pede validação de quem abriu. Fechar por conta própria é a causa número 1 de reabertura — e reabertura estraga o indicador.",
        },
        {
          id: "b",
          text: "Quando eu terminei o procedimento técnico",
          why: "Você pode ter resolvido outra coisa, ou resolvido parcialmente. Sem confirmação, não sabe.",
        },
        {
          id: "c",
          text: "Ao fim do turno, para não deixar chamado aberto",
          why: "Fechar para limpar a fila é maquiar indicador. O certo é registrar o andamento e passar o plantão.",
        },
        {
          id: "d",
          text: "Quando o usuário para de responder",
          why: "Aí o correto é pausar o SLA e registrar a tentativa de contato, não encerrar como resolvido.",
        },
      ],
      takeaway:
        "Registro → categorização → prioridade → diagnóstico → resolução/escalonamento → encerramento validado → documentação.",
    },
    {
      id: "hd-sla",
      area: "helpdesk",
      prompt: "O que significa 'pausar o SLA' de um chamado?",
      options: [
        {
          id: "a",
          text: "Parar a contagem do prazo enquanto o chamado depende de terceiro",
          correct: true,
          why: "Certo. Usuário não responde, peça em compra, fornecedor analisando: o relógio para, porque o atraso não é seu. Saber pausar corretamente é o que impede seu indicador de afundar por algo fora do seu controle.",
        },
        {
          id: "b",
          text: "Cancelar o chamado",
          why: "Não. Cancelar encerra; pausar mantém aberto com o prazo congelado.",
        },
        {
          id: "c",
          text: "Baixar a prioridade",
          why: "São coisas diferentes. Prioridade define a ordem; SLA define o prazo.",
        },
        {
          id: "d",
          text: "Passar o chamado para outro atendente",
          why: "Isso é transferência ou escalonamento, não pausa de SLA.",
        },
      ],
      takeaway:
        "Dois relógios diferentes: tempo de primeira resposta (alguém assumiu) e tempo de solução (está resolvido).",
    },
    {
      id: "hd-offboarding",
      area: "helpdesk",
      context: "RH avisa que um funcionário foi desligado hoje.",
      prompt: "Qual o procedimento correto com a conta dele?",
      options: [
        {
          id: "a",
          text: "Desabilitar a conta, preservar os dados, liberar a licença depois e recolher o equipamento",
          correct: true,
          why: "Certo. Desabilitar corta o acesso imediatamente sem destruir nada. Os dados podem ser necessários para a empresa, e a licença só se libera depois de garantir isso.",
        },
        {
          id: "b",
          text: "Deletar a conta e a caixa de e-mail na hora",
          why: "Erro grave: leva embora histórico, arquivos e e-mails que a empresa pode precisar, e é irreversível na maioria dos ambientes.",
        },
        {
          id: "c",
          text: "Só trocar a senha e deixar a conta ativa",
          why: "Conta ativa continua existindo em grupos e acessos, e pode ser reativada por engano. Desabilitar é explícito.",
        },
        {
          id: "d",
          text: "Nada, o RH resolve isso no sistema deles",
          why: "Acesso a sistema é responsabilidade da TI. Conta ativa de ex-funcionário é risco de segurança.",
        },
      ],
      takeaway:
        "Offboarding: desabilitar (nunca deletar), preservar dados, remover de grupos, mover para OU de desligados, liberar licença, recolher ativo.",
    },
    {
      id: "hd-logar",
      area: "helpdesk",
      context: "O usuário liga: 'não consigo entrar no computador'.",
      prompt: "Quais três causas diferentes você precisa distinguir antes de agir?",
      options: [
        {
          id: "a",
          text: "Conta bloqueada por tentativas, conta desabilitada, e senha expirada",
          correct: true,
          why: "Certo. São três estados com correção diferente: desbloquear, reabilitar (e perguntar por que foi desabilitada) ou resetar com troca no próximo logon.",
        },
        {
          id: "b",
          text: "Teclado, monitor e mouse",
          why: "Vale confirmar o básico, mas não é o eixo do problema de logon em ambiente com domínio.",
        },
        {
          id: "c",
          text: "Vírus, Windows corrompido e HD com defeito",
          why: "Pula direto para causas destrutivas antes de checar o mais comum e mais barato de resolver.",
        },
        {
          id: "d",
          text: "Sempre é senha errada, então resete direto",
          why: "Resetar senha de uma conta apenas bloqueada não resolve, e resetar de conta desabilitada esconde o motivo real da desabilitação.",
        },
      ],
      takeaway:
        "Bloqueada ≠ desabilitada ≠ senha expirada. Ler o estado da conta no AD antes de mexer economiza o chamado inteiro.",
    },
    {
      id: "hd-acesso",
      area: "helpdesk",
      context:
        "Um usuário do Comercial pede acesso à pasta do Financeiro, dizendo que precisa para um relatório urgente.",
      prompt: "O que você faz?",
      options: [
        {
          id: "a",
          text: "Registro como requisição e encaminho para aprovação do responsável pelos dados",
          correct: true,
          why: "Certo. Acesso a dado de outro setor não é decisão do N1 nem do solicitante. Urgência não substitui aprovação.",
        },
        {
          id: "b",
          text: "Concedo, porque é urgente, e depois aviso o gestor",
          why: "Conceder primeiro e avisar depois é exatamente o que auditoria e política de acesso proíbem. Se der problema, a responsabilidade é sua.",
        },
        {
          id: "c",
          text: "Recuso, porque acesso entre setores nunca é permitido",
          why: "Também errado, no outro extremo. Pode ser perfeitamente legítimo — só não é você quem decide.",
        },
        {
          id: "d",
          text: "Adiciono o usuário direto na permissão da pasta, sem passar por grupo",
          why: "Duas falhas: sem aprovação, e por usuário em vez de grupo. Permissão por usuário vira bagunça impossível de auditar.",
        },
      ],
      takeaway:
        "Permissão sempre por grupo, nunca por usuário. E acesso a dado de terceiro sempre com aprovação registrada no chamado.",
    },
    {
      id: "hd-imac",
      area: "helpdesk",
      prompt: "Nas vagas aparece 'atendimento a demandas de IMAC'. O que é IMAC?",
      options: [
        {
          id: "a",
          text: "Install, Move, Add, Change — instalar, mover, adicionar e alterar estações de trabalho",
          correct: true,
          why: "Certo. É o trabalho de mexer no parque de máquinas: montar estação nova, mudar alguém de sala, adicionar periférico, trocar configuração.",
        },
        {
          id: "b",
          text: "Um modelo de computador da Apple",
          why: "Confusão comum pelo nome, mas no contexto de vaga de suporte é o processo, não o produto.",
        },
        {
          id: "c",
          text: "Um tipo de endereço de rede",
          why: "Endereço físico da placa é MAC, sem o I. Coisa diferente.",
        },
        {
          id: "d",
          text: "Uma certificação de infraestrutura",
          why: "Não é certificação.",
        },
      ],
      takeaway:
        "Vocabulário que aparece nas vagas: IMAC, onboarding, offboarding, inventário/ativo de TI, FCR, backlog, catálogo de serviços.",
    },
    {
      id: "hd-registro",
      area: "helpdesk",
      context:
        "Você resolve um problema para um colega no corredor, em dois minutos, sem abrir chamado.",
      prompt: "Qual o problema disso?",
      options: [
        {
          id: "a",
          text: "Sem registro não existe histórico, indicador nem base de conhecimento",
          correct: true,
          why: "Certo. O atendimento aconteceu, mas para a empresa não existiu: não conta no seu volume, não vira artigo de KB, e se o problema voltar ninguém sabe o que já foi feito.",
        },
        {
          id: "b",
          text: "Nenhum, chamado só serve para burocracia",
          why: "É a visão que o gestor de service desk menos quer ouvir numa entrevista. O registro é o que permite medir e melhorar.",
        },
        {
          id: "c",
          text: "O problema é ter atendido rápido",
          why: "Atender rápido é bom. O que falta é registrar.",
        },
        {
          id: "d",
          text: "Só é problema se o chefe descobrir",
          why: "Além de ser a resposta errada, é a postura errada.",
        },
      ],
      takeaway:
        "Se não está no sistema, não aconteceu. Registrar é o que transforma atendimento em histórico, indicador e conhecimento.",
    },
  ],
};

/**
 * A trilha de domínio cobrava na prática (laboratório da unidade Z:) e não tinha
 * cobrança nenhuma de conceito — AD, GPO e NTFS não apareciam em nenhuma das 20
 * questões anteriores, apesar de estarem nas vagas mais bem pagas do mapeamento.
 */
const dominioBasico: Quiz = {
  id: "dominio-basico",
  title: "Domínio, AD e permissão",
  area: "ad",
  summary:
    "Controlador de domínio, OU, grupo, GPO e as duas camadas de permissão de pasta. É o que separa suporte doméstico de suporte corporativo.",
  questions: [
    {
      id: "ad-dc",
      area: "ad",
      prompt: "O que é o controlador de domínio numa empresa?",
      options: [
        {
          id: "a",
          text: "O servidor que roda o Active Directory e autentica o logon de todo mundo",
          correct: true,
          why: "Certo. Ele guarda usuários, grupos, computadores e políticas, e é quem valida a senha quando alguém liga a máquina. Por isso ele tem IP fixo: as estações precisam encontrá-lo sempre no mesmo lugar.",
        },
        {
          id: "b",
          text: "O roteador que controla o acesso à internet da empresa",
          why: "Não. Isso é o roteador ou firewall de borda. Controlador de domínio é sobre identidade, não sobre saída de rede.",
        },
        {
          id: "c",
          text: "O servidor de arquivos onde ficam as pastas dos setores",
          why: "Pode ser a mesma máquina numa empresa pequena, mas são papéis diferentes. Servidor de arquivos guarda pasta; controlador de domínio autentica gente.",
        },
        {
          id: "d",
          text: "O programa de inventário que lista as máquinas",
          why: "Não. Inventário é ferramenta de gestão de ativos, tipo GLPI.",
        },
      ],
      takeaway:
        "AD depende de DNS: é por DNS que a estação descobre onde está o controlador. DNS errado em máquina de domínio quebra logon e GPO, não só sites.",
    },
    {
      id: "ad-share-ntfs",
      area: "ad",
      context:
        "Numa pasta compartilhada, a permissão de Compartilhamento dá Leitura ao grupo e a permissão NTFS dá Modificar.",
      prompt: "O que o usuário consegue fazer de fato?",
      options: [
        {
          id: "a",
          text: "Só ler — vale a mais restritiva das duas",
          correct: true,
          why: "Certo. São dois cadeados independentes, e o efetivo pelo acesso de rede é o mais restritivo. É a pergunta de permissão mais comum em teste técnico.",
        },
        {
          id: "b",
          text: "Modificar — o NTFS sempre manda",
          why: "Errado no sentido. O NTFS é mais granular, mas quando o acesso vem pela rede as duas camadas se aplicam e a mais restritiva ganha.",
        },
        {
          id: "c",
          text: "Nada — permissões conflitantes bloqueiam o acesso",
          why: "Não. Não é conflito que bloqueia; é a interseção que define. Leitura em uma e Modificar na outra resulta em Leitura.",
        },
        {
          id: "d",
          text: "Depende de quem criou a pasta",
          why: "O criador vira proprietário e isso importa para tomar posse, mas não altera a regra do mais restritivo.",
        },
      ],
      takeaway:
        "Compartilhamento = quem entra pela rede. NTFS = quem acessa de qualquer jeito, inclusive local. Efetivo pela rede: o mais restritivo.",
    },
    {
      id: "ad-grupo",
      area: "ad",
      prompt:
        "Aprovaram o acesso de um usuário à pasta do Financeiro. Como você concede?",
      options: [
        {
          id: "a",
          text: "Adiciono o usuário ao grupo que já tem a permissão na pasta",
          correct: true,
          why: "Certo. Permissão se dá a grupo, e usuário entra no grupo. É o que mantém o ambiente auditável: você olha o grupo e sabe quem tem acesso.",
        },
        {
          id: "b",
          text: "Adiciono o usuário direto na aba Segurança da pasta",
          why: "Funciona e é justamente o problema: em seis meses ninguém sabe mais quem tem acesso a quê nem por quê. Permissão por usuário é dívida técnica garantida.",
        },
        {
          id: "c",
          text: "Copio a conta de alguém do Financeiro para o novo usuário",
          why: "Copiar conta é um atalho que arrasta permissões que você não conferiu, e costuma dar mais acesso do que foi aprovado.",
        },
        {
          id: "d",
          text: "Dou permissão de Administrador na máquina dele",
          why: "Não tem relação: administrador local não concede acesso a pasta de rede de outro servidor, e ainda cria risco de segurança.",
        },
      ],
      takeaway: "Permissão em grupo, usuário no grupo. Sempre, sem exceção.",
    },
    {
      id: "ad-gpupdate-falha",
      area: "ad",
      context:
        "Você roda `gpupdate /force` numa estação e ele responde que não foi possível localizar um controlador de domínio para o domínio.",
      prompt: "O que isso indica primeiro?",
      options: [
        {
          id: "a",
          text: "Problema de rede ou de DNS: a máquina não está alcançando o controlador",
          correct: true,
          why: "Certo. GPO precisa conversar com o controlador. Sem rede, com 169.254 ou com DNS apontando para o lugar errado, o gpupdate falha assim. Chamado de GPO costuma ser chamado de rede disfarçado — rode a sequência de quatro passos antes.",
        },
        {
          id: "b",
          text: "A GPO está com erro de configuração",
          why: "A mensagem não é sobre o conteúdo da política; é sobre não encontrar quem a entrega. Só investigue a GPO depois de confirmar que a máquina fala com o DC.",
        },
        {
          id: "c",
          text: "O usuário não tem permissão para aplicar políticas",
          why: "Aplicação de GPO não depende de permissão do usuário comum. A mensagem seria outra.",
        },
        {
          id: "d",
          text: "A máquina precisa ser reinstalada",
          why: "Desproporcional. Nenhuma mensagem de gpupdate justifica reinstalar Windows.",
        },
      ],
      takeaway:
        "`gpresult /r` mostra o que aplicou e de qual controlador. Se nem o controlador aparece, o problema está antes da política.",
    },
    {
      id: "ad-ou-gpo",
      area: "ad",
      prompt: "Onde uma GPO pode ser vinculada?",
      options: [
        {
          id: "a",
          text: "Ao site, ao domínio ou a uma OU",
          correct: true,
          why: "Certo, e essa é a ordem em que se aplicam: site, depois domínio, depois OU — a de baixo prevalece em caso de conflito. É por isso que organizar OU por setor importa.",
        },
        {
          id: "b",
          text: "Diretamente a um grupo de segurança",
          why: "É a confusão mais comum. Não se vincula GPO a grupo; usa-se o grupo como **filtro de segurança** de uma GPO que está vinculada a um site, domínio ou OU. Parecido no efeito, diferente no mecanismo — e o entrevistador percebe a diferença.",
        },
        {
          id: "c",
          text: "A uma pasta compartilhada",
          why: "Pasta recebe permissão, não política de grupo.",
        },
        {
          id: "d",
          text: "A um endereço IP ou faixa de rede",
          why: "Não existe vínculo de GPO por IP. O que existe por rede é o conceito de site do AD, que agrupa sub-redes.",
        },
      ],
      takeaway:
        "Vínculo: site → domínio → OU. Grupo entra como filtro, não como alvo do vínculo.",
    },
    {
      id: "ad-offboarding",
      area: "ad",
      context: "Funcionário desligado. Você abre o console de Usuários e Computadores.",
      prompt: "Qual sequência é a correta?",
      options: [
        {
          id: "a",
          text: "Desabilitar a conta, remover dos grupos, mover para a OU de Desligados",
          correct: true,
          why: "Certo. Desabilitar corta o acesso na hora sem destruir nada; remover dos grupos tira as permissões herdadas; mover para a OU de Desligados deixa o ambiente organizado e sob uma política própria.",
        },
        {
          id: "b",
          text: "Excluir a conta e a caixa de e-mail",
          why: "Irreversível e leva embora histórico e arquivos que a empresa pode precisar. Exclusão, quando acontece, vem muito depois e com autorização.",
        },
        {
          id: "c",
          text: "Trocar a senha e deixar a conta onde está",
          why: "Conta ativa continua nos grupos e pode ser reativada por engano. Desabilitar é explícito e auditável.",
        },
        {
          id: "d",
          text: "Renomear a conta para o próximo funcionário aproveitar",
          why: "Prática ruim e comum: arrasta permissões antigas e destrói a rastreabilidade de quem fez o quê.",
        },
      ],
      takeaway:
        "Desabilitar ≠ excluir. E preservar os dados antes de liberar licença é parte do procedimento.",
    },
    {
      id: "ad-desbloqueio",
      area: "ad",
      context:
        "No AD a conta da usuária está marcada como bloqueada, e a senha dela não está expirada.",
      prompt: "Qual a ação correta?",
      options: [
        {
          id: "a",
          text: "Desbloquear a conta, sem trocar a senha",
          correct: true,
          why: "Certo. Bloqueio vem de excesso de tentativas erradas; a senha continua válida. Desbloquear devolve o acesso sem obrigar a usuária a decorar senha nova.",
        },
        {
          id: "b",
          text: "Resetar a senha com troca no próximo logon",
          why: "É a ação para senha expirada ou esquecida. Aplicada aqui, cria trabalho desnecessário para quem só errou a digitação.",
        },
        {
          id: "c",
          text: "Desabilitar e reabilitar a conta",
          why: "Não é o mecanismo do bloqueio, e desabilitar sem motivo pode disparar alerta ou confundir quem olhar o histórico.",
        },
        {
          id: "d",
          text: "Criar uma conta nova",
          why: "Duplica usuário, perde grupos e permissões. Nunca é a saída para problema de logon.",
        },
      ],
      takeaway:
        "Três estados, três correções: bloqueada → desbloquear · desabilitada → reabilitar e perguntar por quê · senha expirada → resetar com troca no logon.",
    },
    {
      id: "ad-rsat",
      area: "ad",
      prompt:
        "De onde um técnico normalmente administra usuários e políticas do domínio?",
      options: [
        {
          id: "a",
          text: "Da própria estação, com o RSAT instalado, usando dsa.msc e gpmc.msc",
          correct: true,
          why: "Certo. Ninguém senta no console do servidor para trabalho de rotina. O RSAT traz os consoles gráficos para a máquina do técnico, e é assim que se administra em qualquer empresa organizada.",
        },
        {
          id: "b",
          text: "Fisicamente no servidor, pelo teclado dele",
          why: "Acontece em emergência, mas como rotina é errado: expõe o servidor e não escala para mais de um técnico.",
        },
        {
          id: "c",
          text: "Pelo Painel de Controle da estação do usuário",
          why: "Painel de Controle não administra domínio. O que existe lá é a ingressão da máquina no domínio.",
        },
        {
          id: "d",
          text: "Só por PowerShell, porque não existe interface gráfica",
          why: "PowerShell é ótimo e vale saber (`New-ADUser`, `Unlock-ADAccount`), mas os consoles gráficos existem e são o caminho comum do dia a dia.",
        },
      ],
      takeaway:
        "RSAT no Windows 10/11 Pro é recurso sob demanda: instala pelas Configurações ou por `Add-WindowsCapability`. Em edição Home não existe.",
    },
  ],
};

const windowsEstacao: Quiz = {
  id: "windows-estacao",
  title: "Estação Windows",
  area: "windows",
  summary:
    "Visualizador de Eventos, serviços, elevação, lentidão e perfil. O chamado que não é de rede cai aqui.",
  questions: [
    {
      id: "win-evento",
      area: "windows",
      context:
        "A usuária diz que a máquina 'desligou sozinha ontem de manhã' e não sabe a hora nem a mensagem.",
      prompt: "Onde você descobre o que aconteceu?",
      options: [
        {
          id: "a",
          text: "Visualizador de Eventos, log Sistema, filtrando Erro e Crítico no período",
          correct: true,
          why: "Certo. O usuário não sabe a hora, mas o Windows sabe: evento 6008 registra que o desligamento anterior foi inesperado, com data e hora. Filtrar por período e severidade é o que torna o log utilizável.",
        },
        {
          id: "b",
          text: "Gerenciador de Tarefas",
          why: "Ele mostra o presente, não o passado. Serve para ver o que consome recurso agora, não o que aconteceu ontem.",
        },
        {
          id: "c",
          text: "Não tem como saber, é preciso esperar acontecer de novo",
          why: "Tem como, e é justamente o que separa diagnóstico de chute. Esperar repetir é desperdiçar o registro que já existe.",
        },
        {
          id: "d",
          text: "Rodando `sfc /scannow`",
          why: "Isso repara arquivo de sistema; não conta o histórico. Reparar antes de saber a causa é tratar sintoma no escuro.",
        },
      ],
      takeaway:
        "6008 = desligamento inesperado · 41 = reinício sem desligar direito · 4625 = falha de logon · 4740 = conta bloqueada.",
    },
    {
      id: "win-erro5",
      area: "windows",
      context:
        "Você digita `net stop spooler` e o Windows responde 'Erro do sistema 5. Acesso negado.'",
      prompt: "O que está acontecendo?",
      options: [
        {
          id: "a",
          text: "O prompt não está elevado — precisa abrir como administrador",
          correct: true,
          why: "Certo. Mexer em serviço é operação administrativa, e mesmo numa conta de administrador o prompt roda sem privilégio até você abrir com 'Executar como administrador'. Erro 5 é sempre permissão.",
        },
        {
          id: "b",
          text: "O serviço não existe nessa máquina",
          why: "Serviço inexistente dá outra mensagem, dizendo que o nome não foi encontrado. Erro 5 é permissão, não nome.",
        },
        {
          id: "c",
          text: "O serviço já está parado",
          why: "Aí o Windows diria que o serviço não foi iniciado. Continua sendo mensagem diferente de Acesso negado.",
        },
        {
          id: "d",
          text: "O antivírus está bloqueando o comando",
          why: "Improvável e não é o que a mensagem diz. Erro 5 vem do próprio controle de acesso do Windows.",
        },
      ],
      takeaway:
        "Erro 5 = Acesso negado = falta elevação. Vale para serviço, para pasta de sistema e para muita coisa de rede.",
    },
    {
      id: "win-lento",
      area: "windows",
      context:
        "'Meu computador está muito lento.' No Gerenciador de Tarefas, o disco fica em 100% quase todo o tempo e a CPU está baixa.",
      prompt: "Qual a hipótese mais provável?",
      options: [
        {
          id: "a",
          text: "O disco é o gargalo — HD mecânico saturado ou no fim da vida",
          correct: true,
          why: "Certo. Disco em 100% com CPU folgada é a assinatura de HD mecânico saturado. Confirme a saúde do disco e o espaço livre em C:. A intervenção com melhor retorno em máquina de escritório é trocar por SSD.",
        },
        {
          id: "b",
          text: "Falta memória RAM",
          why: "Falta de RAM aparece como memória no limite, e aí sim o disco sofre por paginação. Mas com CPU baixa e disco constante em 100%, o disco é o suspeito principal — confira a memória antes de concluir.",
        },
        {
          id: "c",
          text: "Precisa formatar e reinstalar o Windows",
          why: "Formatar é a resposta que ignora o dado que está na tela. Se o disco está morrendo, reinstalar vai ficar lento igual — e você gastou um dia.",
        },
        {
          id: "d",
          text: "É vírus, com certeza",
          why: "Vírus normalmente aparece como CPU ou rede alta, e 'com certeza' sem evidência não é diagnóstico. Vale varredura, mas não como primeira conclusão.",
        },
      ],
      takeaway:
        "Transforme 'está lento' em fato: lento em quê, desde quando, o tempo todo, e o que mudou antes.",
    },
    {
      id: "win-perfil",
      area: "windows",
      context:
        "O usuário loga e cai numa área de trabalho vazia, sem os atalhos e sem os arquivos dele. O Windows avisou algo sobre perfil temporário.",
      prompt: "Qual a primeira coisa que você faz?",
      options: [
        {
          id: "a",
          text: "Avisar que ele não deve trabalhar nesse perfil, porque o que salvar ali será perdido",
          correct: true,
          why: "Certo, e é a parte que quase todo mundo esquece. Perfil temporário é descartado no logoff: se ele passar a manhã trabalhando ali, perde tudo. Avisar vem antes de investigar. Depois você trata a causa — disco cheio, perfil corrompido ou logon que não alcançou o controlador — e recupera os arquivos de `C:\\Usuários\\<nome>`.",
        },
        {
          id: "b",
          text: "Criar um usuário novo para ele e seguir a vida",
          why: "Deixa os dados e as permissões antigas para trás e esconde a causa. Vira dois problemas: o original e um usuário duplicado.",
        },
        {
          id: "c",
          text: "Formatar a máquina",
          why: "Destrói o perfil que ainda está em disco e do qual você ia recuperar os arquivos. É a pior escolha possível aqui.",
        },
        {
          id: "d",
          text: "Reiniciar e esperar resolver",
          why: "Pode até carregar o perfil certo, mas sem avisar o usuário existe o risco real de ele já ter salvado coisas no perfil temporário.",
        },
      ],
      takeaway:
        "Antes de qualquer intervenção que mexa em perfil, disco ou reinstalação: backup dos dados do usuário.",
    },
    {
      id: "win-reparo",
      area: "windows",
      prompt:
        "Qual a ordem correta das tentativas de reparo, do menos para o mais invasivo?",
      options: [
        {
          id: "a",
          text: "Reiniciar → sfc /scannow → DISM RestoreHealth → Restauração do Sistema → reinstalar",
          correct: true,
          why: "Certo. O `sfc` repara arquivo de sistema; o `DISM /RestoreHealth` repara a imagem que o próprio sfc usa como fonte, e por isso vem depois dele. Restauração do Sistema volta driver e configuração sem tocar arquivo pessoal. Reinstalar é último recurso, com backup e combinado.",
        },
        {
          id: "b",
          text: "Reinstalar o Windows primeiro, porque resolve tudo de uma vez",
          why: "Resolve e destrói: um dia de trabalho, risco de perder dados, e você nunca descobre a causa — então o problema volta na próxima máquina.",
        },
        {
          id: "c",
          text: "Restauração do Sistema → reinstalar → sfc",
          why: "Fora de ordem e com o mais invasivo no meio. `sfc` é barato e deveria vir muito antes.",
        },
        {
          id: "d",
          text: "Só desfragmentar o disco",
          why: "Desfragmentação praticamente não se aplica hoje, e em SSD é contraindicada. Não repara sistema.",
        },
      ],
      takeaway:
        "Windows que não inicia: segure Shift ao clicar em Reiniciar para abrir o ambiente de recuperação. O F8 do Windows 7 não vale mais.",
    },
    {
      id: "win-console",
      area: "windows",
      prompt:
        "Você precisa ver se o Spooler de Impressão está rodando, sem sair do prompt. Qual comando?",
      options: [
        {
          id: "a",
          text: "`sc query spooler`",
          correct: true,
          why: "Certo. Devolve o estado: ESTADO 4 EM_EXECUÇÃO ou 1 PARADO. Pelo console gráfico o equivalente é `services.msc`.",
        },
        {
          id: "b",
          text: "`tasklist /spooler`",
          why: "Não existe esse parâmetro. `tasklist` lista processos e não recebe nome de serviço assim.",
        },
        {
          id: "c",
          text: "`net use spooler`",
          why: "`net use` é sobre unidade de rede mapeada. Nada a ver com serviço.",
        },
        {
          id: "d",
          text: "`ipconfig /services`",
          why: "Não existe. `ipconfig` só trata de configuração de rede da máquina.",
        },
      ],
      takeaway:
        "`eventvwr.msc` · `services.msc` · `devmgmt.msc` · `diskmgmt.msc` · `lusrmgr.msc` · `msconfig`. Decorar esses nomes faz você ser rápido.",
    },
  ],
};

const impressaoQuiz: Quiz = {
  id: "impressao",
  title: "Impressão",
  area: "impressao",
  summary:
    "Fila, spool, driver e escopo. Roteiro curto, causa quase sempre a mesma, e muita gente tenta na ordem errada.",
  questions: [
    {
      id: "imp-ordem",
      area: "impressao",
      prompt:
        "Chamado de impressora aberto. Qual a primeira coisa a verificar?",
      options: [
        {
          id: "a",
          text: "O painel do equipamento: papel, toner, atolamento, tampa, modo offline",
          correct: true,
          why: "Certo. Resolve boa parte dos chamados e custa cinco segundos. É humilhante descobrir isso depois de mexer em serviço e driver.",
        },
        {
          id: "b",
          text: "Reinstalar o driver na máquina do usuário",
          why: "Driver é a última hipótese, não a primeira. E não explica setor inteiro parando ao mesmo tempo.",
        },
        {
          id: "c",
          text: "Reiniciar o Spooler",
          why: "É eficaz, mas derruba a impressão de todos na máquina por alguns segundos — num servidor de impressão afeta a empresa. Não se começa por aí.",
        },
        {
          id: "d",
          text: "Trocar a impressora",
          why: "Pedir equipamento com diagnóstico incompleto queima orçamento e credibilidade.",
        },
      ],
      takeaway:
        "Painel → rede → fila → serviço → driver → página de teste e validação. Nessa ordem.",
    },
    {
      id: "imp-escopo",
      area: "impressao",
      context:
        "Uma pessoa do setor não imprime. As outras cinco, na mesma impressora, imprimem normalmente.",
      prompt: "Onde você investiga?",
      options: [
        {
          id: "a",
          text: "Na estação dela: fila local e driver",
          correct: true,
          why: "Certo. Se o que é compartilhado funciona para cinco pessoas, o problema está no caminho individual — fila local presa ou driver da estação dela.",
        },
        {
          id: "b",
          text: "Na impressora",
          why: "A impressora está imprimindo para os outros cinco. Ela não é a causa.",
        },
        {
          id: "c",
          text: "No servidor de impressão",
          why: "Se o spool compartilhado estivesse parado, o setor inteiro pararia — e não é o caso.",
        },
        {
          id: "d",
          text: "No link do provedor",
          why: "Impressão interna não passa pela internet. Provedor não tem relação.",
        },
      ],
      takeaway:
        "Um usuário = estação dele. Setor todo = impressora, spool compartilhado ou rede do trecho. É a mesma pergunta de escopo de sempre.",
    },
    {
      id: "imp-spooler-ordem",
      area: "impressao",
      context:
        "A fila está presa e você decidiu limpar os arquivos de spool em C:\\Windows\\System32\\spool\\PRINTERS.",
      prompt: "Qual a sequência correta?",
      options: [
        {
          id: "a",
          text: "Parar o Spooler, apagar os arquivos, iniciar o Spooler",
          correct: true,
          why: "Certo. Com o serviço rodando os arquivos estão em uso e não deixam apagar. Parar, limpar, subir. Precisa de prompt de administrador.",
        },
        {
          id: "b",
          text: "Apagar os arquivos e depois reiniciar o Spooler",
          why: "É o erro clássico: o arquivo está em uso, a exclusão falha, e a pessoa conclui que 'não deu' quando só fez na ordem trocada.",
        },
        {
          id: "c",
          text: "Reiniciar a máquina, que limpa sozinho",
          why: "O reinício pode até liberar, mas não limpa a pasta de spool: trabalho preso volta a travar a fila depois do logon.",
        },
        {
          id: "d",
          text: "Apagar a impressora e instalar de novo",
          why: "Desproporcional para fila travada, e não resolve arquivo de spool preso.",
        },
      ],
      takeaway:
        "`net stop spooler` → limpar a pasta PRINTERS → `net start spooler`. Confira antes e depois com `sc query spooler`.",
    },
    {
      id: "imp-caracteres",
      area: "impressao",
      context: "A impressora imprime páginas com caracteres estranhos e símbolos aleatórios.",
      prompt: "Qual a causa mais provável?",
      options: [
        {
          id: "a",
          text: "Driver errado para o modelo da impressora",
          correct: true,
          why: "Certo. O driver traduz o documento para a linguagem do equipamento. Driver de outro modelo, ou genérico onde precisava do específico, produz lixo no papel.",
        },
        {
          id: "b",
          text: "Falta de toner",
          why: "Toner baixo dá página fraca ou falhada, não caractere aleatório.",
        },
        {
          id: "c",
          text: "Cabo de rede com defeito",
          why: "Problema de rede normalmente impede o trabalho de chegar, e não faz a impressora produzir símbolos.",
        },
        {
          id: "d",
          text: "O usuário mandou o arquivo errado",
          why: "Vale confirmar, mas o padrão descrito é assinatura de driver incompatível.",
        },
      ],
      takeaway:
        "Lixo no papel = driver. Nada no papel com fila crescendo = spool. Nada no papel com painel avisando = equipamento.",
    },
    {
      id: "imp-reserva",
      area: "impressao",
      context:
        "A impressora do setor mudou de IP depois de uma queda de energia e ninguém imprime mais.",
      prompt: "Qual a correção certa, e não só a mais rápida?",
      options: [
        {
          id: "a",
          text: "Criar reserva por MAC no servidor DHCP para essa impressora",
          correct: true,
          why: "Certo. Reserva garante que ela receba sempre o mesmo endereço, e o controle fica centralizado no DHCP. Se um dia a faixa da rede mudar, você resolve no servidor em vez de visitar cada equipamento.",
        },
        {
          id: "b",
          text: "Digitar IP fixo no painel da impressora",
          why: "Funciona e é o atalho comum, mas espalha configuração pelo parque: ninguém documenta, e a próxima mudança de rede vira caça ao tesouro. Aceitável como contorno, não como solução.",
        },
        {
          id: "c",
          text: "Reinstalar a impressora em todas as estações com o IP novo",
          why: "Trata o sintoma na ponta errada e multiplica o trabalho por cada máquina. E no próximo reinício muda de novo.",
        },
        {
          id: "d",
          text: "Deixar como está e pedir para os usuários avisarem quando parar",
          why: "Transfere o problema para o usuário e garante chamado recorrente.",
        },
      ],
      takeaway:
        "Impressora e servidor merecem reserva por MAC. IP digitado no equipamento é contorno, não padrão.",
    },
    {
      id: "imp-servidor",
      area: "impressao",
      prompt: "O que é um servidor de impressão?",
      options: [
        {
          id: "a",
          text: "A máquina que hospeda as filas compartilhadas e fala com as impressoras",
          correct: true,
          why: "Certo. As estações imprimem nele, e ele repassa para o equipamento. Se o spool dele para, o setor inteiro para mesmo com todas as impressoras saudáveis.",
        },
        {
          id: "b",
          text: "Uma impressora com placa de rede",
          why: "Isso é impressora de rede. Servidor de impressão é a máquina que centraliza as filas.",
        },
        {
          id: "c",
          text: "O driver instalado na estação",
          why: "Driver é o tradutor local, não um servidor.",
        },
        {
          id: "d",
          text: "O contrato de outsourcing de impressão",
          why: "Isso é o contrato de locação e cobrança por página. Coisa comercial, não componente técnico.",
        },
      ],
      takeaway:
        "Impressora de rede: a estação fala com o IP dela. Compartilhada: a estação fala com uma fila em outra máquina.",
    },
  ],
};

/* ============================================================== nível 2 === */

const n2Identidade: Quiz = {
  id: "n2-identidade",
  title: "Identidade e confiança",
  area: "ad",
  summary:
    "Conta de máquina, Kerberos, hora e replicação. O logon que falha sem a conta do usuário ter problema.",
  questions: [
    {
      id: "n2i-confianca",
      area: "ad",
      context:
        "A tela mostra «A relação de confiança entre esta estação de trabalho e o domínio principal falhou». A rede está boa e a conta da usuária está normal no AD.",
      prompt: "Sobre o que essa mensagem está falando?",
      options: [
        {
          id: "a",
          text: "Sobre a conta da MÁQUINA no domínio, não sobre a do usuário",
          correct: true,
          why: "Certo. Cada estação tem um objeto de computador no AD com senha própria, renovada a cada 30 dias. Quando ela desincroniza, o canal seguro cai e o logon de domínio para naquela máquina para todos os usuários.",
        },
        {
          id: "b",
          text: "A senha da usuária expirou",
          why: "Senha expirada mostra outra tela, pedindo troca. E resetar a senha dela não muda nada aqui — é o que o N1 costuma tentar antes de escalar.",
        },
        {
          id: "c",
          text: "O certificado do servidor venceu",
          why: "Não é sobre certificado. O canal seguro do NetLogon usa a senha da conta de computador.",
        },
        {
          id: "d",
          text: "A máquina foi removida do domínio por um administrador",
          why: "Pode ter acontecido, e nesse caso o objeto não existe mais. Mas o texto dessa mensagem é sobre a confiança quebrada, e o caso comum é a senha fora de sincronia com o objeto ainda lá.",
        },
      ],
      takeaway:
        "`nltest /sc_verify:lab.local` confirma. `Reset-ComputerMachinePassword` conserta sem tirar do domínio.",
    },
    {
      id: "n2i-reset-vs-rejoin",
      area: "ad",
      prompt:
        "Confirmada a confiança quebrada, qual o conserto de primeira escolha?",
      options: [
        {
          id: "a",
          text: "`Reset-ComputerMachinePassword` num PowerShell elevado",
          correct: true,
          why: "Certo. Redefine a senha da conta de computador sem sair do domínio: sem reboot duplo, sem perder o perfil do usuário, sem recriar o objeto no AD.",
        },
        {
          id: "b",
          text: "Remover do domínio, reiniciar, ingressar de novo, reiniciar",
          why: "É o ritual mais executado e quase sempre desnecessário. Funciona, mas derruba o perfil, exige dois reboots de parada e recria o objeto. Vale como plano B.",
        },
        {
          id: "c",
          text: "Formatar e reinstalar a estação",
          why: "Desproporcional por completo para um problema de senha de conta de computador.",
        },
        {
          id: "d",
          text: "Criar um usuário local para ela trabalhar",
          why: "É contorno, e caro: ela perde acesso a tudo que depende do domínio. Serve para você entrar na máquina e consertar, não como solução.",
        },
      ],
      takeaway:
        "Antes do conserto, separe rede de confiança: `nltest /dsgetdc` mostra se a máquina acha o controlador.",
    },
    {
      id: "n2i-kerberos-hora",
      area: "ad",
      context:
        "Trocaram a placa-mãe da máquina ontem. Hoje ela tem rede, alcança o servidor, e nenhuma conta de domínio entra — erro de credencial mesmo com a senha certa.",
      prompt: "Qual a primeira hipótese?",
      options: [
        {
          id: "a",
          text: "O relógio está fora da tolerância do Kerberos",
          correct: true,
          why: "Certo. O Kerberos usa o horário como prova de autenticidade e recusa ticket com diferença acima de 5 minutos. Placa-mãe nova costuma vir com relógio e bateria zerados. `w32tm /query /status` mostra a diferença, `klist` mostra zero ticket, `w32tm /resync` corrige.",
        },
        {
          id: "b",
          text: "A placa-mãe nova tem defeito",
          why: "Ela liga, tem rede e alcança o servidor. O que ela trouxe foi efeito colateral de configuração, não defeito.",
        },
        {
          id: "c",
          text: "A senha de todas as contas expirou junto",
          why: "Não acontece por troca de hardware, e o erro atinge qualquer conta naquela máquina especificamente.",
        },
        {
          id: "d",
          text: "O driver de rede está errado",
          why: "A máquina tem rede e alcança o servidor. Se fosse driver de rede, o sintoma seria de conectividade.",
        },
      ],
      takeaway:
        "Existe uma quarta causa de falha de logon além de bloqueada, desabilitada e senha expirada: hora fora de sincronia.",
    },
    {
      id: "n2i-bloqueio-repetido",
      area: "ad",
      context:
        "A mesma usuária bloqueia a conta três, quatro vezes por dia. Você desbloqueia e minutos depois trava de novo.",
      prompt: "O que investigar?",
      options: [
        {
          id: "a",
          text: "Um dispositivo ou serviço com credencial velha tentando autenticar em loop",
          correct: true,
          why: "Certo. Celular com senha antiga do e-mail, unidade mapeada com credencial salva ou tarefa agendada rodando com senha expirada tentam sozinhos e bloqueiam a conta. O evento 4740 no controlador diz de qual máquina vieram as tentativas.",
        },
        {
          id: "b",
          text: "Orientar a usuária a digitar a senha com mais cuidado",
          why: "Se fosse digitação, não bloquearia minutos depois do desbloqueio sem ela fazer nada. E transferir o problema para o usuário não resolve.",
        },
        {
          id: "c",
          text: "Aumentar o limite de tentativas na política",
          why: "Isso esconde o sintoma e enfraquece a política de segurança. A causa continua tentando.",
        },
        {
          id: "d",
          text: "Criar uma conta nova para ela",
          why: "A nova conta vai bloquear igual, porque o dispositivo continua tentando com a credencial antiga.",
        },
      ],
      takeaway:
        "Bloqueio repetido é chamado de causa raiz, não de desbloqueio. Procure o dispositivo, não o usuário.",
    },
    {
      id: "n2i-replicacao",
      area: "ad",
      context:
        "Você resetou a senha de um usuário. Ele tenta logar e falha. Vinte minutos depois, sem você fazer nada, funciona.",
      prompt: "O que mais provavelmente aconteceu?",
      options: [
        {
          id: "a",
          text: "Latência de replicação: ele autenticou num controlador que ainda tinha a senha antiga",
          correct: true,
          why: "Certo. Com mais de um controlador, a mudança leva tempo para replicar. Nessa janela o resultado depende de qual DC atendeu. `nltest /dsgetdc` mostra em qual ele caiu; `repadmin /replsummary` mostra se a replicação está saudável.",
        },
        {
          id: "b",
          text: "O usuário estava digitando errado e acertou depois",
          why: "Possível, mas o padrão 'falha e depois funciona sozinho' é assinatura de replicação. E é o tipo de coincidência em que não vale apostar.",
        },
        {
          id: "c",
          text: "O cache de credencial do Windows",
          why: "Credencial em cache permite logar offline com a senha ANTIGA, o que é quase o inverso: ela ajudaria, não impediria.",
        },
        {
          id: "d",
          text: "A conta estava bloqueada e desbloqueou pelo tempo de duração",
          why: "Plausível em outro contexto e vale conferir. Mas aí a causa é a política de bloqueio, e o sintoma teria aparecido no estado da conta quando você olhou.",
        },
      ],
      takeaway:
        "Resultado inconsistente entre tentativas: pare de repetir a ação e descubra em qual controlador cada uma caiu.",
    },
    {
      id: "n2i-dns-interno",
      area: "ad",
      context:
        "Um técnico configurou 8.8.8.8 como DNS numa estação de domínio para 'melhorar a navegação'.",
      prompt: "O que quebra?",
      options: [
        {
          id: "a",
          text: "Logon de domínio, GPO e unidade mapeada — a estação deixa de achar o controlador",
          correct: true,
          why: "Certo, e é a consequência que quase ninguém antecipa. É por DNS que a estação localiza o controlador de domínio. Com DNS público, os registros de serviço do AD não existem, e o que quebra vai muito além de site: quebra autenticação, política e mapeamento.",
        },
        {
          id: "b",
          text: "Nada, é só uma alternativa de DNS",
          why: "Em máquina doméstica seria indiferente. Em domínio é uma das configurações mais destrutivas que se pode fazer sem perceber.",
        },
        {
          id: "c",
          text: "Só a navegação de sites internos",
          why: "Site interno é o sintoma visível, mas a autenticação também depende do DNS interno.",
        },
        {
          id: "d",
          text: "Apenas a impressão em rede",
          why: "Impressão por IP nem usa DNS. O que quebra é maior e mais grave.",
        },
      ],
      takeaway:
        "Estação e servidor apontam para o DNS interno, sempre. Quem sai para a internet é o DNS interno, pelo encaminhador.",
    },
  ],
};

const n2Permissao: Quiz = {
  id: "n2-permissao",
  title: "Permissão a fundo",
  area: "windows",
  summary: "Acumulação, Negar, herança e acesso efetivo.",
  questions: [
    {
      id: "n2p-negar",
      area: "windows",
      context:
        "A usuária está no GRP_Financeiro_Escrita, já saiu e entrou de novo, e continua sem acessar a pasta. Outras pessoas do mesmo grupo acessam.",
      prompt: "Qual a causa mais provável?",
      options: [
        {
          id: "a",
          text: "Ela está em outro grupo que tem um Negar explícito na pasta",
          correct: true,
          why: "Certo. Permitir se acumula entre grupos, mas Negar vence Permitir. Um único Negar, vindo de qualquer grupo do qual ela participe, anula todo o resto. `icacls` mostra a entrada com (DENY).",
        },
        {
          id: "b",
          text: "O token dela ainda não pegou o grupo novo",
          why: "É a causa mais comum e por isso a primeira a descartar — mas ela já saiu e entrou, o que renova o token.",
        },
        {
          id: "c",
          text: "A pasta está com permissão só para administradores",
          why: "Aí ninguém do grupo acessaria, e o enunciado diz que outras pessoas do mesmo grupo acessam.",
        },
        {
          id: "d",
          text: "O compartilhamento está em Leitura",
          why: "Share restritivo limitaria todos igualmente, e daria erro ao salvar em vez de negar o acesso só a ela.",
        },
      ],
      takeaway:
        "Permitir acumula · Negar vence · explícito prevalece sobre herdado · o token é calculado no logon.",
    },
    {
      id: "n2p-acumula",
      area: "windows",
      context:
        "O usuário está em dois grupos: um com Leitura na pasta, outro com Modificar. Nenhum Negar em nenhum lugar.",
      prompt: "O que ele consegue fazer?",
      options: [
        {
          id: "a",
          text: "Ler e modificar — as permissões de Permitir somam",
          correct: true,
          why: "Certo. Permitir acumula: o resultado é a união do que os grupos concedem, não a interseção. A regra do mais restritivo vale entre compartilhamento e NTFS, não entre grupos.",
        },
        {
          id: "b",
          text: "Só ler, porque vale a mais restritiva",
          why: "Essa é a confusão mais comum: aplicar a regra do share×NTFS onde ela não vale. Entre grupos, Permitir soma.",
        },
        {
          id: "c",
          text: "Nada, porque as permissões conflitam",
          why: "Não há conflito entre dois Permitir. Conflito só surge quando entra um Negar.",
        },
        {
          id: "d",
          text: "Depende de qual grupo foi adicionado primeiro",
          why: "Ordem de adição não influencia. O que influencia é tipo (Permitir/Negar) e origem (explícita/herdada).",
        },
      ],
      takeaway:
        "Entre grupos, Permitir soma. Entre compartilhamento e NTFS, vale o mais restritivo. São regras diferentes.",
    },
    {
      id: "n2p-efetivo",
      area: "windows",
      prompt:
        "Qual a forma mais rápida de saber o que um usuário específico consegue fazer numa pasta, sem montar a conta de cabeça?",
      options: [
        {
          id: "a",
          text: "Propriedades da pasta → Segurança → Avançado → aba Acesso Efetivo",
          correct: true,
          why: "Certo. Você escolhe o usuário e o Windows calcula o resultado final, já considerando acumulação, Negar e herança. É a ferramenta mais subutilizada do Windows em suporte.",
        },
        {
          id: "b",
          text: "Logar como o usuário e testar",
          why: "Funciona e às vezes é necessário, mas exige a senha dele — o que você não deve pedir — e não explica por que o resultado é aquele.",
        },
        {
          id: "c",
          text: "Olhar a lista de grupos e deduzir",
          why: "É exatamente o trabalho manual que a aba Acesso Efetivo existe para eliminar, e onde se erra por esquecer um Negar.",
        },
        {
          id: "d",
          text: "Conferir só a permissão de compartilhamento",
          why: "Metade da história. O efetivo depende das duas camadas e do cálculo dentro da NTFS.",
        },
      ],
      takeaway: "`icacls <pasta>` no prompt e `whoami /groups` no token dão a mesma resposta pelo terminal.",
    },
    {
      id: "n2p-heranca",
      area: "windows",
      context:
        "Você concedeu acesso ao grupo na pasta raiz do setor. Confirmou que está lá. Uma subpasta específica continua negando.",
      prompt: "O que aconteceu?",
      options: [
        {
          id: "a",
          text: "A herança foi quebrada naquela subpasta — ela parou de receber do pai",
          correct: true,
          why: "Certo. Quebrar a herança copia o estado do momento e congela: mudanças no pai deixam de descer. É o sintoma característico de 'concedi na raiz e uma subpasta ignora'.",
        },
        {
          id: "b",
          text: "A concessão ainda vai propagar, é questão de tempo",
          why: "Herança não tem latência: quando está ativa, a mudança vale imediatamente para quem abrir depois.",
        },
        {
          id: "c",
          text: "A subpasta está em outro disco",
          why: "Disco diferente não interrompe herança por si só. O que interrompe é a herança ter sido desativada.",
        },
        {
          id: "d",
          text: "O grupo não existe mais",
          why: "Aí a raiz também negaria, e você confirmou que a permissão está lá funcionando.",
        },
      ],
      takeaway:
        "Explícito prevalece sobre herdado. `icacls` mostra quais entradas são herdadas e quais foram marcadas na própria pasta.",
    },
    {
      id: "n2p-desenho",
      area: "windows",
      prompt:
        "Como desenhar permissão de servidor de arquivos para não virar pesadelo em seis meses?",
      options: [
        {
          id: "a",
          text: "Um grupo por tipo de acesso, permissão no grupo, usuário dentro do grupo",
          correct: true,
          why: "Certo. `GRP_Financeiro_Leitura`, `GRP_Financeiro_Escrita`, `GRP_Financeiro_Total`. A pasta nunca conhece o usuário, e auditar quem tem acesso é olhar o grupo.",
        },
        {
          id: "b",
          text: "Permissão direto no usuário, que é mais rápido de conceder",
          why: "Rápido hoje, impossível de auditar depois. Em seis meses ninguém sabe quem tem acesso a quê nem por quê.",
        },
        {
          id: "c",
          text: "Dar Controle Total para Todos e controlar por combinação",
          why: "Abre mão de controle e é falha de segurança grave. Confiança não substitui permissão.",
        },
        {
          id: "d",
          text: "Um grupo por pessoa, para ter granularidade máxima",
          why: "Multiplica objetos sem ganho: você recria o problema da permissão por usuário com mais passos.",
        },
      ],
      takeaway:
        "ABE esconde da listagem o que a pessoa não pode abrir — reduz o chamado de 'por que existe uma pasta que eu não acesso?'.",
    },
    {
      id: "n2p-rollback",
      area: "windows",
      prompt:
        "O que fazer antes de alterar permissão de uma pasta compartilhada usada por um setor?",
      options: [
        {
          id: "a",
          text: "Salvar o estado atual da ACL, por exemplo `icacls C:\\Dados\\Financeiro > antes.txt`",
          correct: true,
          why: "Certo. Leva dois segundos e te dá o caminho de volta. Mudança de permissão é mudança, e mudança sem rollback é aposta.",
        },
        {
          id: "b",
          text: "Nada, permissão é fácil de refazer de memória",
          why: "ACL de pasta antiga tem entradas herdadas, grupos esquecidos e às vezes um Negar histórico. Ninguém reconstrói de memória.",
        },
        {
          id: "c",
          text: "Avisar depois, se alguém reclamar",
          why: "Transforma a sua mudança em incidente descoberto pelo usuário. Comunicação prévia é parte do processo.",
        },
        {
          id: "d",
          text: "Tirar todos os acessos e reconstruir do zero",
          why: "Garante indisponibilidade para o setor e é a forma mais rápida de transformar um ajuste em incidente maior.",
        },
      ],
      takeaway:
        "A pergunta de toda mudança: como eu volto atrás? Se não tem resposta, não está pronta para aplicar.",
    },
  ],
};

const n2DhcpDns: Quiz = {
  id: "n2-dhcp-dns",
  title: "DHCP e DNS no servidor",
  area: "redes",
  summary: "Escopo, concessão, reserva, opções e envelhecimento.",
  questions: [
    {
      id: "n2d-esgotado",
      area: "redes",
      context:
        "Várias máquinas em 169.254, o serviço DHCP rodando, e algumas estações pegando IP normalmente.",
      prompt: "Qual a causa mais provável?",
      options: [
        {
          id: "a",
          text: "O escopo esgotou — não há endereço livre para novas concessões",
          correct: true,
          why: "Certo, e o detalhe que denuncia é 'algumas pegam': quem já tinha concessão renova, quem chega novo não recebe nada. `Get-DhcpServerv4ScopeStatistics` mostra Free em zero.",
        },
        {
          id: "b",
          text: "O serviço DHCP precisa ser reiniciado",
          why: "Reiniciar não cria endereço. O serviço está saudável; o estoque acabou.",
        },
        {
          id: "c",
          text: "Problema de rede entre as estações e o servidor",
          why: "Se fosse rede no trecho, as outras estações do mesmo lugar também não pegariam.",
        },
        {
          id: "d",
          text: "As máquinas estão com IP fixo configurado",
          why: "Máquina com IP fixo não cai em APIPA — ela usa o endereço que foi digitado.",
        },
      ],
      takeaway:
        "'Serviço rodando' e 'tem endereço para entregar' são duas coisas diferentes. Olhe o escopo, não o serviço.",
    },
    {
      id: "n2d-saidas",
      area: "redes",
      prompt:
        "Escopo esgotado numa rede que cresceu. Qual a saída mais rápida, antes de mexer na estrutura?",
      options: [
        {
          id: "a",
          text: "Reduzir o tempo de concessão",
          correct: true,
          why: "Certo. De 8 dias para 8 horas devolve ao estoque o endereço de quem só passou pelo escritório. É reversível e não exige mexer em faixa.",
        },
        {
          id: "b",
          text: "Ampliar o escopo imediatamente até o fim da faixa",
          why: "É a saída estrutural e a certa no médio prazo, mas exige conferir colisão com IP fixo e reservas. Ampliar às cegas troca escopo esgotado por conflito espalhado.",
        },
        {
          id: "c",
          text: "Reiniciar o servidor DHCP",
          why: "Não cria endereço nem libera concessão válida.",
        },
        {
          id: "d",
          text: "Configurar IP fixo nas máquinas afetadas",
          why: "Resolve caso a caso e espalha configuração manual pelo parque — dívida garantida, e provável fonte de conflito depois.",
        },
      ],
      takeaway:
        "Rápida: reduzir concessão. Estrutural: ampliar escopo com exclusão. Definitiva: separar rede de visitante.",
    },
    {
      id: "n2d-reserva",
      area: "redes",
      prompt: "Qual a diferença entre reserva no DHCP e IP fixo digitado no equipamento?",
      options: [
        {
          id: "a",
          text: "Na reserva quem entrega o endereço continua sendo o DHCP, vinculado ao MAC",
          correct: true,
          why: "Certo, e a consequência é operacional: o controle fica centralizado. Se um dia a faixa da rede mudar, você ajusta no servidor em vez de visitar cada impressora.",
        },
        {
          id: "b",
          text: "São a mesma coisa, com nomes diferentes",
          why: "O resultado visível é o mesmo — endereço estável — mas o controle está em lugares opostos.",
        },
        {
          id: "c",
          text: "Reserva só funciona para servidores, não para impressoras",
          why: "Funciona para qualquer dispositivo com MAC. Impressora é justamente o caso mais comum.",
        },
        {
          id: "d",
          text: "IP fixo é mais seguro que reserva",
          why: "Não há ganho de segurança, e há perda de rastreabilidade: ninguém documenta o que foi digitado no painel do equipamento.",
        },
      ],
      takeaway:
        "Mantenha as reservas fora da faixa dinâmica, ou crie exclusão. Reserva dentro da faixa distribuída pede atenção.",
    },
    {
      id: "n2d-opcao6",
      area: "redes",
      context:
        "Depois de uma alteração no servidor DHCP, a empresa inteira passou a ter rede e nenhum site abre.",
      prompt: "Onde você olha primeiro?",
      options: [
        {
          id: "a",
          text: "A opção 6 do escopo — os servidores DNS que o DHCP está entregando",
          correct: true,
          why: "Certo. A opção 6 define o DNS que a estação recebe junto do endereço. Apontando para o lugar errado, todo mundo pega IP válido e nada resolve — o mesmo sintoma que o N1 vê na estação, agora com causa única no servidor.",
        },
        {
          id: "b",
          text: "O link do provedor",
          why: "Possível em outro contexto, mas a mudança recente no DHCP é a pista, e o sintoma bate exatamente com DNS.",
        },
        {
          id: "c",
          text: "O firewall de cada estação",
          why: "Firewall local não muda para todos ao mesmo tempo por causa de alteração no DHCP.",
        },
        {
          id: "d",
          text: "As placas de rede das estações",
          why: "Hardware não muda em massa por configuração de servidor.",
        },
      ],
      takeaway:
        "Opções que importam: 3 gateway · 6 servidores DNS · 15 sufixo de domínio.",
    },
    {
      id: "n2d-scavenging",
      area: "redes",
      context:
        "Você pinga o nome de uma máquina e responde outra, que não é aquela.",
      prompt: "Qual a causa provável?",
      options: [
        {
          id: "a",
          text: "Registro velho no DNS: o endereço foi reciclado pelo DHCP e o registro antigo ficou",
          correct: true,
          why: "Certo. Sem envelhecimento (scavenging) ligado, o DNS acumula registro de máquina que sumiu. Quando o DHCP entrega aquele endereço para outra estação, o nome antigo passa a resolver para o dono novo.",
        },
        {
          id: "b",
          text: "Cache de DNS na sua máquina",
          why: "Vale descartar com `ipconfig /flushdns`, mas se persiste e afeta mais gente, o registro no servidor é o suspeito.",
        },
        {
          id: "c",
          text: "Conflito de IP",
          why: "Conflito é duas máquinas com o mesmo endereço ao mesmo tempo. Aqui o endereço tem um dono só; o que está errado é o nome apontando para ele.",
        },
        {
          id: "d",
          text: "A máquina antiga voltou a ligar",
          why: "Se tivesse voltado, ela pegaria endereço novo e registraria de novo. O sintoma descrito é de registro órfão.",
        },
      ],
      takeaway:
        "Integrar DHCP e DNS mantém o registro limpo: o DHCP atualiza quando entrega e quando libera concessão.",
    },
    {
      id: "n2d-escopo-tamanho",
      area: "redes",
      prompt: "Quantos endereços tem a faixa 10.10.10.100 até 10.10.10.150?",
      options: [
        {
          id: "a",
          text: "51",
          correct: true,
          why: "Certo, e o erro de um a menos é clássico: a faixa inclui as duas pontas. 150 menos 100 é 50, mais 1 é 51. Contar errado no planejamento é como se cria escopo apertado sem perceber.",
        },
        {
          id: "b",
          text: "50",
          why: "É a subtração pura, esquecendo que o primeiro endereço também conta.",
        },
        {
          id: "c",
          text: "49",
          why: "Excluiria as duas pontas, o que não é como escopo funciona.",
        },
        {
          id: "d",
          text: "100",
          why: "Não corresponde a nenhuma leitura da faixa informada.",
        },
      ],
      takeaway:
        "Ao dimensionar escopo, conte celular, notebook de visitante e impressora: todos consomem concessão.",
    },
  ],
};

const n2ProblemaMudanca: Quiz = {
  id: "n2-problema-mudanca",
  title: "Problema e mudança",
  area: "helpdesk",
  summary: "Causa raiz, incidente maior, janela e rollback. Julgamento, não comando.",
  questions: [
    {
      id: "n2pm-contorno",
      area: "helpdesk",
      context:
        "Reiniciar o serviço resolve o chamado. Ele volta a acontecer toda segunda-feira, e você reinicia de novo.",
      prompt: "O que está faltando?",
      options: [
        {
          id: "a",
          text: "Abrir registro de problema para tratar a causa — o reinício é contorno",
          correct: true,
          why: "Certo. Contorno é legítimo e às vezes obrigatório; o erro é chamar contorno de solução e encerrar o assunto. Enquanto a causa está lá, o chamado é seu para sempre.",
        },
        {
          id: "b",
          text: "Nada, o chamado está sendo resolvido dentro do SLA",
          why: "O indicador fecha e o volume não cai. Um N2 que só apaga incêndio mantém a própria fila cheia.",
        },
        {
          id: "c",
          text: "Automatizar o reinício do serviço toda segunda",
          why: "Tentador, e às vezes usado como paliativo — mas esconde o defeito e cria dependência de um script que ninguém lembra que existe.",
        },
        {
          id: "d",
          text: "Escalar para o N3 sem investigar",
          why: "Sem informação nenhuma, o N3 vai começar do zero. Escalonamento pede o que você já testou e descartou.",
        },
      ],
      takeaway:
        "Incidente restaura o serviço. Problema elimina a causa. Erro conhecido é a causa achada com contorno documentado.",
    },
    {
      id: "n2pm-cinco-porques",
      area: "helpdesk",
      prompt:
        "Fazendo os cinco porquês, onde você para?",
      options: [
        {
          id: "a",
          text: "No último elo que está dentro do meu alcance de mudar",
          correct: true,
          why: "Certo. Ir além disso produz causa verdadeira e inútil, tipo 'a empresa não investe em TI'. Parar antes produz culpa em vez de correção, tipo 'o usuário mandou o arquivo errado'.",
        },
        {
          id: "b",
          text: "Exatamente no quinto porquê, sempre",
          why: "Cinco é referência, não regra. Às vezes três bastam, às vezes precisa de sete.",
        },
        {
          id: "c",
          text: "Quando encontro quem causou o problema",
          why: "Achar culpado encerra a investigação sem mudar nada, e faz a informação parar de aparecer nas próximas vezes.",
        },
        {
          id: "d",
          text: "No primeiro motivo técnico que explica o sintoma",
          why: "Esse é o começo, não o fim: normalmente é o contorno que você já conhece.",
        },
      ],
      takeaway:
        "Causa raiz não é adivinhar melhor. É seguir a cadeia até algo que você pode mudar de fato.",
    },
    {
      id: "n2pm-incidente-maior",
      area: "helpdesk",
      context: "Sistema crítico parado, empresa inteira afetada, e você está investigando.",
      prompt: "O que não pode faltar, além do trabalho técnico?",
      options: [
        {
          id: "a",
          text: "Alguém dedicado a comunicar, com aviso do que se sabe e da hora do próximo informe",
          correct: true,
          why: "Certo. Quem está com a mão no problema não consegue avisar cinquenta pessoas. E 'estamos apurando, novo informe às 15h30' vale mais que silêncio e mais que prazo inventado — é a falta de informação, não a falha, que gera a maior parte da reclamação.",
        },
        {
          id: "b",
          text: "Responder individualmente cada usuário que ligar",
          why: "Consome exatamente o tempo que deveria ir para a solução. Declarar incidente maior existe para dispensar isso.",
        },
        {
          id: "c",
          text: "Esperar ter a solução antes de comunicar qualquer coisa",
          why: "É o instinto errado mais comum. O silêncio é lido como abandono, e a fila enche de chamado duplicado.",
        },
        {
          id: "d",
          text: "Identificar quem causou, para constar no relatório",
          why: "Pós-morte é sobre o que falhou no sistema, não sobre quem errou. Caça às bruxas seca a informação.",
        },
      ],
      takeaway:
        "Registre a linha de tempo enquanto acontece: ninguém reconstrói isso depois com precisão.",
    },
    {
      id: "n2pm-rollback",
      area: "helpdesk",
      prompt:
        "Você vai alterar uma GPO que afeta a empresa toda. O que é indispensável antes de aplicar?",
      options: [
        {
          id: "a",
          text: "Saber exatamente como voltar atrás",
          correct: true,
          why: "Certo, e é a pergunta que resume o processo de mudança: se você não sabe voltar, não está pronto para aplicar. Exportar a GPO antes de editar custa segundos.",
        },
        {
          id: "b",
          text: "Aplicar num horário de pouco movimento e ver o que acontece",
          why: "Janela de manutenção é parte do processo, mas sozinha não é plano: se der errado, você ainda precisa saber desfazer.",
        },
        {
          id: "c",
          text: "Avisar depois, se alguém notar diferença",
          why: "Transforma sua mudança em incidente descoberto pelo usuário, e queima a confiança no service desk.",
        },
        {
          id: "d",
          text: "Nada, GPO é reversível por natureza",
          why: "Editar uma GPO sobrescreve o estado anterior. Sem exportação prévia, reconstruir depende da sua memória.",
        },
      ],
      takeaway:
        "Mudança pede janela, teste num escopo pequeno, aprovação, comunicação prévia, rollback e registro do que mudou.",
    },
    {
      id: "n2pm-emergencial",
      area: "helpdesk",
      prompt: "O que caracteriza uma mudança emergencial bem conduzida?",
      options: [
        {
          id: "a",
          text: "É aplicada na hora e registrada e aprovada depois",
          correct: true,
          why: "Certo. Emergência dispensa a reunião prévia, não o rastro. Sem registro, ninguém sabe semana que vem o que mudou quando algo quebrar.",
        },
        {
          id: "b",
          text: "Dispensa registro, porque era urgente",
          why: "É a interpretação que transforma o processo em teatro: um ambiente onde ninguém sabe o que foi alterado.",
        },
        {
          id: "c",
          text: "Só pode ser feita pelo gestor",
          why: "Depende da política de cada empresa, e não é o que define uma mudança emergencial.",
        },
        {
          id: "d",
          text: "Não precisa de plano de rollback, porque não há tempo",
          why: "É justamente quando o rollback importa mais: você está mexendo com pressa em algo que já está quebrado.",
        },
      ],
      takeaway:
        "Registro do que mudou é o primeiro lugar que se olha quando algo quebra na semana seguinte.",
    },
    {
      id: "n2pm-indicador",
      area: "helpdesk",
      prompt:
        "Qual indicador mostra que você está tratando causa raiz, e não só apagando incêndio?",
      options: [
        {
          id: "a",
          text: "A queda de chamados recorrentes do mesmo tipo",
          correct: true,
          why: "Certo. É o que aparece numa avaliação: um N2 que trata causa esvazia a própria fila. Volume estável com SLA em dia pode significar que você ficou muito bom em contornar.",
        },
        {
          id: "b",
          text: "O número de chamados fechados por dia",
          why: "Mede produção, não efeito. Fechar mais do mesmo chamado é sinal de causa não tratada.",
        },
        {
          id: "c",
          text: "O tempo médio de atendimento caindo",
          why: "Melhora útil, mas compatível com ficar mais rápido no contorno. Não prova que a causa foi eliminada.",
        },
        {
          id: "d",
          text: "A quantidade de chamados escalados para o N3",
          why: "Diz mais sobre a fronteira entre níveis que sobre tratamento de causa.",
        },
      ],
      takeaway:
        "Contorno mantém o serviço. Causa raiz muda o volume. As duas coisas são trabalho, e só a segunda é progresso.",
    },
  ],
};

export const QUIZZES: Quiz[] = [
  redesN1,
  helpdeskConceitos,
  windowsEstacao,
  impressaoQuiz,
  dominioBasico,
  n2Identidade,
  n2Permissao,
  n2DhcpDns,
  n2ProblemaMudanca,
];

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}

export function allQuestions() {
  return QUIZZES.flatMap((q) => q.questions.map((qq) => ({ ...qq, quizId: q.id })));
}
