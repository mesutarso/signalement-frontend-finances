"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { organizeDraw } from "@/modules/report/actions/organize-draw";
import { prepareDrawTickets } from "@/modules/report/actions/prepare-draw-tickets";

export function PrepareTicketsForm() {
  const [message, action, pending] = useActionState(prepareDrawTickets, null);
  return (
    <form action={action} className="grid gap-3">
      <Field>
        <FieldLabel htmlFor="ticket-month">Mois</FieldLabel>
        <input id="ticket-month" name="month" type="month" required className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      <Button type="submit" disabled={pending}>Retenir les tickets</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

export function OrganizeDrawForm({ kind }: { kind: "monthly" | "final" }) {
  const [message, action, pending] = useActionState(organizeDraw, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="kind" value={kind} />
      {kind === "monthly" ? (
        <Field>
          <FieldLabel htmlFor="draw-month">Mois</FieldLabel>
          <input id="draw-month" name="month" type="month" required className="h-11 rounded-md border border-input bg-card px-3" />
        </Field>
      ) : null}
      <Field>
        <FieldLabel htmlFor={`draw-witness-${kind}`}>Témoin</FieldLabel>
        <input id={`draw-witness-${kind}`} name="witness" required maxLength={160} className="h-11 rounded-md border border-input bg-card px-3" />
      </Field>
      {kind === "monthly" ? (
        <>
          <Quantity kind={kind} id="campaign" label="Articles de campagne" />
          <Quantity kind={kind} id="intermediate" label="Lots intermédiaires" />
          <Quantity kind={kind} id="motorcycles" label="Motos" />
        </>
      ) : (
        <>
          <Quantity kind={kind} id="cars" label="Voitures" />
          <Quantity kind={kind} id="motorcycles" label="Motos" />
        </>
      )}
      <Button type="submit" disabled={pending}>{kind === "monthly" ? "Tirer au sort le mois" : "Tirer au sort la finale"}</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}

function Quantity({ kind, id, label }: { kind: string; id: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={`draw-${kind}-${id}`}>{label}</FieldLabel>
      <input id={`draw-${kind}-${id}`} name={id} type="number" min={0} max={100} defaultValue={0} className="h-11 rounded-md border border-input bg-card px-3" />
    </Field>
  );
}
