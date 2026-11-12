"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { recordBudget, captureReport } from "@/modules/report/actions/campaign-reporting";

export function BudgetForm() {
  const [message, action, pending] = useActionState(recordBudget, null);
  return <form action={action}><FieldGroup>
    <Field><FieldLabel htmlFor="campaign-budget">Budget prévisionnel des récompenses en FC</FieldLabel><Input id="campaign-budget" name="amount" type="number" min={1} max={1000000000000} step={1} required /></Field>
    <Field><FieldLabel htmlFor="campaign-budget-reference">Référence de l’approbation du budget</FieldLabel><Input id="campaign-budget-reference" name="reference" maxLength={160} required /></Field>
    <Button type="submit" disabled={pending}>Enregistrer le budget</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}

export function CaptureReportForm() {
  const [message, action, pending] = useActionState(captureReport, null);
  return <form action={action}><FieldGroup>
    <Field><FieldLabel htmlFor="campaign-report-kind">Période close</FieldLabel><select id="campaign-report-kind" name="kind" className="h-11 rounded-md border border-input bg-card px-3"><option value="weekly">Dernière semaine</option><option value="monthly">Dernier mois</option></select></Field>
    <Button type="submit" disabled={pending}>Enregistrer le rapport</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}
