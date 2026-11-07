"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { decidePaymentStatement } from "@/modules/report/actions/decide-payment-statement";

export function PaymentDecisionForm({ id, step }: { id: string; step: "control" | "visa" | "authorize" }) {
  const [accepted, accept, accepting] = useActionState(decidePaymentStatement, null);
  const [returned, sendBack, returning] = useActionState(decidePaymentStatement, null);
  const [refused, refuse, refusing] = useActionState(decidePaymentStatement, null);
  const pending = accepting || returning || refusing;
  const acceptLabel = step === "control" ? "Contrôler" : step === "visa" ? "Viser" : "Autoriser";
  return (
    <div className="grid gap-4">
      <form action={accept} className="grid gap-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="step" value={step} />
        <input type="hidden" name="result" value="accept" />
        <Button type="submit" disabled={pending}>{acceptLabel}</Button>
        {accepted ? <p role="status" className="text-sm font-bold text-primary">{accepted}</p> : null}
      </form>
      {step === "control" ? null : (
        <form action={sendBack} className="grid gap-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="step" value={step} />
          <input type="hidden" name="result" value="return" />
          <Field>
            <FieldLabel htmlFor={`payment-return-${id}`}>Motif du renvoi</FieldLabel>
            <textarea id={`payment-return-${id}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
          </Field>
          <Button type="submit" variant="outline" disabled={pending}>Renvoyer</Button>
          {returned ? <p role="status" className="text-sm font-bold text-primary">{returned}</p> : null}
        </form>
      )}
      <form action={refuse} className="grid gap-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="step" value={step} />
        <input type="hidden" name="result" value="refuse" />
        <Field>
          <FieldLabel htmlFor={`payment-refuse-${id}`}>Motif du refus</FieldLabel>
          <textarea id={`payment-refuse-${id}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>Refuser</Button>
        {refused ? <p role="status" className="text-sm font-bold text-primary">{refused}</p> : null}
      </form>
    </div>
  );
}
