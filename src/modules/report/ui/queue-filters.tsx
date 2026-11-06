"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function QueueFilters({
  q,
  state,
  priority,
  scope,
}: {
  q: string;
  state: string;
  priority: string;
  scope: string;
}) {
  return (
    <form
      key={`${q}|${state}|${priority}|${scope}`}
      className="grid gap-3 md:grid-cols-5"
      action="/signalements"
      method="get"
    >
      <Input name="q" defaultValue={q} placeholder="Identifiant, titre, description" aria-label="Recherche" className="w-full" />
      <NativeSelect name="state" defaultValue={state} aria-label="État" className="w-full" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <NativeSelectOption value="">Tous les états</NativeSelectOption>
        <NativeSelectOption value="pending">À traiter</NativeSelectOption>
        <NativeSelectOption value="assigned">Affecté</NativeSelectOption>
      </NativeSelect>
      <NativeSelect name="priority" defaultValue={priority} aria-label="Priorité" className="w-full" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <NativeSelectOption value="">Toutes les priorités</NativeSelectOption>
        <NativeSelectOption value="unset">Non définie</NativeSelectOption>
        <NativeSelectOption value="urgent">Urgente</NativeSelectOption>
        <NativeSelectOption value="high">Haute</NativeSelectOption>
        <NativeSelectOption value="normal">Normale</NativeSelectOption>
        <NativeSelectOption value="low">Faible</NativeSelectOption>
      </NativeSelect>
      <NativeSelect name="scope" defaultValue={scope} aria-label="Affectation" className="w-full" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <NativeSelectOption value="all">Tous</NativeSelectOption>
        <NativeSelectOption value="mine">Les miens</NativeSelectOption>
        <NativeSelectOption value="unassigned">Non affectés</NativeSelectOption>
      </NativeSelect>
      <Button type="submit">Rechercher</Button>
    </form>
  );
}
