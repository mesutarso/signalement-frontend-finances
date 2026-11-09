import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import type { PointMovement } from "@/modules/report/ui/points-panel";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

type Page = { items: PointMovement[]; page: number; size: number; total: number; net: number };

export default function PointsPage({ searchParams }: PageProps<"/points">) {
  return <Suspense fallback={<PageSkeleton />}><Points searchParams={searchParams} /></Suspense>;
}

async function Points({ searchParams }: Pick<PageProps<"/points">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const points = await readJson<Page>(`/api/points?page=${page}`).catch(() => null);
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Points" description={points ? `Solde net de ${points.net.toLocaleString("fr-FR")} points, ${points.total.toLocaleString("fr-FR")} mouvements enregistrés.` : undefined} />
      {!points ? <Alert variant="destructive"><AlertTitle>Les points sont indisponibles. Actualisez la page.</AlertTitle></Alert> : points.items.length === 0 ? <LedgerEmpty>Aucun point crédité.</LedgerEmpty> : (
        <div className="grid gap-5">
          <Ledger>
            {points.items.map((movement) => {
              const total = movement.basePoints + movement.bonusPoints;
              const finding = findingLabel(movement.finding);
              const credit = movement.kind === "credit";
              return (
                <LedgerItem
                  key={movement.id}
                  title={<span className="tabular-nums">{total > 0 ? `+${total}` : total} point{Math.abs(total) > 1 ? "s" : ""}</span>}
                  status={<Badge variant={credit ? "success" : "destructive"}>{credit ? "Crédit" : "Annulation"}</Badge>}
                >
                  {finding ? <p className="font-medium">{finding}</p> : null}
                  <p className="text-muted-foreground">Dépôt du {calendarLabel(movement.filedOn)}. Enregistré le {reportedAtLabel(movement.recordedAt)}.</p>
                  {movement.reason ? <p>{movement.reason}</p> : null}
                  <ReportLink id={movement.reportId} reference={movement.reportReference} />
                </LedgerItem>
              );
            })}
          </Ledger>
          <TablePagination page={points.page} size={points.size} total={points.total} label="Pagination des points" />
        </div>
      )}
    </Page>
  );
}
