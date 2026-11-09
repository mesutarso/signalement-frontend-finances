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
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { ViewTabs } from "@/components/view-tabs";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

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
  return <Suspense fallback={<PageSkeleton />}><Supervision searchParams={searchParams} /></Suspense>;
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
    <Page className="max-w-6xl">
      <PageHeader title="Contrôle" />
      <div className="grid gap-5">
        <ViewTabs label="Filtrer le contrôle" items={FILTERS.map((filter) => ({ href: `/supervision?status=${filter.value}`, label: filter.label, active: filter.value === status }))} />
        {!queue ? <Alert variant="destructive"><AlertTitle>Le contrôle est indisponible. Actualisez la page.</AlertTitle></Alert> : queue.items.length === 0 ? <LedgerEmpty className="border-t-0">Aucun dossier dans cette liste.</LedgerEmpty> : (
          <div className="grid gap-5">
            <Ledger>
              {queue.items.map((item) => {
                const finding = findingLabel(item.finding);
                const proof = proofLabel(item.proof);
                return (
                  <LedgerItem
                    key={item.qualificationId}
                    title={qualificationDecisionLabel(item.decision)}
                    status={<Badge variant={item.reviewResult === "upheld" ? "success" : item.reviewResult ? "destructive" : "warning"}>{item.reviewResult ? supervisionResultLabel(item.reviewResult) : "À revoir"}</Badge>}
                    meta={`Qualifié le ${reportedAtLabel(item.qualifiedAt)}${item.qualifierName ? ` par ${item.qualifierName}` : ""}`}
                    action={canReview ? <ActionDialog label="Examiner" title="Examiner la décision" description={item.identifier} variant="default" size="sm"><SupervisionForm reportId={item.reportId} /></ActionDialog> : undefined}
                  >
                    {finding ? <p className="font-medium">{finding}{proof ? <span className="font-normal text-muted-foreground"> · {proof}</span> : ""}</p> : null}
                    <p>{item.justification}</p>
                    {item.reviewReason ? <p className="text-muted-foreground">Motif du contrôle : {item.reviewReason}{item.reviewerName ? ` — ${item.reviewerName}` : ""}</p> : null}
                    <ReportLink id={item.reportId} reference={item.identifier} />
                  </LedgerItem>
                );
              })}
            </Ledger>
            <TablePagination page={queue.page} size={queue.size} total={queue.total} label="Pagination du contrôle" />
          </div>
        )}
      </div>
    </Page>
  );
}
