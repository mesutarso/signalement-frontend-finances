"use client";

import { useActionState, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { DialogSurface } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { updateAccount } from "@/modules/access/actions/update-account";
import { roleLabel, type Account, type AccountRole } from "@/modules/access/model/account";

const roles: AccountRole[] = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"];

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
      <DialogSurface title="Modifier le compte" description={account.username} closeDisabled={pending}>
        <EditForm account={account} onSuccess={() => setOpen(false)} onPending={setPending} />
      </DialogSurface>
    </Dialog.Root>
  );
}
