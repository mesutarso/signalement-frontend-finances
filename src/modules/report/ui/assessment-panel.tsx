"use client";

import { useActionState, useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RefreshButton } from "@/components/refresh-button";
import { ImportRefresh } from "@/modules/report/ui/import-refresh";
import { reviewAssessment, reviewFiscalStatus } from "@/modules/report/actions/review-assessment";
import { type Assessment, type AssessmentPrecalculation, type AssessmentView } from "@/modules/report/model/assessment";
import { francs, rewardStatusLabel } from "@/modules/report/model/reward";

export function AssessmentPanel({ view, canReview }: {
  view: AssessmentView; canReview: boolean;
}) {
  const current = view.assessment;
  const busy = current.jobState !== "done";
  return <section className="grid gap-5" aria-label="Vérification du signalement">
    <Alert><AlertTitle>{current.reason}</AlertTitle></Alert>
    {busy ? <><ImportRefresh /><RefreshButton /></> : null}
    {view.reward ? <p className="flex flex-wrap items-baseline gap-2 text-sm"><span className="font-bold">Récompense : {francs(view.reward.amount)}</span><Badge variant="outline">{rewardStatusLabel(view.reward.status)}</Badge></p> : null}
    {canReview && !busy && view.precalculation ? <FiscalStatusForm key={`fiscal-${current.revision}`} assessment={current} /> : null}
    {!canReview ? <EvidenceDetails evidence={current} /> : null}
  </section>;
}

const CRITERION_VALUES: Record<string, string> = {
  unknown: "À vérifier", normalized: "Normalisée", "non-normalized": "Non normalisée",
  conform: "Conforme", nonconform: "Non conforme", yes: "TVA facturée", no: "Aucune TVA facturée",
  unique: "Antériorité vérifiée", duplicate: "Doublon confirmé",
  READABLE: "Lisible", PARTIAL: "Lecture partielle", UNREADABLE: "Illisible — rejet", UNKNOWN: "À déterminer",
};

export function AssessmentCriteria({ calculation: c }: { calculation: AssessmentPrecalculation }) {
  return <dl className="grid gap-2" aria-label="Critères du signalement">{c.criteria.map(criterion => <div key={criterion.key} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
      <dt>{criterion.label}</dt><dd><Badge variant="outline">{CRITERION_VALUES[criterion.value] ?? criterion.value}</Badge></dd>
    </div>)}</dl>;
}

function FiscalStatusForm({ assessment: a }: { assessment: Assessment }) {
  const [message, action, pending] = useActionState(reviewFiscalStatus, null);
  const [status, setStatus] = useState(a.vatStatus);
  return <form action={action} aria-label="Renseigner l’assujettissement à la TVA">
    <input type="hidden" name="reportId" value={a.reportId} /><input type="hidden" name="revision" value={a.revision} />
    <FieldGroup>
      <Field><FieldLabel htmlFor="fiscal-vat-status">L’établissement est-il assujetti à la TVA ?</FieldLabel>
        <NativeSelect id="fiscal-vat-status" name="vatStatus" value={status} onChange={event => setStatus(event.target.value)} disabled={pending} required>
          <NativeSelectOption value="unknown" disabled>Choisir le statut fiscal</NativeSelectOption>
          <NativeSelectOption value="registered">Assujetti à la TVA</NativeSelectOption>
          <NativeSelectOption value="unregistered">Non assujetti à la TVA</NativeSelectOption>
        </NativeSelect>
      </Field>
      {message ? <p role="status" className="text-sm">{message}</p> : null}
      <Button type="submit" disabled={pending || status === "unknown"}>{pending ? "Recalcul en cours…" : "Enregistrer"}</Button>
    </FieldGroup>
  </form>;
}

export function AssessmentCompletion({ assessment: a }: { assessment: Assessment }) {
  const [message, action, pending] = useActionState(reviewAssessment, null);
  return <form action={action} className="grid gap-4" aria-label="Compléter ou corriger la facture">
    <input type="hidden" name="reportId" value={a.reportId} /><input type="hidden" name="revision" value={a.revision} />
    <FieldGroup>
      <Field><FieldLabel htmlFor="verified-seller">Établissement</FieldLabel><Input id="verified-seller" name="sellerName" maxLength={160} defaultValue={a.sellerName ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-nif">NIF</FieldLabel><Input id="verified-nif" name="sellerTaxId" maxLength={40} defaultValue={a.sellerTaxId ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-number">Numéro de facture</FieldLabel><Input id="verified-number" name="documentNumber" maxLength={80} defaultValue={a.documentNumber ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-date">Date de facture</FieldLabel><Input id="verified-date" name="documentDate" type="date" defaultValue={a.documentDate ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-normalization">Normalisation de la facture</FieldLabel>
        <NativeSelect id="verified-normalization" name="normalization" defaultValue={a.normalization} disabled={pending}>
          <NativeSelectOption value="unknown">À déterminer</NativeSelectOption>
          <NativeSelectOption value="non-normalized">Facture non normalisée</NativeSelectOption>
          <NativeSelectOption value="normalized">Facture normalisée</NativeSelectOption>
        </NativeSelect>
      </Field>
      {message ? <p role="status" className="text-sm text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer la facture"}</Button>
    </FieldGroup>
  </form>;
}

function EvidenceDetails({ evidence }: { evidence: Partial<Assessment> }) {
  const entries = [
    ["Établissement", evidence.sellerName], ["NIF", evidence.sellerTaxId],
    ["Facture", [evidence.documentNumber, evidence.documentDate].filter(Boolean).join(" · ")],
    ["Assujettissement", evidence.vatEvidence], ["Normalisation", evidence.normalizationEvidence],
    ["Recherche d’antériorité", evidence.uniquenessEvidence],
    ["TVA facturée", evidence.vatChargeEvidence],
  ].filter(([, value]) => value);
  if (!entries.length) return null;
  return <details className="mt-1"><summary className="cursor-pointer text-primary">Preuves vérifiées</summary>
    <dl className="mt-2 grid gap-2 break-words">{entries.map(([label, value]) => <div key={label}><dt className="font-medium">{label}</dt><dd>{value}</dd></div>)}</dl>
  </details>;
}
