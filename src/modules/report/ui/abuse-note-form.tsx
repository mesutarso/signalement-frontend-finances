"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { recordAbuseNote } from "@/modules/report/actions/record-abuse-note";

export function AbuseNoteForm({ fingerprint }: { fingerprint: string }) {
  const [message, action, pending] = useActionState(recordAbuseNote, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="fingerprint" value={fingerprint} />
      <Field>
        <FieldLabel htmlFor={`abuse-reason-${fingerprint}`}>Motif</FieldLabel>
        <textarea id={`abuse-reason-${fingerprint}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2 text-base" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="noted" disabled={pending}>Noter l’indice</Button>
        <Button type="submit" name="decision" value="dismissed" variant="outline" disabled={pending}>Écarter l’indice</Button>
      </div>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
