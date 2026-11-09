"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { DialogSurface } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { AccountForm } from "@/modules/access/ui/account-form";

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>Nouveau compte</Dialog.Trigger>
      <DialogSurface title="Nouveau compte">
        <AccountForm onSuccess={() => setOpen(false)} />
      </DialogSurface>
    </Dialog.Root>
  );
}
