import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { AbuseNoteForm } from "@/modules/report/ui/abuse-note-form";
import { SuspensionForm } from "@/modules/report/ui/suspension-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

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
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Indices searchParams={searchParams} /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Indices</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Un indice n&apos;est pas une preuve de fraude. La suspension du droit aux primes est une décision séparée. Une prime déjà payée n&apos;est pas reprise.</p>
      </div>
      {indices ? <p className="text-sm text-muted-foreground">{indices.retouch} {indices.score}</p> : null}
      {!indices ? <Alert variant="destructive"><AlertTitle>Les indices sont indisponibles. Actualisez la page.</AlertTitle></Alert> : indices.indices.length === 0 ? <p className="text-sm text-muted-foreground">Aucune image partagée.</p> : (
        <>
          <div className="grid gap-4">
            {indices.indices.map((index) => (
              <Card key={index.fingerprint}>
                <CardHeader className="gap-2">
                  <CardTitle>{STATUS[index.status] ?? index.status} · {index.reportCount} signalements</CardTitle>
                  <p className="text-sm">{index.explanation}</p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ul className="grid gap-2 text-sm">
                    {index.reports.map((report) => (
                      <li key={report.id}>
                        <Link href={`/signalements/${report.id}`} className="text-primary underline-offset-4 hover:underline">Signalement {report.identifier}</Link>
                        <span className="text-muted-foreground"> · Reçu le {reportedAtLabel(report.reportedAt)}</span>
                      </li>
                    ))}
                  </ul>
                  {index.reason ? <p className="text-sm text-muted-foreground">Motif : {index.reason}{index.actorName ? ` — ${index.actorName}` : ""}{index.recordedAt ? ` · ${reportedAtLabel(index.recordedAt)}` : ""}</p> : null}
                  {canNote ? <AbuseNoteForm fingerprint={index.fingerprint} /> : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination page={indices.page} size={indices.size} total={indices.total} label="Pagination des indices" />
        </>
      )}
      {indices && indices.series.length === 0 ? <p className="text-sm text-muted-foreground">Aucun signalement en série.</p> : indices ? (
        <div className="grid gap-4">
          {indices.series.map((item) => (
            <Card key={`${item.reportedOn}-${item.reports[0]?.id ?? item.reportCount}`}>
              <CardHeader className="gap-2">
                <CardTitle>{item.reportCount} signalements · {calendarLabel(item.reportedOn)}</CardTitle>
                <p className="text-sm">{item.explanation}</p>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm">
                  {item.reports.map((report) => <li key={report.id}><Link href={`/signalements/${report.id}`} className="text-primary underline-offset-4 hover:underline">Signalement {report.reference}</Link></li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {indices && indices.accounts.length === 0 ? <p className="text-sm text-muted-foreground">Aucun compte multiple.</p> : indices ? (
        <div className="grid gap-4">
          {indices.accounts.map((item) => (
            <Card key={item.reports[0]?.id ?? item.accountCount}>
              <CardHeader className="gap-2">
                <CardTitle>{item.accountCount} comptes · {item.reportCount} signalements</CardTitle>
                <p className="text-sm">{item.explanation}</p>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm">
                  {item.reports.map((report) => <li key={report.id}><Link href={`/signalements/${report.id}`} className="text-primary underline-offset-4 hover:underline">Signalement {report.reference}</Link></li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      <h2 className="text-xl font-bold text-primary">Droit aux primes</h2>
      {suspensions && suspensions.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun droit suspendu.</p> : suspensions ? suspensions.items.map((item) => (
        <p key={`${item.reference}-${item.recordedAt}`} className="text-sm">{item.reference} · {item.action === "suspended" ? "Suspendu" : "Rétabli"} · {item.reason}</p>
      )) : <p className="text-sm text-muted-foreground">Le droit aux primes est indisponible.</p>}
      {canNote ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SuspensionForm action="suspended" label="Suspendre le droit aux primes" />
          <SuspensionForm action="restored" label="Rétablir le droit aux primes" />
        </div>
      ) : null}
    </section>
  );
}
