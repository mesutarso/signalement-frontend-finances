import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

const COLUMNS = {
  2: "grid-cols-2 [&>li:nth-child(odd)]:pl-0",
  3: "sm:grid-cols-3 max-sm:[&>li]:pl-0 sm:[&>li:first-child]:pl-0",
  4: "grid-cols-2 lg:grid-cols-4 max-lg:[&>li:nth-child(odd)]:pl-0 lg:[&>li:first-child]:pl-0",
} as const;

/* Rangée de chiffres clés : un filet d'encre, de grands nombres, aucune boîte. */
export function Figures({ columns = 4, className, children }: { columns?: keyof typeof COLUMNS; className?: string; children: ReactNode }) {
  return <ul className={cn("grid gap-px border-y border-b-border border-t-foreground bg-border", COLUMNS[columns], className)}>{children}</ul>;
}

export function Figure({
  label,
  value,
  note,
  href,
  signal,
  compact,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  href?: string;
  signal?: boolean;
  compact?: boolean;
}) {
  // Les très grands montants passent à une taille inférieure pour rester dans leur colonne.
  const long = typeof value === "string" && value.length > 7;
  const body = (
    <>
      <span className="flex items-center gap-2 text-[13px] leading-5 text-muted-foreground">
        {signal ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-destructive" /> : null}
        {label}
        {href ? <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="ml-auto size-3.5 opacity-0 transition-opacity group-hover/figure:opacity-100 group-focus-visible/figure:opacity-100" /> : null}
      </span>
      <span className={cn("leading-none font-medium tracking-[-0.02em] tabular-nums transition-colors", compact ? "text-[1.3125rem] leading-tight" : long ? "text-[1.75rem] md:text-[2.25rem] md:leading-[3.25rem]" : "text-[2.5rem] md:text-[3.25rem]", href && "group-hover/figure:text-primary")}>{value}</span>
      {note ? <span className="text-[13px] leading-5 text-muted-foreground">{note}</span> : null}
    </>
  );
  return (
    <li className="bg-background px-5 pt-3.5 pb-6">
      {href ? <Link href={href} className="group/figure flex h-full flex-col gap-3">{body}</Link> : <div className="flex h-full flex-col gap-3">{body}</div>}
    </li>
  );
}

/* Colonne de chiffres : libellé à gauche, valeur à droite, comme une ligne de relevé. */
export function FigureRows({ rows, className }: { rows: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cn("grid", className)}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b py-2">
          <dt className="text-[13px] text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
