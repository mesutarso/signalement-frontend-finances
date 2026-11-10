"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { routeLetter, dispatchLetter } from "@/modules/report/actions/route-letter";

export function LetterRoutingForm() {
  const [message, action, pending] = useActionState(routeLetter, null);
  return <form action={action}><FieldGroup>
    <Field><FieldLabel htmlFor="route-tax">NIF</FieldLabel><Input id="route-tax" name="taxId" maxLength={40} required /></Field>
    <Field><FieldLabel htmlFor="route-service">Service opérationnel destinataire</FieldLabel><Input id="route-service" name="service" maxLength={160} required /></Field>
    <Button type="submit" disabled={pending}>Enregistrer le service</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}

export function LetterDispatchForm({ letterId }: { letterId: string }) {
  const [message, action, pending] = useActionState(dispatchLetter, null);
  return <form action={action}><FieldGroup>
    <input type="hidden" name="letterId" value={letterId} />
    <Field><FieldLabel htmlFor="dispatch-date">Date de l’envoi</FieldLabel><Input id="dispatch-date" name="sentOn" type="date" required /></Field>
    <Field><FieldLabel htmlFor="dispatch-reference">Référence du bordereau</FieldLabel><Input id="dispatch-reference" name="reference" maxLength={160} required /></Field>
    <Button type="submit" disabled={pending}>Enregistrer l’envoi</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}
