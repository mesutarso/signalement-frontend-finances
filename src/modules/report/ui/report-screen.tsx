import { ActionDialog } from "@/components/action-dialog";
import { Page, PageHeader } from "@/components/page";
import { priorityLabel, reportedAtLabel, reportedAtParts, supervisionResultLabel, type Assignee, type ReportDetail } from "@/modules/report/model/report";
import { AssignmentForm } from "@/modules/report/ui/assignment-form";
import { DuplicateAlerts } from "@/modules/report/ui/duplicate-alerts";
import { QualificationPanel } from "@/modules/report/ui/qualification-panel";
import { PointsPanel, type PointMovement } from "@/modules/report/ui/points-panel";
import { PrimePanel } from "@/modules/report/ui/prime-panel";
import type { PrimeAccount } from "@/modules/report/model/prime";
import { PriorityMark, StateTag } from "@/modules/report/ui/report-marks";
import { ReportInstruction, type InstructionTab } from "@/modules/report/ui/report-instruction";
import { ReportPhotos } from "@/modules/report/ui/report-photos";

function Unavailable({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

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
  const received = reportedAtParts(report.reportedAt);
  const openDuplicates = report.duplicates.filter((alert) => alert.status === "open").length;

  const tabs: InstructionTab[] = [
    {
      value: "qualification",
      label: "Qualification",
      count: report.qualifications.length,
      content: <QualificationPanel reportId={report.id} qualifications={report.qualifications} canDecide={canRequest} />,
    },
    {
      value: "doublons",
      label: "Doublons",
      count: report.duplicates.length,
      attention: openDuplicates > 0,
      content: <DuplicateAlerts reportId={report.id} alerts={report.duplicates} canDecide={canRequest} />,
    },
    {
      value: "points",
      label: "Points",
      count: points?.items.length,
      content: points ? <PointsPanel reportId={report.id} movements={points.items} net={points.net} canCredit={canAssign} /> : <Unavailable>Les points sont indisponibles. Actualisez la page.</Unavailable>,
    },
    {
      value: "prime",
      label: "Prime",
      count: prime?.tiers.length,
      content: prime ? <PrimePanel account={prime} reportId={report.id} canReview={canAssign} /> : <Unavailable>Les primes sont indisponibles. Actualisez la page.</Unavailable>,
    },
  ];
  if (report.reviews.length > 0) {
    tabs.push({
      value: "controle",
      label: "Contrôle",
      count: report.reviews.length,
      content: (
        <ul className="border-t">
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
      ),
    });
  }

  const facts: [string, React.ReactNode][] = [
    ["État", <StateTag key="state" state={report.state} />],
    ["Priorité", <PriorityMark key="priority" priority={report.priority} />],
    ["Agent responsable", report.assigneeName ?? <span key="none" className="text-muted-foreground">Aucun agent affecté</span>],
    ["Reçu le", <span key="date" className="tabular-nums">{received.date} <span className="text-muted-foreground">à {received.time}</span></span>],
    ["Référence", <span key="ref" className="ref break-all">{report.identifier}</span>],
  ];

  return (
    <Page className="gap-8 md:gap-10">
      <PageHeader
        compact
        back={{ href: "/signalements", label: "Signalements" }}
        title={report.title || "Signalement sans titre"}
        actions={
          <>
            <ActionDialog label={`Historique (${report.assignments.length})`} title="Historique des affectations" variant="ghost">
              {report.assignments.length === 0 ? <p className="text-sm text-muted-foreground">Aucune affectation enregistrée.</p> : (
                <ol className="flex flex-col divide-y">
                  {report.assignments.map((entry, index) => (
                    <li key={`${entry.recordedAt}-${index}`} className="grid gap-1 py-3.5 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-bold">{entry.assigneeName ? `Affecté à ${entry.assigneeName}` : "Affectation retirée"}</p>
                        <span className="text-[13px] text-muted-foreground">{reportedAtLabel(entry.recordedAt)}</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground">Par {entry.actorName ?? "Compte introuvable"} · Priorité {priorityLabel(entry.priority).toLowerCase()}</p>
                    </li>
                  ))}
                </ol>
              )}
            </ActionDialog>
            {canAssign ? (
              <ActionDialog label="Modifier l’affectation" title="Affectation et priorité" variant="default">
                <AssignmentForm reportId={report.id} version={report.version} priority={report.priority} assigneeId={report.assigneeId} assignees={assignees} />
              </ActionDialog>
            ) : null}
          </>
        }
      />

      <dl className="-mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-b-border border-t-foreground py-4 md:grid-cols-[auto_auto_1fr_auto_auto] md:gap-x-12">
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
              {report.reporterPhone ? <a href={`tel:${report.reporterPhone.replace(/[^+\d]/g, "")}`} className="w-fit break-all text-primary underline-offset-4 hover:underline">{report.reporterPhone}</a> : null}
              {report.reporterEmail ? <a href={`mailto:${report.reporterEmail}`} className="w-fit break-all text-primary underline-offset-4 hover:underline">{report.reporterEmail}</a> : null}
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
          <ReportPhotos reportId={report.id} photos={report.photos} photoRequests={report.photoRequests} canRequest={canRequest} />
        </section>
        <section aria-label="Traitement du dossier" className="min-w-0">
          <ReportInstruction
            tabs={tabs}
            notice={openDuplicates > 0 ? { tab: "doublons", text: openDuplicates > 1 ? `${openDuplicates} rapprochements sont à vérifier avant de décider.` : "Un rapprochement est à vérifier avant de décider." } : undefined}
          />
        </section>
      </div>
    </Page>
  );
}
