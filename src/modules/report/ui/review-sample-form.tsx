"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { reviewPaymentSample } from "@/modules/report/actions/review-payment-sample";

export function ReviewSampleForm({ lineId, sampleId }: { lineId: string; sampleId: string }) {
  const [message, action, pending] = useActionState(reviewPaymentSample, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={lineId} />
      <input type="hidden" name="sampleId" value={sampleId} />
      <Field>
        <FieldLabel htmlFor={`sample-result-${lineId}`}>Résultat</FieldLabel>
        <select id={`sample-result-${lineId}`} name="result" required className="h-11 rounded-md border border-input bg-card px-3">
          <option value="conform">Conforme</option>
          <option value="anomaly">Anomalie</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`sample-reason-${lineId}`}>Motif</FieldLabel>
        <input id={`sample-reason-${lineId}`} name="reason" maxLength={500} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending}>Enregistrer le contrôle</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
