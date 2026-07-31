/**
 * Embaralhamento determinístico de alternativas.
 *
 * POR QUE EXISTE: ao escrever os exercícios, a alternativa correta saiu em
 * primeiro lugar em todos eles — 64 questões, 12 diagnósticos de laboratório e
 * 8 escolhas de chamado, 100% na primeira posição. É um vício de autoria: a
 * gente escreve a resposta certa e depois inventa os distratores. O efeito é
 * que dava para gabaritar o produto inteiro clicando sempre na primeira opção,
 * sem ler nada.
 *
 * POR QUE DETERMINÍSTICO, e não `Math.random`: as páginas são pré-renderizadas
 * estaticamente. Sorteio em tempo de render produziria uma ordem no servidor e
 * outra no cliente, e a hidratação do React acusaria divergência. Com a semente
 * derivada do id do exercício, os dois lados chegam à mesma ordem.
 *
 * A semente aceita um deslocamento para que refazer o exercício mude a ordem —
 * isso só acontece depois da hidratação, então é seguro.
 */

/** FNV-1a de 32 bits: id em número, estável entre execuções e máquinas. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Fisher-Yates com gerador congruente linear próprio. Não usa `Math.random`
 * justamente para a mesma semente devolver sempre a mesma ordem.
 */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = (seed || 1) >>> 0;
  const proximo = () => {
    // Constantes do "Numerical Recipes".
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    // Os bits BAIXOS de um gerador congruente linear são fracos e periódicos:
    // com `s % (i + 1)` a primeira posição ficava com 42% das respostas certas,
    // em vez dos 25% esperados. Escalar pelo intervalo inteiro usa os bits
    // altos, que é onde está a aleatoriedade útil.
    return s / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Ordem estável das alternativas de um exercício, opcionalmente por rodada. */
export function shuffleFor<T>(items: readonly T[], id: string, round = 0): T[] {
  return shuffleWithSeed(items, seedFrom(id) + round * 7919);
}

/** Letras mostradas ao lado das alternativas, sempre em ordem na tela. */
export const OPTION_LETTERS = "abcdefgh";
