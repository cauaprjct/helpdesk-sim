import { describe, expect, it } from "vitest";
import { OPTION_LETTERS, seedFrom, shuffleFor, shuffleWithSeed } from "./shuffle";

describe("seedFrom", () => {
  it("é estável para o mesmo texto", () => {
    expect(seedFrom("redes-apipa")).toBe(seedFrom("redes-apipa"));
  });

  it("separa ids parecidos", () => {
    expect(seedFrom("redes-apipa")).not.toBe(seedFrom("redes-apipb"));
    expect(seedFrom("redes-dns")).not.toBe(seedFrom("redes-dns "));
  });

  it("devolve inteiro sem sinal", () => {
    for (const t of ["", "a", "redes-gateway-dns", "áéí"]) {
      const s = seedFrom(t);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("shuffleWithSeed", () => {
  const itens = ["a", "b", "c", "d"];

  it("mesma semente, mesma ordem — é o que salva a hidratação", () => {
    // A página é pré-renderizada: servidor e cliente têm que chegar na mesma
    // ordem, senão o React acusa divergência.
    expect(shuffleWithSeed(itens, 12345)).toEqual(shuffleWithSeed(itens, 12345));
  });

  it("sementes diferentes produzem ordens diferentes", () => {
    const ordens = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map((s) => shuffleWithSeed(itens, s).join("")),
    );
    expect(ordens.size).toBeGreaterThan(1);
  });

  it("preserva todos os elementos, sem perder nem duplicar", () => {
    for (let s = 1; s <= 50; s++) {
      expect([...shuffleWithSeed(itens, s)].sort()).toEqual([...itens].sort());
    }
  });

  it("não muta a entrada", () => {
    const original = [...itens];
    shuffleWithSeed(itens, 999);
    expect(itens).toEqual(original);
  });

  it("aguenta lista vazia e de um só item", () => {
    expect(shuffleWithSeed([], 7)).toEqual([]);
    expect(shuffleWithSeed(["só"], 7)).toEqual(["só"]);
  });

  it("semente zero não trava o gerador", () => {
    // `seed || 1` existe por isso: com s = 0 o LCG multiplicativo ficaria preso.
    expect([...shuffleWithSeed(itens, 0)].sort()).toEqual([...itens].sort());
  });

  it("distribui a primeira posição de forma razoável", () => {
    // Este é o teste que pega a regressão que motivou o módulo: com `% (i+1)`
    // sobre os bits baixos do LCG, o primeiro item caía em 42% dos casos na
    // primeira posição em vez de 25%.
    const n = 4000;
    const conta = new Map<string, number>();
    for (let s = 1; s <= n; s++) {
      const primeiro = shuffleWithSeed(itens, seedFrom(`q-${s}`))[0];
      conta.set(primeiro, (conta.get(primeiro) ?? 0) + 1);
    }
    expect(conta.size).toBe(4);
    for (const [item, vezes] of conta) {
      const pct = (vezes / n) * 100;
      expect(pct, `${item} apareceu ${pct.toFixed(1)}% das vezes em 1º`).toBeGreaterThan(20);
      expect(pct, `${item} apareceu ${pct.toFixed(1)}% das vezes em 1º`).toBeLessThan(30);
    }
  });
});

describe("shuffleFor", () => {
  const itens = ["a", "b", "c", "d"];

  it("é estável para o mesmo id e rodada", () => {
    expect(shuffleFor(itens, "redes-dns")).toEqual(shuffleFor(itens, "redes-dns"));
  });

  it("muda quando a rodada muda — refazer não repete a ordem", () => {
    const ordens = new Set(
      [0, 1, 2, 3].map((r) => shuffleFor(itens, "redes-dns", r).join("")),
    );
    expect(ordens.size).toBeGreaterThan(1);
  });

  it("ids diferentes não caem na mesma ordem em bloco", () => {
    const ordens = new Set(
      ["a1", "b2", "c3", "d4", "e5", "f6"].map((id) => shuffleFor(itens, id).join("")),
    );
    expect(ordens.size).toBeGreaterThan(1);
  });
});

describe("letras das alternativas", () => {
  it("cobrem o maior conjunto de opções do conteúdo", () => {
    expect(OPTION_LETTERS.length).toBeGreaterThanOrEqual(6);
  });

  it("estão em ordem alfabética, porque a tela mostra por posição", () => {
    expect([...OPTION_LETTERS].sort().join("")).toBe(OPTION_LETTERS);
  });
});
