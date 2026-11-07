import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { priorityLabel, reportedAtLabel, stateLabel, supervisionResultLabel, type Assignee, type ReportDetail } from "@/modules/report/model/report";
import { AssignmentForm } from "@/modules/report/ui/assignment-form";
import { DuplicateAlerts } from "@/modules/report/ui/duplicate-alerts";
import { QualificationPanel } from "@/modules/report/ui/qualification-panel";
import { PointsPanel, type PointMovement } from "@/modules/report/ui/points-panel";
import { PrimePanel } from "@/modules/report/ui/prime-panel";
import type { PrimeAccount } from "@/modules/report/model/prime";
import { ReportActionDialog } from "@/modules/report/ui/report-action-dialog";
import { ReportPhotos } from "@/modules/report/ui/report-photos";

export function ReportScreen({
  report,
  canAssign,
  canRequest,
  assignees,
  points,
  prime,
}: {
  report: ReportDetail;
  canAssign: boolean;
  canRequest: boolean;
  assignees: Assignee[];
  points: { items: PointMovement[]; net: number } | null;
  prime: PrimeAccount | null;
}) {
  const hasReporter = report.reporterName || report.reporterEmail || report.reporterPhone;
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <Link href="/signalements" className="w-fit text-sm font-bold text-primary underline-offset-4 hover:underline">← Retour aux signalements</Link>
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Reçu le {reportedAtLabel(report.reportedAt)}</p>
            <Badge variant="secondary">{stateLabel(report.state)}</Badge>
          </div>
          <h1 className="max-w-4xl break-words text-2xl leading-tight font-bold text-primary sm:text-3xl">{report.title || "Signalement sans titre"}</h1>
            <div className="flex flex-wrap justify-end gap-3">
              {canAssign ? <ReportActionDialog label="Modifier l’affectation" title="Affectation et priorité" primary><AssignmentForm reportId={report.id} version={report.version} priority={report.priority} assigneeId={report.assigneeId} assignees={assignees} /></ReportActionDialog> : null}
              <ReportActionDialog label={`Voir l’historique (${report.assignments.length})`} title="Historique des affectations">
              <div className="mt-4 pb-2">{report.assignments.length === 0 ? <p className="text-sm text-muted-foreground">Aucune affectation enregistrée.</p> : <ol className="flex flex-col divide-y">{report.assignments.map((entry, index) => <li key={`${entry.recordedAt}-${index}`} className="grid gap-2 py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold">{entry.assigneeName ? `Affecté à ${entry.assigneeName}` : "Affectation retirée"}</p><span className="text-xs text-muted-foreground">{reportedAtLabel(entry.recordedAt)}</span></div><p className="text-xs text-muted-foreground">Par {entry.actorName ?? "Compte introuvable"} · Priorité {priorityLabel(entry.priority).toLowerCase()}</p></li>)}</ol>}</div>
              </ReportActionDialog>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Separator />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="flex min-w-0 flex-col gap-8">
              <section aria-labelledby="report-description" className="grid gap-3">
                <h2 id="report-description" className="text-sm font-bold">Description</h2>
                <p className="text-sm leading-7 break-words whitespace-pre-wrap">{report.description || "Aucune description renseignée."}</p>
              </section>
              {hasReporter ? <section aria-labelledby="report-declarant" className="grid gap-4">
                <h2 id="report-declarant" className="text-sm font-bold">Déclarant</h2>
                <dl className="grid gap-4 text-sm">
                  {report.reporterName ? <div className="grid gap-1"><dt className="text-xs text-muted-foreground">Nom</dt><dd className="break-words font-bold">{report.reporterName}</dd></div> : null}
                  {report.reporterPhone ? <div className="grid gap-1"><dt className="text-xs text-muted-foreground">Téléphone</dt><dd><a href={`tel:${report.reporterPhone.replace(/[^+\d]/g, "")}`} className="break-all text-primary underline-offset-4 hover:underline">{report.reporterPhone}</a></dd></div> : null}
                  {report.reporterEmail ? <div className="grid gap-1"><dt className="text-xs text-muted-foreground">E-mail</dt><dd><a href={`mailto:${report.reporterEmail}`} className="break-all text-primary underline-offset-4 hover:underline">{report.reporterEmail}</a></dd></div> : null}
                </dl>
              </section> : null}
              <div className="grid gap-1"><span className="text-xs text-muted-foreground">Référence du signalement</span><span className="break-all text-xs">{report.identifier}</span></div>
            </div>
            <section aria-labelledby="report-attachments" className="flex min-w-0 flex-col gap-4">
              <h2 id="report-attachments" className="text-sm font-bold">Pièces jointes ({report.photos.length})</h2>
              <ReportPhotos reportId={report.id} photos={report.photos} photoRequests={report.photoRequests} canRequest={canRequest} />
            </section>
          </div>
          <Separator />
          <section aria-labelledby="report-processing" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="grid gap-1"><h2 id="report-processing" className="text-sm font-bold">Traitement du dossier</h2><p className="text-sm text-muted-foreground">{report.assigneeName ? `Agent responsable : ${report.assigneeName}` : "Aucun agent affecté"}</p></div>
              <Badge variant={report.priority === "urgent" ? "destructive" : "outline"}>Priorité : {priorityLabel(report.priority)}</Badge>
            </div>
            <QualificationPanel reportId={report.id} qualifications={report.qualifications} canDecide={canRequest} />
            {points ? <PointsPanel reportId={report.id} movements={points.items} net={points.net} canCredit={canAssign} /> : <p className="text-sm text-muted-foreground">Les points sont indisponibles. Actualisez la page.</p>}
            {prime ? <PrimePanel account={prime} reportId={report.id} canReview={canAssign} /> : <p className="text-sm text-muted-foreground">Les primes sont indisponibles. Actualisez la page.</p>}
            {report.reviews.length > 0 ? (
              <section aria-labelledby="report-supervision" className="grid gap-3">
                <h3 id="report-supervision" className="text-sm font-bold">Contrôle</h3>
                {report.reviews.map((review) => (
                  <article key={review.id} className="grid gap-2 rounded-lg border p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{supervisionResultLabel(review.result)}</p>
                      <p className="text-xs text-muted-foreground">{reportedAtLabel(review.recordedAt)}</p>
                    </div>
                    <p>{review.reason}</p>
                    <p className="text-xs text-muted-foreground">Par {review.actorName ?? "Compte introuvable"}. La décision déjà enregistrée reste en place.</p>
                  </article>
                ))}
              </section>
            ) : null}
            <DuplicateAlerts reportId={report.id} alerts={report.duplicates} canDecide={canRequest} />

          </section>
        </CardContent>
      </Card>
    </section>
  );
}
