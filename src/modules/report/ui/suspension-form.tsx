"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ReportPicker } from "@/modules/report/ui/report-picker";
import { recordSuspension } from "@/modules/report/actions/record-suspension";

export function SuspensionForm({ action, label }: { action: "suspended" | "restored"; label: string }) {
  const [message, submit, pending] = useActionState(recordSuspension, null);
  return (
    <form action={submit} className="grid gap-3">
      <input type="hidden" name="action" value={action} />
      <ReportPicker />
      <Field>
        <FieldLabel htmlFor={`suspension-reason-${action}`}>Motif</FieldLabel>
        <textarea id={`suspension-reason-${action}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
      </Field>
      <Button type="submit" disabled={pending}>{label}</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
