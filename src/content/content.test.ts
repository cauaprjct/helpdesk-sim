import { describe, expect, it } from "vitest";
import { AVAILABLE_LEVELS, LESSONS } from "./lessons";
import { QUIZZES } from "./quizzes";
import { SCENARIOS } from "./scenarios";
import { TICKETS, TICKETS_BY_LESSON, lessonForTicket } from "./tickets";
import { LINKS, N1_INVENTORY } from "./cover";
import { shuffleFor } from "@/lib/shuffle";

/**
 * Invariantes do conteúdo.
 *
 * O tipo do TypeScript garante a FORMA (todo campo existe, do tipo certo). O
 * que ele não garante é a COERÊNCIA: uma questão sem alternativa correta
 * compila. Uma aula apontando para um laboratório inexistente compila e vira
 * link morto em produção. Uma contagem na capa desatualizada compila e mente
 * para quem chega.
 *
 * Estes testes cobrem exatamente essa faixa.
 */

function duplicados(ids: string[]): string[] {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const id of ids) {
    if (vistos.has(id)) repetidos.add(id);
    vistos.add(id);
  }
  return [...repetidos];
}

/* ============================================================== ids ====== */

describe("identidade", () => {
  it.each([
    ["aulas", LESSONS.map((l) => l.id)],
    ["quizzes", QUIZZES.map((q) => q.id)],
    ["cenários", SCENARIOS.map((s) => s.id)],
    ["chamados", TICKETS.map((t) => t.id)],
  ])("ids de %s são únicos", (_nome, ids) => {
    expect(duplicados(ids)).toEqual([]);
  });

  it("ids de questão são únicos no projeto inteiro", () => {
    // A fila de revisão guarda id de questão sem o quiz de origem. Id repetido
    // faria uma questão errada apagar outra.
    const ids = QUIZZES.flatMap((q) => q.questions.map((x) => x.id));
    expect(duplicados(ids)).toEqual([]);
  });

  it("ids são slugs, sem espaço nem maiúscula", () => {
    const todos = [
      ...LESSONS.map((l) => l.id),
      ...QUIZZES.map((q) => q.id),
      ...SCENARIOS.map((s) => s.id),
      ...TICKETS.map((t) => t.id),
    ];
    // Vão para a URL: /aula/<id>, /lab/<id>.
    expect(todos.filter((id) => !/^[a-z0-9-]+$/.test(id))).toEqual([]);
  });
});

/* =========================================================== aulas ====== */

describe("aulas", () => {
  it("toda aula tem nível disponível", () => {
    for (const l of LESSONS) {
      expect(AVAILABLE_LEVELS).toContain(l.level);
    }
  });

  it("toda aula tem título, resumo e blocos", () => {
    for (const l of LESSONS) {
      expect(l.title.trim(), l.id).not.toBe("");
      expect(l.summary.trim(), l.id).not.toBe("");
      expect(l.blocks.length, l.id).toBeGreaterThan(0);
    }
  });

  it("tempo de leitura é plausível", () => {
    for (const l of LESSONS) {
      expect(l.minutes, l.id).toBeGreaterThan(0);
      expect(l.minutes, l.id).toBeLessThan(60);
    }
  });

  it("nextQuizId aponta para quiz existente", () => {
    // Link morto aqui é 404 para quem termina de ler a aula.
    const ids = new Set(QUIZZES.map((q) => q.id));
    for (const l of LESSONS) {
      if (l.nextQuizId) expect(ids, `${l.id} -> ${l.nextQuizId}`).toContain(l.nextQuizId);
    }
  });

  it("nextLabIds apontam para cenários existentes", () => {
    const ids = new Set(SCENARIOS.map((s) => s.id));
    for (const l of LESSONS) {
      for (const lab of l.nextLabIds ?? []) {
        expect(ids, `${l.id} -> ${lab}`).toContain(lab);
      }
    }
  });

  it("todo cenário é alcançável por alguma aula", () => {
    // Cenário órfão é trabalho feito que ninguém encontra.
    const referenciados = new Set(LESSONS.flatMap((l) => l.nextLabIds ?? []));
    const orfaos = SCENARIOS.filter((s) => !referenciados.has(s.id)).map((s) => s.id);
    expect(orfaos).toEqual([]);
  });

  it("todo chamado pertence a uma trilha existente", () => {
    // O mapa vivia dentro do Dashboard: chamado sem trilha virava exercício
    // órfão e nada acusava.
    const idsDeAula = new Set(LESSONS.map((l) => l.id));
    const idsDeChamado = new Set(TICKETS.map((t) => t.id));

    for (const [aula, chamados] of Object.entries(TICKETS_BY_LESSON)) {
      expect(idsDeAula, `trilha inexistente no mapa: ${aula}`).toContain(aula);
      for (const c of chamados) {
        expect(idsDeChamado, `chamado inexistente no mapa: ${c}`).toContain(c);
      }
    }

    const mapeados = new Set(Object.values(TICKETS_BY_LESSON).flat());
    const orfaos = TICKETS.filter((t) => !mapeados.has(t.id)).map((t) => t.id);
    expect(orfaos).toEqual([]);
  });

  it("nenhum chamado aparece em duas trilhas", () => {
    const todos = Object.values(TICKETS_BY_LESSON).flat();
    expect(duplicados(todos)).toEqual([]);
  });

  it("todo chamado resolve para a aula da própria trilha", () => {
    // A tela de encerramento oferece "reler a aula". O destino estava fixo em
    // helpdesk-conceitos e mandava quem fazia a triagem de impressora para a
    // aula errada.
    const idsDeAula = new Set(LESSONS.map((l) => l.id));
    for (const t of TICKETS) {
      const aula = lessonForTicket(t.id);
      expect(aula, `${t.id} sem aula de apoio`).toBeTruthy();
      expect(idsDeAula, `${t.id} -> ${aula}`).toContain(aula);
    }
  });

  it("a triagem de impressora aponta para a aula de impressão", () => {
    expect(lessonForTicket("impressora-setor")).toBe("impressao");
  });

  it("todo quiz é alcançável por alguma aula", () => {
    const referenciados = new Set(
      LESSONS.map((l) => l.nextQuizId).filter((x): x is string => !!x),
    );
    const orfaos = QUIZZES.filter((q) => !referenciados.has(q.id)).map((q) => q.id);
    expect(orfaos).toEqual([]);
  });

  it("blocos de tabela têm linhas do tamanho do cabeçalho", () => {
    for (const l of LESSONS) {
      for (const b of l.blocks) {
        if (b.kind !== "table") continue;
        for (const row of b.rows) {
          expect(row.length, `${l.id}: ${b.head.join("|")}`).toBe(b.head.length);
        }
      }
    }
  });

  it("termo tem definição", () => {
    for (const l of LESSONS) {
      for (const b of l.blocks) {
        if (b.kind === "term") expect(b.def.trim(), `${l.id}: ${b.term}`).not.toBe("");
      }
    }
  });
});

/* ======================================================== questões ====== */

describe("questões", () => {
  const todas = QUIZZES.flatMap((q) => q.questions.map((x) => ({ quiz: q.id, ...x })));

  it("existem questões", () => {
    expect(todas.length).toBeGreaterThan(0);
  });

  it("cada questão tem exatamente uma alternativa correta", () => {
    for (const q of todas) {
      const corretas = q.options.filter((o) => o.correct);
      expect(corretas.length, `${q.quiz}/${q.id}`).toBe(1);
    }
  });

  it("cada questão tem pelo menos três alternativas", () => {
    for (const q of todas) {
      expect(q.options.length, `${q.quiz}/${q.id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("toda alternativa explica por que está certa ou errada", () => {
    // É a regra do produto: errar sem entender o motivo não ensina nada.
    for (const q of todas) {
      for (const o of q.options) {
        expect(o.why.trim(), `${q.quiz}/${q.id}/${o.id}`).not.toBe("");
      }
    }
  });

  it("toda questão tem enunciado e takeaway", () => {
    for (const q of todas) {
      expect(q.prompt.trim(), `${q.quiz}/${q.id}`).not.toBe("");
      expect(q.takeaway.trim(), `${q.quiz}/${q.id}`).not.toBe("");
    }
  });

  it("ids de alternativa não repetem dentro da questão", () => {
    for (const q of todas) {
      expect(duplicados(q.options.map((o) => o.id)), `${q.quiz}/${q.id}`).toEqual([]);
    }
  });

  it("questão herda a área do quiz", () => {
    for (const quiz of QUIZZES) {
      for (const q of quiz.questions) {
        expect(q.area, `${quiz.id}/${q.id}`).toBe(quiz.area);
      }
    }
  });
});

/* ======================================================== cenários ====== */

describe("cenários de laboratório", () => {
  it("cada cenário tem exatamente um diagnóstico correto", () => {
    for (const s of SCENARIOS) {
      expect(s.diagnoses.filter((d) => d.correct).length, s.id).toBe(1);
    }
  });

  it("cada cenário oferece pelo menos três diagnósticos", () => {
    for (const s of SCENARIOS) {
      expect(s.diagnoses.length, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("todo diagnóstico explica por que está certo ou errado", () => {
    // Descartar a hipótese errada é metade do treino.
    for (const s of SCENARIOS) {
      for (const d of s.diagnoses) {
        expect(d.why.trim(), `${s.id}/${d.id}`).not.toBe("");
      }
    }
  });

  it("todo cenário cobra evidência", () => {
    for (const s of SCENARIOS) {
      expect(s.expectedCommands.length, s.id).toBeGreaterThan(0);
    }
  });

  it("todo cenário tem relato, dica e debrief", () => {
    for (const s of SCENARIOS) {
      expect(s.briefing.trim(), s.id).not.toBe("");
      expect(s.reporter.trim(), s.id).not.toBe("");
      expect(s.hint.trim(), s.id).not.toBe("");
      expect(s.debrief.trim(), s.id).not.toBe("");
    }
  });

  it("o estado inicial é coerente consigo mesmo", () => {
    for (const s of SCENARIOS) {
      const m = s.initial;
      // Sem cabo não existe endereço obtido do DHCP.
      if (!m.linkUp) expect(m.dhcpServer === null || m.ip === null, s.id).toBe(true);
      // Se o gateway responde, ele precisa estar entre os hosts no ar.
      if (m.gatewayReachable) expect(m.liveHosts, s.id).toContain(m.gateway);
      // Cache sujo sem endereço velho não produz sintoma nenhum.
      if (m.dnsCacheStale) expect(m.dnsStaleIp, s.id).toBeTruthy();
      // Internet não chega sem gateway.
      if (m.internetReachable) expect(m.gatewayReachable, s.id).toBe(true);
    }
  });
});

/* ======================================================== chamados ====== */

describe("triagem de chamado", () => {
  it("todo chamado tem passos", () => {
    for (const t of TICKETS) {
      expect(t.steps.length, t.id).toBeGreaterThan(0);
    }
  });

  it("passo de escolha tem exatamente uma opção correta e todas explicadas", () => {
    for (const t of TICKETS) {
      for (const p of t.steps) {
        if (p.kind !== "choice") continue;
        expect(p.options.filter((o) => o.correct).length, `${t.id}/${p.id}`).toBe(1);
        for (const o of p.options) {
          expect(o.why.trim(), `${t.id}/${p.id}/${o.id}`).not.toBe("");
        }
      }
    }
  });

  it("passo de ordenação usa exatamente os itens que oferece", () => {
    // correctOrder com item a mais ou a menos torna o passo impossível.
    for (const t of TICKETS) {
      for (const p of t.steps) {
        if (p.kind !== "order") continue;
        expect([...p.correctOrder].sort(), `${t.id}/${p.id}`).toEqual(
          p.items.map((i) => i.id).sort(),
        );
        expect(p.why.trim(), `${t.id}/${p.id}`).not.toBe("");
      }
    }
  });

  it("passo de anotação tem o que exigir e um modelo de resposta", () => {
    for (const t of TICKETS) {
      for (const p of t.steps) {
        if (p.kind !== "note") continue;
        expect(p.mustMention.length, `${t.id}/${p.id}`).toBeGreaterThan(0);
        expect(p.modelAnswer.trim(), `${t.id}/${p.id}`).not.toBe("");
        for (const m of p.mustMention) {
          expect(m.aliases.length, `${t.id}/${p.id}/${m.key}`).toBeGreaterThan(0);
          // O modelo tem que passar no próprio critério, senão o critério é
          // inatingível e o aluno é reprovado por uma régua torta.
          const texto = p.modelAnswer.toLowerCase();
          const bate = m.aliases.some((a) => texto.includes(a.toLowerCase()));
          expect(bate, `${t.id}/${p.id}: modelo não menciona "${m.label}"`).toBe(true);
        }
      }
    }
  });

  it("ids de passo são únicos dentro do chamado", () => {
    for (const t of TICKETS) {
      expect(duplicados(t.steps.map((p) => p.id)), t.id).toEqual([]);
    }
  });
});

/* ========================================= a capa não pode mentir ======== */

describe("inventário anunciado na capa", () => {
  // As contagens da capa já ficaram atrás do conteúdo uma vez. Quem chega pela
  // capa lê esses números como promessa; errar isso é o pior tipo de erro num
  // portfólio, porque é verificável em dois cliques.
  function anunciado(label: string): number {
    const item = N1_INVENTORY.find((i) => i.label === label);
    if (!item) throw new Error(`a capa não anuncia "${label}"`);
    return item.count;
  }

  it("aulas", () => {
    expect(anunciado("aulas")).toBe(LESSONS.length);
  });

  it("laboratórios de terminal", () => {
    expect(anunciado("laboratórios de terminal")).toBe(SCENARIOS.length);
  });

  it("triagens de chamado", () => {
    expect(anunciado("triagens de chamado")).toBe(TICKETS.length);
  });

  it("questões", () => {
    const total = QUIZZES.reduce((n, q) => n + q.questions.length, 0);
    expect(anunciado("questões")).toBe(total);
  });
});

/* ================================ onde cai a resposta certa ============== */

describe("posição da alternativa correta", () => {
  /**
   * O conteúdo-fonte tem um vício de autoria: a resposta certa foi escrita
   * primeiro em TODOS os exercícios — 64 questões, 12 diagnósticos, 8 escolhas
   * de chamado, 100% na primeira posição. Sem redistribuir na tela, dava para
   * gabaritar o produto clicando sempre na primeira opção.
   *
   * A correção é o embaralhamento determinístico por id. Estes testes medem o
   * resultado dele contra o conteúdo real — não a intenção.
   */
  function posicaoDaCorreta<T extends { correct?: boolean }>(
    opcoes: T[],
    id: string,
  ): number {
    return shuffleFor(opcoes, id).findIndex((o) => o.correct) + 1;
  }

  function distribuicao(posicoes: number[]) {
    const conta = new Map<number, number>();
    for (const p of posicoes) conta.set(p, (conta.get(p) ?? 0) + 1);
    const maior = Math.max(...conta.values());
    return {
      distintas: conta.size,
      maiorPct: (maior / posicoes.length) * 100,
      mapa: [...conta].sort((a, b) => a[0] - b[0]),
    };
  }

  // Não há teste exigindo que a fonte mantenha o vício: obrigar autor novo a
  // escrever a resposta certa em primeiro lugar seria absurdo. O que precisa
  // ficar travado é o RESULTADO na tela — e é o que os testes abaixo medem.
  // Se alguém desligar o embaralhamento, a distribuição volta a 100% na
  // primeira posição e eles quebram.

  it("questões: a correta se espalha pelas quatro posições", () => {
    const d = distribuicao(
      QUIZZES.flatMap((q) => q.questions).map((q) => posicaoDaCorreta(q.options, q.id)),
    );
    expect(d.distintas, JSON.stringify(d.mapa)).toBeGreaterThanOrEqual(4);
    expect(d.maiorPct, JSON.stringify(d.mapa)).toBeLessThan(45);
  });

  it("diagnósticos de laboratório: a correta usa pelo menos três posições", () => {
    // Só 12 conjuntos: percentual aqui oscila muito, então o que vale medir é a
    // variedade, não a proporção.
    const d = distribuicao(
      SCENARIOS.map((s) => posicaoDaCorreta(s.diagnoses, s.id)),
    );
    expect(d.distintas, JSON.stringify(d.mapa)).toBeGreaterThanOrEqual(3);
  });

  it("escolhas de chamado: a correta não fica sempre no mesmo lugar", () => {
    const posicoes = TICKETS.flatMap((t) =>
      t.steps
        .filter((p): p is Extract<typeof p, { kind: "choice" }> => p.kind === "choice")
        .map((p) => posicaoDaCorreta(p.options, p.id)),
    );
    const d = distribuicao(posicoes);
    expect(d.distintas, JSON.stringify(d.mapa)).toBeGreaterThanOrEqual(2);
  });

  it("embaralhar não perde nem duplica alternativa", () => {
    for (const quiz of QUIZZES) {
      for (const q of quiz.questions) {
        const ordem = shuffleFor(q.options, q.id);
        expect(ordem.length, `${quiz.id}/${q.id}`).toBe(q.options.length);
        expect(new Set(ordem.map((o) => o.id)).size, `${quiz.id}/${q.id}`).toBe(
          q.options.length,
        );
        expect(ordem.filter((o) => o.correct).length, `${quiz.id}/${q.id}`).toBe(1);
      }
    }
  });
});

/* ==================================== links externos da capa ============= */

describe("links externos", () => {
  /**
   * Link errado numa peça de portfólio é caro: o visitante clica uma vez, não
   * carrega, e não volta. Já aconteceu duas vezes aqui — uma com o portfólio,
   * outra com o LinkedIn — e nenhuma das duas o TypeScript pegaria, porque
   * `string` errada compila igual.
   *
   * Estes testes não checam se a URL está no ar: teste que depende de rede
   * falha por motivo alheio ao código. Eles travam a FORMA, que é onde os dois
   * erros estiveram.
   */
  it("são todos https absolutos", () => {
    for (const [nome, url] of Object.entries(LINKS)) {
      expect(url, nome).toMatch(/^https:\/\//);
    }
  });

  it("não têm espaço nem quebra de linha", () => {
    for (const [nome, url] of Object.entries(LINKS)) {
      expect(url, nome).not.toMatch(/\s/);
    }
  });

  it("o LinkedIn preserva o til escapado do slug", () => {
    // O slug público é `cauã-alves-0975a129b`. Sem o til a URL aponta para um
    // perfil inexistente. Quem "limpar" o %C3%A3 para deixar legível quebra o
    // link — e é exatamente o que este teste impede.
    expect(LINKS.linkedin).toContain("cau%C3%A3-alves");
    expect(LINKS.linkedin).not.toMatch(/\/in\/caua-alves/);
  });

  it("o portfólio aponta para o domínio que está no ar", () => {
    // `cauadev-portfolio.vercel.app` é uma URL antiga que devolve
    // DEPLOYMENT_NOT_FOUND. A válida é esta.
    expect(LINKS.portfolio).toContain("portifolio-caua.vercel.app");
    expect(LINKS.portfolio).not.toContain("cauadev-portfolio");
  });

  it("o GitHub aponta para o perfil, não para um repositório", () => {
    expect(LINKS.github).toBe("https://github.com/cauaprjct");
  });
});
