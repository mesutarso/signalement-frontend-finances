"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { preparePaymentSample } from "@/modules/report/actions/prepare-payment-sample";

export function PrepareSampleForm() {
  const [message, action, pending] = useActionState(preparePaymentSample, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="sample-from">Du</FieldLabel>
        <input id="sample-from" name="periodStart" type="date" required className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor="sample-to">Au</FieldLabel>
        <input id="sample-to" name="periodEnd" type="date" required className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Constituer l&apos;échantillon</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary sm:col-span-2">{message}</p> : null}
    </form>
  );
}
