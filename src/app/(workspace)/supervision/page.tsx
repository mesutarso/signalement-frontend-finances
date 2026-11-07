import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import {
  findingLabel,
  proofLabel,
  qualificationDecisionLabel,
  reportedAtLabel,
  supervisionResultLabel,
} from "@/modules/report/model/report";
import { SupervisionForm } from "@/modules/report/ui/supervision-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

type Item = {
  reportId: string;
  identifier: string;
  reportedAt: string;
  title: string | null;
  qualificationId: string;
  decision: string;
  finding: string | null;
  proof: string | null;
  justification: string;
  qualifierName: string | null;
  qualifiedAt: string;
  reviewResult: string | null;
  reviewReason: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
};
type Page = { items: Item[]; page: number; size: number; total: number };

const FILTERS = [
  { value: "open", label: "À revoir" },
  { value: "returned", label: "Renvoyés" },
  { value: "upheld", label: "Maintenus" },
  { value: "all", label: "Tous" },
];

export default function SupervisionPage({ searchParams }: PageProps<"/supervision">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Supervision searchParams={searchParams} /></Suspense>;
}

async function Supervision({ searchParams }: Pick<PageProps<"/supervision">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (account.role === "AGENT") {
    redirect("/signalements");
  }
  const params = await searchParams;
  const status = FILTERS.some((filter) => filter.value === params.status) ? String(params.status) : "open";
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const queue = await readJson<Page>(`/api/supervision?status=${status}&page=${page}`).catch(() => null);
  const canReview = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Contrôle</h1>
      </div>
      <form className="flex flex-wrap gap-2" method="get">
        {FILTERS.map((filter) => (
          <Button key={filter.value} type="submit" name="status" value={filter.value} variant={filter.value === status ? "default" : "outline"}>{filter.label}</Button>
        ))}
      </form>
      {!queue ? <Alert variant="destructive"><AlertTitle>Le contrôle est indisponible. Actualisez la page.</AlertTitle></Alert> : queue.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun dossier dans cette liste.</p> : (
        <>
          <div className="grid gap-4">
            {queue.items.map((item) => {
              const finding = findingLabel(item.finding);
              const proof = proofLabel(item.proof);
              return (
                <Card key={item.qualificationId}>
                  <CardHeader className="gap-2">
                    <CardTitle>{item.reviewResult ? supervisionResultLabel(item.reviewResult) : "À revoir"}</CardTitle>
                    <p className="text-sm font-bold">{qualificationDecisionLabel(item.decision)}{finding ? ` · ${finding}` : ""}{proof ? ` · ${proof}` : ""}</p>
                    <p className="text-sm">{item.justification}</p>
                    <p className="text-xs text-muted-foreground">Qualifié le {reportedAtLabel(item.qualifiedAt)}{item.qualifierName ? ` par ${item.qualifierName}` : ""}</p>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <Link href={`/signalements/${item.reportId}`} className="w-fit text-sm text-primary underline-offset-4 hover:underline">Ouvrir le signalement {item.identifier}</Link>
                    {item.reviewReason ? <p className="text-sm text-muted-foreground">Motif du contrôle : {item.reviewReason}{item.reviewerName ? ` — ${item.reviewerName}` : ""}</p> : null}
                    {canReview ? <SupervisionForm reportId={item.reportId} /> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <TablePagination page={queue.page} size={queue.size} total={queue.total} label="Pagination du contrôle" />
        </>
      )}
    </section>
  );
}
