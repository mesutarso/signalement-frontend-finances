import { RefreshButton } from "@/components/refresh-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readAccounts } from "@/modules/access/queries/read-accounts";
import { roleLabel } from "@/modules/access/model/account";
import { readReports } from "@/modules/report/queries/read-reports";
import { reportedAtLabel } from "@/modules/report/model/report";
import { readAvailability } from "@/modules/availability/queries/read-availability";

export default function Page() {
  return <Suspense fallback={<DashboardFallback />}><Dashboard /></Suspense>;
}

function DashboardFallback() {
  return <div className="flex flex-col gap-6"><Skeleton className="h-10 w-64" /><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-32 w-full" />)}</div><Skeleton className="h-80 w-full" /></div>;
}

async function Dashboard() {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  const admin = account.role === "ADMINISTRATOR";
  const reader = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"].includes(account.role);
  const [reports, accounts, availability] = await Promise.all([
    readReports().catch(() => null),
    admin ? readAccounts().catch(() => null) : Promise.resolve(null),
    readAvailability(),
  ]);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">{account.username} · {roleLabel(account.role)}</p>
        </div>
        <RefreshButton />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Signalements enregistrés</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold tabular-nums text-primary">{reports?.total.toLocaleString("fr-FR") ?? "—"}</p><Link href="/signalements" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">Consulter les signalements</Link></CardContent></Card>
        {reader ? <Card><CardHeader><CardTitle>Indicateurs</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">La semaine et le mois sont calculés à la lecture.</p><Link href="/indicateurs" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">Consulter les indicateurs</Link></CardContent></Card> : null}
        {admin ? <Card><CardHeader><CardTitle>Comptes utilisateurs</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold tabular-nums text-primary">{accounts?.total.toLocaleString("fr-FR") ?? "—"}</p><Link href="/comptes" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">Gérer les comptes</Link></CardContent></Card> : null}
        <Card><CardHeader><CardTitle>État du service</CardTitle></CardHeader><CardContent><Badge variant={availability.available ? "success" : "destructive"}>{availability.available ? "Disponible" : "Indisponible"}</Badge><p className="mt-4 text-sm text-muted-foreground">{availability.message}</p></CardContent></Card>
      </div>
      {!reports || (admin && !accounts) ? <Alert variant="destructive"><AlertTitle>Certaines données ne sont pas disponibles. Actualisez la page.</AlertTitle></Alert> : null}
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><CardTitle>Derniers signalements</CardTitle><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/signalements" />}>Voir tout</Button></CardHeader>
          <CardContent>
            {reports?.reports.length ? <ul className="divide-y">{reports.reports.slice(0, 5).map((report) => <li key={report.id}><Link href={`/signalements/${report.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-sm px-2 py-4 hover:bg-muted"><div className="grid min-w-0 gap-1"><span className="text-xs font-bold text-primary">{report.identifier}</span><span className="break-words text-sm font-bold">{report.title ?? "Sans titre"}</span></div><span className="text-xs text-muted-foreground">{reportedAtLabel(report.reportedAt)}</span></Link></li>)}</ul> : <Empty><EmptyHeader><EmptyTitle>{reports ? "Aucun signalement enregistré" : "Signalements indisponibles"}</EmptyTitle></EmptyHeader></Empty>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
