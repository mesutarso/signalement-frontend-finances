"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";

export function ReportActionDialog({ label, title, primary = false, children }: { label: string; title: string; primary?: boolean; children: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant={primary ? "gold" : "neutral"} />}>{label}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-xl font-bold text-primary">{title}</Dialog.Title>
            <Dialog.Close render={<Button variant="ghost" size="sm" />}>Fermer</Dialog.Close>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
