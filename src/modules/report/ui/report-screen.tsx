import { ReportNavigation } from "@/modules/report/ui/report-navigation";
import { ActionDialog } from "@/components/action-dialog";
import { Page, PageHeader } from "@/components/page";
import { reportedAtLabel, reportedAtParts, reportTitle, supervisionResultLabel, type Assignee, type ReportDetail } from "@/modules/report/model/report";
import { AssignmentForm } from "@/modules/report/ui/assignment-form";
import { DuplicateAlerts } from "@/modules/report/ui/duplicate-alerts";
import { ReportPhotos } from "@/modules/report/ui/report-photos";
import { AssessmentPanel } from "@/modules/report/ui/assessment-panel";
import type { AssessmentView } from "@/modules/report/model/assessment";
import { ValidationTag } from "@/modules/report/ui/report-marks";
import { Button } from "@/components/ui/button";

export function ReportScreen({
  report,
  canAssign,
  canReview,
  canDecide,
  assignees,
  assessment,
  backHref = "/signalements", nextHref, previousHref,
}: {
  report: ReportDetail;
  canAssign: boolean;
  canReview: boolean;
  canDecide: boolean;
  assignees: Assignee[];
  assessment: AssessmentView | null;
  backHref?: string; nextHref?: string; previousHref?: string;
}) {
  const hasReporter = report.reporterName || report.reporterEmail || report.reporterPhone;
  const received = reportedAtParts(report.reportedAt);
  const hasOpenDuplicate = report.duplicates.some((alert) => alert.status === "open");

  const facts: [string, React.ReactNode][] = [
    ["Statut", <ValidationTag key="state" state={report.validationState} assignmentState={report.state} screeningReason={report.screeningReason} />],
    ["Agent responsable", report.assigneeName ?? <span key="none" className="text-muted-foreground">Aucun agent affecté</span>],
    ["Reçu le", <span key="date" className="tabular-nums">{received.date} <span className="text-muted-foreground">à {received.time}</span></span>],
  ];

  return (
    <Page className="gap-8 md:gap-10">
      <PageHeader
        compact
        back={{ href: backHref, label: backHref.startsWith("/dossiers-valides") ? "Dossiers validés" : "Signalements" }}
        title={reportTitle(report.title)}
        actions={
          <>
            <ReportNavigation key={`${report.id}:${backHref}`} nextHref={nextHref} previousHref={previousHref} />
            {canAssign ? (
              <ActionDialog label="Modifier l’affectation" title="Affectation" variant="default">
                <AssignmentForm reportId={report.id} version={report.version} assigneeId={report.assigneeId} assignees={assignees} />
              </ActionDialog>
            ) : null}
          </>
        }
      />

      <dl className="-mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-b-border border-t-foreground py-4 md:grid-cols-[auto_1fr_auto] md:gap-x-12">
        {facts.map(([label, value]) => (
          <div key={label} className="grid content-start gap-1.5">
            <dt className="text-[13px] text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="report-description" className="grid content-start gap-2">
          <h2 id="report-description" className="text-[15px] font-bold">Description</h2>
          <p className="max-w-[68ch] text-[15px] leading-7 break-words whitespace-pre-wrap">{report.description || <span className="text-muted-foreground">Aucune description renseignée.</span>}</p>
        </section>
        {hasReporter ? (
          <section aria-labelledby="report-declarant" className="grid content-start gap-2">
            <h2 id="report-declarant" className="text-[15px] font-bold">Déclarant</h2>
            <div className="grid gap-1 text-sm leading-6">
              {report.reporterName ? <p className="break-words">{report.reporterName}</p> : null}
              {report.reporterPhone ? <div className="flex flex-wrap items-center gap-2">
                <span>{report.reporterPhone}</span>
                <Button variant="outline" size="sm" nativeButton={false} render={<a href={`tel:${report.reporterPhone.replace(/[^+\d]/g, "")}`} />}>Appeler</Button>
              </div> : null}
              {report.reporterEmail ? <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 break-all">{report.reporterEmail}</span>
                <Button variant="outline" size="sm" nativeButton={false} render={<a href={`mailto:${report.reporterEmail}`} />}>Écrire</Button>
              </div> : null}
            </div>
          </section>
        ) : null}
      </div>

      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-2">
        <section aria-labelledby="report-attachments" className="grid min-w-0 content-start gap-4">
          <div className="flex items-baseline justify-between gap-3 border-t border-foreground pt-3.5">
            <h2 id="report-attachments" className="text-[15px] font-bold">Pièces jointes</h2>
            <span className="text-[13px] text-muted-foreground tabular-nums">{report.photos.length}</span>
          </div>
          <ReportPhotos reportId={report.id} photos={report.photos} photoRequests={report.photoRequests} canRequest={canReview} />
        </section>
        <div className="grid min-w-0 content-start gap-8">
          {assessment ? <section aria-labelledby="report-verification" className="grid gap-4 border-t border-foreground pt-3.5">
            <h2 id="report-verification" className="text-[15px] font-bold">Vérification</h2>
            {hasOpenDuplicate ? <Button variant="outline" size="sm" className="w-fit" nativeButton={false} render={<a href="#report-duplicates" />}>Voir les rapprochements à vérifier</Button> : null}
            <AssessmentPanel view={assessment} reference={report.identifier} canReview={canReview} canDecide={canDecide} />
          </section> : null}
          {report.duplicates.length > 0 ? (
            <DuplicateAlerts reportId={report.id} alerts={report.duplicates} canDecide={canReview} reportedAt={report.reportedAt} />
          ) : null}
          {report.reviews.length > 0 ? (
            <section aria-labelledby="report-control" className="grid gap-4 border-t border-foreground pt-3.5">
              <h2 id="report-control" className="text-[15px] font-bold">Contrôle</h2>
              <ul>
                {report.reviews.map((review) => (
                  <li key={review.id} className="grid gap-1 border-b py-4 text-sm leading-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-bold">{supervisionResultLabel(review.result)}</p>
                      <p className="text-[13px] text-muted-foreground">{reportedAtLabel(review.recordedAt)}</p>
                    </div>
                    <p>{review.reason}</p>
                    <p className="text-[13px] text-muted-foreground">Par {review.actorName ?? "Compte introuvable"}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
