import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FilterBar, FilterDateRange } from "@/components/filter-bar";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { readOutcome } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { exceptionDate, exceptionPeriodQuery, type ExceptionPage } from "@/modules/report/model/exception-regime";
import { ExceptionRegimeTable } from "@/modules/report/ui/exception-regime-table";

const ROUTE = "/regime-exception";

export default function ExceptionRegimePage({ searchParams }: PageProps<"/regime-exception">) {
  return <Suspense fallback={<PageSkeleton />}><ExceptionRegime searchParams={searchParams} /></Suspense>;
}

async function ExceptionRegime({ searchParams }: Pick<PageProps<"/regime-exception">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (account.role !== "ADMINISTRATOR") redirect("/");
  const params = await searchParams;
  const period = { start: exceptionDate(params.start), end: exceptionDate(params.end) };
  const query = exceptionPeriodQuery(period);
  const number = Number(params.page ?? 0);
  query.set("page", String(Number.isInteger(number) && number >= 0 && number <= 2147483647 ? number : 0));
  const invalidDates = (params.start && !period.start) || (params.end && !period.end);
  const result = invalidDates ? { ok: false as const, message: "Indiquez des dates valides." }
    : await readOutcome<ExceptionPage>(`/api/exception-regime?${query}`)
      .catch(() => ({ ok: false as const, message: "Les signalements sont indisponibles. Actualisez la page." }));
  return (
    <Page className="max-w-7xl">
      <PageHeader title="Régime d’exception" actions={result.ok && result.body.environment === "sandbox"
        ? <Badge variant="warning">Mode test Araka</Badge> : undefined} />
      <PageSection className="min-w-0" title="Signalements enregistrés">
        <FilterBar key={exceptionPeriodQuery(period).toString()} action={ROUTE} label="Filtrer par date de signalement" clearHref={ROUTE}>
          <FilterDateRange from={{ name: "start", value: period.start }} to={{ name: "end", value: period.end }} />
        </FilterBar>
        {result.ok
          ? <ExceptionRegimeTable key={exceptionPeriodQuery(period).toString()} data={result.body} period={period} />
          : <Alert variant="destructive"><AlertTitle>{result.message}</AlertTitle></Alert>}
      </PageSection>
    </Page>
  );
}
