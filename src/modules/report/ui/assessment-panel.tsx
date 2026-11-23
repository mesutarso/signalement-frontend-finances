"use client";

import { useActionState, useRef, useState } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import { RefreshButton } from "@/components/refresh-button";
import { ImportRefresh } from "@/modules/report/ui/import-refresh";
import { decideAssessment, reviewFiscalStatus } from "@/modules/report/actions/review-assessment";
import {
  REJECTION_REASONS, UNREADABLE_MESSAGE, VALIDATION_FINDINGS, validationLabel,
  type Assessment, type AssessmentPrecalculation, type AssessmentView,
} from "@/modules/report/model/assessment";
import { francs, rewardStatusLabel } from "@/modules/report/model/reward";

export function AssessmentPanel({ view, reference, canReview, canDecide }: {
  view: AssessmentView;
  reference: string;
  canReview: boolean;
  canDecide: boolean;
}) {
  const current = view.assessment;
  const busy = current.jobState !== "done";
  const calculation = view.precalculation;
  const validated = current.state === "validated";
  const outcome = validated ? `Votre signalement ${reference} a été validé.` : validationLabel(current.state);
  const reason = validated ? findingLabel(view.finding) ?? current.reason : current.reason;
  return <section className="grid gap-5" aria-label="Vérification du signalement">
    <div aria-live="polite" className="grid gap-2">
      <Alert>
        <AlertTitle>{outcome}</AlertTitle>
        <AlertDescription>{reason}</AlertDescription>
      </Alert>
      {current.checkedAt && VAT_LABELS[current.vatStatus] ? (
        <div className="grid gap-1 text-sm">
          <p className="font-medium">{current.vatSource === "ocr" ? "Assujettissement établi par l’OCR" : "Assujettissement vérifié"} · {VAT_LABELS[current.vatStatus]}</p>
          <p className="text-muted-foreground">{reportedAtLabel(current.checkedAt)}{current.vatEvidence ? ` · ${current.vatEvidence}` : ""}</p>
        </div>
      ) : null}
    </div>
    {busy ? <><ImportRefresh /><RefreshButton /></> : null}
    {view.reward ? <p className="flex flex-wrap items-baseline gap-2 text-sm"><span className="font-bold">Récompense : {francs(view.reward.amount)}</span><Badge variant="outline">{rewardStatusLabel(view.reward.status)}</Badge></p> : null}
    {calculation && !busy ? <AssessmentCriteria calculation={calculation} /> : null}
    {canReview && !busy && current.vatCharged !== "yes" && current.state === "doubt" ? (
      <FiscalStatusForm key={`fiscal-${current.revision}`} assessment={current} />
    ) : null}
    {canDecide && !busy ? (
      <div className="flex flex-wrap gap-2" key={`decision-${current.revision}`}>
        <ActionDialog label="Valider" title="Valider le signalement" variant="default">
          <DecisionForm assessment={current} decision="validate" />
        </ActionDialog>
        <ActionDialog label="Rejeter" title="Rejeter le signalement" variant="destructive">
          <DecisionForm assessment={current} decision="reject" />
        </ActionDialog>
      </div>
    ) : null}
    {!busy ? <EvidenceDetails evidence={current} /> : null}
  </section>;
}

const VAT_LABELS: Record<string, string> = {
  registered: "Assujetti à la TVA",
  unregistered: "Non assujetti à la TVA",
};

const CRITERION_VALUES: Record<string, string> = {
  unknown: "À vérifier", "markers-found": "Éléments relevés", normalized: "Normalisée", "non-normalized": "Non normalisée",
  conform: "Conforme", nonconform: "Non conforme", yes: "TVA facturée", no: "Aucune TVA facturée",
  unique: "Antériorité vérifiée", duplicate: "Doublon confirmé",
  READABLE: "Lisible", PARTIAL: "Lecture partielle", UNREADABLE: "Photo illisible", UNKNOWN: "À déterminer",
};

export function AssessmentCriteria({ calculation: c }: { calculation: AssessmentPrecalculation }) {
  return <dl className="grid gap-3" aria-label="Critères du signalement">{c.criteria.map(criterion => <div key={criterion.key} className="grid gap-1 text-sm">
    <dt className="flex flex-wrap items-baseline justify-between gap-2">
      {criterion.label}<Badge variant="outline">{CRITERION_VALUES[criterion.value] ?? criterion.value}</Badge>
    </dt>
    {criterion.detail ? <dd className="text-muted-foreground">{criterion.detail}</dd> : null}
  </div>)}</dl>;
}

function FiscalStatusForm({ assessment: a }: { assessment: Assessment }) {
  const [message, action, pending] = useActionState(reviewFiscalStatus, null);
  const [status, setStatus] = useState(a.vatStatus);
  const [reference, setReference] = useState(a.vatEvidence ?? "");
  const [referenceMissing, setReferenceMissing] = useState(false);
  const referenceInput = useRef<HTMLInputElement>(null);
  return <form action={action} noValidate aria-label="Renseigner l’assujettissement à la TVA" onSubmit={(event) => {
    if (!reference.trim()) {
      event.preventDefault();
      setReferenceMissing(true);
      referenceInput.current?.focus();
    }
  }}>
    <input type="hidden" name="reportId" value={a.reportId} /><input type="hidden" name="revision" value={a.revision} />
    <FieldGroup>
      <Field><FieldLabel htmlFor="fiscal-vat-status">L’établissement est-il assujetti à la TVA ?</FieldLabel>
        <NativeSelect id="fiscal-vat-status" name="vatStatus" value={status} onChange={event => setStatus(event.target.value)} disabled={pending} required>
          <NativeSelectOption value="unknown" disabled>Choisir le statut fiscal</NativeSelectOption>
          <NativeSelectOption value="registered">{VAT_LABELS.registered}</NativeSelectOption>
          <NativeSelectOption value="unregistered">{VAT_LABELS.unregistered}</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field data-invalid={referenceMissing || undefined}>
        <FieldLabel htmlFor="fiscal-evidence">Référence de la vérification (obligatoire)</FieldLabel>
        <Input ref={referenceInput} id="fiscal-evidence" name="vatEvidence" value={reference} required maxLength={500} disabled={pending}
          aria-invalid={referenceMissing || undefined} aria-describedby={referenceMissing ? "fiscal-evidence-error" : "fiscal-evidence-help"}
          onChange={(event) => {
            setReference(event.target.value);
            if (event.target.value.trim()) setReferenceMissing(false);
          }} />
        {referenceMissing ? <FieldError id="fiscal-evidence-error" role="alert">Indiquez la référence de votre vérification.</FieldError> : (
          <FieldDescription id="fiscal-evidence-help">Indiquez le registre ou la pièce consultée.</FieldDescription>
        )}
      </Field>
      {message && !pending ? <Alert variant="destructive"><AlertTitle>{message}</AlertTitle></Alert> : null}
      <Button type="submit" disabled={pending || status === "unknown"}>{pending ? "Enregistrement…" : "Enregistrer l’assujettissement"}</Button>
    </FieldGroup>
  </form>;
}

function DecisionForm({ assessment, decision }: { assessment: Assessment; decision: "validate" | "reject" }) {
  const [message, action, pending] = useActionState(decideAssessment, null);
  const [code, setCode] = useState("");
  const validate = decision === "validate";
  const options = validate ? VALIDATION_FINDINGS : REJECTION_REASONS;

  return <form action={action}>
    <input type="hidden" name="reportId" value={assessment.reportId} />
    <input type="hidden" name="revision" value={assessment.revision} />
    <input type="hidden" name="decision" value={decision} />
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`assessment-${decision}`}>{validate ? "Catégorie de validation" : "Motif du rejet"}</FieldLabel>
        <NativeSelect id={`assessment-${decision}`} name="code" className="w-full" value={code} required
          disabled={pending} onChange={(event) => setCode(event.target.value)}>
          <NativeSelectOption value="" disabled>{validate ? "Choisir la catégorie" : "Choisir le motif"}</NativeSelectOption>
          {Object.entries(options).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
        </NativeSelect>
        {code === "unreadable" ? <FieldDescription>{UNREADABLE_MESSAGE}</FieldDescription> : null}
      </Field>
      {message ? <Alert variant="destructive"><AlertTitle>{message}</AlertTitle></Alert> : null}
      <Button type="submit" variant={validate ? "default" : "destructive"} disabled={pending || !code}>
        {pending ? "Enregistrement…" : validate ? "Confirmer la validation" : "Confirmer le rejet"}
      </Button>
    </FieldGroup>
  </form>;
}

function EvidenceDetails({ evidence }: { evidence: Partial<Assessment> }) {
  const entries = [
    ["Établissement", evidence.sellerName], ["NIF", evidence.sellerTaxId],
    ["Facture", [evidence.documentNumber, evidence.documentDate].filter(Boolean).join(" · ")],
    ["Code de vérification", evidence.extracted?.readCode],
    ["Code DEF", evidence.extracted?.defCode], ["Numéro DEF", evidence.extracted?.defNumber],
  ].filter(([, value]) => value);
  if (!entries.length) return null;
  return <section className="grid gap-2 border-t pt-4 text-sm">
    <h3 className="font-medium">Informations de la facture</h3>
    <dl className="grid gap-2 break-words">{entries.map(([label, value]) => <div key={label}><dt className="font-medium">{label}</dt><dd>{value}</dd></div>)}</dl>
  </section>;
}
