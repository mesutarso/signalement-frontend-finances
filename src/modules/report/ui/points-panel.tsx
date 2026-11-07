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
    <section aria-labelledby="report-points" className="grid gap-3">
      <h3 id="report-points" className="text-sm font-bold">Points</h3>
      <p className="text-sm text-muted-foreground">Solde : {net} points.</p>
      {movements.length === 0 ? <p className="text-sm text-muted-foreground">Aucun mouvement de points.</p> : movements.map((movement) => {
        const total = movement.basePoints + movement.bonusPoints;
        const finding = findingLabel(movement.finding);
        return (
          <article key={movement.id} className="grid gap-1 rounded-lg border p-4 text-sm">
            <p className="font-bold">{total > 0 ? `+${total}` : total} · {movement.kind === "credit" ? "Crédit" : "Annulation"}</p>
            <p>{finding}{movement.bonusPoints > 0 ? " · bonus du premier signalement" : ""}{movement.taxId ? ` · ${movement.taxId}` : ""}</p>
            <p className="text-xs text-muted-foreground">Dépôt du {calendarLabel(movement.filedOn)}. Enregistré le {reportedAtLabel(movement.recordedAt)}.</p>
            {movement.dgiReference ? <p className="text-xs text-muted-foreground">Confirmation {movement.dgiReference}</p> : null}
            {movement.reason ? <p>{movement.reason}</p> : null}
          </article>
        );
      })}
      {canCredit ? <CreditPointsForm reportId={reportId} /> : null}
      {canCredit && net > 0 ? <ReversePointsForm reportId={reportId} /> : null}
    </section>
  );
}
