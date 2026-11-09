"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/* Fenêtre commune : centrée sur grand écran, ancrée en bas sur téléphone, à portée de pouce. */
export function DialogSurface({
  title,
  description,
  closeDisabled,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  closeDisabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--fin-ink)]/45 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Dialog.Popup className="fixed z-50 flex flex-col overflow-y-auto bg-card text-card-foreground shadow-[0_24px_64px_-16px_rgb(18_26_46/0.45)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[90svh] max-sm:rounded-t-xl max-sm:data-[ending-style]:translate-y-4 max-sm:data-[starting-style]:translate-y-4 sm:top-1/2 sm:left-1/2 sm:max-h-[calc(100svh-3rem)] sm:w-[calc(100%-3rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:data-[ending-style]:scale-[0.98] sm:data-[starting-style]:scale-[0.98]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card py-4 pr-3 pl-5 sm:pl-6">
          <div className="grid gap-0.5 pt-1">
            <Dialog.Title className="text-lg leading-snug font-medium">{title}</Dialog.Title>
            {description ? <Dialog.Description className="text-[13px] leading-5 text-muted-foreground">{description}</Dialog.Description> : null}
          </div>
          <Dialog.Close disabled={closeDisabled} aria-label="Fermer" render={<Button variant="ghost" size="icon-sm" />}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Dialog.Close>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export function ActionDialog({
  label,
  title,
  description,
  variant = "outline",
  size,
  ariaLabel,
  children,
}: {
  label: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger aria-label={ariaLabel} render={<Button variant={variant} size={size} />}>{label}</Dialog.Trigger>
      <DialogSurface title={title} description={description}>{children}</DialogSurface>
    </Dialog.Root>
  );
}
