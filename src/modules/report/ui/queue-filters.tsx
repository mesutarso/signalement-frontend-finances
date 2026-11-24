import { FilterBar, FilterDateRange } from "@/components/filter-bar";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Assignee } from "@/modules/report/model/report";
import { REPORT_STATUS_FILTERS } from "@/modules/report/model/assessment";
import { workParams, type WorkFilters } from "@/modules/report/model/work-filters";

const choices = {
  validation: REPORT_STATUS_FILTERS,
  scope: [["all", "Tous les dossiers"], ["mine", "Les miens"], ["unassigned", "Non affectés"]],
  state: [["", "Toutes les affectations"], ["pending", "Non affectés"], ["assigned", "Affectés"]],
  vat: [["", "Tous"], ["unknown", "À confirmer"], ["registered", "Assujetti"], ["unregistered", "Non assujetti"]],
  reading: [["", "Toutes"], ["pending", "En attente"], ["done", "Terminée"], ["failed", "À reprendre"], ["unreadable", "Photo illisible"]],
  missing: [["", "Tous les dossiers"], ["any", "Informations manquantes"], ["nif", "NIF manquant"], ["number", "Numéro manquant"], ["date", "Date manquante"]],
  duplicates: [["", "Tous"], ["open", "À trancher"], ["confirmed", "Confirmés"], ["none", "Sans rapprochement"]],
  photoRequest: [["", "Toutes"], ["open", "Nouvelle photo attendue"], ["linked", "Photo reçue"], ["none", "Aucune relance en cours"]],
  sort: [["newest", "Plus récents"], ["oldest", "Plus anciens"], ["seller", "Établissement"], ["invoice", "Numéro de facture"], ["status", "Statut"]],
} as const;

function SelectFilter({ name, label, filters }: { name: keyof typeof choices; label: string; filters: WorkFilters }) {
  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor={`filter-${name}`}>{label}</FieldLabel>
      <NativeSelect className="w-full" id={`filter-${name}`} name={name} defaultValue={filters[name] || choices[name][0][0]}>
        {choices[name].map(([value, text]) => <NativeSelectOption key={value} value={value}>{text}</NativeSelectOption>)}
      </NativeSelect>
    </Field>
  );
}

function SearchFilter({ value }: { value?: string }) {
  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor="report-search">Recherche</FieldLabel>
      <Input id="report-search" name="q" type="search" defaultValue={value} placeholder="Établissement, NIF, facture…" />
    </Field>
  );
}

function AgentFilter({ agents, value }: { agents: Assignee[]; value?: string }) {
  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor="report-agent">Agent</FieldLabel>
      <NativeSelect className="w-full" id="report-agent" name="agent" defaultValue={value}>
        <NativeSelectOption value="">Tous les agents</NativeSelectOption>
        {agents.map((agent) => <NativeSelectOption key={agent.id} value={agent.id}>{agent.username}</NativeSelectOption>)}
      </NativeSelect>
    </Field>
  );
}

function SignalementFilters({ filters, agents }: { filters: WorkFilters; agents: Assignee[] }) {
  const { q, validation, start, end, agent, sort } = filters;
  const activeSort = sort && sort !== "newest" ? sort : "";
  const advancedCount = Number(Boolean(start || end)) + Number(Boolean(agent)) + Number(Boolean(activeSort));
  const active = workParams({
    q, start, end, agent, sort: activeSort, validation: validation === "all" ? "" : validation,
  });

  return (
    <FilterBar
      key={active.toString()}
      action="/signalements"
      label="Filtres des signalements"
      secondary={<SelectFilter name="validation" label="Statut" filters={filters} />}
      clearHref={active.size ? "/signalements" : undefined}
      advanced={{
        count: advancedCount,
        fields: (
          <FieldGroup className="grid items-end gap-3 @sm:grid-cols-2 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <FilterDateRange
              from={{ name: "start", value: start }}
              to={{ name: "end", value: end }}
              className="@sm:col-span-2 @3xl:col-span-1"
            />
            <SelectFilter name="sort" label="Trier par" filters={filters} />
            <AgentFilter agents={agents} value={agent} />
          </FieldGroup>
        ),
      }}
    >
      <SearchFilter value={q} />
    </FilterBar>
  );
}

const dossierAdvancedFilters = ["agent", "state", "vat", "reading", "missing", "duplicates", "photoRequest"] as const;

export async function QueueFilters({ filters, assignees, validatedOnly }: { filters: WorkFilters; assignees: Assignee[] | Promise<Assignee[]>; validatedOnly: boolean }) {
  const agents = await assignees;
  if (!validatedOnly) return <SignalementFilters filters={filters} agents={agents} />;

  const { scope = "all", q, sort, start, end } = filters;
  const advancedCount = Number(Boolean(start || end)) + Number(Boolean(sort && sort !== "newest"))
    + dossierAdvancedFilters.filter((name) => filters[name]).length;
  const hasFilters = Boolean(q || advancedCount || scope !== "all");

  return (
    <FilterBar
      key={workParams({ ...filters, page: "" }).toString()}
      action="/dossiers-valides"
      label="Filtres des dossiers validés"
      secondary={<SelectFilter name="scope" label="Affectation" filters={filters} />}
      clearHref={hasFilters ? "/dossiers-valides" : undefined}
      advanced={{
        count: advancedCount,
        fields: (
          <FieldGroup className="grid items-end gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
            <FilterDateRange
              from={{ name: "start", value: start }}
              to={{ name: "end", value: end }}
              className="@sm:col-span-2"
            />
            <SelectFilter name="sort" label="Trier par" filters={filters} />
            <AgentFilter agents={agents} value={filters.agent} />
            <SelectFilter name="state" label="État d’affectation" filters={filters} />
            <SelectFilter name="vat" label="Assujettissement TVA" filters={filters} />
            <SelectFilter name="reading" label="Lecture des pièces" filters={filters} />
            <SelectFilter name="missing" label="Informations à compléter" filters={filters} />
            <SelectFilter name="duplicates" label="Doublons" filters={filters} />
            <SelectFilter name="photoRequest" label="Relance photo" filters={filters} />
          </FieldGroup>
        ),
      }}
    >
      <SearchFilter value={q} />
    </FilterBar>
  );
}
