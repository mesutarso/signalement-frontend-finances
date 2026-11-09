"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Account } from "@/modules/access/model/account";
import { roleLabel } from "@/modules/access/model/account";
import { isNavActive, navigationFor } from "@/modules/access/model/navigation";
import { signOut } from "@/modules/access/actions/sign-out";

export function AppSidebar({ account }: { account: Account | null }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const sections = navigationFor(account);
  const activeSection = sections.find((section) => section.items.some((item) => isNavActive(pathname, item.href)))?.id;
  const primarySection = sections.find((section) => section.label)?.id;
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [lastPath, setLastPath] = useState(pathname);

  // Une navigation ramène toujours sur une rubrique ouverte, même si elle avait été repliée.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (activeSection && overrides[activeSection] === false) {
      setOverrides({ ...overrides, [activeSection]: true });
    }
  }

  function isOpen(id: string): boolean {
    return overrides[id] ?? (id === activeSection || id === "accueil" || id === primarySection);
  }

  const initials = account ? account.username.slice(0, 2).toUpperCase() : "";
  const accountActive = pathname === "/compte";

  return (
    <Sidebar collapsible="icon" className="institution-sidebar">
      <SidebarHeader className="gap-2.5 px-4 pt-5 pb-5 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pb-3">
        <Link
          href="/"
          onClick={() => setOpenMobile(false)}
          aria-label="Plateforme de signalements, Ministère des Finances : tableau de bord"
          className="block w-fit rounded-sm focus-visible:outline-white"
        >
          <span className="relative block h-11 w-[114px] overflow-hidden group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10" aria-hidden="true">
            <Image
              src="/logo-finances-light.webp"
              alt=""
              width={384}
              height={148}
              priority
              className="absolute top-0 left-0 h-11 w-auto max-w-none group-data-[collapsible=icon]:h-10"
            />
          </span>
        </Link>
        <p className="text-[13px] leading-tight text-white/75 group-data-[collapsible=icon]:hidden">Plateforme de signalements</p>
      </SidebarHeader>

      <SidebarContent className="gap-0 pb-3 group-data-[collapsible=icon]:overflow-y-auto">
        {sections.map((section) => {
          const open = isOpen(section.id);
          return (
            <SidebarGroup key={section.id} data-open={open} className="nav-section p-0 pl-3">
              {section.label ? (
                <SidebarGroupLabel
                  render={<button type="button" aria-expanded={open} onClick={() => setOverrides({ ...overrides, [section.id]: !open })} />}
                >
                  <span>{section.label}</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5!" />
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          aria-label={item.label}
                          aria-current={active ? "page" : undefined}
                          isActive={active}
                          tooltip={item.label}
                          onClick={() => setOpenMobile(false)}
                          className="group-data-[collapsible=icon]:data-active:w-[52px]! group-data-[collapsible=icon]:data-active:justify-start group-data-[collapsible=icon]:data-active:pl-3!"
                          render={<Link href={item.href} />}
                        >
                          <HugeiconsIcon icon={item.icon} strokeWidth={1.75} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {account ? (
        <SidebarFooter className="gap-1 border-t border-sidebar-border p-3 group-data-[collapsible=icon]:px-3">
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
            <Link
              href="/compte"
              onClick={() => setOpenMobile(false)}
              aria-current={accountActive ? "page" : undefined}
              aria-label={`Mon compte : ${account.username}, ${roleLabel(account.role)}`}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-sidebar-accent focus-visible:outline-white aria-[current=page]:bg-sidebar-accent group-data-[collapsible=icon]:flex-none"
            >
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-primary">
                {initials}
              </span>
              <span className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[13px] font-medium">{account.username}</span>
                <span className="truncate text-xs text-white/70">{roleLabel(account.role)}</span>
              </span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:outline-white"
              >
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} className="size-4" />
              </button>
            </form>
          </div>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
