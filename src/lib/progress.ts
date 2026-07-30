"use client";

/**
 * Progresso local, sem backend e sem login.
 * Fica em localStorage: nada sai da máquina, nada para proteger no servidor.
 */

const KEY = "helpdesk-sim:v1";

export type ExerciseKind = "quiz" | "lab" | "chamado";

export interface Attempt {
  /** ex.: "quiz:redes-n1" */
  ref: string;
  kind: ExerciseKind;
  score: number;
  total: number;
  /** ISO date */
  at: string;
}

export interface ProgressState {
  attempts: Attempt[];
  /** ids de questões erradas, para o modo revisão */
  wrongQuestions: string[];
  /** aulas marcadas como lidas */
  readLessons: string[];
}

const EMPTY: ProgressState = { attempts: [], wrongQuestions: [], readLessons: [] };

function read(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      wrongQuestions: Array.isArray(parsed.wrongQuestions)
        ? parsed.wrongQuestions
        : [],
      readLessons: Array.isArray(parsed.readLessons) ? parsed.readLessons : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("helpdesk-sim:progress"));
  } catch {
    /* localStorage cheio ou bloqueado: seguir sem persistir */
  }
}

export function getProgress(): ProgressState {
  return read();
}

export function saveAttempt(
  attempt: Omit<Attempt, "at">,
  wrongIds: string[] = [],
) {
  const state = read();
  state.attempts = [
    { ...attempt, at: new Date().toISOString() },
    ...state.attempts,
  ].slice(0, 200);

  // acertou = sai da fila de revisão; errou = entra
  const wrong = new Set(state.wrongQuestions);
  for (const id of wrongIds) wrong.add(id);
  state.wrongQuestions = [...wrong];

  write(state);
}

export function clearWrong(ids: string[]) {
  const state = read();
  const wrong = new Set(state.wrongQuestions);
  for (const id of ids) wrong.delete(id);
  state.wrongQuestions = [...wrong];
  write(state);
}

export function markLessonRead(id: string) {
  const state = read();
  if (!state.readLessons.includes(id)) {
    state.readLessons = [...state.readLessons, id];
    write(state);
  }
}

export function isLessonRead(id: string): boolean {
  return read().readLessons.includes(id);
}

export function bestScore(ref: string): Attempt | null {
  const attempts = read().attempts.filter((a) => a.ref === ref);
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) =>
    a.score / a.total > best.score / best.total ? a : best,
  );
}

export function resetAll() {
  write(EMPTY);
}
