import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Assignee } from "@/modules/report/model/report";
import { workParams, type WorkFilters } from "@/modules/report/model/work-filters";

const choices = {
  validation: [["all", "Tous les statuts"], ["doubt", "À vérifier"], ["completion", "À compléter"], ["queued", "Lecture en attente"], ["analyzing", "Lecture en cours"], ["validated", "Validés"], ["rejected", "Rejetés"], ["rejected-duplicate", "Doublons écartés"]],
  state: [["", "Toutes les affectations"], ["pending", "Non affectés"], ["assigned", "Affectés"]],
  vat: [["", "Tous"], ["unknown", "À confirmer"], ["registered", "Assujetti"], ["unregistered", "Non assujetti"]],
  reading: [["", "Toutes"], ["pending", "En attente"], ["done", "Terminée"], ["failed", "À reprendre"], ["unreadable", "Photo illisible"]],
  missing: [["", "Tous les dossiers"], ["any", "Informations manquantes"], ["nif", "NIF manquant"], ["number", "Numéro manquant"], ["date", "Date manquante"]],
  duplicates: [["", "Tous"], ["open", "À trancher"], ["confirmed", "Confirmés"], ["none", "Sans rapprochement"]],
  photoRequest: [["", "Toutes"], ["open", "Nouvelle photo attendue"], ["linked", "Photo reçue"], ["none", "Aucune relance en cours"]],
  sort: [["newest", "Plus récents"], ["oldest", "Plus anciens"], ["seller", "Établissement"], ["invoice", "Numéro de facture"], ["status", "Statut"]],
} as const;
function SelectFilter({ name, label, filters }: { name: keyof typeof choices; label: string; filters: WorkFilters }) {
  return <Field><FieldLabel htmlFor={`filter-${name}`}>{label}</FieldLabel><NativeSelect id={`filter-${name}`} name={name} defaultValue={filters[name] || (name === "sort" ? "newest" : name === "validation" ? "all" : "")}>
    {choices[name].map(([value, text]) => <NativeSelectOption key={value} value={value}>{text}</NativeSelectOption>)}
  </NativeSelect></Field>;
}
export function QueueFilters({ filters, assignees, agent }: { filters: WorkFilters; assignees: Assignee[]; agent: string }) {
  const advanced = ["start", "end", "vat", "reading", "missing", "duplicates", "photoRequest", "agent"].some(key=> Boolean(filters[key as keyof WorkFilters]));
  return <form action="/signalements" method="get" className="grid gap-4">
    <input type="hidden" name="scope" value={filters.scope || "all"} />
    <FieldGroup className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,2fr)_1fr_1fr_auto]">
      <Field><FieldLabel htmlFor="report-search">Rechercher</FieldLabel><Input id="report-search" name="q" defaultValue={filters.q} placeholder="Référence, établissement, NIF, facture…" /></Field>
      <SelectFilter name="validation" label="Statut" filters={filters} />
      <SelectFilter name="sort" label="Trier par" filters={filters} />
      <Button type="submit">Appliquer</Button>
    </FieldGroup>
    <details open={advanced || undefined} className="text-sm">
      <summary className="w-fit cursor-pointer py-2 font-medium">Filtres détaillés</summary>
      <FieldGroup className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field><FieldLabel htmlFor="report-start">Reçu à partir du</FieldLabel><Input id="report-start" name="start" type="date" defaultValue={filters.start} /></Field>
        <Field><FieldLabel htmlFor="report-end">Reçu jusqu’au</FieldLabel><Input id="report-end" name="end" type="date" defaultValue={filters.end} /></Field>
        <Field><FieldLabel htmlFor="report-agent">Agent</FieldLabel><NativeSelect id="report-agent" name="agent" defaultValue={agent}><NativeSelectOption value="">Tous les agents</NativeSelectOption>{assignees.map(a=><NativeSelectOption key={a.id} value={a.id}>{a.username}</NativeSelectOption>)}</NativeSelect></Field>
        <SelectFilter name="state" label="Affectation" filters={filters} />
        <SelectFilter name="vat" label="Assujettissement TVA" filters={filters} />
        <SelectFilter name="reading" label="Lecture des pièces" filters={filters} />
        <SelectFilter name="missing" label="Informations à compléter" filters={filters} />
        <SelectFilter name="duplicates" label="Doublons" filters={filters} />
        <SelectFilter name="photoRequest" label="Relance photo" filters={filters} />
      </FieldGroup>
    </details>
    {workParams(filters).size > 1 ? <Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href={`/signalements?scope=${filters.scope || "all"}`} />}>Effacer les filtres</Button> : null}
  </form>;
}
