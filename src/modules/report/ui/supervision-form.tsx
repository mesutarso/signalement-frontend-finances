"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { recordSupervision } from "@/modules/report/actions/record-supervision";

export function SupervisionForm({ reportId }: { reportId: string }) {
  const [message, action, pending] = useActionState(recordSupervision, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <Field>
        <FieldLabel htmlFor={`supervision-reason-${reportId}`}>Motif</FieldLabel>
        <textarea id={`supervision-reason-${reportId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2 text-base" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="result" value="upheld" disabled={pending}>Maintenir la décision</Button>
        <Button type="submit" name="result" value="returned" variant="outline" disabled={pending}>Renvoyer le dossier</Button>
      </div>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
