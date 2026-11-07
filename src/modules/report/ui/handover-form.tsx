"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { recordHandover } from "@/modules/report/actions/record-handover";

export function HandoverForm({ id }: { id: string }) {
  const [message, submit, pending] = useActionState(recordHandover, null);
  return (
    <form action={submit} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Field>
        <FieldLabel htmlFor={`handover-note-${id}`}>Note</FieldLabel>
        <textarea id={`handover-note-${id}`} name="note" maxLength={500} rows={2} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
      <Button type="submit" disabled={pending}>Enregistrer la remise</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
