"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { recordQualification } from "@/modules/report/actions/record-qualification";
import {
  calendarLabel,
  findingLabel,
  proofLabel,
  qualificationDecisionLabel,
  reportedAtLabel,
  type Qualification,
} from "@/modules/report/model/report";

export function QualificationPanel({
  reportId,
  qualifications,
  canDecide,
}: {
  reportId: string;
  qualifications: Qualification[];
  canDecide: boolean;
}) {
  const current = qualifications[0] ?? null;
  return (
    <section aria-labelledby="report-qualification" className="grid gap-4">
      <div className="grid gap-1">
        <h3 id="report-qualification" className="text-sm font-bold">Qualification</h3>
      </div>
      {current?.decision === "wait" ? <p className="text-sm font-bold">En attente de confirmation de la DGI.</p> : null}
      {current ? <QualificationCard entry={current} current /> : <p className="text-sm text-muted-foreground">Aucune qualification.</p>}
      {qualifications.length > 1 ? (
        <ol className="grid gap-3">
          {qualifications.slice(1).map((entry) => <li key={entry.id}><QualificationCard entry={entry} current={false} /></li>)}
        </ol>
      ) : null}
      {canDecide ? <QualificationForm reportId={reportId} waiting={current?.decision === "wait"} /> : null}
    </section>
  );
}

function QualificationCard({ entry, current }: { entry: Qualification; current: boolean }) {
  const finding = findingLabel(entry.finding);
  const proof = proofLabel(entry.proof);
  const corrections = [
    entry.sellerName ? `Vendeur ${entry.sellerName}` : null,
    entry.sellerTaxId ? `NIF ${entry.sellerTaxId}` : null,
    entry.issuedOn ? `Date ${calendarLabel(entry.issuedOn)}` : null,
    entry.amount ? `Montant ${entry.amount}` : null,
    entry.documentNumber ? `Numéro ${entry.documentNumber}` : null,
    entry.code ? `Code ${entry.code}` : null,
  ].filter((item) => item !== null);
  return (
    <article className="grid gap-2 rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{current ? "Décision actuelle" : "Décision précédente"} · {qualificationDecisionLabel(entry.decision)}</p>
        <p className="text-xs text-muted-foreground">{reportedAtLabel(entry.recordedAt)}</p>
      </div>
      {finding ? <p>{finding}{proof ? ` · ${proof}` : ""}</p> : null}
      {entry.missingElements ? <p>Éléments manquants : {entry.missingElements}</p> : null}
      {entry.dgiReference ? <p>Référence de la DGI : {entry.dgiReference}</p> : null}
      <p>{entry.justification}</p>
      {corrections.length > 0 ? <p className="text-muted-foreground">Données corrigées : {corrections.join(", ")}.</p> : null}
      <p className="text-xs text-muted-foreground">Par {entry.actorName ?? "Compte introuvable"}</p>
    </article>
  );
}

function QualificationForm({ reportId, waiting }: { reportId: string; waiting: boolean }) {
  const [message, action, pending] = useActionState(recordQualification, null);
  const [decision, setDecision] = useState("confirm");
  const [finding, setFinding] = useState("non-normalized");
  const answer = waiting && decision === "confirm" && finding === "refusal";
  const registerOnly = finding !== "non-normalized";
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="qualification-decision">Décision</FieldLabel>
          <NativeSelect id="qualification-decision" name="decision" value={decision} onChange={(event) => setDecision(event.target.value)} aria-label="Décision">
            <NativeSelectOption value="confirm">Retenir le constat</NativeSelectOption>
            <NativeSelectOption value="reject">Écarter le signalement</NativeSelectOption>
            <NativeSelectOption value="wait">Attendre la confirmation de la DGI</NativeSelectOption>
          </NativeSelect>
        </Field>
        {decision === "wait" ? (
          <>
            <input type="hidden" name="finding" value="refusal" />
            <input type="hidden" name="proof" value="pending" />
            <p className="text-sm">Refus de facture · Confirmation attendue</p>
            <Field>
              <FieldLabel htmlFor="qualification-missing">Éléments manquants</FieldLabel>
              <textarea id="qualification-missing" name="missingElements" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2 text-base" />
            </Field>
          </>
        ) : null}
        {decision === "reject" && waiting ? (
          <Field>
            <FieldLabel htmlFor="qualification-reference">Référence de la réponse</FieldLabel>
            <input id="qualification-reference" name="dgiReference" required maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
          </Field>
        ) : null}
        {decision === "confirm" ? (
          <>
            <Field>
              <FieldLabel htmlFor="qualification-finding">Constat</FieldLabel>
              <NativeSelect id="qualification-finding" name="finding" value={finding} onChange={(event) => setFinding(event.target.value)} aria-label="Constat">
                <NativeSelectOption value="non-normalized">Facture non normalisée</NativeSelectOption>
                <NativeSelectOption value="unknown-seller">Vendeur non identifié</NativeSelectOption>
                <NativeSelectOption value="fake-invoice">Facture ou code non authentique</NativeSelectOption>
                <NativeSelectOption value="understated">Facture minorée</NativeSelectOption>
                <NativeSelectOption value="missing-transmission">Défaut d’enregistrement ou de transmission</NativeSelectOption>
                {waiting ? <NativeSelectOption value="refusal">Refus de facture</NativeSelectOption> : null}
              </NativeSelect>
            </Field>
            {answer ? (
              <>
                <input type="hidden" name="proof" value="authority" />
                <p className="text-sm">Réponse de la DGI</p>
                <Field>
                  <FieldLabel htmlFor="qualification-reference">Référence de la réponse</FieldLabel>
                  <input id="qualification-reference" name="dgiReference" required maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
                </Field>
              </>
            ) : (
            <Field>
              <FieldLabel htmlFor="qualification-proof">Niveau de preuve</FieldLabel>
              <NativeSelect id="qualification-proof" name="proof" defaultValue={registerOnly ? "register" : "photo"} key={finding} aria-label="Niveau de preuve">
                {registerOnly ? null : <NativeSelectOption value="photo">Photo suffisante</NativeSelectOption>}
                <NativeSelectOption value="register">Vérification manuelle</NativeSelectOption>
              </NativeSelect>
            </Field>
            )}
            {answer ? null : <fieldset className="grid gap-3">
              <legend className="text-sm font-bold">Corriger les données lues</legend>
              <Field>
                <FieldLabel htmlFor="qualification-seller">Vendeur</FieldLabel>
                <input id="qualification-seller" name="sellerName" maxLength={160} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="qualification-tax">NIF</FieldLabel>
                <input id="qualification-tax" name="sellerTaxId" maxLength={40} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="qualification-date">Date</FieldLabel>
                <input id="qualification-date" name="issuedOn" type="date" className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="qualification-amount">Montant</FieldLabel>
                <input id="qualification-amount" name="amount" maxLength={40} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="qualification-number">Numéro</FieldLabel>
                <input id="qualification-number" name="documentNumber" maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="qualification-code">Code</FieldLabel>
                <input id="qualification-code" name="code" maxLength={80} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" />
              </Field>
            </fieldset>}
          </>
        ) : null}
        <Field>
          <FieldLabel htmlFor="qualification-justification">Motif</FieldLabel>
          <textarea
            id="qualification-justification"
            name="justification"
            required
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--fin-focus)]"
          />
        </Field>
        <Button type="submit" disabled={pending}>Enregistrer la qualification</Button>
        {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
