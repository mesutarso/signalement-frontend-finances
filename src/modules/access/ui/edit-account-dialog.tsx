"use client";

import { useActionState, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { DialogSurface } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { AccountSecurityForm } from "@/modules/access/ui/account-security-form";
import { Spinner } from "@/components/ui/spinner";
import { updateAccount } from "@/modules/access/actions/update-account";
import { ACCOUNT_ROLES, roleLabel, type Account } from "@/modules/access/model/account";



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
        <Field><FieldLabel htmlFor={`username-${account.id}`}>Identifiant</FieldLabel><Input id={`username-${account.id}`} name="username" defaultValue={account.username} minLength={3} maxLength={80} pattern="[a-z0-9][a-z0-9._-]*" required disabled={pending} /></Field>
        <Field>
          <FieldLabel htmlFor={`role-${account.id}`}>Rôle</FieldLabel>
          <NativeSelect id={`role-${account.id}`} name="role" defaultValue={account.role} disabled={pending} className="w-full">
            {ACCOUNT_ROLES.map((role) => <NativeSelectOption key={role} value={role}>{roleLabel(role)}</NativeSelectOption>)}
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

export function EditAccountDialog({ account, currentId }: { account: Account; currentId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}>
      <Dialog.Trigger render={<Button variant="ghost" size="sm" />} aria-label={`Modifier le compte ${account.username}`}>Modifier</Dialog.Trigger>
      <DialogSurface title="Modifier le compte" description={account.username} closeDisabled={pending}>
        <div className="grid gap-6">
          <EditForm account={account} onSuccess={() => setOpen(false)} onPending={setPending} />
          <details><summary className="cursor-pointer text-sm">Permissions héritées du rôle ({account.permissions.length})</summary><ul className="mt-3 grid gap-1 text-sm">{account.permissions.map(permission => <li key={permission}>{permission}</li>)}</ul></details>
          <AccountSecurityForm id={account.id} operation="reset" />
          <AccountSecurityForm id={account.id} operation="unlock" />
          {account.id !== currentId ? <details><summary className="cursor-pointer text-sm text-destructive">Supprimer ce compte</summary><div className="mt-3"><AccountSecurityForm id={account.id} operation="delete" /></div></details> : null}
        </div>
      </DialogSurface>
    </Dialog.Root>
  );
}
