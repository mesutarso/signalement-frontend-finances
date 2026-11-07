import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import type { PointMovement } from "@/modules/report/ui/points-panel";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

type Page = { items: PointMovement[]; page: number; size: number; total: number; net: number };

export default function PointsPage({ searchParams }: PageProps<"/points">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Points searchParams={searchParams} /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Points</h1>
      </div>
      {!points ? <Alert variant="destructive"><AlertTitle>Les points sont indisponibles. Actualisez la page.</AlertTitle></Alert> : points.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun point crédité.</p> : (
        <>
          <div className="grid gap-4">
            {points.items.map((movement) => {
              const total = movement.basePoints + movement.bonusPoints;
              const finding = findingLabel(movement.finding);
              return (
                <Card key={movement.id}>
                  <CardHeader className="gap-2">
                    <CardTitle>{total > 0 ? `+${total}` : total} point{Math.abs(total) > 1 ? "s" : ""}</CardTitle>
                    <p className="text-sm font-bold">{movement.kind === "credit" ? "Crédit" : "Annulation"}{finding ? ` · ${finding}` : ""}</p>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm">
                    <p>Dépôt du {calendarLabel(movement.filedOn)}. Enregistré le {reportedAtLabel(movement.recordedAt)}.</p>
                    {movement.reason ? <p>{movement.reason}</p> : null}
                    <Link href={`/signalements/${movement.reportId}`} className="w-fit text-primary underline-offset-4 hover:underline">Ouvrir le signalement {movement.reportReference}</Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <TablePagination page={points.page} size={points.size} total={points.total} label="Pagination des points" />
        </>
      )}
    </section>
  );
}
