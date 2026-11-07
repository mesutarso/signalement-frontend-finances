"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { recordPaymentAttempt } from "@/modules/report/actions/record-payment-attempt";

function OperatorField({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Moyen de paiement</FieldLabel>
      <NativeSelect id={id} name="operator" defaultValue="airtel" className="w-full">
        <NativeSelectOption value="airtel">Airtel Money</NativeSelectOption>
        <NativeSelectOption value="m-pesa">M-Pesa</NativeSelectOption>
        <NativeSelectOption value="orange">Orange Money</NativeSelectOption>
        <NativeSelectOption value="afrimoney">Afrimoney</NativeSelectOption>
      </NativeSelect>
    </Field>
  );
}

export function PaymentAttemptForm({ statementId, lineId, settle }: { statementId: string; lineId: string; settle: boolean }) {
  const [paid, recordPaid, paying] = useActionState(recordPaymentAttempt, null);
  const [failed, recordFailed, failing] = useActionState(recordPaymentAttempt, null);
  const [unknown, recordUnknown, waiting] = useActionState(recordPaymentAttempt, null);
  const pending = paying || failing || waiting;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{settle ? "Confirmez le résultat simulé avant une nouvelle tentative. Aucun argent n'est envoyé." : "La simulation produit la référence. Aucun argent n'est envoyé."}</p>
      <form action={recordPaid} className="grid gap-3">
        <input type="hidden" name="id" value={statementId} />
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="result" value="paid" />
        <OperatorField id={`payment-operator-paid-${lineId}`} />
        <Button type="submit" disabled={pending}>Simuler le paiement</Button>
        {paid ? <p role="status" className="text-sm font-bold text-primary">{paid}</p> : null}
      </form>
      <form action={recordFailed} className="grid gap-3">
        <input type="hidden" name="id" value={statementId} />
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="result" value="failed" />
        <OperatorField id={`payment-operator-failed-${lineId}`} />
        <Field>
          <FieldLabel htmlFor={`payment-failure-${lineId}`}>Motif de l&apos;échec</FieldLabel>
          <textarea id={`payment-failure-${lineId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>Simuler un échec</Button>
        {failed ? <p role="status" className="text-sm font-bold text-primary">{failed}</p> : null}
      </form>
      {settle ? null : (
        <form action={recordUnknown} className="grid gap-3">
          <input type="hidden" name="id" value={statementId} />
          <input type="hidden" name="lineId" value={lineId} />
          <input type="hidden" name="result" value="unknown" />
          <OperatorField id={`payment-operator-unknown-${lineId}`} />
          <Field>
            <FieldLabel htmlFor={`payment-unknown-${lineId}`}>Motif du résultat incertain</FieldLabel>
            <textarea id={`payment-unknown-${lineId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
          </Field>
          <Button type="submit" variant="outline" disabled={pending}>Simuler un résultat incertain</Button>
          {unknown ? <p role="status" className="text-sm font-bold text-primary">{unknown}</p> : null}
        </form>
      )}
    </div>
  );
}
