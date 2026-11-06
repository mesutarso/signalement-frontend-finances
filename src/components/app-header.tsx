"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Account } from "@/modules/access/model/account";
import { roleLabel } from "@/modules/access/model/account";

const PAGE_LABELS: Record<string, string> = {
  "/": "Tableau de bord",
  "/signalements": "Signalements",
  "/imports": "Imports",
  "/compte": "Mon compte",
  "/comptes": "Comptes",
  "/connexion": "Connexion",
};

export function AppHeader({ account }: { account: Account | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3 md:gap-5">
        <SidebarTrigger />
        <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-4 text-sm">
          <span aria-current="page" className="truncate font-bold">{PAGE_LABELS[pathname] ?? "Signalements"}</span>
        </nav>
      </div>
      {account ? (
        <Link href="/compte" className="flex shrink-0 items-center gap-3 rounded-md p-1.5 hover:bg-muted">
          <span className="hidden text-right sm:grid">
            <span className="text-sm font-bold">{account.username}</span>
            <span className="text-xs text-muted-foreground">{roleLabel(account.role)}</span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{account.username.slice(0, 2).toUpperCase()}</span>
          <span className="sr-only">Mon compte</span>
        </Link>
      ) : (
        <Link href="/connexion" className="rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-accent">Se connecter</Link>
      )}
    </header>
  );
}
