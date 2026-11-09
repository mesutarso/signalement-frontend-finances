import { ActionDialog } from "@/components/action-dialog";
import { FigureRows } from "@/components/figures";
import { Badge } from "@/components/ui/badge";
import { francs, primeStatusLabel, primeStatusVariant, type PrimeAccount } from "@/modules/report/model/prime";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ReviewPrimeForm } from "@/modules/report/ui/review-prime-form";

export function PrimePanel({ account, reportId, canReview }: { account: PrimeAccount; reportId: string; canReview: boolean }) {
  const phone =
    account.phoneState === "ready" && account.phone ? account.phone
    : account.phoneState === "several" ? "Plusieurs numéros à confirmer"
    : account.phoneState === "missing" ? "Numéro manquant"
    : account.phoneState === "unrecorded" ? "Aucun numéro"
    : null;
  return (
    <section aria-labelledby="report-prime" className="grid gap-5">
      <h3 id="report-prime" className="sr-only">Prime</h3>
      <FigureRows
        rows={[
          ["Solde", `${account.netPoints} points`],
          ["Surplus", account.surplus],
          ["Montant accordé", francs(account.grantedAmount)],
          ["Plafond", francs(account.ceiling)],
          ...(phone ? [["Numéro de paiement", phone] as [string, string]] : []),
        ]}
      />
      {account.tiers.length === 0 ? <p className="text-sm text-muted-foreground">Aucune prime proposée.</p> : (
        <ul className="border-t border-foreground">
          {account.tiers.map((tier) => (
            <li key={tier.id} className="grid gap-2 border-b py-3.5 text-sm leading-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-0.5">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold tabular-nums">{francs(tier.amount)}<Badge variant={primeStatusVariant(tier.status)}>{primeStatusLabel(tier.status)}</Badge></p>
                  <p className="text-[13px] text-muted-foreground">Palier de {tier.threshold} points</p>
                </div>
                {canReview && tier.status === "proposed" ? (
                  <ActionDialog label="Examiner" title="Examiner la prime" description={`${francs(tier.amount)} · palier de ${tier.threshold} points`} variant="default" size="sm">
                    <ReviewPrimeForm primeId={tier.id} reportId={reportId} />
                  </ActionDialog>
                ) : null}
              </div>
              {tier.reviews.map((review) => (
                <div key={review.id} className="grid gap-0.5">
                  <p>{primeStatusLabel(review.result)}{review.reason ? ` : ${review.reason}` : ""}</p>
                  <p className="text-[13px] text-muted-foreground">{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
