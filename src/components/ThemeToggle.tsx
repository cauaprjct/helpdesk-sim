"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getThemeChoice,
  setThemeChoice,
  type ThemeChoice,
} from "@/lib/theme";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Tema claro", Icon: Sun },
  { value: "system", label: "Seguir o sistema", Icon: Monitor },
  { value: "dark", label: "Tema escuro", Icon: Moon },
];

/**
 * `tone="console"` existe porque na capa o controle fica sobre o campo de
 * console. Passar classe no wrapper não alcançava os botões internos, e os
 * ícones ficavam em 2:1 — invisíveis. O tom precisa ser do componente.
 */
type Tone = "surface" | "console";

const SHELL: Record<Tone, string> = {
  surface: "border-line bg-sunken",
  console: "border-console-line bg-console-2",
};

const ITEM: Record<Tone, { on: string; off: string }> = {
  surface: {
    on: "bg-surface text-accent shadow-[var(--shadow-panel)]",
    off: "text-ink-soft hover:text-ink",
  },
  console: {
    on: "bg-console-line text-console-ink",
    off: "text-console-dim hover:text-console-ink",
  },
};

export default function ThemeToggle({
  className,
  tone = "surface",
}: {
  className?: string;
  tone?: Tone;
}) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChoice(getThemeChoice());
    setMounted(true);
  }, []);

  /* Com "sistema" escolhido, acompanhar a troca no SO em tempo real. */
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  function pick(value: ThemeChoice) {
    setChoice(value);
    setThemeChoice(value);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border p-0.5",
        SHELL[tone],
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        // Antes de montar não se sabe a escolha salva: nada marcado evita
        // pintar o botão errado e depois corrigir.
        const active = mounted && choice === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => pick(value)}
            className={cn(
              "grid size-7 place-items-center rounded transition-colors duration-[var(--dur-fast)]",
              active ? ITEM[tone].on : ITEM[tone].off,
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
