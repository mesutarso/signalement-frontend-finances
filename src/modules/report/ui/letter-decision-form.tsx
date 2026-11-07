"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { decideLetter } from "@/modules/report/actions/decide-letter";

export function LetterDecisionForm({ letterId }: { letterId: string }) {
  const [message, action, pending] = useActionState(decideLetter, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="letterId" value={letterId} />
      <Field>
        <FieldLabel htmlFor={`letter-recipient-${letterId}`}>Destinataire</FieldLabel>
        <input id={`letter-recipient-${letterId}`} name="recipient" maxLength={160} className="h-11 w-full rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`letter-reason-${letterId}`}>Motif de renvoi</FieldLabel>
        <textarea id={`letter-reason-${letterId}`} name="reason" maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="result" value="validated" disabled={pending}>Valider le courrier</Button>
        <Button type="submit" name="result" value="returned" variant="outline" disabled={pending}>Renvoyer le courrier</Button>
      </div>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
