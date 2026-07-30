import Link from "next/link";
import { cn } from "@/lib/cn";

/* ============================================================== botão ===
   Um só vocabulário de botão em toda a interface. Registro de produto: se o
   "salvar" tem duas aparências no produto, uma das duas está errada.
   Todos os estados definidos: hover, focus, active, disabled.
   ======================================================================= */

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium " +
  "transition-[background-color,border-color,color,box-shadow] duration-[var(--dur-fast)] " +
  "ease-out-quart disabled:pointer-events-none disabled:opacity-45 " +
  "active:translate-y-px";

const BUTTON_TONE: Record<ButtonTone, string> = {
  primary:
    "bg-accent text-surface shadow-[0_1px_0_var(--color-accent-shade)] hover:bg-accent-hi",
  secondary:
    "border border-line-2 bg-surface text-ink hover:border-accent-line hover:bg-accent-soft",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
  danger: "border border-bad-line bg-surface text-bad-ink hover:bg-bad-soft",
};

const BUTTON_SIZE = "px-4 py-2";

export function Button({
  tone = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_SIZE, BUTTON_TONE[tone], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  tone = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { tone?: ButtonTone }) {
  return (
    <Link
      className={cn(BUTTON_BASE, BUTTON_SIZE, BUTTON_TONE[tone], className)}
      {...props}
    />
  );
}

/* ================================================================ chip ===
   Vocabulário de status de sistema de chamado: pastilha pequena, mono,
   fundo tênue e texto que passa contraste. Serve para nota, estado e área.
   ======================================================================= */

type ChipTone = "neutral" | "ok" | "warn" | "bad" | "accent";

const CHIP_TONE: Record<ChipTone, string> = {
  neutral: "border-line bg-sunken text-ink-soft",
  ok: "border-ok-line bg-ok-soft text-ok-ink",
  warn: "border-warn-line bg-warn-soft text-warn-ink",
  bad: "border-bad-line bg-bad-soft text-bad-ink",
  accent: "border-accent-line bg-accent-soft text-accent",
};

export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5",
        "font-mono text-2xs tracking-wide whitespace-nowrap",
        CHIP_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ============================================================== painel ===
   Superfície de conteúdo. Existe UM tipo, com cabeçalho opcional — em vez de
   cada seção inventar sua própria caixa.
   ======================================================================= */

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface shadow-[var(--shadow-panel)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-line bg-sunken px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================== medidor ===
   Barra fina de progresso. Usada em fila de etapas e leitura.
   ======================================================================= */

export function Meter({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-[var(--dur)] ease-out-quart"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
