import { AppSidebar } from "@/modules/access/ui/app-sidebar";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export async function AppShell({ children }: { children: React.ReactNode }) {
  let account = null;
  try {
    account = await readCurrentAccount();
  } catch {
    account = null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider style={{ "--sidebar-width": "17.5rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
        <AppSidebar account={account} />
        <SidebarInset id="contenu">
          <AppHeader account={account} />
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 py-8 md:px-10 md:py-10">{children}</div>
          <footer className="flex flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground md:px-10">
            <span>Ministère des Finances</span>
            <span>République démocratique du Congo</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
