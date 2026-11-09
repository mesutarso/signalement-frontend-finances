"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { CommandMenu } from "@/components/command-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Account } from "@/modules/access/model/account";
import { breadcrumbFor } from "@/modules/access/model/navigation";

function Separator() {
  return <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} aria-hidden="true" className="size-3 shrink-0 text-muted-foreground/60" />;
}

export function AppHeader({ account }: { account: Account | null }) {
  const pathname = usePathname();
  const crumb = breadcrumbFor(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-2 text-[13px]">
          {crumb.section ? (
            <>
              <span className="hidden text-muted-foreground sm:inline">{crumb.section}</span>
              <span className="hidden sm:contents"><Separator /></span>
            </>
          ) : null}
          {crumb.detail ? (
            <>
              <Link href={crumb.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">{crumb.page}</Link>
              <Separator />
              <span aria-current="page" className="truncate font-medium">{crumb.detail}</span>
            </>
          ) : (
            <span aria-current="page" className="truncate font-medium">{crumb.page}</span>
          )}
        </nav>
      </div>
      {account ? (
        <CommandMenu account={account} />
      ) : (
        <Link href="/connexion" className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent">Se connecter</Link>
      )}
    </header>
  );
}
