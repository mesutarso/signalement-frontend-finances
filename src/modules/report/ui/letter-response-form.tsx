"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { recordLetterResponse } from "@/modules/report/actions/record-letter-response";

export function LetterResponseForm({ letterId }: { letterId: string }) {
  const [message, action, pending] = useActionState(recordLetterResponse, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="letterId" value={letterId} />
      <Field>
        <FieldLabel htmlFor={`response-date-${letterId}`}>Date de la réponse</FieldLabel>
        <input id={`response-date-${letterId}`} name="receivedOn" type="date" required className="h-11 w-full rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`response-service-${letterId}`}>Service</FieldLabel>
        <input id={`response-service-${letterId}`} name="service" required maxLength={160} className="h-11 w-full rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`response-reference-${letterId}`}>Référence</FieldLabel>
        <input id={`response-reference-${letterId}`} name="reference" required maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`response-conclusion-${letterId}`}>Conclusion</FieldLabel>
        <textarea id={`response-conclusion-${letterId}`} name="conclusion" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`response-document-${letterId}`}>Pièce</FieldLabel>
        <input id={`response-document-${letterId}`} name="document" type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" className="block w-full text-sm" />
      </Field>
      <Button type="submit" disabled={pending}>Enregistrer la réponse</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
