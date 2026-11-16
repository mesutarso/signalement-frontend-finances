"use client";

import { useActionState, useId, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { recordModel } from "@/modules/report/actions/record-model";
import { editablePattern, previewMessage, REFERENCE_MARKER, SMS_LIMIT, storedPattern } from "@/modules/report/model/message";

export function ModelForm({ kind, body, referenceLength }: { kind: string; body: string; referenceLength: number }) {
  const [message, action, pending] = useActionState(recordModel, null);
  const [text, setText] = useState(editablePattern(body));
  const id = useId();
  const preview = previewMessage(text.trim(), referenceLength);
  const markers = storedPattern(text).split("%s").length - 1;
  const multiline = /[\u0000-\u001f\u007f-\u009f]/u.test(text);
  const invalid = markers !== 1 || preview.length > SMS_LIMIT || !text.trim() || multiline;
  return <form action={action} className="grid gap-3" aria-label="Modifier le modèle SMS">
    <input type="hidden" name="kind" value={kind} />
    <FieldGroup>
      <Field data-invalid={invalid} data-disabled={pending}>
        <FieldLabel htmlFor={`${id}-body`}>Texte du SMS</FieldLabel>
        <textarea id={`${id}-body`} name="body" required maxLength={SMS_LIMIT} rows={4}
          value={text} onChange={event => setText(event.target.value)} disabled={pending}
          aria-describedby={`${id}-counter`} aria-invalid={invalid}
          className="w-full rounded-md border border-input bg-card px-3 py-2" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" size="sm" variant="ghost" disabled={pending || markers > 0} onClick={() => setText(value => `${value}${value.endsWith(" ") ? "" : " "}${REFERENCE_MARKER}`)}>Insérer la référence</Button>
          <p id={`${id}-counter`} role="status" className={cn("text-xs tabular-nums", preview.length > SMS_LIMIT ? "text-destructive" : "text-muted-foreground")}>{preview.length}/100 caractères, référence comprise</p>
        </div>
        {multiline ? <p className="text-sm text-destructive">Gardez le SMS sur une seule ligne.</p> : null}
        {markers !== 1 ? <p className="text-sm text-destructive">Insérez la référence une seule fois.</p> : null}
      </Field>
      <div className="grid gap-1 rounded-md bg-muted p-3 text-sm" aria-label="Aperçu du SMS">
        <p className="font-medium">Aperçu</p><p className="break-words">{preview}</p>
      </div>
      <Button type="submit" disabled={pending || invalid} className="w-fit">{pending ? "Enregistrement…" : "Enregistrer"}</Button>
    </FieldGroup>
    {message ? <p role="status" className={cn("text-sm", message.saved ? "text-primary" : "text-destructive")}>{message.message}</p> : null}
  </form>;
}
