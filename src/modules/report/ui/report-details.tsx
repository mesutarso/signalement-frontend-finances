import Link from "next/link";
import { PageSection } from "@/components/page";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ReportDecisions } from "@/modules/report/ui/report-decisions";
import { DOSSIER_PAYMENT_STATUSES, pageIndex, type ListPage, type Correction, type Reexamination, type DossierPayment } from "@/modules/report/model/administration";
import { francs } from "@/modules/report/model/reward";
import { can, type Account } from "@/modules/access/model/account";
import { notFound } from "next/navigation";
import { readAssignees } from "@/modules/report/queries/read-assignees";
import { listHref } from "@/modules/report/model/work-filters";
import { readReport } from "@/modules/report/queries/read-report";
import { readJson, readMissingJson } from "@/lib/api";
import { ReportScreen } from "@/modules/report/ui/report-screen";
import type { AssessmentView } from "@/modules/report/model/assessment";

export async function ReportDetails({
  account, id, search, inPanel = false,
}: {
  account: Account;
  id: string;
  search: Record<string, string | string[] | undefined>;
  inPanel?: boolean;
}) {
  const rawList = typeof search.list === "string" ? search.list : "";
  const report = await readReport(id);
  if (!report) {
    if (inPanel) return <Alert variant="destructive"><AlertTitle>Ce signalement est indisponible.</AlertTitle></Alert>;
    notFound();
  }
  const canAssign = can(account, "report.assign");
  const alreadyValidated = report.validationState === "validated" || report.historicalDecision === "confirm";
  const canAnalyze = can(account, "report.analyze");
  const legacy = report.validationState === "legacy";
  const isAdmin = account.role === "ADMINISTRATOR";
  const showPayments = isAdmin && can(account, "payment.read");
  const [assignees, assessment, corrections, reexaminations, payments] = await Promise.all([
    canAssign && !alreadyValidated ? readAssignees() : Promise.resolve([]),
    legacy ? Promise.resolve(null) : readMissingJson<AssessmentView>(`/api/reports/${id}/assessment`),
    isAdmin ? readJson<ListPage<Correction>>(`/api/corrections?reportId=${id}&page=${pageIndex(search.corrections)}`).catch(() => null) : null,
    isAdmin ? readJson<ListPage<Reexamination>>(`/api/reexaminations?reportId=${id}&page=${pageIndex(search.reexamens)}`).catch(() => null) : null,
    showPayments ? readJson<ListPage<DossierPayment>>(`/api/dossier-payments?reportId=${id}`).catch(() => null) : null,
  ]);
  const validationState = assessment?.assessment.state ?? report.validationState;
  const canReview = can(account, "report.review") && (account.role !== "AGENT" || validationState === "doubt");
  const canDecide = canReview && validationState === "doubt";
  const canModifyDecision = isAdmin && canReview && ["validated", "rejected"].includes(validationState);
  const validated = validationState === "validated" || report.historicalDecision === "confirm";
  const decided = validated || validationState === "rejected" || report.historicalDecision === "reject";
  const payment = payments?.items[0];
  const followUp = isAdmin ? <>
    {showPayments && (validated || payment) ? <PageSection title="Paiement associé" className="border-t pt-5">
      {!payments ? <Alert variant="destructive"><AlertTitle>Le paiement du dossier est indisponible.</AlertTitle></Alert>
        : payment ? <p className="text-sm">
          {DOSSIER_PAYMENT_STATUSES[payment.status]} · {francs(payment.amount)}
          {payment.statementId ? <Link className="ml-3 text-primary underline" href={`/etats/${payment.statementId}`}>Voir l’état de paiement</Link> : null}
        </p> : <p className="text-sm text-muted-foreground">Aucun versement engagé pour ce dossier.</p>}
    </PageSection> : null}
    <ReportDecisions reference={`id:${report.id}`} corrections={corrections} reexaminations={reexaminations}
      canWithdraw={validated && can(account, "correction.decide")} canReexamine={decided && can(account, "reexam.decide")} />
  </> : null;
  return <ReportScreen
    report={report}
    canAnalyze={canAnalyze}
    canAssign={canAssign}
    canReview={canReview}
    canDecide={canDecide}
    canModifyDecision={canModifyDecision}
    assignees={assignees}
    assessment={assessment}
    followUp={followUp}
    followUpOpen={Boolean(search.corrections || search.reexamens)}
    backHref={inPanel ? null : listHref(rawList)}
  />;
}
