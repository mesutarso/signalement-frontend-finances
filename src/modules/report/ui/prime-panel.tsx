import { francs, primeStatusLabel, type PrimeAccount } from "@/modules/report/model/prime";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ReviewPrimeForm } from "@/modules/report/ui/review-prime-form";

export function PrimePanel({ account, reportId, canReview }: { account: PrimeAccount; reportId: string; canReview: boolean }) {
  return (
    <section aria-labelledby="report-prime" className="grid gap-3">
      <h3 id="report-prime" className="text-sm font-bold">Prime</h3>
      <p className="text-sm">Solde {account.netPoints} points. Surplus {account.surplus}. Montant accordé : {francs(account.grantedAmount)}. Plafond {francs(account.ceiling)}.</p>
      {account.phoneState === "unrecorded" ? <p className="text-sm">Aucun numéro de paiement.</p> : null}
      {account.phoneState === "missing" ? <p className="text-sm">Numéro de paiement manquant.</p> : null}
      {account.phoneState === "several" ? <p className="text-sm">Plusieurs numéros renseignés. Confirmez le numéro de paiement.</p> : null}
      {account.phoneState === "ready" && account.phone ? <p className="text-sm">Numéro de paiement : {account.phone}</p> : null}
      {account.tiers.length === 0 ? <p className="text-sm text-muted-foreground">Aucune prime proposée.</p> : account.tiers.map((tier) => (
        <article key={tier.id} className="grid gap-3 rounded-lg border p-4 text-sm">
          <div className="grid gap-1">
            <p className="font-bold">{primeStatusLabel(tier.status)} · {francs(tier.amount)}</p>
            <p>Palier de {tier.threshold} points.</p>
          </div>
          {tier.reviews.map((review) => (
            <div key={review.id} className="grid gap-1">
              <p className="font-bold">{primeStatusLabel(review.result)}</p>
              {review.reason ? <p>{review.reason}</p> : null}
              <p className="text-xs text-muted-foreground">{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
            </div>
          ))}
          {canReview && tier.status === "proposed" ? <ReviewPrimeForm primeId={tier.id} reportId={reportId} /> : null}
        </article>
      ))}
    </section>
  );
}
