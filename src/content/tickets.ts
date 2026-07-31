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

/**
 * Triagem de bancada. Mesmo formato de passos, assunto físico: ordem de teste,
 * o que fazer com um sinal do equipamento, e o laudo. A queda de energia
 * atingir duas peças não é enfeite — é o que acontece de verdade, e é o que
 * ensina a não encerrar no primeiro conserto.
 */
const pcNaoLiga: Ticket = {
  id: "pc-nao-liga",
  title: "O computador do balcão não liga",
  reporter: "Cláudia Ferraz",
  sector: "Atendimento",
  openedAt: "08:05",
  body:
    "O computador do balcão não liga. Aperto o botão e não acontece nada: nenhuma luz, nenhum " +
    "barulho de ventoinha. Ontem funcionou até o fim do dia. Teve queda de energia à noite. " +
    "É o único PC do balcão, e o atendimento ao público abre às 9h.",
  steps: [
    {
      kind: "choice",
      id: "prioridade",
      question: "Qual prioridade você atribui?",
      help: "Impacto é o alcance do estrago. Urgência é o quanto pode esperar.",
      options: [
        {
          id: "alta",
          label: "Alta — impacto além de uma pessoa (o atendimento ao público para), urgência imediata (abre às 9h)",
          correct: true,
          why: "Certo. Não é uma pessoa sem trabalhar: é uma função da empresa que não abre, e com hora marcada. Isso eleva o impacto acima do individual e a urgência ao imediato.",
        },
        {
          id: "critica",
          label: "Crítica — o atendimento ao público está parado",
          why: "Crítica se reserva para impacto em toda a empresa ou em serviço central. Um balcão parado é grave e localizado. Se um posto parado já é crítico, não sobra classificação para o dia em que o servidor cair.",
        },
        {
          id: "media",
          label: "Média — é um computador só",
          why: "Conta máquinas em vez de consequência. Uma máquina só, mas ela é o balcão inteiro: o impacto é da função que ela sustenta, não da quantidade de equipamentos.",
        },
        {
          id: "baixa",
          label: "Baixa — hardware sempre demora, então não adianta correr",
          why: "Prioridade descreve a importância do chamado, não a dificuldade de resolver. Se a peça vai demorar, isso vira contorno e comunicação — não rebaixamento de prioridade.",
        },
      ],
    },
    {
      kind: "order",
      id: "bancada",
      question: "Ordene os testes, do mais barato para o mais invasivo.",
      help: "Nenhum sinal de vida: sem LED, sem ventoinha. Não abra o gabinete antes do necessário.",
      items: [
        { id: "b1", label: "Confirmar com a Cláudia exatamente o que ela vê: alguma luz no gabinete, no monitor, algum som" },
        { id: "b2", label: "Testar a tomada e a régua ligando outro equipamento que funciona" },
        { id: "b3", label: "Conferir o cabo de força e o botão liga/desliga na traseira da fonte" },
        { id: "b4", label: "Abrir o gabinete e reassentar os conectores de força da placa-mãe" },
        { id: "b5", label: "Substituir a fonte por uma fonte testada" },
        { id: "b6", label: "Registrar o que foi feito e devolver o equipamento testado" },
      ],
      correctOrder: ["b1", "b2", "b3", "b4", "b5", "b6"],
      why:
        "A pergunta vem primeiro porque muda o rumo inteiro: 'nenhuma luz' e 'a luz acende e a tela fica preta' são dois chamados diferentes, e você está a um telefonema de saber qual é. Depois vem o que não exige ferramenta nem desmontagem: tomada e régua, que falham mais do que fonte, e o botão traseiro da fonte, que é desligado por engano com frequência humilhante. Só então o gabinete abre para reassentar conector — barato, reversível e sem consumir peça. A substituição da fonte vem depois porque é a primeira etapa que gasta recurso. O registro fecha, e não é opcional.",
    },
    {
      kind: "choice",
      id: "bipe",
      question:
        "Com uma fonte testada a máquina liga — mas emite três bipes curtos e não dá vídeo. O que você faz com esse bipe?",
      help: "Você tem um código de diagnóstico na mão. A questão é como usá-lo.",
      options: [
        {
          id: "consultar",
          label: "Anotar o padrão exato e consultar a documentação daquele modelo de placa e fabricante de BIOS",
          correct: true,
          why: "Certo. O bipe é um código, e o dicionário dele é do fabricante: AMI, Award, Phoenix, Dell e HP usam padrões diferentes para a mesma falha. Anotar quantos, longos ou curtos, e conferir na documentação do modelo é o que transforma o som em informação.",
        },
        {
          id: "memoria",
          label: "Trocar a memória — três bipes é memória",
          why: "Essa equivalência não existe de forma universal; ela vale para algumas tabelas e não para outras. Pode até acertar por sorte, e é o hábito que faz trocar a peça errada com confiança. Além disso, reassentar a memória vem antes de trocar.",
        },
        {
          id: "cmos",
          label: "Limpar a CMOS, porque bipe é sempre problema de configuração",
          why: "Limpar a CMOS é um teste legítimo, mas não porque 'bipe é configuração'. Aplicar procedimento sem hipótese é o oposto de diagnóstico, e aqui você ainda perderia as configurações sem saber se era isso.",
        },
        {
          id: "ignorar",
          label: "Ignorar o bipe: o que importa é que a fonte estava com defeito",
          why: "A fonte estava com defeito e havia mais de um problema — o que é comum depois de queda de energia. Encerrar aqui devolve uma máquina que continua sem vídeo, e o chamado reabre no mesmo dia.",
        },
      ],
    },
    {
      kind: "choice",
      id: "fechamento",
      question: "A fonte antiga está comprovadamente defeituosa. O que você faz com ela e com o registro?",
      options: [
        {
          id: "registrar",
          label:
            "Registrar a troca no inventário com série e patrimônio, descartar a fonte no destino correto e verificar se a queda atingiu outros equipamentos",
          correct: true,
          why: "Certo. A troca só existe para a empresa se estiver no inventário — é o que sustenta garantia e planejamento. E se a queda de energia queimou uma fonte, ela pode ter atingido mais: verificar é prevenir os próximos chamados em vez de esperar por eles.",
        },
        {
          id: "prateleira",
          label: "Guardar a fonte na prateleira de peças, pode servir para teste depois",
          why: "Peça com defeito comprovado guardada junto com peça boa acaba voltando para dentro de uma máquina — geralmente às pressas, por outra pessoa. Se guardar, tem que estar identificada como defeituosa e separada.",
        },
        {
          id: "abrir",
          label: "Abrir a fonte para achar o capacitor estufado e confirmar o diagnóstico",
          why: "Não se abre fonte de alimentação. Os capacitores mantêm carga mesmo desligada e fora da tomada, e o risco é real. Fonte com defeito se substitui e se descarta; a confirmação já veio da substituição.",
        },
        {
          id: "devolver",
          label: "Devolver a máquina funcionando e encerrar — o problema acabou",
          why: "Resolver sem registrar deixa a empresa sem saber o que tem, e a próxima pessoa sem saber o que já foi feito. O conserto é metade do trabalho de bancada.",
        },
      ],
    },
    {
      kind: "note",
      id: "laudo",
      question: "Escreva o laudo de bancada, como se o próximo técnico fosse ler daqui a seis meses.",
      help:
        "Um laudo utilizável tem: o relato, o que você testou, a causa encontrada, as peças trocadas com identificação, e a confirmação de quem usa.",
      mustMention: [
        {
          key: "relato",
          label: "o relato de quem abriu o chamado",
          aliases: ["relat", "informou", "cláudia", "claudia", "balcão", "balcao", "não ligava", "nao ligava"],
        },
        {
          key: "teste",
          label: "os testes que você fez",
          aliases: ["test", "tomada", "régua", "regua", "substitu", "conferi", "verifiq"],
        },
        {
          key: "causa",
          label: "a causa encontrada",
          aliases: ["fonte", "queda de energia", "defeit"],
        },
        {
          key: "peca",
          label: "a peça trocada e o registro no inventário",
          aliases: ["invent", "patrim", "série", "serie", "troca", "substitui"],
        },
        {
          key: "validacao",
          label: "a confirmação de quem usa a máquina",
          aliases: ["confirm", "validou", "testou", "acompanh", "liberado"],
        },
      ],
      modelAnswer:
        "Cláudia (Atendimento) informou que o PC do balcão não ligava: sem luz e sem ventoinha, após queda de energia na noite anterior. " +
        "Testei tomada e régua com outro equipamento — energia normal. Conferi cabo e botão traseiro da fonte. Reassentei os conectores de força. " +
        "Causa: fonte de alimentação com defeito, provavelmente por conta da queda de energia. " +
        "Substituí a fonte (patrimônio 4471, série ATX-9F2K31); a fonte antiga foi descartada como defeituosa e a troca foi registrada no inventário. " +
        "Com a fonte nova a máquina emitiu três bipes curtos sem vídeo; conforme a documentação do modelo, reassentei a memória e o vídeo voltou. " +
        "Cláudia testou o sistema de atendimento e confirmou funcionamento às 08:52, antes da abertura. " +
        "Recomendação registrada: verificar os demais equipamentos do balcão e a proteção elétrica do ponto.",
    },
  ],
  debrief:
    "Dois aprendizados de bancada aqui. O primeiro é a ordem: quase todo mundo quer abrir o gabinete, e a régua e o botão traseiro da fonte respondem por uma fatia embaraçosa dos 'não liga'. O segundo é que **queda de energia costuma atingir mais de uma coisa** — trocar a fonte e devolver sem testar até o vídeo é como o chamado reabre no mesmo dia. Sobre o bipe: a única resposta profissional é anotar o padrão e consultar o modelo, porque a tabela é do fabricante. E o laudo não é burocracia: em seis meses, se essa máquina voltar, é o laudo que diz se a fonte já foi trocada e quando — o que muda a decisão entre consertar de novo e substituir o equipamento.",
};

/**
 * Movimentação de equipamento: o exercício de IMAC. As vagas mapeadas pedem
 * isso por nome — "atividades de IMAC (instalação, movimentação, adição,
 * mudança de equipamentos)" — e é trabalho planejado, não incidente.
 */
const mudancaDeAndar: Ticket = {
  id: "mudanca-de-andar",
  title: "Vou mudar de andar e preciso levar meu equipamento",
  reporter: "Renata Alves",
  sector: "Comercial",
  openedAt: "14:20",
  body:
    "Boa tarde. Na sexta eu mudo do 3º para o 5º andar. Preciso levar meu computador e os dois " +
    "monitores. No 5º eu vou usar a impressora do outro setor também. Nada está com problema, " +
    "é só a mudança mesmo.",
  steps: [
    {
      kind: "choice",
      id: "tipo",
      question: "Isso é um incidente ou uma requisição de serviço?",
      help: "A pergunta é se algo que funcionava parou, ou se estão pedindo trabalho novo.",
      options: [
        {
          id: "req",
          label: "Requisição de serviço",
          correct: true,
          why: "Certo. Nada quebrou e ninguém está parado. É trabalho planejado, com data marcada — entra como requisição, com janela combinada e checklist, e não disputa a fila com quem está sem trabalhar.",
        },
        {
          id: "inc",
          label: "Incidente",
          why: "Incidente é interrupção de algo que funcionava. Aqui a própria Renata diz que nada está com problema. Classificar como incidente infla a fila de urgências e distorce qualquer indicador de disponibilidade.",
        },
        {
          id: "problema",
          label: "Problema",
          why: "Problema é a causa raiz por trás de incidentes repetidos. Não existe incidente nenhum aqui.",
        },
      ],
    },
    {
      kind: "choice",
      id: "imac",
      question: "Dentro de IMAC, que atividade é essa?",
      help: "Instalação, Movimentação, Adição, Mudança.",
      options: [
        {
          id: "mov",
          label: "Movimentação",
          correct: true,
          why: "Certo. O mesmo equipamento muda de lugar. Não entra equipamento novo, não se acrescenta componente e não se altera configuração de hardware — muda a localização, e é isso que o inventário precisa registrar.",
        },
        {
          id: "inst",
          label: "Instalação",
          why: "Instalação é equipamento novo entrando em uso. O computador e os monitores da Renata já existem e já estão inventariados.",
        },
        {
          id: "adic",
          label: "Adição",
          why: "Adição é acrescentar item ao que já existe — memória, um monitor a mais, um leitor. Passar a usar uma impressora que já está instalada no 5º andar é permissão e mapeamento, não peça nova.",
        },
        {
          id: "mud",
          label: "Mudança",
          why: "Mudança é trocar configuração ou componente por outro diferente. Aqui nada muda no equipamento além de onde ele fica.",
        },
      ],
    },
    {
      kind: "order",
      id: "checklist",
      question: "Ordene o checklist da movimentação.",
      help: "Do que precisa ser combinado antes até o que fecha o serviço.",
      items: [
        { id: "m1", label: "Confirmar a janela com a Renata e com quem libera o acesso ao 5º andar" },
        { id: "m2", label: "Abrir a requisição com a data combinada e o que será movido" },
        { id: "m3", label: "Conferir no inventário o patrimônio do computador e dos dois monitores" },
        { id: "m4", label: "Desligar, identificar os cabos e transportar" },
        { id: "m5", label: "Instalar no lugar novo e testar rede, unidades do setor e a impressora" },
        { id: "m6", label: "Obter a confirmação da Renata de que está trabalhando normalmente" },
        { id: "m7", label: "Atualizar o inventário com a nova localização e encerrar" },
      ],
      correctOrder: ["m1", "m2", "m3", "m4", "m5", "m6", "m7"],
      why:
        "A janela vem antes de tudo porque movimentação sem hora combinada para a pessoa no meio do expediente — e o acesso ao andar novo pode não depender de você. A requisição registra o combinado antes de existir trabalho físico. A conferência de patrimônio vem antes do transporte, e não depois: é agora que você sabe o que saiu de onde, e é o momento de descobrir divergência com calma. O transporte com cabo identificado economiza a remontagem. Testar vem antes de pedir confirmação, e a confirmação vem antes de encerrar — quem diz que está funcionando é quem usa. A atualização do inventário é o último passo e o mais esquecido: sem ela o ativo existe no 5º andar e continua registrado no 3º.",
    },
    {
      kind: "choice",
      id: "sem-rede",
      question:
        "Na sexta, instalado no 5º andar, o computador não pega rede. Nada foi alterado nele. Qual a primeira hipótese?",
      options: [
        {
          id: "ponto",
          label: "O ponto de rede daquela mesa não está ativo — sem patch no switch ou tomada não conectada",
          correct: true,
          why: "Certo. A máquina funcionava até ser desligada e nada nela mudou. O único fato novo é o ponto de rede, e ponto sem patch no switch é rotina em andar remanejado. Confirme com outro equipamento na mesma tomada antes de qualquer coisa.",
        },
        {
          id: "placa",
          label: "A placa de rede foi danificada no transporte",
          why: "Possível e improvável como primeira hipótese: você mudaria o suspeito mais fácil de testar pelo mais difícil. Teste o ponto primeiro, que custa um cabo e outro equipamento.",
        },
        {
          id: "dhcp",
          label: "O DHCP não tem endereço para essa sub-rede",
          why: "Testável e vale conferir, mas depois — e o sintoma seria diferente: com o ponto ativo a estação teria link e cairia em 169.254.x.x. Sem link, o DHCP nem é consultado.",
        },
        {
          id: "ad",
          label: "A conta de computador precisa ser reingressada no domínio por causa da mudança",
          why: "Mudar de andar não afeta a conta de computador no domínio. Confundir mudança física com identidade no AD leva a mexer no que estava certo.",
        },
      ],
    },
    {
      kind: "note",
      id: "encerramento",
      question: "Escreva o encerramento da requisição.",
      help:
        "Registre: o que foi movido com identificação, de onde para onde, o que foi testado, e a confirmação da pessoa.",
      mustMention: [
        {
          key: "itens",
          label: "o que foi movido, com patrimônio",
          aliases: ["patrim", "monitor", "computador", "série", "serie"],
        },
        {
          key: "local",
          label: "de onde para onde",
          aliases: ["3º", "3o", "5º", "5o", "andar", "sala", "localiza"],
        },
        {
          key: "testes",
          label: "o que foi testado no lugar novo",
          aliases: ["test", "rede", "impressora", "unidade"],
        },
        {
          key: "inventario",
          label: "a atualização do inventário",
          aliases: ["invent", "atualiz", "registr"],
        },
        {
          key: "validacao",
          label: "a confirmação da Renata",
          aliases: ["confirm", "validou", "renata", "acompanh"],
        },
      ],
      modelAnswer:
        "Movimentação executada na sexta, 09:00, conforme janela combinada. " +
        "Movidos: computador (patrimônio 3182, série DT-77QK04) e dois monitores (patrimônio 3183 e 3184), do 3º andar — Comercial para o 5º andar, mesa 12. " +
        "No lugar novo o ponto de rede da mesa estava sem patch no switch; acionei a infraestrutura e o ponto foi ativado às 09:40. " +
        "Testei rede, unidade Z: do setor e impressão na impressora do 5º andar, com página de teste. " +
        "Renata confirmou que está trabalhando normalmente às 09:55. " +
        "Inventário atualizado com a nova localização dos três ativos. Requisição encerrada.",
    },
  ],
  debrief:
    "Movimentação parece o serviço mais simples da lista e é o que mais suja o inventário. O ativo continua existindo, muda de lugar e ninguém atualiza o registro — meses depois o inventário aponta um equipamento no 3º andar que está no 5º, e a empresa compra um que já tem. Dois detalhes que separam quem já fez isso: conferir patrimônio **antes** de transportar, porque divergência descoberta na origem se resolve com calma; e desconfiar do **ponto de rede** primeiro quando a máquina não sobe no lugar novo, já que ela funcionava e nada nela mudou. Por fim, repare que isso é requisição, não incidente: tem data, tem checklist e não disputa a fila com quem está parado.",
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

export const TICKETS: Ticket[] = [
  naoConsigoLogar,
  impressoraSetor,
  sistemaForaDoAr,
  pcNaoLiga,
  mudancaDeAndar,
];

/**
 * A qual trilha cada chamado pertence.
 *
 * Ficava embutido no `Dashboard`, e isso escondia conteúdo dentro de
 * componente: um chamado sem trilha virava exercício órfão, alcançável por
 * nenhum caminho, e nada acusava. Aqui em cima do conteúdo há teste garantindo
 * que todo chamado tem casa.
 */
export const TICKETS_BY_LESSON: Record<string, string[]> = {
  "helpdesk-conceitos": ["nao-consigo-logar", "sistema-fora-do-ar"],
  impressao: ["impressora-setor"],
  "hardware-bancada": ["pc-nao-liga", "mudanca-de-andar"],
};

/**
 * A aula de apoio de um chamado. A tela de encerramento oferece "reler a aula",
 * e o destino estava fixo em `helpdesk-conceitos` — o que já mandava quem fazia
 * a triagem de impressora para a aula errada, e mandaria os dois chamados de
 * bancada também.
 */
export function lessonForTicket(ticketId: string): string | undefined {
  return Object.keys(TICKETS_BY_LESSON).find((aula) =>
    TICKETS_BY_LESSON[aula].includes(ticketId),
  );
}

export function getTicket(id: string): Ticket | undefined {
  return TICKETS.find((t) => t.id === id);
}
