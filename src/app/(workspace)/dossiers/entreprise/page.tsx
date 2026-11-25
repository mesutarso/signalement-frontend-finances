import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Figure, Figures } from "@/components/figures";
import { LedgerEmpty } from "@/components/ledger";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { TablePagination } from "@/components/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readMissingJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { pageIndex, type CompanyOverview, type ListPage } from "@/modules/report/model/administration";
import { reportedAtLabel, reportTitle } from "@/modules/report/model/report";

const OUTCOMES = {
  validated: "Validé",
  rejected: "Rejeté",
  pending: "À traiter",
  duplicate: "Doublon",
} as const;

type CompanyReport = { id: string; title: string | null; reportedAt: string | null; outcome: keyof typeof OUTCOMES };

export default function CompanyPage({ searchParams }: PageProps<"/dossiers/entreprise">) {
  return <Suspense fallback={<PageSkeleton />}><CompanyDetails searchParams={searchParams} /></Suspense>;
}

async function CompanyDetails({ searchParams }: Pick<PageProps<"/dossiers/entreprise">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!can(account, "dossier.read")) redirect("/signalements");

  const params = await searchParams;
  const nif = typeof params.nif === "string" ? params.nif.trim() : "";
  const name = typeof params.nom === "string" ? params.nom.trim() : "";
  if (Boolean(nif) === Boolean(name)) notFound();
  const query = new URLSearchParams({ page: String(pageIndex(params.page)) });
  if (nif) query.set("nif", nif);
  else query.set("name", name);
  const detail = await readMissingJson<{ company: CompanyOverview; reports: ListPage<CompanyReport> }>(`/api/seller-files/companies/details?${query}`);
  if (!detail) notFound();

  const fromTaxpayers = params.origine === "contribuables" && can(account, "taxpayer.read");
  const back = new URLSearchParams();
  const previousPage = pageIndex(params.retourPage);
  if (previousPage > 0) back.set("page", String(previousPage));
  if (!fromTaxpayers && typeof params.retourRecherche === "string" && params.retourRecherche) back.set("q", params.retourRecherche);
  const backHref = `${fromTaxpayers ? "/contribuables" : "/dossiers"}${back.size ? `?${back}` : ""}`;
  const { company, reports } = detail;
  return (
    <Page className="max-w-6xl">
      <PageHeader title={company.name ?? "Entreprise"} description={company.taxId ? `NIF ${company.taxId}` : "NIF non renseigné"}
        back={{ href: backHref, label: fromTaxpayers ? "Contribuables" : "Établissements" }} />
      <Figures>
        <Figure compact label="Signalements validés" value={company.validated.toLocaleString("fr-FR")} />
        <Figure compact label="Signalements rejetés" value={company.rejected.toLocaleString("fr-FR")} />
        <Figure compact label="Signalements à traiter" value={company.pending.toLocaleString("fr-FR")} />
        <Figure compact label="Doublons" value={company.duplicates.toLocaleString("fr-FR")} />
      </Figures>
      <PageSection title="Signalements">
        {reports.items.length ? (
          <>
            <Table aria-label="Signalements de l’entreprise">
              <TableHeader><TableRow><TableHead>Signalement</TableHead><TableHead>Reçu le</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>{reports.items.map(report => (
                <TableRow key={report.id}>
                  <TableCell>
                    {can(account, "report.read")
                      ? <Link href={`/signalements/${report.id}`} className="font-medium text-primary hover:underline">{reportTitle(report.title)}</Link>
                      : reportTitle(report.title)}
                  </TableCell>
                  <TableCell>{report.reportedAt ? reportedAtLabel(report.reportedAt) : "—"}</TableCell>
                  <TableCell><Badge variant={report.outcome === "validated" ? "success" : "secondary"}>{OUTCOMES[report.outcome]}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
            <TablePagination page={reports.page} size={reports.size} total={reports.total} label="Pagination des signalements de l’entreprise" />
          </>
        ) : <LedgerEmpty>Aucun signalement sur cette page.</LedgerEmpty>}
      </PageSection>
    </Page>
  );
}
