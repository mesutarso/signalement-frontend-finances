"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { decideReexamination } from "@/modules/report/actions/decide-reexamination";

export function ReexaminationDecisionForm({ id }: { id: string }) {
  const [message, action, pending] = useActionState(decideReexamination, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Field>
        <FieldLabel htmlFor={`reexamination-result-${id}`}>Décision</FieldLabel>
        <select id={`reexamination-result-${id}`} name="result" required className="h-11 rounded-md border border-input bg-card px-3">
          <option value="maintained">Maintenir</option>
          <option value="modified">Modifier</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`reexamination-comment-${id}`}>Commentaire</FieldLabel>
        <input id={`reexamination-comment-${id}`} name="comment" maxLength={500} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending}>Enregistrer la décision</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
