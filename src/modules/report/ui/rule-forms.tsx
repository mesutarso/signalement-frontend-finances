"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { activateRule, recordRule } from "@/modules/report/actions/record-rule";
import { previewRule } from "@/modules/report/actions/preview-rule";

const FIELDS = [
  ["fakeInvoice", "Fausse facture"],
  ["missingTransmission", "Défaut de transmission"],
  ["understated", "Facture minorée"],
  ["nonNormalized", "Facture non normalisée"],
  ["refusal", "Refus"],
  ["bonus", "Bonus"],
  ["ceiling", "Plafond"],
  ["dailyCap", "Limite du jour"],
  ["spacingDays", "Écart en jours"],
] as const;

export function PreviewRuleForm() {
  const [message, submit, pending] = useActionState(previewRule, null);
  return (
    <form action={submit} className="grid gap-3">
      <Fields prefix="preview" defaults={DEFAULTS} />
      <Field>
        <FieldLabel htmlFor="preview-finding">Constat de l’exemple</FieldLabel>
        <input id="preview-finding" name="finding" required defaultValue="non-normalized" className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Field>
        <FieldLabel htmlFor="preview-points">Points de l’exemple</FieldLabel>
        <input id="preview-points" name="netPoints" required defaultValue="30" inputMode="numeric" className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="firstEstablishment" /> Premier signalement de l’établissement</label>
      <Button type="submit" disabled={pending}>Prévisualiser</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function RecordRuleForm() {
  const [message, submit, pending] = useActionState(recordRule, null);
  return (
    <form action={submit} className="grid gap-3">
      <Field>
        <FieldLabel htmlFor="rule-code">Code de la version</FieldLabel>
        <input id="rule-code" name="code" required maxLength={32} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Fields prefix="record" />
      <Button type="submit" disabled={pending}>Enregistrer la version</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function ActivateRuleForm({ id }: { id: string }) {
  const [message, submit, pending] = useActionState(activateRule, null);
  return (
    <form action={submit}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" disabled={pending}>Activer pour les nouveaux crédits</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

const DEFAULTS: Record<string, string> = {
  fakeInvoice: "4",
  missingTransmission: "3",
  understated: "3",
  nonNormalized: "2",
  refusal: "1",
  bonus: "1",
  ceiling: "1000000",
  dailyCap: "5",
  spacingDays: "3",
  tiers: "30 10000\n60 20000\n100 30000",
};

function Fields({ prefix, defaults }: { prefix: string; defaults?: Record<string, string> }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {FIELDS.map(([name, label]) => (
          <Field key={`${prefix}-${name}`}>
            <FieldLabel htmlFor={`${prefix}-${name}`}>{label}</FieldLabel>
            <input id={`${prefix}-${name}`} name={name} required defaultValue={defaults?.[name]} inputMode="numeric" className="h-11 rounded-md border border-input bg-card px-3" />
          </Field>
        ))}
      </div>
      <Field>
        <FieldLabel htmlFor={`${prefix}-tiers`}>Paliers</FieldLabel>
        <textarea id={`${prefix}-tiers`} name="tiers" required rows={4} defaultValue={defaults?.tiers} placeholder={"30 10000\n60 20000"} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
    </>
  );
}
