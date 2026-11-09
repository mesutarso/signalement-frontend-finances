"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { createAccount } from "@/modules/access/actions/create-account";

export function AccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, submit, pending] = useActionState(async (current: string | null, formData: FormData) => {
    const result = await createAccount(current, formData);
    if (result === null) onSuccess?.();
    return result;
  }, null);

  return (
    <form action={submit}>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="new-username">Identifiant</FieldLabel>
          <Input
            id="new-username"
            name="username"
            autoComplete="off"
            required
            minLength={3}
            maxLength={80}
            aria-invalid={error ? true : undefined}
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="new-password">Mot de passe</FieldLabel>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
            aria-invalid={error ? true : undefined}
          />
          <FieldDescription>Au moins 12 caractères, avec une lettre et un chiffre.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="role">Rôle</FieldLabel>
          <NativeSelect id="role" name="role" defaultValue="AGENT" className="w-full">
            <NativeSelectOption value="AGENT">Agent</NativeSelectOption>
            <NativeSelectOption value="SUPERVISOR">Superviseur</NativeSelectOption>
            <NativeSelectOption value="AUDITOR">Auditeur</NativeSelectOption>
            <NativeSelectOption value="ADMINISTRATOR">Administrateur</NativeSelectOption>
            <NativeSelectOption value="CELLULE">Cellule fiscale</NativeSelectOption>
            <NativeSelectOption value="CABINET">Cabinet</NativeSelectOption>
            <NativeSelectOption value="PAYMASTER">Gestionnaire de paiement</NativeSelectOption>
          </NativeSelect>
        </Field>
        {error ? <FieldError>{error}</FieldError> : null}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Créer le compte
        </Button>
      </FieldGroup>
    </form>
  );
}
