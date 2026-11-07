import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Figures = {
  from: string | null;
  to: string | null;
  received: number;
  treated: number;
  findings: number;
  transmissions: number;
  responses: number;
  points: number;
  primes: number;
  paidAmount: number;
  payments: number;
  draws: number;
  alerts: number;
};
type Indicators = { from: string | null; to: string | null; finding: string | null; figures: Figures; week: Figures; month: Figures; asOf: string };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const FINDINGS = ["fake-invoice", "missing-transmission", "understated", "non-normalized", "refusal", "unknown-seller"];

export default function IndicatorsPage({ searchParams }: PageProps<"/indicateurs">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Indicators searchParams={searchParams} /></Suspense>;
}

function amount(value: number): string {
  return value.toLocaleString("fr-FR");
}

function periodLabel(figures: Figures): string {
  if (!figures.from || !figures.to) {
    return "Ensemble";
  }
  return `Du ${calendarLabel(figures.from)} au ${calendarLabel(figures.to)}`;
}

function FiguresCard({ title, figures }: { title: string; figures: Figures }) {
  const rows = [
    ["Signalements reçus", amount(figures.received)],
    ["Signalements traités", amount(figures.treated)],
    ["Constats", amount(figures.findings)],
    ["Dossiers transmis", amount(figures.transmissions)],
    ["Réponses des services", amount(figures.responses)],
    ["Points", amount(figures.points)],
    ["Primes", amount(figures.primes)],
    ["Paiements", amount(figures.payments)],
    ["Montant payé", `${amount(figures.paidAmount)} FC`],
    ["Tirages", amount(figures.draws)],
    ["Alertes", amount(figures.alerts)],
  ];
  return (
    <Card>
      <CardHeader className="gap-2"><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <p className="text-muted-foreground">{periodLabel(figures)}</p>
        {rows.map(([label, value]) => <p key={label} className="flex justify-between gap-4"><span>{label}</span><span className="font-bold tabular-nums">{value}</span></p>)}
      </CardContent>
    </Card>
  );
}

async function Indicators({ searchParams }: Pick<PageProps<"/indicateurs">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const from = String(params.from ?? "");
  const to = String(params.to ?? "");
  const finding = FINDINGS.includes(String(params.finding ?? "")) ? String(params.finding) : "";
  const query = new URLSearchParams();
  if (/^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    query.set("from", from);
    query.set("to", to);
  }
  if (finding) {
    query.set("finding", finding);
  }
  const indicators = await readJson<Indicators>(`/api/indicators?${query}`).catch(() => null);
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Indicateurs</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Les chiffres sont calculés à la lecture. La province, la ville et le service ne sont pas disponibles. Le budget prévisionnel n&apos;est pas fixé.</p>
      </div>
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="grid gap-1 text-sm font-bold">Du<input className="h-11 rounded-md border border-input bg-card px-3 font-normal" type="date" name="from" defaultValue={from} /></label>
        <label className="grid gap-1 text-sm font-bold">Au<input className="h-11 rounded-md border border-input bg-card px-3 font-normal" type="date" name="to" defaultValue={to} /></label>
        <label className="grid gap-1 text-sm font-bold">Constat
          <select className="h-11 rounded-md border border-input bg-card px-3 font-normal" name="finding" defaultValue={finding}>
            <option value="">Tous les constats</option>
            {FINDINGS.map((item) => <option key={item} value={item}>{findingLabel(item)}</option>)}
          </select>
        </label>
        <Button type="submit">Filtrer</Button>
      </form>
      {!indicators ? <Alert variant="destructive"><AlertTitle>Les indicateurs sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <p className="text-sm text-muted-foreground">Lecture du {reportedAtLabel(indicators.asOf)}.{indicators.finding ? ` Constats filtrés : ${findingLabel(indicators.finding)}.` : ""}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            <FiguresCard title="Période choisie" figures={indicators.figures} />
            <FiguresCard title="Rapport de la semaine" figures={indicators.week} />
            <FiguresCard title="Note du mois" figures={indicators.month} />
          </div>
        </>
      )}
    </section>
  );
}
