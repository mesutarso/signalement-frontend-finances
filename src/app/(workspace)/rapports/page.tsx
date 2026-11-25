import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FilterBar, FilterDateRange } from "@/components/filter-bar";
import { LedgerEmpty } from "@/components/ledger";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { TablePagination } from "@/components/table-pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readOutcome } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { pageIndex, type ListPage } from "@/modules/report/model/administration";
import {
  OPERATIONAL_STATUSES,
  operationalReportQuery,
  type OperationalReportOptions,
  type OperationalReportRow,
} from "@/modules/report/model/operational-report";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";

export default function ReportsPage({ searchParams }: PageProps<"/rapports">) {
  return <Suspense fallback={<PageSkeleton />}><Reports searchParams={searchParams} /></Suspense>;
}

async function Reports({ searchParams }: Pick<PageProps<"/rapports">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!can(account, "report.export")) redirect("/signalements");

  const params = await searchParams;
  const query = operationalReportQuery(key => params[key]);
  const previewQuery = new URLSearchParams(query);
  previewQuery.set("page", String(pageIndex(params.page)));
  const [preview, options] = await Promise.all([
    readOutcome<ListPage<OperationalReportRow>>(`/api/operational-reports?${previewQuery}`).catch(() => null),
    readOutcome<OperationalReportOptions>("/api/operational-reports/options").catch(() => null),
  ]);
  const service = query.get("service") ?? "";
  const finding = query.get("finding") ?? "";
  const status = query.get("status") ?? "validated";
  const services = new Set(options?.ok ? options.body.services : []);
  const noConfiguredServices = options?.ok && options.body.services.length === 0;
  const findings = new Set(options?.ok ? options.body.findings : []);
  if (service) services.add(service);
  if (finding) findings.add(finding);
  const hasFilters = query.size > 1 || status !== "validated";
  const canOpen = can(account, "report.read");

  return (
    <Page>
      <PageHeader title="Rapports de signalements" actions={preview?.ok && preview.body.total > 0 ? (
        <Button nativeButton={false} render={<a href={`/rapports/export?${query}`} download />}>Télécharger le CSV</Button>
      ) : null} />
      <FilterBar key={query.toString()} action="/rapports" label="Filtres des rapports" clearHref={hasFilters ? "/rapports" : undefined}>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field className="min-w-0">
            <FieldLabel htmlFor="report-company">Entreprise ou NIF</FieldLabel>
            <Input id="report-company" name="company" type="search" defaultValue={query.get("company") ?? ""} />
          </Field>
          <Field className="min-w-0">
            <FieldLabel htmlFor="report-service">Service opérationnel</FieldLabel>
            <NativeSelect id="report-service" name="service" defaultValue={service} className="w-full"
              aria-describedby={noConfiguredServices ? "report-service-help" : undefined}>
              <NativeSelectOption value="">Tous les services</NativeSelectOption>
              {[...services].map(name => <NativeSelectOption key={name} value={name}>{name}</NativeSelectOption>)}
            </NativeSelect>
            {noConfiguredServices ? (
              <FieldDescription id="report-service-help">
                Aucun service rattaché à une entreprise.
                {can(account, "letter.dispatch") ? <> <Link href="/courriers">Gérer les rattachements</Link></> : null}
              </FieldDescription>
            ) : null}
          </Field>
          <Field className="min-w-0">
            <FieldLabel htmlFor="report-status">Statut</FieldLabel>
            <NativeSelect id="report-status" name="status" defaultValue={status} className="w-full">
              <NativeSelectOption value="all">Tous les statuts</NativeSelectOption>
              {Object.entries(OPERATIONAL_STATUSES).map(([code, label]) => <NativeSelectOption key={code} value={code}>{label}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field className="min-w-0">
            <FieldLabel htmlFor="report-finding">Type de signalement</FieldLabel>
            <NativeSelect id="report-finding" name="finding" defaultValue={finding} className="w-full">
              <NativeSelectOption value="">Tous les types</NativeSelectOption>
              {[...findings].map(code => <NativeSelectOption key={code} value={code}>{findingLabel(code)}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <FilterDateRange legend="Date de réception" from={{ name: "from", value: query.get("from") ?? "" }}
            to={{ name: "to", value: query.get("to") ?? "" }} />
        </div>
      </FilterBar>
      {!options?.ok ? <Alert><AlertTitle>Les options de service et de type sont temporairement indisponibles.</AlertTitle></Alert> : null}
      <PageSection title="Aperçu">
        {!preview?.ok ? <Alert variant="destructive"><AlertTitle>{preview?.message ?? "Le rapport est indisponible."}</AlertTitle></Alert>
          : !preview.body.items.length ? <LedgerEmpty>Aucun signalement ne correspond aux filtres.</LedgerEmpty>
          : (
            <>
              <Table aria-label="Aperçu des signalements du rapport">
                <TableHeader><TableRow>
                  <TableHead>Reçu le</TableHead><TableHead>Entreprise / NIF</TableHead><TableHead>Service opérationnel</TableHead>
                  <TableHead>Statut</TableHead><TableHead>Type de signalement</TableHead><TableHead>Facture</TableHead><TableHead>Montant TTC</TableHead>
                  {canOpen ? <TableHead><span className="sr-only">Accès au signalement</span></TableHead> : null}
                </TableRow></TableHeader>
                <TableBody>{preview.body.items.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="whitespace-nowrap">{reportedAtLabel(report.receivedAt)}</TableCell>
                    <TableCell>
                      <p className="font-medium">{report.company ?? "Entreprise non renseignée"}</p>
                      <p className="text-xs text-muted-foreground">{report.taxId ?? "NIF non renseigné"}</p>
                    </TableCell>
                    <TableCell>{report.service ?? "Non rattaché"}</TableCell>
                    <TableCell><Badge variant={report.status === "validated" ? "success" : "secondary"}>{OPERATIONAL_STATUSES[report.status]}</Badge></TableCell>
                    <TableCell>{findingLabel(report.finding) ?? "—"}</TableCell>
                    <TableCell>
                      <p>{report.invoiceNumber ?? "—"}</p>
                      {report.invoiceDate ? <p className="text-xs text-muted-foreground">{calendarLabel(report.invoiceDate)}</p> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{[report.amount, report.currency].filter(Boolean).join(" ") || "—"}</TableCell>
                    {canOpen ? <TableCell><Link href={`/signalements/${report.id}`} className="font-medium text-primary hover:underline">Ouvrir</Link></TableCell> : null}
                  </TableRow>
                ))}</TableBody>
              </Table>
              <TablePagination page={preview.body.page} size={preview.body.size} total={preview.body.total} label="Pagination des signalements du rapport" />
            </>
          )}
      </PageSection>
    </Page>
  );
}
