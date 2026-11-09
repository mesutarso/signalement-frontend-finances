import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { AbuseNoteForm } from "@/modules/report/ui/abuse-note-form";
import { SuspensionForm } from "@/modules/report/ui/suspension-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type IndexReport = { id: string; identifier: string; reportedAt: string };
type Index = {
  fingerprint: string;
  reportCount: number;
  reports: IndexReport[];
  explanation: string;
  status: string;
  reason: string | null;
  actorName: string | null;
  recordedAt: string | null;
};
type IndexedReport = { id: string; reference: string };
type Series = { reportedOn: string; reportCount: number; reports: IndexedReport[]; explanation: string };
type Accounts = { accountCount: number; reportCount: number; reports: IndexedReport[]; explanation: string };
type Suspension = { reference: string; action: string; reason: string; recordedAt: string };
type Page = { indices: Index[]; series: Series[]; accounts: Accounts[]; retouch: string; score: string; page: number; size: number; total: number };

const STATUS: Record<string, string> = {
  open: "À examiner",
  noted: "Noté",
  dismissed: "Écarté",
};

export default function IndicesPage({ searchParams }: PageProps<"/indices">) {
  return <Suspense fallback={<PageSkeleton />}><Indices searchParams={searchParams} /></Suspense>;
}

async function Indices({ searchParams }: Pick<PageProps<"/indices">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (account.role === "AGENT") {
    redirect("/signalements");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const indices = await readJson<Page>(`/api/abuse-indices?page=${page}`).catch(() => null);
  const suspensions = await readJson<{ items: Suspension[] }>("/api/prime-suspensions").catch(() => null);
  const canNote = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Indices"
        description="Un indice n'est pas une preuve de fraude. La suspension du droit aux primes est une décision séparée. Une prime déjà payée n'est pas reprise."
      >
        {indices ? <p className="text-[13px] leading-5 text-muted-foreground">{indices.retouch} {indices.score}</p> : null}
      </PageHeader>
      {!indices ? <Alert variant="destructive"><AlertTitle>Les indices sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <PageSection title="Images partagées">
            {indices.indices.length === 0 ? <LedgerEmpty>Aucune image partagée.</LedgerEmpty> : (
              <div className="grid gap-5">
                <Ledger>
                  {indices.indices.map((index) => (
                    <LedgerItem
                      key={index.fingerprint}
                      title={`${index.reportCount} signalements`}
                      status={<Badge variant={index.status === "open" ? "warning" : index.status === "noted" ? "secondary" : "outline"}>{STATUS[index.status] ?? index.status}</Badge>}
                      action={canNote ? <ActionDialog label="Statuer" title="Statuer sur l'indice" description={`${index.reportCount} signalements`} variant="default" size="sm"><AbuseNoteForm fingerprint={index.fingerprint} /></ActionDialog> : undefined}
                    >
                      <p>{index.explanation}</p>
                      <ul className="grid gap-1">
                        {index.reports.map((report) => (
                          <li key={report.id}>
                            <Link href={`/signalements/${report.id}`} className="ref text-primary underline-offset-4 hover:underline">{report.identifier}</Link>
                            <span className="text-[13px] text-muted-foreground"> · Reçu le {reportedAtLabel(report.reportedAt)}</span>
                          </li>
                        ))}
                      </ul>
                      {index.reason ? <p className="text-muted-foreground">Motif : {index.reason}{index.actorName ? ` — ${index.actorName}` : ""}{index.recordedAt ? ` · ${reportedAtLabel(index.recordedAt)}` : ""}</p> : null}
                    </LedgerItem>
                  ))}
                </Ledger>
                <TablePagination page={indices.page} size={indices.size} total={indices.total} label="Pagination des indices" />
              </div>
            )}
          </PageSection>
          <PageSection title="Signalements en série">
            {indices.series.length === 0 ? <LedgerEmpty>Aucun signalement en série.</LedgerEmpty> : (
              <Ledger>
                {indices.series.map((item) => (
                  <LedgerItem key={`${item.reportedOn}-${item.reports[0]?.id ?? item.reportCount}`} title={`${item.reportCount} signalements`} meta={calendarLabel(item.reportedOn)}>
                    <p>{item.explanation}</p>
                    <ReportRefs reports={item.reports} />
                  </LedgerItem>
                ))}
              </Ledger>
            )}
          </PageSection>
          <PageSection title="Comptes multiples">
            {indices.accounts.length === 0 ? <LedgerEmpty>Aucun compte multiple.</LedgerEmpty> : (
              <Ledger>
                {indices.accounts.map((item) => (
                  <LedgerItem key={item.reports[0]?.id ?? item.accountCount} title={`${item.accountCount} comptes`} meta={`${item.reportCount} signalements`}>
                    <p>{item.explanation}</p>
                    <ReportRefs reports={item.reports} />
                  </LedgerItem>
                ))}
              </Ledger>
            )}
          </PageSection>
        </>
      )}
      <PageSection
        title="Droit aux primes"
        actions={canNote ? (
          <>
            <ActionDialog label="Rétablir" title="Rétablir le droit aux primes"><SuspensionForm action="restored" label="Rétablir le droit aux primes" /></ActionDialog>
            <ActionDialog label="Suspendre" title="Suspendre le droit aux primes"><SuspensionForm action="suspended" label="Suspendre le droit aux primes" /></ActionDialog>
          </>
        ) : undefined}
      >
        {!suspensions ? <p className="text-sm text-muted-foreground">Le droit aux primes est indisponible.</p> : suspensions.items.length === 0 ? <LedgerEmpty>Aucun droit suspendu.</LedgerEmpty> : (
          <Ledger>
            {suspensions.items.map((item) => (
              <LedgerItem key={`${item.reference}-${item.recordedAt}`} className="py-3.5" title={<span className="ref text-sm font-medium">{item.reference}</span>} status={<Badge variant={item.action === "suspended" ? "destructive" : "success"}>{item.action === "suspended" ? "Suspendu" : "Rétabli"}</Badge>}>
                <p>{item.reason}</p>
              </LedgerItem>
            ))}
          </Ledger>
        )}
      </PageSection>
    </Page>
  );
}

function ReportRefs({ reports }: { reports: IndexedReport[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {reports.map((report) => <li key={report.id}><Link href={`/signalements/${report.id}`} className="ref text-primary underline-offset-4 hover:underline">{report.reference}</Link></li>)}
    </ul>
  );
}
