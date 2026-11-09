import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import {
  findingLabel,
  proofLabel,
  qualificationDecisionLabel,
  reportedAtLabel,
  type SellerFile,
} from "@/modules/report/model/report";
import { readSellerFiles } from "@/modules/report/queries/read-seller-files";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ViewTabs } from "@/components/view-tabs";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

const FILTERS = [
  { value: "identified", label: "Même numéro d'impôt" },
  { value: "unidentified", label: "Sans numéro" },
];

export default function SellerFilesPage({ searchParams }: PageProps<"/dossiers">) {
  return <Suspense fallback={<PageSkeleton />}><SellerFiles searchParams={searchParams} /></Suspense>;
}

async function SellerFiles({ searchParams }: Pick<PageProps<"/dossiers">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const params = await searchParams;
  const status = FILTERS.some((filter) => filter.value === params.status) ? String(params.status) : "identified";
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const files = await readSellerFiles(status, page).catch(() => null);
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Dossiers" />
      <div className="grid gap-5">
        <ViewTabs label="Filtrer les dossiers" items={FILTERS.map((filter) => ({ href: `/dossiers?status=${filter.value}`, label: filter.label, active: filter.value === status }))} />
        {!files ? <Alert variant="destructive"><AlertTitle>Les dossiers sont indisponibles. Actualisez la page.</AlertTitle></Alert> : files.items.length === 0 ? <LedgerEmpty className="border-t-0">{status === "identified" ? "Aucun constat retenu ne porte un numéro d'impôt." : "Aucun constat retenu n'est sans numéro d'impôt."}</LedgerEmpty> : (
          <div className="grid gap-5">
            <Ledger>
              {files.items.map((file) => <SellerFileCard key={file.taxId ?? file.reports[0]?.reportId} file={file} />)}
            </Ledger>
            <TablePagination page={files.page} size={files.size} total={files.total} label="Pagination des dossiers" />
          </div>
        )}
      </div>
    </Page>
  );
}

function SellerFileCard({ file }: { file: SellerFile }) {
  return (
    <LedgerItem
      title={file.taxId ? <span className="ref text-sm font-medium">{file.taxId}</span> : "Sans numéro d'impôt"}
      status={file.namesDiffer ? <Badge variant="warning">Noms à vérifier</Badge> : undefined}
      meta={<>{file.namesDiffer ? null : file.sellerName ? <span className="block font-medium text-foreground">{file.sellerName}</span> : null}{file.reports.length === 1 ? "1 constat" : `${file.reports.length} constats`} · dernier le {reportedAtLabel(file.latestAt)}</>}
    >
      <ul className="grid divide-y">
        {file.reports.map((report) => {
          const finding = findingLabel(report.finding);
          const proof = proofLabel(report.proof);
          return (
            <li key={report.reportId} className="grid gap-0.5 py-2.5 first:pt-0 last:pb-0">
              <p className="font-medium">{qualificationDecisionLabel(report.decision)}{finding ? ` · ${finding}` : ""}{proof ? <span className="font-normal text-muted-foreground"> · {proof}</span> : ""}</p>
              <p>{report.justification}</p>
              {report.sellerName ? <p className="text-[13px] text-muted-foreground">Nom saisi : {report.sellerName}</p> : null}
              <ReportLink id={report.reportId} reference={report.identifier} />
            </li>
          );
        })}
      </ul>
    </LedgerItem>
  );
}
