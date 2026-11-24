"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { findReports } from "@/modules/report/actions/find-report";
import { reportedAtLabel } from "@/modules/report/model/report";

type Matches = NonNullable<Awaited<ReturnType<typeof findReports>>>;

export function ReportPicker({ name = "reference", label = "Signalement", excludeId, idAsValue = false }: {
  name?: string;
  label?: string;
  excludeId?: string;
  idAsValue?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Matches | null>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState(false);
  const [pending, startSearch] = useTransition();
  const options = matches?.reports.filter(report => report.id !== excludeId) ?? [];

  function search() {
    if (pending || query.trim().length < 2) return;
    setSelected("");
    startSearch(async () => {
      const result = await findReports(query);
      setMatches(result);
      setError(result === null);
    });
  }

  return (
    <div className="grid min-w-0 gap-2">
      <Field>
        <FieldLabel htmlFor={`${id}-query`}>Rechercher un signalement</FieldLabel>
        <div className="flex gap-2">
          <Input id={`${id}-query`} type="search" value={query} maxLength={80} disabled={pending}
            placeholder="Déclarant, établissement ou facture"
            onChange={event => {
              setQuery(event.target.value);
              setSelected("");
              setMatches(null);
              setError(false);
            }}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                search();
              }
            }} className="min-w-0" />
          <Button type="button" variant="outline" disabled={pending || query.trim().length < 2} onClick={search}>
            {pending ? "Recherche…" : "Rechercher"}
          </Button>
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-report`}>{label}</FieldLabel>
        <NativeSelect id={`${id}-report`} name={name} required value={selected}
          onChange={event => setSelected(event.target.value)} className="w-full">
          <NativeSelectOption value="" disabled>Choisir un signalement</NativeSelectOption>
          {options.map(report => (
            <NativeSelectOption key={report.id} value={idAsValue ? report.id : `id:${report.id}`}>
              {[report.name, report.title, reportedAtLabel(report.date)].filter(Boolean).join(" · ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      {error ? <p role="alert" className="text-sm text-destructive">La recherche est indisponible.</p>
        : matches && options.length === 0 ? <p role="status" className="text-sm text-muted-foreground">Aucun signalement trouvé.</p>
        : matches && matches.total > matches.reports.length ? (
          <p role="status" className="text-sm text-muted-foreground">Affinez la recherche si le signalement n’apparaît pas.</p>
        ) : null}
    </div>
  );
}
