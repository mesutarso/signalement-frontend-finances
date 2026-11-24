import type { ReactNode } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Page } from "@/components/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requiresFiscalReview, type AssessmentView } from "@/modules/report/model/assessment";
import { findingLabel, formatDeclarantName, reportedAtLabel, reportedAtParts, reportTitle, supervisionResultLabel, type Assignee, type ReportDetail } from "@/modules/report/model/report";
import { AssessmentPanel } from "@/modules/report/ui/assessment-panel";
import { AssignmentForm } from "@/modules/report/ui/assignment-form";
import { DuplicateAlerts } from "@/modules/report/ui/duplicate-alerts";
import { ReportAnalysisRefresh } from "@/modules/report/ui/report-analysis-refresh";
import { ValidationTag } from "@/modules/report/ui/report-marks";
import { ReportWorkspace } from "@/modules/report/ui/report-photos";

export function ReportScreen({
  report,
  canAnalyze,
  canAssign,
  canReview,
  canDecide,
  canModifyDecision,
  assignees,
  assessment,
  followUp,
  followUpOpen,
  backHref = "/signalements",
}: {
  report: ReportDetail;
  canAnalyze: boolean;
  canAssign: boolean;
  canReview: boolean;
  canDecide: boolean;
  canModifyDecision: boolean;
  assignees: Assignee[];
  assessment: AssessmentView | null;
  followUp?: ReactNode;
  followUpOpen?: boolean;
  backHref?: string;
}) {
  const reporterName = formatDeclarantName(report.reporterName);
  const hasReporter = reporterName || report.reporterEmail || report.reporterPhone;
  const received = reportedAtParts(report.reportedAt);
  const current = assessment?.assessment;
  const validationState = report.historicalDecision === "confirm" ? "validated"
    : report.historicalDecision === "reject" ? "rejected" : current?.state ?? report.validationState;
  const analysisPending = current ? current.jobState !== "done" : ["queued", "analyzing"].includes(validationState);
  const analysisPhotoId = current?.photoId;
  const analysisPiece = report.photos.findIndex((photo) => photo.id === analysisPhotoId) + 1;

  const hasOpenDuplicate = report.duplicates.some((alert) => alert.status === "open");
  const duplicates = report.duplicates.length ? (
    <DuplicateAlerts reportId={report.id} alerts={report.duplicates} canDecide={canReview} reportedAt={report.reportedAt} />
  ) : null;
  const reviewAction = canDecide && assessment && current?.state === "doubt" && !analysisPending
    ? reportReviewAction(assessment, hasOpenDuplicate) : null;

  const information = (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section aria-labelledby="report-description" className="grid content-start gap-2">
        <h2 id="report-description" className="text-[15px] font-semibold">Description</h2>
        <p className="max-w-[68ch] text-sm leading-6 wrap-anywhere whitespace-pre-wrap">{report.description || <span className="text-muted-foreground">Aucune description renseignée.</span>}</p>
      </section>
      {hasReporter ? (
        <section aria-labelledby="report-declarant" className="grid content-start gap-2">
          <h2 id="report-declarant" className="text-[15px] font-semibold">Déclarant</h2>
          <div className="grid gap-1 text-sm leading-6">
            {reporterName ? <p className="wrap-anywhere">{reporterName}</p> : null}
            {report.reporterPhone ? <p className="wrap-anywhere">{report.reporterPhone}</p> : null}
            {report.reporterEmail ? <p className="wrap-anywhere">{report.reporterEmail}</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );

  const reviewHistory = report.reviews.length > 0 ? (
    <details className="rounded-md border px-4">
      <summary className="cursor-pointer py-3 text-sm font-medium">Historique des contrôles</summary>
      <ul className="divide-y border-t">
        {report.reviews.map((review) => (
          <li key={review.id} className="grid gap-1 py-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{supervisionResultLabel(review.result)}</p>
              <p className="text-xs text-muted-foreground">{reportedAtLabel(review.recordedAt)}</p>
            </div>
            <p className="wrap-anywhere">{review.reason}</p>
            <p className="text-xs text-muted-foreground">Par {review.actorName ?? "Compte introuvable"}</p>
          </li>
        ))}
      </ul>
    </details>
  ) : null;

  const analysis = (
    <section id="report-verification" aria-labelledby="report-verification-heading" tabIndex={-1}
      className="grid min-w-0 scroll-mt-20 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="report-verification-heading" className="text-base font-semibold">Résultat de l’analyse</h2>
        <ValidationTag state={validationState} assignmentState={report.state} />
      </div>
      {report.photos.length > 1 && analysisPiece > 0 ? (
        <p className="text-sm text-muted-foreground">Pièce analysée : {analysisPiece}</p>
      ) : null}
      {assessment && !analysisPending ? (
        <>
          <ReportOutcome view={assessment} />
          <AssessmentPanel
            view={assessment}
            canReview={canReview}
            canDecide={canDecide}
            canModifyDecision={canModifyDecision}
            openDuplicates={hasOpenDuplicate ? duplicates : null}
          />
        </>
      ) : !analysisPending ? <p className="text-sm text-muted-foreground">Aucun résultat d’analyse automatique disponible.</p> : null}
      {!hasOpenDuplicate || !assessment || analysisPending ? duplicates : null}
      {reviewHistory}
    </section>
  );

  return (
    <Page className="gap-5 md:gap-6">
      {analysisPending ? (
        <ReportAnalysisRefresh key={report.id} reportId={report.id} prioritize={canAnalyze && validationState === "queued"} />
      ) : null}
      <ReportWorkspace
        key={report.id}
        header={{
          compact: true,
          back: { href: backHref, label: backHref.startsWith("/dossiers-valides") ? "Dossiers" : "Signalements" },
          title: (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="min-w-0 wrap-anywhere">{reportTitle(report.title)}</span>
              <ValidationTag state={validationState} assignmentState={report.state} />
            </span>
          ),
          children: (
            <dl className="flex flex-wrap items-start gap-x-7 gap-y-3 border-t pt-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Agent</dt>
                <dd className="mt-0.5 wrap-anywhere">{report.assigneeName ?? "Non affecté"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Reçu le</dt>
                <dd className="mt-0.5 tabular-nums">{received.date} à {received.time}</dd>
              </div>
            </dl>
          ),
        }}
        assignment={canAssign ? (
          <ActionDialog label={report.assigneeId ? "Modifier l’affectation" : "Affecter le dossier"} title="Affectation">
            <AssignmentForm reportId={report.id} version={report.version} assigneeId={report.assigneeId} assignees={assignees} />
          </ActionDialog>
        ) : null}
        reviewAction={reviewAction}
        reportId={report.id}
        photos={report.photos}
        photoRequests={report.photoRequests}
        canRequest={canReview}
        analysisPhotoId={analysisPhotoId}
        analysisPending={analysisPending}
        information={information}
        analysis={analysis}
        administration={followUp ? <div className="grid gap-5">{followUp}</div> : null}
        showAdministration={followUpOpen}
      />
    </Page>
  );
}

function reportReviewAction(view: AssessmentView, hasOpenDuplicate: boolean) {
  if (hasOpenDuplicate) return { target: "report-duplicates", label: "Examiner le doublon" };
  if (requiresFiscalReview(view) && view.assessment.vatStatus === "unknown") {
    return { target: "report-fiscal-review", label: "Vérifier l’assujettissement" };
  }
  return { target: "report-verification", label: "Traiter le signalement" };
}

function ReportOutcome({ view }: { view: AssessmentView }) {
  const current = view.assessment;
  const validated = current.state === "validated";
  const rejected = current.state === "rejected";
  const reason = validated ? findingLabel(view.finding) ?? current.reason : current.reason;

  return (
    <Alert id="report-outcome" role="status" aria-live="polite" variant={rejected ? "destructive" : "default"} className="wrap-anywhere">
      <AlertTitle>{validated ? "Votre signalement a été validé." : rejected ? "Motif du rejet" : reason}</AlertTitle>
      {validated || rejected ? <AlertDescription>{reason}</AlertDescription> : null}
    </Alert>
  );
}
