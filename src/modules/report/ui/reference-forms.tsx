"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { prepareMessage } from "@/modules/report/actions/prepare-message";
import { recordCorrection } from "@/modules/report/actions/record-correction";
import { recordReexamination } from "@/modules/report/actions/record-reexamination";

export function CorrectionForm() {
  const [message, action, pending] = useActionState(recordCorrection, null);
  return (
    <form action={action} className="grid gap-3">
      <ReferenceField id="correction-reference" />
      <Field>
        <FieldLabel htmlFor="correction-reason">Motif</FieldLabel>
        <input id="correction-reason" name="reason" required maxLength={500} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Enregistrer la correction</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function ReexaminationForm() {
  const [message, action, pending] = useActionState(recordReexamination, null);
  return (
    <form action={action} className="grid gap-3">
      <ReferenceField id="reexamination-reference" />
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
      <ReferenceField id="message-reference" />
      <Field>
        <FieldLabel htmlFor="message-kind">Message</FieldLabel>
        <select id="message-kind" name="kind" required className="h-11 rounded-md border border-input bg-card px-3">
          <option value="photo">Nouvelle photo</option>
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

function ReferenceField({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Référence du signalement</FieldLabel>
      <input id={id} name="reference" required maxLength={80} className="h-11 rounded-md border border-input bg-card px-3" />
    </Field>
  );
}
