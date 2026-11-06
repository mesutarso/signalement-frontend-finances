"use client";

import { useActionState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { replacePassword, type PasswordState } from "@/modules/access/actions/replace-password";

const INITIAL: PasswordState = { error: null, saved: false };

export function PasswordForm({ accountId }: { accountId: string }) {
  const [state, submit, pending] = useActionState(replacePassword, INITIAL);

  return (
    <form action={submit} className="max-w-md">
      <input type="hidden" name="accountId" value={accountId} />
      <FieldGroup>
        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="current-password">Mot de passe actuel</FieldLabel>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            aria-invalid={state.error ? true : undefined}
          />
        </Field>
        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="next-password">Nouveau mot de passe</FieldLabel>
          <Input
            id="next-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
            aria-invalid={state.error ? true : undefined}
          />
          <FieldDescription>Au moins 12 caractères, avec une lettre et un chiffre.</FieldDescription>
        </Field>
        {state.error ? <FieldError>{state.error}</FieldError> : null}
        {state.saved ? (
          <Alert>
            <AlertTitle>Mot de passe enregistré.</AlertTitle>
          </Alert>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Enregistrer
        </Button>
      </FieldGroup>
    </form>
  );
}
