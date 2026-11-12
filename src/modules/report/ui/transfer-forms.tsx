"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { checkTransfer, transferPayment } from "@/modules/report/actions/transfer-payment";

const OPERATORS = [["mpesa", "M-Pesa", "81"], ["orange", "Orange Money", "84"], ["airtel", "Airtel Money", "97"], ["afrimoney", "Afrimoney", "90"]] as const;

export function TransferForm({ requestId: initialId, statementId, lineId, sandbox = false, test = false }: {
  requestId: string; statementId?: string; lineId?: string; sandbox?: boolean; test?: boolean;
}) {
  const [feedback, action, pending] = useActionState(transferPayment, null);
  const [requestId, setRequestId] = useState(initialId);
  const [operator, setOperator] = useState("mpesa");
  const prefix = OPERATORS.find(([key]) => key === operator)?.[2] ?? "81";
  const [sample, setSample] = useState("1");
  function changed() { setRequestId(crypto.randomUUID()); }
  return <form action={action} onReset={event => event.preventDefault()}>
    <input type="hidden" name="requestId" value={requestId} />
    <input type="hidden" name="test" value={String(test)} />
    <input type="hidden" name="statementId" value={statementId ?? ""} />
    <input type="hidden" name="lineId" value={lineId ?? ""} />
    <FieldGroup>
      <Field><FieldLabel htmlFor={`transfer-operator-${lineId ?? "test"}`}>Opérateur</FieldLabel>
        <NativeSelect id={`transfer-operator-${lineId ?? "test"}`} name="operator" value={operator} disabled={pending} onChange={e => { setOperator(e.target.value); changed(); }}>
          {OPERATORS.map(([key, label]) => <NativeSelectOption key={key} value={key}>{label}</NativeSelectOption>)}
        </NativeSelect>
      </Field>
      {test ? <Field><FieldLabel htmlFor="transfer-test-number">Numéro de test</FieldLabel>
        <NativeSelect id="transfer-test-number" value={sample} disabled={pending} onChange={e => { setSample(e.target.value); changed(); }}>
          {["1", "2", "3", "4"].map(n => <NativeSelectOption key={n} value={n}>{`+243${prefix}000000${n} · ${Number(n) <= 2 ? "Succès attendu" : "Échec attendu"}`}</NativeSelectOption>)}
        </NativeSelect>
        <input type="hidden" name="phone" value={`+243${prefix}000000${sample}`} />
      </Field> : null}
      {feedback ? <p role="status" className="text-sm">{feedback.message}</p> : null}
      <Button type="submit" disabled={pending || (feedback?.terminal && feedback.requestId === requestId)}>{pending ? "Envoi en cours…" : test || sandbox ? "Tester le versement" : "Effectuer le paiement"}</Button>
    </FieldGroup>
  </form>;
}

export function TransferCheckForm({ id, statementId }: { id: string; statementId?: string }) {
  const [message, action, pending] = useActionState(checkTransfer, null);
  return <form action={action} className="grid justify-items-start gap-2">
    <input type="hidden" name="transferId" value={id} /><input type="hidden" name="statementId" value={statementId ?? ""} />
    <Button type="submit" variant="outline" size="sm" disabled={pending}>{pending ? "Vérification…" : "Vérifier le statut"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}
