"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquare01Icon, File01Icon, Login01Icon, Logout01Icon, UserIcon, UsersIcon } from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { Account, AccountRole } from "@/modules/access/model/account";
import { roleLabel } from "@/modules/access/model/account";
import { signOut } from "@/modules/access/actions/sign-out";

const ITEMS: {
  href: string;
  label: string;
  icon: typeof File01Icon;
  signedIn?: boolean;
  roles?: AccountRole[];
}[] = [
  { href: "/", label: "Tableau de bord", icon: DashboardSquare01Icon, signedIn: true },
  { href: "/signalements", label: "Signalements", icon: File01Icon, signedIn: true },
  { href: "/compte", label: "Mon compte", icon: UserIcon, signedIn: true },
  { href: "/comptes", label: "Comptes", icon: UsersIcon, roles: ["ADMINISTRATOR"] },
];

export function AppSidebar({ account }: { account: Account | null }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => {
    if (!account && (item.signedIn || item.roles)) {
      return false;
    }
    return !item.roles || (account != null && item.roles.includes(account.role));
  });
  const initials = account ? account.username.slice(0, 2).toUpperCase() : "";

  return (
    <Sidebar collapsible="icon" className="institution-sidebar">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-3">
        <Link href="/" aria-label="Plateforme de signalements — accueil" className="flex min-w-0 items-center gap-3">
          <span className="relative block size-11 shrink-0 overflow-hidden group-data-[collapsible=icon]:size-10" aria-hidden="true">
            <Image src="/logo-finances-light.webp" alt="" width={380} height={148} priority className="absolute top-0 left-0 h-11 w-auto max-w-none group-data-[collapsible=icon]:h-10" />
          </span>
          <span className="grid min-w-0 gap-1 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-snug">Plateforme de signalements</span>
            <span className="text-xs text-sidebar-foreground/70">Ministère des Finances</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-3">
        <SidebarGroup className="px-3">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => item.href === "/signalements" ? (
                <SidebarMenuItem key="signalements">
                  <details open={pathname.startsWith("/signalements") || pathname.startsWith("/imports")} className="group/reports group-data-[collapsible=icon]:hidden">
                    <summary className="flex h-12 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-sm font-bold hover:bg-sidebar-accent [&::-webkit-details-marker]:hidden">
                      <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={2} />
                      <span className="flex-1">Signalements</span>
                      <span aria-hidden="true" className="transition-transform group-open/reports:rotate-180">⌄</span>
                    </summary>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem><SidebarMenuSubButton className="h-10" isActive={pathname.startsWith("/signalements")} aria-current={pathname.startsWith("/signalements") ? "page" : undefined} render={<Link href="/signalements" />}>Liste des signalements</SidebarMenuSubButton></SidebarMenuSubItem>
                      {account && account.role !== "AUDITOR" ? <SidebarMenuSubItem><SidebarMenuSubButton className="h-10" isActive={pathname.startsWith("/imports")} aria-current={pathname.startsWith("/imports") ? "page" : undefined} render={<Link href="/imports" />}>Imports et suivi</SidebarMenuSubButton></SidebarMenuSubItem> : null}
                    </SidebarMenuSub>
                  </details>
                  <div className="hidden flex-col gap-1 group-data-[collapsible=icon]:flex">
                    <SidebarMenuButton aria-label="Liste des signalements" tooltip="Liste des signalements" isActive={pathname.startsWith("/signalements")} render={<Link href="/signalements" />}><HugeiconsIcon icon={File01Icon} strokeWidth={2} /></SidebarMenuButton>
                    {account && account.role !== "AUDITOR" ? <SidebarMenuButton aria-label="Imports et suivi" tooltip="Imports et suivi" isActive={pathname.startsWith("/imports")} render={<Link href="/imports" />}><HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} /></SidebarMenuButton> : null}
                  </div>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    size="lg"
                    aria-label={item.label}
                    aria-current={pathname === item.href ? "page" : undefined}
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="gap-3 p-3">
        {account ? (
          <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {initials}
            </span>
            <div className="grid min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold">{account.username}</span>
              <span className="truncate text-xs text-sidebar-foreground/75">{roleLabel(account.role)}</span>
            </div>
          </div>
        ) : null}
        <SidebarMenu>
          <SidebarMenuItem>
            {account ? (
              <form action={signOut}>
                <SidebarMenuButton type="submit" aria-label="Se déconnecter" tooltip="Se déconnecter">
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                  <span>Se déconnecter</span>
                </SidebarMenuButton>
              </form>
            ) : (
              <SidebarMenuButton
                aria-label="Connexion"
                tooltip="Connexion"
                isActive={pathname === "/connexion"}
                render={<Link href="/connexion" />}
              >
                <HugeiconsIcon icon={Login01Icon} strokeWidth={2} />
                <span>Connexion</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
