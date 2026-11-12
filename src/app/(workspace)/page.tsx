import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FigureRows, Figure, Figures } from "@/components/figures";
import { Ledger } from "@/components/ledger";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { RefreshButton } from "@/components/refresh-button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readJson } from "@/lib/api";
import { roleLabel, type Account } from "@/modules/access/model/account";
import { canReadReports } from "@/modules/access/model/navigation";
import { readAccounts } from "@/modules/access/queries/read-accounts";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readAvailability } from "@/modules/availability/queries/read-availability";
import type { AvailabilityView } from "@/modules/availability/model/availability";
import type { Indicators } from "@/modules/report/model/indicators";
import { paymentStatusLabel, paymentStatusVariant, type PaymentItem } from "@/modules/report/model/payment";
import { francs } from "@/modules/report/model/reward";
import { calendarLabel, reportedAtParts } from "@/modules/report/model/report";
import { readReports } from "@/modules/report/queries/read-reports";
import { PriorityMark, ValidationTag } from "@/modules/report/ui/report-marks";

export default function DashboardPage() {
  return <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>;
}

function count(value: number | undefined): string {
  return value === undefined ? "—" : value.toLocaleString("fr-FR");
}

function ServiceState({ availability }: { availability: AvailabilityView }) {
  return (
    <Card size="sm">
      <CardHeader><CardTitle>État du service</CardTitle></CardHeader>
      <CardContent className="grid justify-items-start gap-2">
        <Badge variant={availability.available ? "success" : "destructive"}>{availability.available ? "Disponible" : "Indisponible"}</Badge>
        <p className="text-[13px] leading-5 text-muted-foreground">{availability.message}</p>
      </CardContent>
    </Card>
  );
}

function headerDescription(account: Account): string {
  const today = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "Africa/Kinshasa" }).format(new Date());
  return `${today.charAt(0).toUpperCase()}${today.slice(1)} · ${account.username}, ${roleLabel(account.role)}`;
}

async function Dashboard() {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (account.role === "AGENT") redirect("/signalements");
  if (!canReadReports(account)) return <PaymentDashboard account={account} />;

  const admin = account.role === "ADMINISTRATOR";
  const auditor = account.role === "AUDITOR";
  const [recent, pending, urgent, unassigned, mine, accounts, availability, indicators] = await Promise.all([
    readReports().catch(() => null),
    readReports({ validation: "doubt" }).catch(() => null),
    readReports({ priority: "urgent" }).catch(() => null),
    readReports({ unassigned: true }).catch(() => null),
    auditor ? Promise.resolve(null) : readReports({ assigneeId: account.id }).catch(() => null),
    admin ? readAccounts().catch(() => null) : Promise.resolve(null),
    readAvailability(),
    readJson<Indicators>("/api/indicators").catch(() => null),
  ]);
  const unavailable = !recent || !pending || !urgent || !unassigned || (admin && !accounts);
  const week = indicators?.week;

  return (
    <Page>
      <PageHeader title="Tableau de bord" description={headerDescription(account)} actions={<RefreshButton />} />
      {unavailable ? <Alert variant="destructive"><AlertTitle>Certaines données ne sont pas disponibles. Actualisez la page.</AlertTitle></Alert> : null}

      <Figures>
        <Figure label="À vérifier" value={count(pending?.total)} href="/signalements?scope=all&validation=doubt" />
        <Figure label="Urgents" value={count(urgent?.total)} href="/signalements?scope=all&priority=urgent" signal={Boolean(urgent?.total)} />
        <Figure label="Non affectés" value={count(unassigned?.total)} href="/signalements?scope=unassigned" />
        {auditor
          ? <Figure label="Enregistrés" value={count(recent?.total)} href="/signalements?scope=all" />
          : <Figure label="Mes dossiers" value={count(mine?.total)} href="/signalements?scope=mine" />}
      </Figures>

      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="derniers" className="grid min-w-0 gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="derniers" className="text-[1.3125rem] leading-tight font-medium tracking-[-0.01em]">Derniers signalements</h2>
            <Link href="/signalements?scope=all" className="text-[13px] text-primary underline-offset-4 hover:underline">Voir tout</Link>
          </div>
          {recent?.reports.length ? (
            <Ledger>
              {recent.reports.slice(0, 7).map((report) => {
                const { date } = reportedAtParts(report.reportedAt);
                return (
                  <li key={report.id} className="border-b">
                    <Link href={`/signalements/${report.id}`} className="group/row flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5">
                      <span className="grid min-w-0 flex-1 basis-64 gap-0.5">
                        <span className="text-sm font-medium break-words transition-colors group-hover/row:text-primary">{report.title ?? "Sans titre"}</span>
                        <span className="ref text-muted-foreground">{report.identifier}</span>
                      </span>
                      <span className="flex items-center gap-4">
                        <PriorityMark priority={report.priority} />
                        <ValidationTag state={report.validationState} assignmentState={report.state} />
                        <span className="w-[6.75rem] text-right text-[13px] text-muted-foreground tabular-nums max-sm:hidden">{date}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </Ledger>
          ) : <p className="border-y border-t-foreground py-10 text-sm text-muted-foreground">{recent ? "Aucun signalement enregistré." : "Signalements indisponibles."}</p>}
        </section>

        <aside className="grid content-start gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Cette semaine</CardTitle>
              {week?.from && week.to ? <CardDescription>Du {calendarLabel(week.from)} au {calendarLabel(week.to)}</CardDescription> : null}
            </CardHeader>
            <CardContent className="grid gap-3">
              {week ? (
                <FigureRows
                  rows={[
                    ["Reçus", count(week.received)],
                    ["Traités", count(week.treated)],
                    ["Constats", count(week.findings)],
                    ["Dossiers transmis", count(week.transmissions)],
                    ["Montant payé", `${count(week.paidAmount)} FC`],
                  ]}
                />
              ) : <p className="text-sm text-muted-foreground">Indicateurs indisponibles.</p>}
              <Link href="/indicateurs" className="w-fit text-[13px] text-primary underline-offset-4 hover:underline">Tous les indicateurs</Link>
            </CardContent>
          </Card>
          {admin ? (
            <Card size="sm">
              <CardHeader><CardTitle>Comptes utilisateurs</CardTitle></CardHeader>
              <CardContent className="flex items-baseline justify-between gap-4">
                <p className="text-[1.75rem] leading-none font-medium tabular-nums">{count(accounts?.total)}</p>
                <Link href="/comptes" className="text-[13px] text-primary underline-offset-4 hover:underline">Gérer les comptes</Link>
              </CardContent>
            </Card>
          ) : null}
          <ServiceState availability={availability} />
        </aside>
      </div>
    </Page>
  );
}

const AWAITING: Partial<Record<Account["role"], { status: string; label: string }>> = {
  CELLULE: { status: "controlled", label: "À viser" },
  CABINET: { status: "visaed", label: "À autoriser" },
  PAYMASTER: { status: "authorized", label: "À payer" },
};

async function PaymentDashboard({ account }: { account: Account }) {
  const [statements, availability] = await Promise.all([
    readJson<{ items: PaymentItem[]; total: number }>("/api/payment-statements?page=0").catch(() => null),
    readAvailability(),
  ]);
  const awaiting = AWAITING[account.role];

  return (
    <Page>
      <PageHeader title="Tableau de bord" description={headerDescription(account)} actions={<RefreshButton />} />
      {!statements ? <Alert variant="destructive"><AlertTitle>Les états de paiement sont indisponibles. Actualisez la page.</AlertTitle></Alert> : null}
      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="etats-recents" className="grid min-w-0 gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="etats-recents" className="text-[1.3125rem] leading-tight font-medium tracking-[-0.01em]">États de paiement</h2>
            <Link href="/etats" className="text-[13px] text-primary underline-offset-4 hover:underline">Voir tout</Link>
          </div>
          {statements?.items.length ? (
            <Ledger>
              {statements.items.slice(0, 8).map((statement) => (
                <li key={statement.id} className="border-b">
                  <Link href={`/etats/${statement.id}`} className="group/row flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5">
                    <span className="ref text-sm font-medium transition-colors group-hover/row:text-primary">{statement.reference}</span>
                    <span className="flex items-center gap-4">
                      {awaiting?.status === statement.status ? <Badge variant="warning">{awaiting.label}</Badge> : <Badge variant={paymentStatusVariant(statement.status)}>{paymentStatusLabel(statement.status)}</Badge>}
                      <span className="w-28 text-right text-sm font-medium tabular-nums">{francs(statement.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </Ledger>
          ) : statements ? <p className="border-y border-t-foreground py-10 text-sm text-muted-foreground">Aucun état de paiement.</p> : null}
        </section>
        <aside className="grid content-start gap-8">
          <ServiceState availability={availability} />
        </aside>
      </div>
    </Page>
  );
}
