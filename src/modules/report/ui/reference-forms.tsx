"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ReportPicker } from "@/modules/report/ui/report-picker";
import { prepareMessage } from "@/modules/report/actions/prepare-message";
import { recordCorrection } from "@/modules/report/actions/record-correction";
import { recordReexamination } from "@/modules/report/actions/record-reexamination";

export function CorrectionForm({ reference }: { reference?: string }) {
  const [message, action, pending] = useActionState(recordCorrection, null);
  return (
    <form action={action} className="grid gap-3">
      {reference ? <input type="hidden" name="reference" value={reference} /> : <ReportPicker />}
      <Field>
        <FieldLabel htmlFor="correction-reason">Motif</FieldLabel>
        <input id="correction-reason" name="reason" required maxLength={500} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Retirer la validation</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function ReexaminationForm({ reference }: { reference?: string }) {
  const [message, action, pending] = useActionState(recordReexamination, null);
  return (
    <form action={action} className="grid gap-3">
      {reference ? <input type="hidden" name="reference" value={reference} /> : <ReportPicker />}
      <Field>
        <FieldLabel htmlFor="reexamination-text">Demande</FieldLabel>
        <input id="reexamination-text" name="text" required maxLength={500} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor="reexamination-date">Reçue le</FieldLabel>
        <input id="reexamination-date" name="receivedOn" type="date" required className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Enregistrer la demande</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function MessageForm() {
  const [message, action, pending] = useActionState(prepareMessage, null);
  return (
    <form action={action} className="grid gap-3">
      <ReportPicker />
      <Field>
        <FieldLabel htmlFor="message-kind">Message</FieldLabel>
        <select id="message-kind" name="kind" required className="h-11 rounded-md border border-input bg-card px-3">
          <option value="payout">Numéro de paiement</option>
          <option value="reexamination">Réexamen traité</option>
          <option value="situation">Situation mise à jour</option>
        </select>
      </Field>
      <Button type="submit" disabled={pending}>Préparer le message</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
