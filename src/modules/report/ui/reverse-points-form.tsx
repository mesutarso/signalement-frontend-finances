"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { reversePoints } from "@/modules/report/actions/reverse-points";

export function ReversePointsForm({ reportId }: { reportId: string }) {
  const [message, action, pending] = useActionState(reversePoints, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <Field>
        <FieldLabel htmlFor={`points-reason-${reportId}`}>Motif de l'annulation</FieldLabel>
        <textarea id={`points-reason-${reportId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending}>Annuler les points</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
