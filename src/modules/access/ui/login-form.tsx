"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/modules/access/actions/sign-in";

export function LoginForm() {
  const [error, submit, pending] = useActionState(signIn, null);

  return (
    <form action={submit}>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="username">Identifiant</FieldLabel>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            maxLength={80}
            aria-invalid={error ? true : undefined}
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            aria-invalid={error ? true : undefined}
          />
        </Field>
        {error ? <FieldError>{error}</FieldError> : null}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Se connecter
        </Button>
      </FieldGroup>
    </form>
  );
}
