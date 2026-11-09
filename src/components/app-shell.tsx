import { cookies } from "next/headers";
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
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen} style={{ "--sidebar-width": "16.5rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
        <AppSidebar account={account} />
        <SidebarInset id="contenu">
          <AppHeader account={account} />
          <div className="flex w-full max-w-[1440px] flex-1 flex-col px-4 pt-8 pb-14 sm:px-6 md:px-10 md:pt-12 lg:px-14">{children}</div>
          <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t px-4 py-4 text-xs text-muted-foreground sm:px-6 md:px-10 lg:px-14">
            <span>Ministère des Finances</span>
            <span>République démocratique du Congo</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
