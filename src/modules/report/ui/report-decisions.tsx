import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { TablePagination } from "@/components/table-pagination";
import { PageSection } from "@/components/page";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import type { Correction, ListPage, Reexamination } from "@/modules/report/model/administration";
import { CorrectionForm, ReexaminationForm } from "@/modules/report/ui/reference-forms";
import { ReexaminationDecisionForm } from "@/modules/report/ui/reexamination-decision-form";

const REEXAMINATION_LABELS: Record<string, string> = {
  received: "À examiner",
  maintained: "Décision maintenue",
  modified: "Décision modifiée",
};

export function ReportDecisions({
  reference, corrections, reexaminations, canWithdraw, canReexamine,
}: {
  reference: string;
  corrections: ListPage<Correction> | null;
  reexaminations: ListPage<Reexamination> | null;
  canWithdraw: boolean;
  canReexamine: boolean;
}) {
  const requestAction = canReexamine ? (
    <ActionDialog label="Enregistrer une demande de réexamen" title="Enregistrer une demande de réexamen">
      <ReexaminationForm reference={reference} />
    </ActionDialog>
  ) : null;
  const showReexaminations = !reexaminations || reexaminations.total > 0;

  return <div id="decisions" className="grid scroll-mt-20 gap-8 border-t pt-5">
    <PageSection title="Corrections de la décision" actions={canWithdraw ? (
      <ActionDialog label="Retirer la validation" title="Retirer la validation">
        <CorrectionForm reference={reference} />
      </ActionDialog>
    ) : null}>
      {!corrections ? <Alert variant="destructive"><AlertTitle>L’historique des corrections est indisponible.</AlertTitle></Alert>
        : corrections.items.length ? (
          <>
            <ul className="divide-y border-y">
              {corrections.items.map(item => <li key={item.id} className="grid gap-1 py-3 text-sm">
                <p className="font-bold">Validation retirée</p>
                <p className="break-words">{item.reason}</p>
                <p className="text-muted-foreground">{reportedAtLabel(item.recordedAt)}</p>
              </li>)}
            </ul>
            {corrections.total > corrections.size ? <TablePagination page={corrections.page} size={corrections.size} total={corrections.total} pageParam="corrections" anchor="decisions" label="Pagination des corrections" /> : null}
          </>
        ) : <p className="text-sm text-muted-foreground">Aucune correction sur ce signalement.</p>}
    </PageSection>
    {showReexaminations ? <PageSection title="Demandes de réexamen" actions={requestAction}>
      {!reexaminations ? <Alert variant="destructive"><AlertTitle>Les demandes de réexamen sont indisponibles.</AlertTitle></Alert>
        : (
          <>
            <ul className="divide-y border-y">
              {reexaminations.items.map(item => <li key={item.id} className="grid gap-2 py-4 text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-bold">{item.reference}</p>
                  <Badge variant={item.status === "received" ? "warning" : "secondary"}>{REEXAMINATION_LABELS[item.status] ?? item.status}</Badge>
                </div>
                <p className="text-muted-foreground">Reçue le {calendarLabel(item.receivedOn)} · {item.onTime ? "Dans le délai" : "Hors délai"}</p>
                <p className="break-words">{item.requestText}</p>
                {item.comment ? <p className="break-words">{item.comment}</p> : null}
                {canReexamine && item.status === "received" ? <div>
                  <ActionDialog label="Décider" title="Décider du réexamen" size="sm">
                    <ReexaminationDecisionForm id={item.id} />
                  </ActionDialog>
                </div> : null}
              </li>)}
            </ul>
            {reexaminations.total > reexaminations.size ? <TablePagination page={reexaminations.page} size={reexaminations.size} total={reexaminations.total} pageParam="reexamens" anchor="decisions" label="Pagination des réexamens" /> : null}
          </>
        )}
    </PageSection> : requestAction ? <div>{requestAction}</div> : null}
  </div>;
}
