export type Area =
  | "redes"
  | "helpdesk"
  | "windows"
  | "ad"
  | "impressao"
  | "hardware";

export const AREA_LABEL: Record<Area, string> = {
  redes: "Redes",
  helpdesk: "Help desk",
  windows: "Estação Windows",
  ad: "Active Directory",
  impressao: "Impressão",
  hardware: "Hardware e bancada",
};

/* ---------------------------------------------------------------- quiz --- */

export interface QuizOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Explicação mostrada depois de responder — inclusive para as erradas. */
  why: string;
}

export interface QuizQuestion {
  id: string;
  area: Area;
  prompt: string;
  /** Cenário/contexto opcional acima da pergunta. */
  context?: string;
  options: QuizOption[];
  /** A frase que vale decorar. */
  takeaway: string;
}

export interface Quiz {
  id: string;
  title: string;
  area: Area;
  summary: string;
  questions: QuizQuestion[];
}

/* ------------------------------------------------------ terminal / lab --- */

/**
 * Estado da máquina simulada. Os comandos leem daqui, e alguns escrevem
 * (`ipconfig /renew`, `gpupdate /force`, `net use`).
 */
export interface MachineState {
  hostname: string;
  user: string;
  domain: string | null;
  /** OU do usuário no AD — o `gpresult` lê daqui em vez de fixar Financeiro. */
  ou: string;
  mac: string;

  /** Cabo/Wi-Fi conectado. false => "Mídia desconectada". */
  linkUp: boolean;
  /** null => sem endereço. "169.254.x.x" => APIPA. */
  ip: string | null;
  mask: string;
  gateway: string;
  dns: string[];
  /** null => o DHCP não responde. */
  dhcpServer: string | null;
  dhcpEnabled: boolean;
  /** IP que o DHCP entrega num `/renew` bem-sucedido. */
  dhcpLeaseIp: string;

  /** ping no gateway responde? */
  gatewayReachable: boolean;
  /** ping 8.8.8.8 responde? (saída para a internet) */
  internetReachable: boolean;
  /** o servidor DNS configurado responde consultas? */
  dnsWorking: boolean;
  /**
   * Existe registro velho no cache do cliente DNS.
   *
   * Importante: `nslookup` NÃO lê esse cache — ele consulta o servidor direto.
   * É justamente por isso que ele serve para separar "cache local sujo" de
   * "servidor errado". Então com cache velho o `ping` por nome vai para
   * `dnsStaleIp` e o `nslookup` devolve o endereço certo.
   */
  dnsCacheStale: boolean;
  /** endereço antigo que o cache local devolve enquanto não for limpo */
  dnsStaleIp: string | null;

  /**
   * IPs que realmente respondem na rede local, além do gateway. Sem isso
   * qualquer endereço da sub-rede respondia ao ping, inclusive um servidor
   * inexistente — contradizendo o próprio cenário.
   */
  liveHosts: string[];
  /** aviso de IP duplicado na rede */
  ipConflict: boolean;

  mappedDrives: Record<string, string>;
  gpoApplied: boolean;
  /** nomes de serviço parados que importam no cenário, ex.: ["Spooler"] */
  stoppedServices: string[];

  /** IP da impressora de rede do setor, quando o cenário tem uma. */
  printerIp: string | null;
  /** Trabalhos presos na fila de impressão. */
  printQueue: number;

  /* ------------------------------------------------------------ nível 2 --- */

  /**
   * Canal seguro entre a estação e o domínio quebrado — a origem do
   * "A relação de confiança entre esta estação de trabalho e o domínio
   * principal falhou".
   */
  trustBroken: boolean;
  /**
   * Diferença de relógio entre a estação e o controlador, em segundos.
   * Acima de 300 s o Kerberos recusa o ticket e o logon falha.
   */
  timeSkewSeconds: number;
  /** Estatística do escopo DHCP, quando o cenário é visto do servidor. */
  dhcpScope: {
    scopeId: string;
    start: string;
    end: string;
    inUse: number;
    free: number;
  } | null;
  /** ACL da pasta inspecionada por `icacls`. */
  acl: {
    path: string;
    entries: { principal: string; rights: string; deny: boolean }[];
  } | null;
  /**
   * Prompt aberto como administrador. Mexer em serviço exige isso, e descobrir
   * o "Acesso negado" faz parte do treino — em campo é o primeiro tropeço.
   */
  elevated: boolean;
}

export interface DiagnosisOption {
  id: string;
  label: string;
  correct?: boolean;
  why: string;
}

export interface Scenario {
  id: string;
  title: string;
  area: Area;
  /** O que o usuário relatou no chamado. */
  briefing: string;
  /** Setor/pessoa, para dar textura. */
  reporter: string;
  initial: MachineState;
  /**
   * Comandos que provam o diagnóstico. Usado no debrief para mostrar se
   * ele concluiu com evidência ou por chute.
   */
  expectedCommands: string[];
  diagnoses: DiagnosisOption[];
  /** O que explicar depois de acertar. */
  debrief: string;
  /** Dica liberada sob demanda (custa ponto de "sem dica"). */
  hint: string;
}

/* ------------------------------------------------------------- chamado --- */

export interface TriageChoiceStep {
  kind: "choice";
  id: string;
  question: string;
  help?: string;
  options: DiagnosisOption[];
}

export interface TriageOrderStep {
  kind: "order";
  id: string;
  question: string;
  help?: string;
  items: { id: string; label: string }[];
  correctOrder: string[];
  why: string;
}

export interface TriageNoteStep {
  kind: "note";
  id: string;
  question: string;
  help?: string;
  /** Palavras/ideias que a anotação precisa conter. */
  mustMention: { key: string; label: string; aliases: string[] }[];
  modelAnswer: string;
}

export type TriageStep = TriageChoiceStep | TriageOrderStep | TriageNoteStep;

export interface Ticket {
  id: string;
  title: string;
  reporter: string;
  sector: string;
  openedAt: string;
  body: string;
  steps: TriageStep[];
  debrief: string;
}

/* ---------------------------------------------------------------- aula --- */

export type LessonBlock =
  /** subtítulo de seção */
  | { kind: "h"; text: string }
  /** parágrafo; **negrito** e `código` são interpretados */
  | { kind: "p"; text: string }
  /** termo com definição — o vocabulário obrigatório */
  | { kind: "term"; term: string; def: string; note?: string }
  | { kind: "table"; head: string[]; rows: string[][]; caption?: string }
  /** bloco monoespaçado: comando digitado ou saída de tela */
  | { kind: "cmd"; lines: string[]; caption?: string }
  /** lista ordenada de passos */
  | { kind: "steps"; items: string[] }
  /** destaque: a frase que vale decorar, ou a armadilha */
  | { kind: "callout"; tone: "key" | "warn"; text: string };

/** Nível de suporte. O N1 resolve volume; o N2 recebe o que o N1 escala. */
export type Level = 1 | 2 | 3;

export interface Lesson {
  id: string;
  /** Trilhas são agrupadas por nível no painel. */
  level: Level;
  area: Area;
  title: string;
  summary: string;
  /** tempo estimado de leitura, em minutos */
  minutes: number;
  blocks: LessonBlock[];
  /** o que fazer depois de ler */
  nextQuizId?: string;
  nextLabIds?: string[];
}
