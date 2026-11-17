"use client";

import { useActionState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { assignReport } from "@/modules/report/actions/assign-report";
import type { Assignee } from "@/modules/report/model/report";

export function AssignmentForm({
  reportId,
  version,
  assigneeId,
  assignees,
}: {
  reportId: string;
  version: number;
  assigneeId: string | null;
  assignees: Assignee[];
}) {
  const [message, submit, pending] = useActionState(assignReport, null);

  return (
    <form key={`${version}:${assigneeId ?? ""}`} action={submit} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="version" value={version} />
      <FieldGroup>
      <Field>
      <FieldLabel htmlFor="assignment-agent">Agent</FieldLabel>
      <NativeSelect id="assignment-agent" name="assigneeId" defaultValue={assigneeId ?? ""} aria-label="Agent">
        <NativeSelectOption value="">Retirer l’affectation</NativeSelectOption>
        {assignees.map((agent) => (
          <NativeSelectOption key={agent.id} value={agent.id}>
            {agent.username}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Enregistrer l’affectation
      </Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
