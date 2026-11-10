import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { LetterRoutingForm } from "@/modules/report/ui/letter-routing-form";
import { ActionDialog } from "@/components/action-dialog";
import { PrepareLetterForm } from "@/modules/report/ui/prepare-letter-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ViewTabs } from "@/components/view-tabs";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Letter = {
  id: string;
  reference: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  recipient: string | null;
  reason: string | null;
  preparedAt: string;
  decidedAt: string | null;
};
type Page = { items: Letter[]; page: number; size: number; total: number };

const FILTERS = [
  { value: "all", label: "Tous" },
  { value: "waiting", label: "En attente de réponse" },
];

const STATUS: Record<string, string> = {
  draft: "Brouillon",
  validated: "Validé",
  returned: "Renvoyé",
};

export default function LettersPage({ searchParams }: PageProps<"/courriers">) {
  return <Suspense fallback={<PageSkeleton />}><Letters searchParams={searchParams} /></Suspense>;
}

async function Letters({ searchParams }: Pick<PageProps<"/courriers">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (account.role === "AGENT") {
    redirect("/signalements");
  }
  const params = await searchParams;
  const status = FILTERS.some((filter) => filter.value === params.status) ? String(params.status) : "all";
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const letters = await readJson<Page>(`/api/letters?status=${status}&page=${page}`).catch(() => null);
  const canPrepare = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const routes = canPrepare ? await readJson<{taxId: string; service: string}[]>("/api/letter-routes") : [];
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Courriers" actions={canPrepare ? <><ActionDialog label="Services destinataires" title="Affecter les entreprises aux services"><LetterRoutingForm />{routes.map(route => <p key={route.taxId} className="mt-3 text-sm">{route.taxId} · {route.service}</p>)}</ActionDialog><PrepareLetterForm /></> : undefined} />
      <div className="grid gap-5">
        <ViewTabs label="Filtrer les courriers" items={FILTERS.map((filter) => ({ href: `/courriers?status=${filter.value}`, label: filter.label, active: filter.value === status }))} />
        {!letters ? <Alert variant="destructive"><AlertTitle>Les courriers sont indisponibles. Actualisez la page.</AlertTitle></Alert> : letters.items.length === 0 ? <LedgerEmpty className="border-t-0">{status === "waiting" ? "Aucun courrier validé n'attend de réponse." : "Aucun courrier."}</LedgerEmpty> : (
          <div className="grid gap-5">
            <Ledger>
              {letters.items.map((letter) => (
                <LedgerItem
                  key={letter.id}
                  title={<Link className="ref text-sm font-medium underline-offset-4 hover:text-primary hover:underline" href={`/courriers/${letter.id}`}>{letter.reference}</Link>}
                  status={<Badge variant={letter.status === "validated" ? "success" : letter.status === "returned" ? "warning" : "outline"}>{STATUS[letter.status] ?? letter.status}</Badge>}
                >
                  <p>Semaine du {calendarLabel(letter.periodStart)} au {calendarLabel(letter.periodEnd)}</p>
                  <p className="text-muted-foreground">Préparé le {reportedAtLabel(letter.preparedAt)}.</p>
                  {letter.reason ? <p>Motif : {letter.reason}</p> : null}
                </LedgerItem>
              ))}
            </Ledger>
            <TablePagination page={letters.page} size={letters.size} total={letters.total} label="Pagination des courriers" />
          </div>
        )}
      </div>
    </Page>
  );
}
