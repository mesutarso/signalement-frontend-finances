"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
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
  const filtered = Boolean(q || state || priority);
  return (
    <form
      key={`${q}|${state}|${priority}|${scope}`}
      className="flex flex-wrap items-center gap-2"
      action="/signalements"
      method="get"
    >
      <input type="hidden" name="scope" value={scope} />
      <div className="relative min-w-64 flex-1">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder="Référence, titre ou description" aria-label="Recherche" className="h-10 pl-9" />
      </div>
      <NativeSelect name="state" size="sm" defaultValue={state} aria-label="État" className="w-[calc(50%-0.25rem)] sm:w-40" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <NativeSelectOption value="">Tous les états</NativeSelectOption>
        <NativeSelectOption value="pending">À traiter</NativeSelectOption>
        <NativeSelectOption value="assigned">Affecté</NativeSelectOption>
      </NativeSelect>
      <NativeSelect name="priority" size="sm" defaultValue={priority} aria-label="Priorité" className="w-[calc(50%-0.25rem)] sm:w-44" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <NativeSelectOption value="">Toutes les priorités</NativeSelectOption>
        <NativeSelectOption value="unset">Non définie</NativeSelectOption>
        <NativeSelectOption value="urgent">Urgente</NativeSelectOption>
        <NativeSelectOption value="high">Haute</NativeSelectOption>
        <NativeSelectOption value="normal">Normale</NativeSelectOption>
        <NativeSelectOption value="low">Faible</NativeSelectOption>
      </NativeSelect>
      <Button type="submit" variant="outline">Rechercher</Button>
      {filtered ? <Button variant="ghost" nativeButton={false} render={<Link href={`/signalements?scope=${scope}`} />}>Effacer</Button> : null}
    </form>
  );
}
