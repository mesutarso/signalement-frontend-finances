"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, InboxIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "cn";
import type { Account } from "@/modules/access/model/account";
import { ACCOUNT_ITEM, canReadReports, navigationFor, type NavItem } from "@/modules/access/model/navigation";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function subscribe() {
  return () => {};
}

function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, () => /mac/i.test(navigator.platform), () => false);
}

export function CommandMenu({ account }: { account: Account | null }) {
  const [open, setOpen] = useState(false);
  const isMac = useIsMac();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!account) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Rechercher ou aller à une rubrique"
        className="flex h-9 items-center gap-2 rounded-md text-[13px] text-muted-foreground transition-colors hover:text-foreground max-md:size-10 max-md:justify-center md:w-64 md:border md:border-input md:px-2.5 md:hover:border-foreground"
      >
        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left max-md:hidden">Rechercher ou aller à…</span>
        <kbd className="font-sans text-xs max-md:hidden">{isMac ? "⌘ K" : "Ctrl K"}</kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--fin-ink)]/40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-[10svh] left-1/2 z-50 flex max-h-[min(560px,80svh)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-[0_24px_64px_-16px_rgb(18_26_46/0.45)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:opacity-0">
          <Dialog.Title className="sr-only">Rechercher ou aller à une rubrique</Dialog.Title>
          <CommandBody account={account} onClose={() => setOpen(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommandBody({ account, onClose }: { account: Account; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const trimmed = query.trim();
  const needle = normalize(trimmed);
  const sections = [...navigationFor(account), { id: "compte", label: "Compte", items: [ACCOUNT_ITEM] }]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !needle || normalize(`${item.label} ${section.label ?? ""} ${item.keywords ?? ""}`).includes(needle)),
    }))
    .filter((section) => section.items.length > 0);

  const search: NavItem | null = trimmed && canReadReports(account)
    ? { href: `/signalements?scope=all&q=${encodeURIComponent(trimmed)}`, label: `Chercher « ${trimmed} » dans les signalements`, icon: InboxIcon }
    : null;
  const flat = [...(search ? [search] : []), ...sections.flatMap((section) => section.items)];

  useEffect(() => {
    document.getElementById(`commande-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: NavItem | undefined) {
    if (!item) {
      return;
    }
    onClose();
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (flat.length ? (value + 1) % flat.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (flat.length ? (value - 1 + flat.length) % flat.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(flat[active]);
    }
  }

  let index = search ? 0 : -1;

  function row(item: NavItem, position: number) {
    const selected = position === active;
    return (
      <div
        key={item.href}
        id={`commande-${position}`}
        role="option"
        aria-selected={selected}
        onMouseMove={() => setActive(position)}
        onClick={() => go(item)}
        className={cn("flex h-10 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm", selected && "bg-accent text-primary")}
      >
        <HugeiconsIcon icon={item.icon} strokeWidth={1.75} className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {selected ? <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0" /> : null}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b px-4">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls="commande-liste"
          aria-autocomplete="list"
          aria-label="Rechercher ou aller à une rubrique"
          aria-activedescendant={flat.length ? `commande-${active}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Une rubrique, ou la référence d’un signalement"
          className="h-14 min-w-0 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:shadow-none"
        />
      </div>
      <div id="commande-liste" role="listbox" aria-label="Résultats" className="min-h-0 flex-1 overflow-y-auto p-2">
        {search ? row(search, 0) : null}
        {sections.map((section) => (
          <div key={section.id} role="group" aria-label={section.label ?? "Accueil"} className="pt-1">
            {section.label ? <p aria-hidden="true" className="px-2.5 pt-2 pb-1 text-xs text-muted-foreground">{section.label}</p> : null}
            {section.items.map((item) => {
              index += 1;
              return row(item, index);
            })}
          </div>
        ))}
        {flat.length === 0 ? <p className="px-2.5 py-8 text-center text-sm text-muted-foreground">Aucune rubrique ne correspond à cette recherche.</p> : null}
      </div>
      <p className="flex gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground max-md:hidden">
        <span>↑ ↓ pour se déplacer</span>
        <span>Entrée pour ouvrir</span>
        <span>Échap pour fermer</span>
      </p>
    </>
  );
}
