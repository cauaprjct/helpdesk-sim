"use client";

export type ThemeChoice = "light" | "system" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "helpdesk-sim:theme";

/**
 * O mesmo cálculo existe inline no <head> (ver layout.tsx) para pintar o tema
 * antes do primeiro frame. Se mudar a regra aqui, mudar lá também.
 */
export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return choice;
}

export function getThemeChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* localStorage bloqueado: cai no padrão */
  }
  return "system";
}

export function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolveTheme(choice);
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    window.localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* segue sem persistir */
  }
  applyTheme(choice);
  window.dispatchEvent(new Event("helpdesk-sim:theme"));
}
