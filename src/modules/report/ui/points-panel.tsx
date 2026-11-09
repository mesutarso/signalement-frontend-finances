import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { calendarLabel, findingLabel, reportedAtLabel } from "@/modules/report/model/report";
import { CreditPointsForm } from "@/modules/report/ui/credit-points-form";
import { ReversePointsForm } from "@/modules/report/ui/reverse-points-form";

export type PointMovement = {
  id: string;
  reportId: string;
  reportReference: string;
  taxId: string;
  finding: string;
  basePoints: number;
  bonusPoints: number;
  kind: string;
  dgiReference: string | null;
  reason: string | null;
  filedOn: string;
  recordedAt: string;
};

export function PointsPanel({
  reportId,
  movements,
  net,
  canCredit,
}: {
  reportId: string;
  movements: PointMovement[];
  net: number;
  canCredit: boolean;
}) {
  return (
    <section aria-labelledby="report-points" className="grid gap-4">
      <h3 id="report-points" className="sr-only">Points</h3>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="grid gap-1">
          <span className="text-[13px] text-muted-foreground">Solde du dossier</span>
          <span className="text-[2.5rem] leading-none font-medium tracking-[-0.02em] tabular-nums">{net}<span className="ml-1.5 text-base font-normal tracking-normal text-muted-foreground">points</span></span>
        </p>
        {canCredit ? (
          <div className="flex flex-wrap gap-2">
            {net > 0 ? <ActionDialog label="Annuler des points" title="Annuler les points"><ReversePointsForm reportId={reportId} /></ActionDialog> : null}
            <ActionDialog label="Créditer" title="Créditer les points" variant="default"><CreditPointsForm reportId={reportId} /></ActionDialog>
          </div>
        ) : null}
      </div>
      {movements.length === 0 ? <p className="text-sm text-muted-foreground">Aucun mouvement de points.</p> : (
        <ul className="border-t">
          {movements.map((movement) => {
            const total = movement.basePoints + movement.bonusPoints;
            const finding = findingLabel(movement.finding);
            const credit = movement.kind === "credit";
            return (
              <li key={movement.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 border-b py-3.5 text-sm leading-6">
                <p className="text-lg leading-6 font-medium tabular-nums">{total > 0 ? `+${total}` : total}</p>
                <div className="grid gap-0.5">
                  <p className="flex flex-wrap items-center gap-2">{finding}<Badge variant={credit ? "success" : "destructive"}>{credit ? "Crédit" : "Annulation"}</Badge></p>
                  {movement.bonusPoints > 0 || movement.taxId ? <p className="text-[13px] text-muted-foreground">{movement.bonusPoints > 0 ? "Bonus du premier signalement · " : ""}{movement.taxId}</p> : null}
                  <p className="text-[13px] text-muted-foreground">Dépôt du {calendarLabel(movement.filedOn)}. Enregistré le {reportedAtLabel(movement.recordedAt)}.</p>
                  {movement.dgiReference ? <p className="text-[13px] text-muted-foreground">Confirmation {movement.dgiReference}</p> : null}
                  {movement.reason ? <p>{movement.reason}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
