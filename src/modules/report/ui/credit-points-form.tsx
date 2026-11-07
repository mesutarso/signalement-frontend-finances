"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { creditPoints } from "@/modules/report/actions/credit-points";

export function CreditPointsForm({ reportId }: { reportId: string }) {
  const [message, action, pending] = useActionState(creditPoints, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <Field>
        <FieldLabel htmlFor={`points-reference-${reportId}`}>Référence de la confirmation</FieldLabel>
        <input id={`points-reference-${reportId}`} name="reference" required maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Créditer les points</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
