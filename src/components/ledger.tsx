import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

/* Registre : des lignes séparées par des filets, l'identité à gauche et le détail à droite. */
export function Ledger({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="ledger" className={cn("border-t border-foreground", className)} {...props} />;
}

export function LedgerItem({
  title,
  status,
  meta,
  action,
  children,
  className,
}: {
  title: ReactNode;
  status?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("grid gap-x-10 gap-y-3 border-b py-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto]", className)}>
      <div className="grid min-w-0 content-start justify-items-start gap-1.5">
        <p className="text-[15px] leading-snug font-bold break-words">{title}</p>
        {status}
        {meta ? <p className="text-[13px] leading-5 text-muted-foreground">{meta}</p> : null}
      </div>
      <div className="grid min-w-0 content-start gap-1.5 text-sm leading-6">{children}</div>
      {action ? <div className="flex items-start md:justify-end">{action}</div> : null}
    </li>
  );
}

export function LedgerEmpty({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("border-y border-t-foreground py-10 text-sm text-muted-foreground", className)}>{children}</p>;
}

export function LedgerLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="w-fit text-primary underline-offset-4 hover:underline">{children}</Link>;
}

export function ReportLink({ id, reference }: { id: string; reference: string }) {
  return <LedgerLink href={`/signalements/${id}`}>Ouvrir le signalement <span className="ref">{reference}</span></LedgerLink>;
}
