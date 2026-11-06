import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { RefreshButton } from "@/components/refresh-button";
import { ImportControls, RetryImportButton } from "@/modules/report/ui/import-controls";
import { ImportRefresh } from "@/modules/report/ui/import-refresh";

type Run = { id: string; status: string; createdReports: number; skippedReports: number; createdPhotos: number; errorCode: string | null; startedAt: string; finishedAt: string | null; periodStart: string | null; periodEnd: string | null; triggerType: string };
type History = { runs: Run[]; page: number; size: number; total: number; scheduleEnabled: boolean; cron: string; timezone: string; active: boolean; nextRun: string | null };
const statuses: Record<string, string> = { queued: "En attente", running: "En cours", completed: "Terminé", failed: "Échec" };
const triggers: Record<string, string> = { manual: "Manuel", retry: "Relance", scheduled: "Automatique", startup: "Démarrage" };
const errors: Record<string, string> = { "circuit-open": "API temporairement suspendue après plusieurs échecs. Réessayez dans une minute.", interrupted: "Interrompu après arrêt du service", "missing-photo": "Photos manquantes", source: "Source indisponible", "page-limit": "Limite de pages atteinte", "import-error": "Traitement interrompu", "dispatch-error": "Lancement impossible" };
function time(value: string) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Kinshasa" }).format(new Date(value)); }

export default function Page({ searchParams }: PageProps<"/imports">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Imports searchParams={searchParams} /></Suspense>;
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
  return <section className="flex flex-col gap-8"><ImportRefresh /><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold text-primary">Imports</h1><RefreshButton /></div>
    {!history ? <Alert variant="destructive"><AlertTitle>Le suivi des imports est indisponible. Actualisez la page.</AlertTitle></Alert> : <>
      <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Planification</CardTitle></CardHeader><CardContent className="grid gap-2"><Badge variant={history.scheduleEnabled ? "success" : "secondary"}>{history.scheduleEnabled ? "Activée" : "Désactivée"}</Badge><p className="text-sm">Toutes les 3 heures · Kinshasa</p></CardContent></Card><Card><CardHeader><CardTitle>Prochain lancement</CardTitle></CardHeader><CardContent><p className="text-lg font-bold">{history.nextRun ? time(history.nextRun) : "Non planifié"}</p></CardContent></Card><Card><CardHeader><CardTitle>Traitement</CardTitle></CardHeader><CardContent><Badge variant="secondary">{history.active ? "Import en cours" : "Disponible"}</Badge></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Importer une période</CardTitle></CardHeader><CardContent><ImportControls today={today} busy={history.active} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Historique des imports</CardTitle></CardHeader><CardContent className="flex flex-col gap-5"><Table aria-label="Historique des imports"><TableHeader><TableRow>{["Lancement", "Période", "Origine", "État", "Ajoutés", "Déjà présents", "Photos ajoutées", "Fin", "Actions"].map((title) => <TableHead key={title}>{title}</TableHead>)}</TableRow></TableHeader><TableBody>{history.runs.map((run) => <TableRow key={run.id}><TableCell>{time(run.startedAt)}</TableCell><TableCell>{run.periodStart && run.periodEnd ? `${run.periodStart} au ${run.periodEnd}` : "Non renseignée"}</TableCell><TableCell>{triggers[run.triggerType] ?? run.triggerType}</TableCell><TableCell><Badge variant={run.status === "completed" ? "success" : run.status === "failed" ? "destructive" : "secondary"}>{statuses[run.status] ?? run.status}</Badge>{run.errorCode ? <p className="mt-2 max-w-48 whitespace-normal text-xs">{errors[run.errorCode] ?? "Import interrompu. Relancez la période."}</p> : null}</TableCell><TableCell>{run.createdReports}</TableCell><TableCell>{run.skippedReports}</TableCell><TableCell>{run.createdPhotos}</TableCell><TableCell>{run.finishedAt ? time(run.finishedAt) : "—"}</TableCell><TableCell>{run.periodStart && run.periodEnd && !["running", "queued"].includes(run.status) ? <RetryImportButton id={run.id} disabled={history.active} /> : "—"}</TableCell></TableRow>)}{history.runs.length === 0 ? <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Aucun import enregistré</TableCell></TableRow> : null}</TableBody></Table><TablePagination page={history.page} size={history.size} total={history.total} label="Pagination des imports" /></CardContent></Card>
    </>}
  </section>;
}
