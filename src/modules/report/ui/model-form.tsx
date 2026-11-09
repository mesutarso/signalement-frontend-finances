"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { recordModel } from "@/modules/report/actions/record-model";

const KINDS = [
  ["photo", "Nouvelle photo"],
  ["payout", "Numéro de paiement"],
  ["reexamination", "Réexamen traité"],
  ["situation", "Situation mise à jour"],
] as const;

export function ModelForm() {
  const [message, action, pending] = useActionState(recordModel, null);
  return (
    <form action={action} className="grid gap-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="model-kind">Modèle</FieldLabel>
          <select id="model-kind" name="kind" required className="h-11 rounded-md border border-input bg-card px-3" defaultValue="photo">
            {KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="model-body">Texte</FieldLabel>
          <textarea id="model-body" name="body" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" placeholder="Le signalement %s attend une nouvelle photo." />
        </Field>
        <Button type="submit" disabled={pending} className="w-fit">{pending ? "Enregistrement…" : "Enregistrer le modèle"}</Button>
      </FieldGroup>
      {message ? <p role="status" className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
