"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { decideAssessment, reviewFiscalStatus } from "@/modules/report/actions/review-assessment";
import {
  REJECTION_REASONS, UNREADABLE_MESSAGE, VALIDATION_FINDINGS, requiresFiscalReview,
  type Assessment, type AssessmentPrecalculation, type AssessmentView,
} from "@/modules/report/model/assessment";
import { francs, rewardStatusLabel } from "@/modules/report/model/reward";

export function AssessmentPanel({ view, canReview, canDecide, canModifyDecision, openDuplicates }: {
  view: AssessmentView;
  canReview: boolean;
  canDecide: boolean;
  canModifyDecision: boolean;
  openDuplicates?: ReactNode;
}) {
  const current = view.assessment;
  const calculation = view.precalculation;
  const decided = current.state === "validated" || current.state === "rejected";
  const fiscalReviewRequired = requiresFiscalReview(view);
  const canValidate = !openDuplicates && (!fiscalReviewRequired || current.vatStatus === "registered");
  const validationPrerequisite = openDuplicates ? "Examinez le rapprochement avant de valider."
    : current.vatStatus === "unregistered" ? "L’établissement est non assujetti à la TVA."
      : "Vérifiez l’assujettissement avant de valider.";
  const canVerifyFiscalStatus = canReview && fiscalReviewRequired && current.state === "doubt";
  const actions = (decided ? canModifyDecision : canDecide) ? (
    <div className="grid gap-3" key={`decision-${current.revision}`}>
      <div className="flex flex-wrap gap-2">
        {!canValidate ? (
          <Button disabled aria-describedby="validation-prerequisite">Valider</Button>
        ) : (
          <ActionDialog label="Valider" title="Valider le signalement" variant="default">
            <DecisionForm assessment={current} decision="validate" />
          </ActionDialog>
        )}
        <ActionDialog label="Rejeter" title="Rejeter le signalement" variant="outline">
          <DecisionForm assessment={current} decision="reject" />
        </ActionDialog>
      </div>
      {!canValidate ? <p id="validation-prerequisite" className="text-sm text-muted-foreground">{validationPrerequisite}</p> : null}
    </div>
  ) : null;

  return <div className="grid gap-5">
    <EvidenceDetails evidence={current} calculation={calculation} />
    {current.checkedAt && current.vatSource !== "ocr" && VAT_LABELS[current.vatStatus] ? (
      <div className="grid gap-1 rounded-md bg-muted p-3 text-sm">
        <p className="font-medium">{VAT_LABELS[current.vatStatus]}</p>
        <p className="wrap-anywhere text-muted-foreground">{[reportedAtLabel(current.checkedAt), current.vatEvidence].filter(Boolean).join(" · ")}</p>
      </div>
    ) : null}
    {canVerifyFiscalStatus ? (
      <section id="report-fiscal-review" aria-labelledby="fiscal-review-heading" tabIndex={-1} className="grid scroll-mt-20 gap-3 border-t pt-4">
        <h3 id="fiscal-review-heading" className="text-sm font-bold">Assujettissement à la TVA</h3>
        <FiscalStatusForm key={`fiscal-${current.revision}`} assessment={current} />
      </section>
    ) : null}
    {openDuplicates}
    {actions ? decided ? (
      <details className="rounded-md border px-3">
        <summary className="cursor-pointer py-3 text-sm font-medium">Modifier la décision</summary>
        <div className="pb-3">{actions}</div>
      </details>
    ) : <div className="border-t pt-4">{actions}</div> : null}
    {view.reward ? (
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm">
        <p>Récompense <strong className="ml-1 tabular-nums">{francs(view.reward.amount)}</strong></p>
        <Badge variant="outline">{rewardStatusLabel(view.reward.status)}</Badge>
      </div>
    ) : null}
  </div>;
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

function EvidenceDetails({ evidence, calculation }: { evidence: Assessment; calculation: AssessmentPrecalculation | null }) {
  const amount = evidence.extracted?.vatAmount?.trim();
  const currency = evidence.extracted?.currency?.trim();
  const vatAmount = amount && /^[0-9]+(?:[.,][0-9]{1,2})?$/.test(amount)
    ? [Number(amount.replace(",", ".")).toLocaleString("fr-FR", { maximumFractionDigits: 2 }), currency].filter(Boolean).join(" ")
    : null;
  const readability = calculation?.criteria.find((criterion) => criterion.key === "readability")?.value ?? "UNKNOWN";
  const normalization = calculation?.criteria.find((criterion) => criterion.key === "normalization")?.value ?? evidence.normalization;
  const uniqueness = calculation?.criteria.find((criterion) => criterion.key === "uniqueness")?.value ?? evidence.uniqueness;
  const entries = [
    ["Établissement", evidence.sellerName ?? "Non relevé"],
    ["NIF", evidence.sellerTaxId ?? "Non relevé"],
    ["TVA facturée", vatAmount ?? CRITERION_VALUES[evidence.vatCharged]],
    ["Normalisation", CRITERION_VALUES[normalization] ?? normalization],
    ["Lisibilité", CRITERION_VALUES[readability] ?? readability],
    ["Antériorité", CRITERION_VALUES[uniqueness] ?? uniqueness],
    ["Numéro de facture", evidence.documentNumber],
    ["Date de la facture", evidence.documentDate ? calendarLabel(evidence.documentDate) : null],
    ["Numéro DEF", evidence.extracted?.defNumber],
    ["Code de vérification", evidence.extracted?.readCode],
    ["Code DEF", evidence.extracted?.defCode],
  ].filter(([, value]) => value);

  return <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border bg-muted/35 p-3 text-sm" aria-label="Éléments de la vérification">
    {entries.map(([label, value]) => <div key={label} className="min-w-0">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-anywhere tabular-nums">{value}</dd>
    </div>)}
  </dl>;
}
