import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

const FILTERS = [
  { value: "identified", label: "Même numéro d'impôt" },
  { value: "unidentified", label: "Sans numéro" },
];

export default function SellerFilesPage({ searchParams }: PageProps<"/dossiers">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><SellerFiles searchParams={searchParams} /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Dossiers</h1>
      </div>
      <form className="flex flex-wrap gap-2" method="get">
        {FILTERS.map((filter) => (
          <Button key={filter.value} type="submit" name="status" value={filter.value} variant={filter.value === status ? "default" : "outline"}>{filter.label}</Button>
        ))}
      </form>
      {!files ? <Alert variant="destructive"><AlertTitle>Les dossiers sont indisponibles. Actualisez la page.</AlertTitle></Alert> : files.items.length === 0 ? <p className="text-sm text-muted-foreground">{status === "identified" ? "Aucun constat retenu ne porte un numéro d'impôt." : "Aucun constat retenu n'est sans numéro d'impôt."}</p> : (
        <>
          <div className="grid gap-4">
            {files.items.map((file) => <SellerFileCard key={file.taxId ?? file.reports[0]?.reportId} file={file} />)}
          </div>
          <TablePagination page={files.page} size={files.size} total={files.total} label="Pagination des dossiers" />
        </>
      )}
    </section>
  );
}

function SellerFileCard({ file }: { file: SellerFile }) {
  const title = file.taxId ? `Numéro d'impôt ${file.taxId}` : "Sans numéro d'impôt";
  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>{title}</CardTitle>
        {file.namesDiffer ? <p className="text-sm text-muted-foreground">Plusieurs noms de contribuable à vérifier.</p> : file.sellerName ? <p className="text-sm font-bold">{file.sellerName}</p> : null}
        <p className="text-xs text-muted-foreground">{file.reports.length === 1 ? "1 constat" : `${file.reports.length} constats`} · dernier le {reportedAtLabel(file.latestAt)}</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {file.reports.map((report) => {
          const finding = findingLabel(report.finding);
          const proof = proofLabel(report.proof);
          return (
            <article key={report.reportId} className="grid gap-1 rounded-lg border p-4 text-sm">
              <p className="font-bold">{qualificationDecisionLabel(report.decision)}{finding ? ` · ${finding}` : ""}{proof ? ` · ${proof}` : ""}</p>
              <p>{report.justification}</p>
              {report.sellerName ? <p className="text-xs text-muted-foreground">Nom saisi : {report.sellerName}</p> : null}
              <Link href={`/signalements/${report.reportId}`} className="w-fit text-primary underline-offset-4 hover:underline">Ouvrir le signalement {report.identifier}</Link>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
