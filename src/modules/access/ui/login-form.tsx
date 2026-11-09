"use client";

import { useActionState, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/modules/access/actions/sign-in";

export function LoginForm() {
  const [error, submit, pending] = useActionState(signIn, null);
  const [username, setUsername] = useState("");
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  return (
    <form action={submit}>
      <FieldGroup className="gap-5">
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="username">Identifiant</FieldLabel>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            maxLength={80}
            aria-invalid={error ? true : undefined}
            className="h-12"
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={72}
              aria-invalid={error ? true : undefined}
              onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              onBlur={() => setCapsLock(false)}
              className="h-12 pr-12"
            />
            <button
              type="button"
              aria-pressed={visible}
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setVisible((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={visible ? ViewOffIcon : ViewIcon} strokeWidth={1.75} className="size-[18px]" />
            </button>
          </div>
          {capsLock ? <p role="status" className="text-[13px] text-warning">La touche majuscule est verrouillée.</p> : null}
        </Field>
        {error ? (
          <div role="alert" className="flex items-start gap-2.5 rounded-md bg-danger-soft px-3 py-2.5 text-sm text-destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Connexion en cours…" : "Se connecter"}
        </Button>
      </FieldGroup>
    </form>
  );
}
