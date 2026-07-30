import type { Ticket } from "./types";

/**
 * Triagem de chamado: o exercício que treina o PROCESSO, não a tecnologia.
 * Categorizar, priorizar por impacto × urgência, ordenar o diagnóstico,
 * decidir entre resolver e escalar, e registrar de forma utilizável.
 */

const naoConsigoLogar: Ticket = {
  id: "nao-consigo-logar",
  title: "Não consigo entrar no computador",
  reporter: "Ana Souza",
  sector: "Financeiro",
  openedAt: "08:12",
  body:
    "Bom dia. Cheguei agora e não consigo entrar no meu computador. Ontem funcionou normal. " +
    "Aparece uma mensagem falando de conta, mas fechei sem ler. Tenho fechamento hoje até as 14h.",
  steps: [
    {
      kind: "choice",
      id: "tipo",
      question: "Isso é um incidente ou uma requisição de serviço?",
      help: "Pense se algo que funcionava parou, ou se a pessoa está pedindo algo novo.",
      options: [
        {
          id: "inc",
          label: "Incidente",
          correct: true,
          why: "Certo. Funcionava ontem e parou hoje: serviço interrompido. O objetivo é restaurar o acesso.",
        },
        {
          id: "req",
          label: "Requisição de serviço",
          why: "Requisição é quando o usuário quer algo novo (acesso, instalação, equipamento). Aqui algo existente quebrou.",
        },
      ],
    },
    {
      kind: "choice",
      id: "prioridade",
      question: "Qual prioridade você atribui?",
      help: "Impacto: quantas pessoas / quão crítico. Urgência: o quanto pode esperar.",
      options: [
        {
          id: "media",
          label: "Média — impacto baixo (1 pessoa), urgência alta (prazo de fechamento hoje)",
          correct: true,
          why: "Certo. Uma pessoa afetada é impacto baixo, mas o prazo de fechamento às 14h eleva a urgência. Cruzando os dois na matriz, dá Média — e você registra o prazo dela no chamado.",
        },
        {
          id: "critica",
          label: "Crítica — a pessoa não consegue trabalhar",
          why: "Crítica se reserva para impacto alto: setor ou empresa parada. Se todo chamado individual for crítico, a palavra perde sentido e a fila deixa de funcionar.",
        },
        {
          id: "baixa",
          label: "Baixa — é só uma pessoa",
          why: "Ignora a urgência. O prazo de 14h existe e faz diferença; tratar como baixa pode furar o compromisso dela.",
        },
      ],
    },
    {
      kind: "order",
      id: "passos",
      question: "Coloque os passos de diagnóstico na ordem certa.",
      help: "Clique na ordem em que você faria. Do mais barato/provável para o mais invasivo.",
      items: [
        { id: "p1", label: "Verificar o estado da conta no AD (bloqueada / desabilitada / senha expirada)" },
        { id: "p2", label: "Pedir para ela reproduzir e ler a mensagem que aparece" },
        { id: "p3", label: "Aplicar a correção correspondente ao estado encontrado" },
        { id: "p4", label: "Pedir para a usuária testar o logon com você acompanhando" },
        { id: "p5", label: "Registrar a causa e o que foi feito, e encerrar após ela confirmar" },
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"],
      why:
        "Ela fechou a mensagem sem ler, então perguntar 'o que apareceu?' não devolve nada — o AD responde na hora e sem depender da memória dela. Por isso a consulta ao AD vem primeiro. Pedir para reproduzir vem depois, para confirmar o que você viu e pegar o texto exato se o estado da conta não explicar tudo. Então a correção correspondente ao estado, o teste acompanhado e o encerramento validado. Pular direto para o reset de senha é o atalho que não resolve conta apenas bloqueada.",
    },
    {
      kind: "choice",
      id: "acao",
      question:
        "No AD, a conta aparece bloqueada por excesso de tentativas de senha. O que você faz?",
      options: [
        {
          id: "desbloquear",
          label: "Desbloquear a conta e orientar sobre a senha",
          correct: true,
          why: "Certo. Bloqueio por tentativas se resolve desbloqueando. Se ela não souber a senha, aí sim você reseta com troca no próximo logon — mas são duas ações diferentes para dois estados diferentes.",
        },
        {
          id: "resetar",
          label: "Resetar a senha direto",
          why: "Resetar sem desbloquear pode não resolver, e trocar a senha de quem só errou a digitação cria trabalho desnecessário para a usuária.",
        },
        {
          id: "escalar",
          label: "Escalar para o N2",
          why: "Desbloqueio de conta é escopo de N1 em qualquer service desk. Escalar isso é empurrar trabalho.",
        },
        {
          id: "nova",
          label: "Criar uma conta nova para ela",
          why: "Criaria um usuário duplicado, sem os grupos e permissões da conta original. Nunca é a saída para problema de logon.",
        },
      ],
    },
    {
      kind: "note",
      id: "registro",
      question:
        "Escreva o registro de encerramento do chamado, como se outro técnico fosse ler amanhã.",
      help:
        "Um bom registro tem: o que a usuária relatou, o que você verificou, a causa, o que fez, e a confirmação dela.",
      mustMention: [
        {
          key: "relato",
          label: "o que a usuária relatou",
          aliases: ["relat", "usuária", "usuaria", "informou", "abriu", "mensagem"],
        },
        {
          key: "verificacao",
          label: "o que você verificou (estado da conta no AD)",
          aliases: ["ad", "active directory", "verifiq", "conta", "estado", "checa"],
        },
        {
          key: "causa",
          label: "a causa (bloqueio por tentativas)",
          aliases: ["bloque", "tentativ", "excesso"],
        },
        {
          key: "acao",
          label: "a ação executada (desbloqueio)",
          aliases: ["desbloque", "liber"],
        },
        {
          key: "validacao",
          label: "a validação com a usuária",
          aliases: ["confirm", "testou", "validou", "acompanh", "logou"],
        },
      ],
      modelAnswer:
        "Usuária relatou que não conseguia logar desde a manhã, com mensagem sobre a conta. " +
        "Verifiquei no AD: conta bloqueada por excesso de tentativas de senha, senha ainda válida. " +
        "Desbloqueei a conta e orientei sobre o teclado/Caps Lock. " +
        "Usuária logou com acompanhamento e confirmou acesso normal, inclusive à pasta do setor. " +
        "Chamado encerrado com validação dela às 08:29.",
    },
  ],
  debrief:
    "Esse chamado é o mais comum de um N1 e é onde se perde tempo por pressa: resetar senha de conta bloqueada não resolve. Ler a mensagem e conferir o estado da conta custa 30 segundos e evita reabertura. O registro importa tanto quanto a solução — é o que permite ver depois que esse bloqueio acontece toda segunda-feira e virar um artigo de base de conhecimento.",
};

const impressoraSetor: Ticket = {
  id: "impressora-setor",
  title: "A impressora não imprime",
  reporter: "Marcos Lima",
  sector: "Comercial",
  openedAt: "10:40",
  body:
    "A impressora do Comercial parou de imprimir. Mandei o documento três vezes e não sai nada. " +
    "Perguntei aqui e a Júlia também tentou e não saiu.",
  steps: [
    {
      kind: "choice",
      id: "escopo",
      question:
        "A informação mais importante já está no texto. Qual é, e o que ela muda?",
      help: "Procure o detalhe que define o escopo da falha.",
      options: [
        {
          id: "duas",
          label: "Duas pessoas diferentes falharam — o problema não é da estação do Marcos",
          correct: true,
          why: "Certo. Duas máquinas com o mesmo sintoma tira o foco da estação individual e joga para o que é compartilhado: a impressora, a fila no servidor de impressão, ou a rede daquele trecho.",
        },
        {
          id: "tres",
          label: "Ele mandou três vezes — provavelmente travou a fila",
          why: "A fila com três documentos é consequência, não causa. Vale limpar, mas não é o que define onde investigar.",
        },
        {
          id: "setor",
          label: "É do Comercial — precisa ir até lá presencialmente",
          why: "Pode ser necessário, mas isso é logística de atendimento, não diagnóstico.",
        },
      ],
    },
    {
      kind: "choice",
      id: "prioridade",
      question: "Prioridade?",
      help: "Use a matriz da aula: impacto de grupo cruzado com a urgência que o texto do chamado sustenta.",
      options: [
        {
          id: "media",
          label: "Média — impacto de grupo, urgência média (ninguém citou prazo)",
          correct: true,
          why: "Certo, e é a resposta que a matriz dá: impacto médio (um grupo, não a empresa) × urgência média (o chamado não menciona prazo nenhum) = Média. Sobe para Alta no minuto em que alguém disser que tem nota fiscal ou contrato para emitir hoje — e é exatamente isso que você deve perguntar.",
        },
        {
          id: "alta",
          label: "Alta — impressão sempre trava processo",
          why: "Alta exige urgência alta, e o chamado não traz nenhum prazo. Assumir urgência que o usuário não declarou infla a prioridade e desorganiza a fila. Pergunte antes de subir.",
        },
        {
          id: "baixa",
          label: "Baixa — impressora é sempre secundário",
          why: "Ignora o impacto: já são duas pessoas, e o escopo é de grupo. Baixa se reserva para impacto individual sem prazo.",
        },
        {
          id: "critica",
          label: "Crítica — ninguém consegue trabalhar",
          why: "Exagero: eles continuam trabalhando, só não imprimem. Crítica é serviço essencial parado para a empresa inteira.",
        },
      ],
    },
    {
      kind: "order",
      id: "passos",
      question: "Ordene o diagnóstico.",
      help: "Barato e reversível antes de invasivo.",
      items: [
        { id: "q1", label: "Confirmar se a impressora está ligada, com papel, sem erro no painel" },
        { id: "q2", label: "Verificar se ela responde na rede (ping no IP da impressora)" },
        { id: "q3", label: "Tentar cancelar os documentos travados pela fila de impressão" },
        { id: "q4", label: "Se a fila não esvaziar: parar o Spooler, limpar a pasta de spool e iniciar de novo" },
        { id: "q5", label: "Imprimir uma página de teste e pedir para os dois usuários validarem" },
      ],
      correctOrder: ["q1", "q2", "q3", "q4", "q5"],
      why:
        "O painel da impressora resolve boa parte dos chamados (papel, toner, atolamento) e custa 5 segundos. Depois você confirma que ela está na rede. Então tenta o caminho barato: cancelar os documentos pela fila. Quando a fila não obedece — e é comum ela travar em 'excluindo' — aí vem o procedimento pesado, e ele tem ordem própria: **parar** o serviço Spooler, apagar o conteúdo de `C:\\Windows\\System32\\spool\\PRINTERS` e **iniciar** o serviço de novo. Tentar apagar o arquivo com o Spooler rodando não funciona, e é o erro clássico. Validar com os dois usuários fecha o escopo que você identificou no começo.",
    },
    {
      kind: "choice",
      id: "acao",
      question:
        "A impressora responde ao ping, o painel está sem erro, mas a fila tem 6 documentos parados e novos não avançam. Qual a ação?",
      options: [
        {
          id: "spooler",
          label: "Limpar a fila e reiniciar o Spooler de Impressão",
          correct: true,
          why: "Certo. Fila travada com a impressora saudável é o caso típico de Spooler. Limpar a fila e reiniciar o serviço é a solução padrão — e é literalmente metade dos chamados de impressora.",
        },
        {
          id: "driver",
          label: "Reinstalar o driver nas duas máquinas",
          why: "Driver é hipótese posterior, e não explica duas máquinas falhando ao mesmo tempo com a fila travada no mesmo ponto.",
        },
        {
          id: "trocar",
          label: "Solicitar troca da impressora",
          why: "Pedir equipamento novo com o diagnóstico incompleto queima orçamento e credibilidade.",
        },
        {
          id: "escalar",
          label: "Escalar para o N2",
          why: "Spooler e fila são escopo de N1. Escalar aqui é sinal de que o roteiro básico não foi tentado.",
        },
      ],
    },
    {
      kind: "note",
      id: "registro",
      question: "Escreva o registro do chamado.",
      help: "Inclua o escopo que você identificou, os testes e o resultado.",
      mustMention: [
        {
          key: "escopo",
          label: "o escopo (duas pessoas / setor)",
          aliases: ["dois", "duas", "setor", "ambos", "usuários", "usuarios", "júlia", "julia"],
        },
        {
          key: "testes",
          label: "os testes feitos (painel, ping, fila)",
          aliases: ["ping", "fila", "painel", "rede", "testei", "verifiq"],
        },
        {
          key: "causa",
          label: "a causa (fila travada / spooler)",
          aliases: ["spooler", "fila", "trav"],
        },
        {
          key: "acao",
          label: "a ação (limpeza da fila e reinício do serviço)",
          aliases: ["limp", "reinici", "servi"],
        },
        {
          key: "validacao",
          label: "a validação dos usuários",
          aliases: ["confirm", "valid", "teste de impress", "página de teste", "pagina de teste"],
        },
      ],
      modelAnswer:
        "Dois usuários do Comercial (Marcos e Júlia) sem imprimir na impressora do setor — escopo de grupo, não de estação. " +
        "Impressora ligada, sem erro no painel e respondendo ao ping no IP. " +
        "Fila com 6 documentos travados, novos trabalhos não avançavam. " +
        "Limpei a fila e reiniciei o serviço Spooler de Impressão. " +
        "Página de teste saiu e os dois usuários confirmaram impressão normal. Encerrado às 11:05.",
    },
  ],
  debrief:
    "O detalhe que resolve esse chamado não é técnico, é de leitura: 'a Júlia também tentou' muda o escopo de estação para setor e economiza meia hora de diagnóstico na máquina errada. Treinar essa leitura é mais valioso que decorar comando.",
};

const sistemaForaDoAr: Ticket = {
  id: "sistema-fora-do-ar",
  title: "Sistema fora do ar, ninguém consegue trabalhar",
  reporter: "Recepção",
  sector: "Vários setores",
  openedAt: "14:05",
  body:
    "O sistema não abre para ninguém. Estão ligando de três setores. " +
    "O Financeiro diz que tem pagamento para fechar hoje. Neste momento você já tem 4 chamados abertos na fila.",
  steps: [
    {
      kind: "choice",
      id: "prioridade",
      question: "O que acontece com a sua fila agora?",
      options: [
        {
          id: "pausar",
          label:
            "Este vira prioridade crítica; pauso os demais, aviso os usuários afetados do novo prazo e comunico o time",
          correct: true,
          why: "Certo. Impacto alto + urgência alta = crítica, e crítica reordena a fila. O que separa um bom N1 aqui é o 'aviso os usuários' — reordenar sem comunicar gera quatro chamados novos reclamando.",
        },
        {
          id: "ordem",
          label: "Termino os 4 que já estão abertos e depois pego esse",
          why: "Deixa a empresa parada para resolver casos individuais. É o erro que a matriz de prioridade existe para evitar.",
        },
        {
          id: "abandonar",
          label: "Abandono os 4 sem avisar ninguém e foco neste",
          why: "A priorização está certa, a conduta não. Chamado pausado sem comunicação vira reclamação e queima confiança no service desk.",
        },
      ],
    },
    {
      kind: "order",
      id: "passos",
      question: "Ordene os primeiros passos.",
      help: "Antes de mexer, delimite o problema.",
      items: [
        { id: "r1", label: "Confirmar o escopo: quais setores, todos os usuários ou alguns" },
        { id: "r2", label: "Testar você mesmo o acesso ao sistema de uma estação" },
        { id: "r3", label: "Verificar rede e alcance do servidor do sistema (ping / porta)" },
        { id: "r4", label: "Comunicar o incidente e o que já se sabe aos usuários e ao responsável" },
        { id: "r5", label: "Escalar ao N2 com a evidência coletada" },
      ],
      correctOrder: ["r1", "r2", "r3", "r4", "r5"],
      why:
        "Reproduzir você mesmo é o que transforma relato em fato. Depois você isola: é rede, é o servidor, é o sistema? Comunicar vem ANTES de escalar, porque enquanto o N2 trabalha os usuários continuam sem informação — e é a falta de informação, não a falha, que gera a maior parte da reclamação.",
    },
    {
      kind: "choice",
      id: "escalar",
      question:
        "Você confirma: a rede está sã, o servidor responde ao ping, mas o serviço do sistema não sobe e você não tem acesso administrativo a ele. Escala?",
      options: [
        {
          id: "sim",
          label: "Sim — falta permissão que eu não tenho, e é impacto alto",
          correct: true,
          why: "Certo. Dois dos três gatilhos legítimos: fora do meu escopo de acesso e SLA em risco por impacto alto. Escalar aqui não é fraqueza, é o procedimento.",
        },
        {
          id: "tentar",
          label: "Não — procuro a senha de administrador com alguém e tento subir o serviço",
          why: "Mexer em serviço de produção sem autorização nem conhecimento pode transformar uma indisponibilidade de 20 minutos em um dia inteiro. E usar credencial de outra pessoa é violação de política.",
        },
        {
          id: "esperar",
          label: "Não — espero para ver se volta sozinho",
          why: "Esperar com a empresa parada queima SLA sem produzir informação nenhuma.",
        },
      ],
    },
    {
      kind: "note",
      id: "escalonamento",
      question:
        "Escreva o texto do escalonamento para o N2, como se outro humano fosse ler agora.",
      help:
        "O N2 precisa saber: escopo, desde quando, o que você testou, o resultado, o que já descartou e o impacto.",
      mustMention: [
        {
          key: "escopo",
          label: "escopo (quantos setores/usuários)",
          aliases: ["setor", "usuários", "usuarios", "todos", "três", "tres", "geral"],
        },
        {
          key: "inicio",
          label: "desde quando",
          aliases: ["desde", "início", "inicio", "14", "hora", "começou", "comecou"],
        },
        {
          key: "testes",
          label: "o que você testou",
          aliases: ["ping", "testei", "reproduzi", "verifiq", "rede", "porta"],
        },
        {
          key: "descartado",
          label: "o que já descartou",
          aliases: ["descart", "não é", "nao e", "rede está", "rede esta", "excluí", "exclui"],
        },
        {
          key: "impacto",
          label: "o impacto de negócio",
          aliases: ["impacto", "pagamento", "fechamento", "parad", "crític", "critic"],
        },
      ],
      modelAnswer:
        "Sistema X indisponível para todos os usuários de três setores desde ~14:00. " +
        "Reproduzi de duas estações diferentes: mesma falha. " +
        "Rede sã (IP válido, gateway e DNS respondendo) e o servidor do sistema responde ao ping — " +
        "descartei rede e estação. O serviço da aplicação não sobe e não tenho acesso administrativo a ele. " +
        "Impacto: três setores parados, Financeiro com pagamento a fechar hoje. " +
        "Usuários já comunicados. Encaminho para N2 para atuação no serviço da aplicação.",
    },
  ],
  debrief:
    "Escalonamento bem escrito é o que mais diferencia um N1 na prática, e quase ninguém treina. O N2 não deveria precisar repetir nenhum teste que você já fez. Repare que 'o que já descartei' é a parte mais valiosa do texto — é ela que economiza o tempo de quem recebe.",
};

export const TICKETS: Ticket[] = [naoConsigoLogar, impressoraSetor, sistemaForaDoAr];

export function getTicket(id: string): Ticket | undefined {
  return TICKETS.find((t) => t.id === id);
}
