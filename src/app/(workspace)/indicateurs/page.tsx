import { CaptureReportForm } from "@/modules/report/ui/campaign-reporting-forms";
import { ActionDialog } from "@/components/action-dialog";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Figure, Figures as FigureGrid } from "@/components/figures";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Figures, Indicators as IndicatorsData } from "@/modules/report/model/indicators";

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const FINDINGS = ["fake-invoice", "missing-transmission", "understated", "non-normalized", "refusal", "unknown-seller"];

export default function IndicatorsPage({ searchParams }: PageProps<"/indicateurs">) {
  return <Suspense fallback={<PageSkeleton />}><Indicators searchParams={searchParams} /></Suspense>;
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

function reportSentence(title: string, figures: Figures): string {
  return `${title}, ${periodLabel(figures).toLowerCase()} : ${amount(figures.received)} signalements reçus, ${amount(figures.treated)} traités, ${amount(figures.findings)} constats, ${amount(figures.transmissions)} dossiers transmis, ${amount(figures.responses)} réponses, ${amount(figures.points)} points, ${amount(figures.primes)} primes, ${amount(figures.payments)} paiements pour ${amount(figures.paidAmount)} FC, ${amount(figures.draws)} tirages, ${amount(figures.alerts)} alertes.`;
}

const DEFINITIONS = [
  ["Signalements reçus", "Signalements dont la date de dépôt est dans la période."],
  ["Signalements traités", "Dernier constat confirmé ou non retenu."],
  ["Constats", "Dernier constat confirmé."],
  ["Dossiers transmis", "Courriers dont l’envoi a été enregistré."],
  ["Réponses des services", "Réponses enregistrées."],
  ["Points", "Somme des mouvements de la période."],
  ["Primes", "Primes enregistrées."],
  ["Paiements", "Tentatives dont le résultat est payé."],
  ["Montant payé", "Somme des lignes payées."],
  ["Tirages", "Tirages effectués."],
  ["Alertes", "Notes portées sur un indice."],
  ["Province, ville, service", "Ces données ne sont pas fournies par l’API actuelle."],
];

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
  const [indicators, budget, reports] = await Promise.all([
    readJson<IndicatorsData>(`/api/indicators?${query}`).catch(() => null),
    readJson<{amount: number | null; approvedAmount: number; paidAmount: number}>("/api/campaign-budget"),
    readJson<{id: string; kind: string; from: string; to: string; figures: Figures; generatedAt: string}[]>("/api/campaign-reports"),
  ]);
  const rows: [string, (figures: Figures) => string][] = [
    ["Signalements reçus", (figures) => amount(figures.received)],
    ["Signalements traités", (figures) => amount(figures.treated)],
    ["Constats", (figures) => amount(figures.findings)],
    ["Dossiers transmis", (figures) => amount(figures.transmissions)],
    ["Réponses des services", (figures) => amount(figures.responses)],
    ["Points", (figures) => amount(figures.points)],
    ["Primes", (figures) => amount(figures.primes)],
    ["Paiements", (figures) => amount(figures.payments)],
    ["Montant payé", (figures) => `${amount(figures.paidAmount)} FC`],
    ["Tirages", (figures) => amount(figures.draws)],
    ["Alertes", (figures) => amount(figures.alerts)],
  ];
  const columns = indicators ? [
    { title: "Période choisie", figures: indicators.figures },
    { title: "Semaine", figures: indicators.week },
    { title: "Mois", figures: indicators.month },
  ] : [];
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Indicateurs"
        actions={account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR" ? <ActionDialog label="Archiver un rapport" title="Rapport de la dernière période close"><CaptureReportForm /></ActionDialog> : undefined}
        description="Les chiffres sont calculés à la lecture. La province, la ville et le service ne sont pas disponibles. Le budget et les rapports archivés se consultent ci-dessous."
      />
      <PageSection title="Budget prévisionnel des primes">
        {budget.amount === null ? <p className="text-sm">Le budget reste à renseigner par le superviseur dans Règles.</p> : <p className="text-sm">Budget : {amount(budget.amount)} FC · Primes approuvées : {amount(budget.approvedAmount)} FC · Montant payé : {amount(budget.paidAmount)} FC ({(100 * budget.paidAmount / budget.amount).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} % du budget).</p>}
      </PageSection>
      <PageSection title="Rapports archivés">
        {reports.length === 0 ? <p className="text-sm text-muted-foreground">Aucun rapport archivé. La préparation planifiée utilise le compte habilité configuré.</p> : reports.map(report => <p key={report.id} className="text-sm">{reportSentence(report.kind === "weekly" ? "Rapport hebdomadaire" : "Note mensuelle", report.figures)} Archivé le {reportedAtLabel(report.generatedAt)}.</p>)}
      </PageSection>
      <form className="flex flex-wrap items-end gap-2" method="get">
        <label className="grid gap-2 text-[13px] font-medium">Du<input className="h-10 rounded-md border border-input bg-card px-3 text-[15px] font-normal" type="date" name="from" defaultValue={from} /></label>
        <label className="grid gap-2 text-[13px] font-medium">Au<input className="h-10 rounded-md border border-input bg-card px-3 text-[15px] font-normal" type="date" name="to" defaultValue={to} /></label>
        <label className="grid gap-2 text-[13px] font-medium">Constat
          <select className="h-10 rounded-md border border-input bg-card px-3 text-[15px] font-normal" name="finding" defaultValue={finding}>
            <option value="">Tous les constats</option>
            {FINDINGS.map((item) => <option key={item} value={item}>{findingLabel(item)}</option>)}
          </select>
        </label>
        <Button type="submit" variant="outline">Filtrer</Button>
      </form>
      {!indicators ? <Alert variant="destructive"><AlertTitle>Les indicateurs sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <div className="grid gap-3">
            <FigureGrid>
              <Figure label="Reçus" value={amount(indicators.figures.received)} />
              <Figure label="Traités" value={amount(indicators.figures.treated)} />
              <Figure label="Constats" value={amount(indicators.figures.findings)} />
              <Figure label="Payé (FC)" value={amount(indicators.figures.paidAmount)} />
            </FigureGrid>
            <p className="text-[13px] leading-5 text-muted-foreground">{periodLabel(indicators.figures)}. Lecture du {reportedAtLabel(indicators.asOf)}.{indicators.finding ? ` Constats filtrés : ${findingLabel(indicators.finding)}.` : ""}</p>
          </div>
          <PageSection title="Comparaison des périodes">
            <Table aria-label="Indicateurs par période">
              <TableHeader>
                <TableRow>
                  <TableHead>Indicateur</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.title} className="text-right whitespace-normal">
                      <span className="block text-foreground">{column.title}</span>
                      <span className="block text-xs font-normal">{shortPeriod(column.figures)}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(([label, read]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    {columns.map((column) => <TableCell key={column.title} className="text-right font-medium tabular-nums">{read(column.figures)}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PageSection>
          <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Rapport produit à la lecture</CardTitle></CardHeader>
              <CardContent className="grid gap-3 leading-6">
                <p>{reportSentence("Rapport de la semaine", indicators.week)}</p>
                <p>{reportSentence("Note du mois", indicators.month)}</p>
                <p className="text-muted-foreground">Les définitions ci-contre s&apos;appliquent à ces deux textes. La province, la ville et le service ne sont pas fournis par l’API actuelle. Les archives conservent le budget connu à leur génération.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Définitions</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid">
                  {DEFINITIONS.map(([label, text]) => (
                    <div key={label} className="grid gap-0.5 border-b py-2 first:pt-0">
                      <dt className="font-medium">{label}</dt>
                      <dd className="text-[13px] leading-5 text-muted-foreground">{text}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </Page>
  );
}

function shortPeriod(figures: Figures): string {
  return figures.from && figures.to ? `${calendarLabel(figures.from)} – ${calendarLabel(figures.to)}` : "Ensemble";
}
