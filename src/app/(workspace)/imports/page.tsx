import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Figure, Figures } from "@/components/figures";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { RefreshButton } from "@/components/refresh-button";
import { ImportControls, RetryImportButton } from "@/modules/report/ui/import-controls";
import { ImportRefresh } from "@/modules/report/ui/import-refresh";

type Run = { id: string; status: string; createdReports: number; skippedReports: number; createdPhotos: number; errorCode: string | null; startedAt: string; finishedAt: string | null; periodStart: string | null; periodEnd: string | null; triggerType: string };
type History = { runs: Run[]; page: number; size: number; total: number; scheduleEnabled: boolean; cron: string; timezone: string; active: boolean; nextRun: string | null };
const statuses: Record<string, string> = { queued: "En attente", running: "En cours", completed: "Terminé", failed: "Échec" };
const triggers: Record<string, string> = { manual: "Manuel", retry: "Relance", scheduled: "Automatique", startup: "Démarrage" };
const errors: Record<string, string> = { "circuit-open": "Récupération temporairement indisponible. Réessayez dans une minute.", interrupted: "Import interrompu. Relancez la période.", "missing-photo": "Photos manquantes", source: "Récupération des signalements indisponible", "page-limit": "Import incomplet. Réduisez la période et relancez.", "import-error": "Traitement interrompu", "dispatch-error": "Impossible de lancer l’import. Réessayez." };
function time(value: string) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Kinshasa" }).format(new Date(value)); }

export default function ImportsPage({ searchParams }: PageProps<"/imports">) {
  return <Suspense fallback={<PageSkeleton />}><Imports searchParams={searchParams} /></Suspense>;
}
async function Imports({ searchParams }: Pick<PageProps<"/imports">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (account.role === "AUDITOR") redirect("/signalements");
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const history = await readJson<History>(`/api/report-imports?page=${page}`).catch(() => null);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return (
    <Page>
      <ImportRefresh />
      <PageHeader title="Imports" actions={<RefreshButton />} />
      {!history ? <Alert variant="destructive"><AlertTitle>Le suivi des imports est indisponible. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <Figures columns={3}>
            <Figure compact label="Planification" value={history.scheduleEnabled ? "Activée" : "Désactivée"} note="Toutes les 3 heures · Kinshasa" />
            <Figure compact label="Prochain lancement" value={history.nextRun ? time(history.nextRun) : "Non planifié"} />
            <Figure compact label="Traitement" value={history.active ? "Import en cours" : "Disponible"} />
          </Figures>
          <Card>
            <CardHeader><CardTitle>Importer une période</CardTitle></CardHeader>
            <CardContent className="max-w-2xl"><ImportControls today={today} busy={history.active} /></CardContent>
          </Card>
          <PageSection title="Traitements">
            <div className="grid gap-4">
              <Table aria-label="Traitements d’import">
                <TableHeader>
                  <TableRow>
                    {[["Lancement"], ["Période"], ["Origine"], ["État"], ["Ajoutés", "text-right"], ["Déjà présents", "text-right"], ["Photos", "text-right"], ["Fin"], ["", "w-20"]].map(([title, className]) => <TableHead key={title || "actions"} className={className}>{title || <span className="sr-only">Actions</span>}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.runs.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="tabular-nums">{time(run.startedAt)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{run.periodStart && run.periodEnd ? `${run.periodStart} au ${run.periodEnd}` : "Non renseignée"}</TableCell>
                      <TableCell>{triggers[run.triggerType] ?? run.triggerType}</TableCell>
                      <TableCell>
                        <Badge variant={run.status === "completed" ? "success" : run.status === "failed" ? "destructive" : "secondary"}>{statuses[run.status] ?? run.status}</Badge>
                        {run.errorCode ? <p className="mt-1.5 max-w-48 text-[13px] leading-5 whitespace-normal text-muted-foreground">{errors[run.errorCode] ?? "Import interrompu. Relancez la période."}</p> : null}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{run.createdReports}</TableCell>
                      <TableCell className="text-right tabular-nums">{run.skippedReports}</TableCell>
                      <TableCell className="text-right tabular-nums">{run.createdPhotos}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{run.finishedAt ? time(run.finishedAt) : "—"}</TableCell>
                      <TableCell>{run.periodStart && run.periodEnd && !["running", "queued"].includes(run.status) ? <RetryImportButton id={run.id} disabled={history.active} /> : null}</TableCell>
                    </TableRow>
                  ))}
                  {history.runs.length === 0 ? <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Aucun import enregistré</TableCell></TableRow> : null}
                </TableBody>
              </Table>
              <TablePagination page={history.page} size={history.size} total={history.total} label="Pagination des imports" />
            </div>
          </PageSection>
        </>
      )}
    </Page>
  );
}
