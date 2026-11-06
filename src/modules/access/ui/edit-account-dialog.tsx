"use client";

import { useActionState, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { updateAccount } from "@/modules/access/actions/update-account";
import { roleLabel, type Account, type AccountRole } from "@/modules/access/model/account";

const roles: AccountRole[] = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

function EditForm({ account, onSuccess, onPending }: { account: Account; onSuccess: () => void; onPending: (pending: boolean) => void }) {
  const [error, submit, pending] = useActionState(async (current: string | null, data: FormData) => {
    onPending(true);
    try {
      const result = await updateAccount(current, data);
      if (result === null) onSuccess();
      return result;
    } finally {
      onPending(false);
    }
  }, null);
  return (
    <form action={submit}>
      <input type="hidden" name="id" value={account.id} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`role-${account.id}`}>Rôle</FieldLabel>
          <NativeSelect id={`role-${account.id}`} name="role" defaultValue={account.role} disabled={pending} className="w-full">
            {roles.map((role) => <NativeSelectOption key={role} value={role}>{roleLabel(role)}</NativeSelectOption>)}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`enabled-${account.id}`}>Accès à la plateforme</FieldLabel>
          <NativeSelect id={`enabled-${account.id}`} name="enabled" defaultValue={String(account.enabled)} disabled={pending} className="w-full">
            <NativeSelectOption value="true">Actif</NativeSelectOption>
            <NativeSelectOption value="false">Désactivé</NativeSelectOption>
          </NativeSelect>
        </Field>
        {error ? <FieldError role="alert">{error}</FieldError> : null}
        <Button type="submit" disabled={pending}>{pending ? <Spinner data-icon="inline-start" /> : null}Enregistrer les modifications</Button>
      </FieldGroup>
    </form>
  );
}

export function EditAccountDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}>
      <Dialog.Trigger render={<Button variant="ghost" size="sm" />} aria-label={`Modifier le compte ${account.username}`}>Modifier</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <Dialog.Title className="text-xl font-bold text-primary">Modifier le compte</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">{account.username}</Dialog.Description>
            </div>
            <Dialog.Close disabled={pending} render={<Button variant="ghost" size="sm" />}>Fermer</Dialog.Close>
          </div>
          <EditForm account={account} onSuccess={() => setOpen(false)} onPending={setPending} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
