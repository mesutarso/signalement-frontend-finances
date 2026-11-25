"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export function ReportSheet({ closeHref, openerId, children }: { closeHref: string; openerId: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Sheet defaultOpen onOpenChange={(open) => { if (!open) router.replace(closeHref, { scroll: false }); }}>
      <SheetContent showCloseButton={false} finalFocus={() => document.getElementById(openerId) ?? undefined}
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-6xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
          <SheetTitle>Détail du signalement</SheetTitle>
          <SheetDescription className="sr-only">Consultation depuis la liste des signalements du déclarant.</SheetDescription>
          <SheetClose render={<Button variant="outline" size="sm" />}>Fermer</SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
