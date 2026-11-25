import { can } from "@/modules/access/model/account";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson, readOutcome } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FilterBar } from "@/components/filter-bar";
import { ReportPicker } from "@/modules/report/ui/report-picker";
import { ReportDetails } from "@/modules/report/ui/report-details";
import { ReportSheet } from "@/modules/report/ui/report-sheet";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Figure, Figures } from "@/components/figures";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { pageIndex, type DeclarantOverview, type ListPage } from "@/modules/report/model/administration";
import { LedgerEmpty } from "@/components/ledger";
import { formatDeclarantName, reportedAtLabel, reportTitle } from "@/modules/report/model/report";
import { BeneficiaryForm } from "@/modules/report/ui/beneficiary-form";

type Report = { id: string; reference?: string; status: string; title: string | null; reportedAt: string | null };
type Situation = {
  rewardAmount: number;
  validatedCount: number;
  validatedRewardAmount: number;
  paidAmount: number;
  ceiling: number;
  remainder: number;
  tickets: number;
  lots: number;
  rewardApproved: boolean;
  rewardPaid: boolean;
  identified: boolean;
  identity: { name: string | null; email: string | null; phone: string | null } | null;
  rejectedCount: number;
  duplicateCount: number;
  pendingCount: number;
  reportsTotal: number;
  reportsPage: number;
  reportsSize: number;
  reports: Report[];
};

const STATUS: Record<string, string> = {
  received: "Reçu",
  review: "En vérification",
  rejected: "Rejeté",
  confirmed: "Validé",
  duplicate: "Doublon",
};

export default function DeclarantsPage({ searchParams }: PageProps<"/declarants">) {
  return <Suspense fallback={<PageSkeleton />}><Declarants searchParams={searchParams} /></Suspense>;
}

async function Declarants({ searchParams }: Pick<PageProps<"/declarants">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "declarant.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const selectedReport = typeof params.signalement === "string" ? params.signalement.trim() : "";
  const reference = selectedReport ? `id:${selectedReport}` : typeof params.reference === "string" ? params.reference.trim() : "";
  const page = pageIndex(params.page);
  const canReadOverview = account.role === "ADMINISTRATOR";
  const canVerify = can(account, "beneficiary.verify");
  const encodedReference = encodeURIComponent(reference);
  const [overview, situation, beneficiary] = await Promise.all([
    !reference && canReadOverview ? readJson<ListPage<DeclarantOverview>>(`/api/declarants/overview?page=${page}`).catch(() => null) : null,
    reference ? readOutcome<Situation>(`/api/declarants?reference=${encodedReference}&page=${page}`) : null,
    reference && can(account, "reward.read")
      ? readOutcome<{ verified: boolean; accounts: number; reservedAmount: number; remainder: number }>(`/api/beneficiaries?reference=${encodedReference}`).catch(() => null)
      : null,
  ]);
  const current = situation?.ok ? situation.body : null;
  const person = current?.identity;
  const name = formatDeclarantName(person?.name ?? null);
  const canReadReports = can(account, "report.read");
  const reportInPanel = canReadReports && current?.reports.find(report => report.id === params.dossier);
  const context = new URLSearchParams(selectedReport ? { signalement: selectedReport } : { reference });
  if (current?.reportsPage) context.set("page", String(current.reportsPage));
  const declarantHref = `/declarants?${context}`;
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title={name ?? (reference ? "Situation du déclarant" : "Déclarants")}
        back={reference && canReadOverview ? { href: "/declarants", label: "Déclarants" } : undefined}
      />
      {!reference || !canReadOverview ? <div className="max-w-2xl">
        <FilterBar
          key={reference}
          action="/declarants"
          label="Recherche d’un déclarant"
          submitLabel="Consulter"
          clearHref={reference ? "/declarants" : undefined}
        >
          <ReportPicker name="signalement" idAsValue />
        </FilterBar>
      </div> : null}
      {!reference && canReadOverview ? <DeclarantTable overview={overview} /> : null}
      {!situation ? null : !situation.ok ? <Alert variant="destructive"><AlertTitle>{situation.message}</AlertTitle></Alert> : (
        <>
          {person ? (
            <PageSection title="Informations du déclarant">
              <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                <div><dt className="text-sm text-muted-foreground">Nom</dt><dd className="mt-1 font-medium">{name ?? "Non renseigné"}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Téléphone</dt><dd className="mt-1 wrap-anywhere">{person.phone ?? "Non renseigné"}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Adresse e-mail</dt><dd className="mt-1 wrap-anywhere">{person.email ?? "Non renseignée"}</dd></div>
              </dl>
              {!situation.body.identified ? <p className="text-sm text-muted-foreground">Compte non identifié.</p> : null}
            </PageSection>
          ) : null}
          <PageSection title="Récompenses" className="min-w-0">
            <Figures>
              <Figure label="Récompenses des dossiers validés (FC)" value={situation.body.validatedRewardAmount.toLocaleString("fr-FR")}
                note={`${situation.body.validatedCount.toLocaleString("fr-FR")} dossier${situation.body.validatedCount > 1 ? "s validés" : " validé"}`} />
              <Figure label="Récompenses enregistrées (FC)" value={situation.body.rewardAmount.toLocaleString("fr-FR")} />
              <Figure label="Payé (FC)" value={situation.body.paidAmount.toLocaleString("fr-FR")} />
              <Figure label="Solde (FC)" value={situation.body.remainder.toLocaleString("fr-FR")} note={`Plafond de ${situation.body.ceiling.toLocaleString("fr-FR")} FC`} />
            </Figures>
            <p className="text-sm leading-6 text-muted-foreground">{situation.body.tickets} ticket{situation.body.tickets > 1 ? "s" : ""} · {situation.body.lots} lot{situation.body.lots > 1 ? "s" : ""} · {situation.body.rewardApproved ? "Récompense approuvée" : "Aucune récompense approuvée"} · {situation.body.rewardPaid ? "Récompense payée" : "Aucune récompense payée"}</p>
          </PageSection>
          <PageSection title="Signalements">
            <Figures>
              <Figure compact label="Validés" value={situation.body.validatedCount.toLocaleString("fr-FR")} />
              <Figure compact label="Rejetés" value={situation.body.rejectedCount.toLocaleString("fr-FR")} />
              <Figure compact label="Doublons" value={situation.body.duplicateCount.toLocaleString("fr-FR")} />
              <Figure compact label="À traiter" value={situation.body.pendingCount.toLocaleString("fr-FR")} />
            </Figures>
            <Table aria-label="Signalements du déclarant">
              <TableHeader><TableRow>
                <TableHead>Signalement</TableHead><TableHead>Reçu le</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader>
              <TableBody>{situation.body.reports.map(report => (
                <TableRow key={report.id}>
                  <TableCell>
                    {canReadReports ? (
                      <Link id={`ouvrir-${report.id}`} href={`${declarantHref}&dossier=${report.id}`} scroll={false} aria-haspopup="dialog" className="font-medium text-primary hover:underline">
                        {reportTitle(report.title, report.reference)}
                      </Link>
                    ) : reportTitle(report.title, report.reference)}
                  </TableCell>
                  <TableCell>{report.reportedAt ? reportedAtLabel(report.reportedAt) : "—"}</TableCell>
                  <TableCell><Badge variant={report.status === "confirmed" ? "success" : "secondary"}>{STATUS[report.status] ?? report.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
            <TablePagination page={situation.body.reportsPage} size={situation.body.reportsSize} total={situation.body.reportsTotal} label="Pagination des signalements du déclarant" />
          </PageSection>
          {reportInPanel ? (
            <ReportSheet key={reportInPanel.id} closeHref={declarantHref} openerId={`ouvrir-${reportInPanel.id}`}>
              <Suspense fallback={<PageSkeleton />}>
                <ReportDetails account={account} id={reportInPanel.id} search={params} inPanel />
              </Suspense>
            </ReportSheet>
          ) : null}
          {beneficiary?.ok ? (
            <PageSection title="Identité et plafond du bénéficiaire">
              {beneficiary.body.verified ? <p className="text-sm">Identité vérifiée · {beneficiary.body.accounts} compte(s) rattaché(s) · {beneficiary.body.reservedAmount.toLocaleString("fr-FR")} FC approuvés ou payés · {beneficiary.body.remainder.toLocaleString("fr-FR")} FC disponibles.</p>
                : <><p className="text-sm">Une vérification de l’identité est requise avant toute approbation de récompense.</p>{canVerify ? <BeneficiaryForm reference={reference} /> : null}</>}
            </PageSection>
          ) : null}
        </>
      )}
    </Page>
  );
}


function DeclarantTable({ overview }: { overview: ListPage<DeclarantOverview> | null }) {
  if (!overview) return <Alert variant="destructive"><AlertTitle>Les compteurs des déclarants sont indisponibles.</AlertTitle></Alert>;
  if (!overview.items.length) return <LedgerEmpty>Aucun déclarant sur cette page.</LedgerEmpty>;

  return (
    <div className="grid gap-4">
      <Table aria-label="Signalements par déclarant">
        <TableHeader><TableRow>
          <TableHead>Déclarant</TableHead><TableHead>Total</TableHead><TableHead>Validés</TableHead>
          <TableHead className="text-right">Récompenses des dossiers validés (FC)</TableHead>
          <TableHead>Rejetés</TableHead><TableHead>Doublons</TableHead><TableHead>En cours</TableHead>
        </TableRow></TableHeader>
        <TableBody>{overview.items.map(item => (
          <TableRow key={item.reportId}>
            <TableCell>
              <Link className="font-medium text-primary hover:underline" href={`/declarants?signalement=${item.reportId}`}>
                {formatDeclarantName(item.name) ?? "Déclarant non renseigné"}
              </Link>
              {!item.identified ? <p className="text-xs text-muted-foreground">Compte non identifié</p> : null}
            </TableCell>
            <TableCell className="tabular-nums">{item.total}</TableCell>
            <TableCell className="tabular-nums">{item.validated}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">{item.validatedRewardAmount.toLocaleString("fr-FR")}</TableCell>
            <TableCell className="tabular-nums">{item.rejected}</TableCell>
            <TableCell className="tabular-nums">{item.duplicates}</TableCell>
            <TableCell className="tabular-nums">{item.pending}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <TablePagination page={overview.page} size={overview.size} total={overview.total} label="Pagination des déclarants" />
    </div>
  );
}
