"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
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

const FIELD = "h-11 w-full rounded-md border border-input bg-card px-3 text-base md:text-[15px]";
const AREA = "w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground md:text-[15px]";

const DECISIONS = [
  ["confirm", "Retenir le constat"],
  ["reject", "Écarter le signalement"],
  ["wait", "Attendre la confirmation de la DGI"],
] as const;

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
    <section aria-labelledby="report-qualification" className="grid gap-5">
      <h3 id="report-qualification" className="sr-only">Qualification</h3>
      {current?.decision === "wait" ? <p className="rounded-md bg-warning-soft px-3 py-2.5 text-sm text-warning">En attente de confirmation de la DGI.</p> : null}
      {canDecide ? <QualificationForm reportId={reportId} waiting={current?.decision === "wait"} latestId={current?.id ?? null} /> : null}
      {current ? (
        <div className="grid gap-1">
          <h4 className="text-[13px] text-muted-foreground">Décisions enregistrées</h4>
          <ol className="border-t">
            <li><QualificationCard entry={current} current /></li>
            {qualifications.slice(1).map((entry) => <li key={entry.id}><QualificationCard entry={entry} current={false} /></li>)}
          </ol>
        </div>
      ) : <p className="text-sm text-muted-foreground">Aucune qualification.</p>}
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
    <article className="grid gap-1 border-b py-4 text-sm leading-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold">{qualificationDecisionLabel(entry.decision)}{current ? "" : <span className="font-normal text-muted-foreground"> · décision précédente</span>}</p>
        <p className="text-[13px] text-muted-foreground">{reportedAtLabel(entry.recordedAt)}</p>
      </div>
      {finding ? <p>{finding}{proof ? <span className="text-muted-foreground"> · {proof}</span> : ""}</p> : null}
      {entry.missingElements ? <p>Éléments manquants : {entry.missingElements}</p> : null}
      {entry.dgiReference ? <p>Référence de la DGI : {entry.dgiReference}</p> : null}
      <p>{entry.justification}</p>
      {corrections.length > 0 ? <p className="text-muted-foreground">Données corrigées : {corrections.join(", ")}.</p> : null}
      <p className="text-[13px] text-muted-foreground">Par {entry.actorName ?? "Compte introuvable"}</p>
    </article>
  );
}

function QualificationForm({ reportId, waiting, latestId }: { reportId: string; waiting: boolean; latestId: string | null }) {
  const [message, action, pending] = useActionState(recordQualification, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Le formulaire ne se vide que lorsqu'une nouvelle décision est réellement enregistrée.
  useEffect(() => {
    formRef.current?.reset();
  }, [latestId]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  const [decision, setDecision] = useState("confirm");
  const [finding, setFinding] = useState("non-normalized");
  const answer = waiting && decision === "confirm" && finding === "refusal";
  const registerOnly = finding !== "non-normalized";
  return (
    <form ref={formRef} action={action} onSubmit={submit} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <FieldGroup>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[13px] leading-none font-medium">Décision</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {DECISIONS.map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-start gap-2.5 rounded-md border border-input p-3 text-sm leading-snug transition-colors hover:border-foreground has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--fin-focus)]">
                <input type="radio" name="decision" value={value} checked={decision === value} onChange={() => setDecision(value)} className="mt-0.5 outline-none" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {decision === "wait" ? (
          <>
            <input type="hidden" name="finding" value="refusal" />
            <input type="hidden" name="proof" value="pending" />
            <p className="text-sm text-muted-foreground">Refus de facture · Confirmation attendue</p>
            <Field>
              <FieldLabel htmlFor="qualification-missing">Éléments manquants</FieldLabel>
              <textarea id="qualification-missing" name="missingElements" required maxLength={500} rows={3} className={AREA} />
            </Field>
          </>
        ) : null}
        {decision === "reject" && waiting ? (
          <Field>
            <FieldLabel htmlFor="qualification-reference">Référence de la réponse</FieldLabel>
            <input id="qualification-reference" name="dgiReference" required maxLength={80} className={FIELD} />
          </Field>
        ) : null}
        {decision === "confirm" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="qualification-finding">Constat</FieldLabel>
                <NativeSelect id="qualification-finding" name="finding" value={finding} onChange={(event) => setFinding(event.target.value)} aria-label="Constat" className="w-full">
                  <NativeSelectOption value="non-normalized">Facture non normalisée</NativeSelectOption>
                  <NativeSelectOption value="unknown-seller">Vendeur non identifié</NativeSelectOption>
                  <NativeSelectOption value="fake-invoice">Facture ou code non authentique</NativeSelectOption>
                  <NativeSelectOption value="understated">Facture minorée</NativeSelectOption>
                  <NativeSelectOption value="missing-transmission">Défaut d’enregistrement ou de transmission</NativeSelectOption>
                  {waiting ? <NativeSelectOption value="refusal">Refus de facture</NativeSelectOption> : null}
                </NativeSelect>
              </Field>
              {answer ? (
                <Field>
                  <input type="hidden" name="proof" value="authority" />
                  <FieldLabel htmlFor="qualification-reference">Référence de la réponse</FieldLabel>
                  <input id="qualification-reference" name="dgiReference" required maxLength={80} className={FIELD} />
                  <p className="text-[13px] text-muted-foreground">Réponse de la DGI</p>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="qualification-proof">Niveau de preuve</FieldLabel>
                  <NativeSelect id="qualification-proof" name="proof" defaultValue={registerOnly ? "register" : "photo"} key={finding} aria-label="Niveau de preuve" className="w-full">
                    {registerOnly ? null : <NativeSelectOption value="photo">Photo suffisante</NativeSelectOption>}
                    <NativeSelectOption value="register">Vérification manuelle</NativeSelectOption>
                  </NativeSelect>
                </Field>
              )}
            </div>
            {answer ? null : (
              <details className="group/details border-y">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span>Corriger les données lues <span className="font-normal text-muted-foreground">(facultatif)</span></span>
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4 text-muted-foreground transition-transform group-open/details:rotate-180" />
                </summary>
                <fieldset className="grid gap-4 pb-4 sm:grid-cols-2">
                  <legend className="sr-only">Corriger les données lues</legend>
                  <Field>
                    <FieldLabel htmlFor="qualification-seller">Vendeur</FieldLabel>
                    <input id="qualification-seller" name="sellerName" maxLength={160} className={FIELD} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualification-tax">NIF</FieldLabel>
                    <input id="qualification-tax" name="sellerTaxId" maxLength={40} className={FIELD} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualification-date">Date</FieldLabel>
                    <input id="qualification-date" name="issuedOn" type="date" className={FIELD} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualification-amount">Montant</FieldLabel>
                    <input id="qualification-amount" name="amount" maxLength={40} className={FIELD} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualification-number">Numéro</FieldLabel>
                    <input id="qualification-number" name="documentNumber" maxLength={80} className={FIELD} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualification-code">Code</FieldLabel>
                    <input id="qualification-code" name="code" maxLength={80} className={FIELD} />
                  </Field>
                </fieldset>
              </details>
            )}
          </>
        ) : null}
        <Field>
          <FieldLabel htmlFor="qualification-justification">Motif</FieldLabel>
          <textarea id="qualification-justification" name="justification" required maxLength={500} rows={3} className={AREA} />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer la qualification"}</Button>
        {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
