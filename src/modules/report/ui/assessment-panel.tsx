"use client";

import { useActionState, useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RefreshButton } from "@/components/refresh-button";
import { requestAnalysis, reviewAssessment } from "@/modules/report/actions/review-assessment";
import { type Assessment, type AssessmentView } from "@/modules/report/model/assessment";
import { francs, rewardStatusLabel } from "@/modules/report/model/reward";
import { reportedAtLabel, type ReportPhoto } from "@/modules/report/model/report";

export function AssessmentPanel({ view, photos, canReview, canAnalyze }: {
  view: AssessmentView; photos: ReportPhoto[]; canReview: boolean; canAnalyze: boolean;
}) {
  const current = view.assessment;
  const busy = current.jobState !== "done";
  return <section className="grid gap-5" aria-label="Vérification du signalement">
    <Alert><AlertTitle>{current.reason}</AlertTitle></Alert>
    {busy ? <RefreshButton /> : null}
    {view.reward ? <p className="flex flex-wrap items-baseline gap-2 text-sm"><span className="font-bold">Récompense : {francs(view.reward.amount)}</span><Badge variant="outline">{rewardStatusLabel(view.reward.status)}</Badge></p> : null}
    {canReview && !busy ? <AssessmentForm key={current.revision} assessment={current} photos={photos} /> : null}
    {canAnalyze && !busy ? <AnalysisButton reportId={current.reportId} /> : null}
    {!canReview ? <EvidenceDetails evidence={current} /> : null}
  </section>;
}

function AssessmentForm({ assessment: a, photos }: { assessment: Assessment; photos: ReportPhoto[] }) {
  const [message, action, pending] = useActionState(reviewAssessment, null);
  return <form action={action} className="grid gap-4">
    <input type="hidden" name="reportId" value={a.reportId} /><input type="hidden" name="revision" value={a.revision} />
    <FieldGroup>
      <Field><FieldLabel htmlFor="verified-photo">Pièce vérifiée</FieldLabel>
        <NativeSelect id="verified-photo" name="photoId" defaultValue={a.photoId ?? ""}>
          <NativeSelectOption value="">Choisir une pièce</NativeSelectOption>
          {photos.map((photo, index) => <NativeSelectOption key={photo.id} value={photo.id}>Pièce {index + 1}</NativeSelectOption>)}
        </NativeSelect>
      </Field>
      <Field><FieldLabel htmlFor="verified-seller">Établissement</FieldLabel><Input id="verified-seller" name="sellerName" maxLength={160} defaultValue={a.sellerName ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-nif">NIF</FieldLabel><Input id="verified-nif" name="sellerTaxId" maxLength={40} defaultValue={a.sellerTaxId ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-number">Numéro de facture</FieldLabel><Input id="verified-number" name="documentNumber" maxLength={80} defaultValue={a.documentNumber ?? ""} /></Field>
      <Field><FieldLabel htmlFor="verified-date">Date de facture</FieldLabel><Input id="verified-date" name="documentDate" type="date" defaultValue={a.documentDate ?? ""} /></Field>
      <CheckField name="vatStatus" label="1. Assujettissement à la TVA" value={a.vatStatus} options={[["registered", "Assujetti"], ["unregistered", "Non assujetti"]]} proofName="vatEvidence" proof={a.vatEvidence} proofLabel="Source et référence de la vérification fiscale" />
      {a.checkedAt ? <p className="text-[13px] text-muted-foreground">Vérification fiscale enregistrée le {reportedAtLabel(a.checkedAt)}</p> : null}
      <CheckField name="normalization" label="2. Normalisation de la facture" value={a.normalization} options={[["non-normalized", "Facture non normalisée"], ["normalized", "Facture normalisée"]]} proofName="normalizationEvidence" proof={a.normalizationEvidence} proofLabel="Éléments vérifiés sur la facture" />
      <CheckField name="purchaseConformity" label="3. Conformité à l’achat réel" value={a.purchaseConformity} options={[["nonconform", "Montant ou articles non conformes"], ["conform", "Achat conforme à la facture"]]} proofName="purchaseEvidence" proof={a.purchaseEvidence} proofLabel="Justificatif de comparaison avec l’achat réel" />
      <CheckField name="uniqueness" label="4. Facture non encore signalée" value={a.uniqueness} options={[["unique", "Aucun signalement antérieur retenu"], ["duplicate", "Facture déjà signalée"]]} proofName="uniquenessEvidence" proof={a.uniquenessEvidence} proofLabel="Résultat de la recherche et références vérifiées" />
      <CheckField name="vatCharged" label="5. TVA facturée" value={a.vatCharged} options={[["yes", "TVA facturée"], ["no", "Aucune TVA facturée"]]} proofName="vatChargeEvidence" proof={a.vatChargeEvidence} proofLabel="Mention ou montant relevé sur la facture" />
      {message ? <p role="status" className="text-sm text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer les vérifications"}</Button>
    </FieldGroup>
  </form>;
}

function EvidenceDetails({ evidence }: { evidence: Partial<Assessment> }) {
  const entries = [
    ["Établissement", evidence.sellerName], ["NIF", evidence.sellerTaxId],
    ["Facture", [evidence.documentNumber, evidence.documentDate].filter(Boolean).join(" · ")],
    ["Assujettissement", evidence.vatEvidence], ["Normalisation", evidence.normalizationEvidence],
    ["Achat réel", evidence.purchaseEvidence], ["Recherche d’antériorité", evidence.uniquenessEvidence],
    ["TVA facturée", evidence.vatChargeEvidence],
  ].filter(([, value]) => value);
  if (!entries.length) return null;
  return <details className="mt-1"><summary className="cursor-pointer text-primary">Preuves vérifiées</summary>
    <dl className="mt-2 grid gap-2 break-words">{entries.map(([label, value]) => <div key={label}><dt className="font-medium">{label}</dt><dd>{value}</dd></div>)}</dl>
  </details>;
}

function CheckField({ name, label, value, options, proofName, proof, proofLabel }: {
  name: string; label: string; value: string; options: [string, string][]; proofName: string; proof: string | null; proofLabel: string;
}) {
  const [selected, setSelected] = useState(value);
  return <div className="grid gap-3 border-t pt-4">
    <Field><FieldLabel htmlFor={name}>{label}</FieldLabel>
      <NativeSelect id={name} name={name} value={selected} onChange={e => setSelected(e.target.value)}>
        <NativeSelectOption value="unknown">Non vérifié / non applicable</NativeSelectOption>
        {options.map(([key, text]) => <NativeSelectOption key={key} value={key}>{text}</NativeSelectOption>)}
      </NativeSelect>
    </Field>
    {selected !== "unknown" ? <Field><FieldLabel htmlFor={proofName}>{proofLabel}</FieldLabel><Input id={proofName} name={proofName} maxLength={500} required defaultValue={proof ?? ""} /></Field> : null}
  </div>;
}

function AnalysisButton({ reportId }: { reportId: string }) {
  const [message, action, pending] = useActionState(requestAnalysis, null);
  return <form action={action} className="grid justify-items-start gap-2"><input type="hidden" name="reportId" value={reportId} /><Button variant="outline" size="sm" disabled={pending}>{pending ? "Demande en cours…" : "Relancer l’analyse"}</Button>{message ? <p role="status" className="text-sm">{message}</p> : null}</form>;
}
