import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs, payoutStateLabel, primeStatusLabel, type PrimeTier } from "@/modules/report/model/prime";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ReviewPrimeForm } from "@/modules/report/ui/review-prime-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

type Page = { items: PrimeTier[]; page: number; size: number; total: number };
type Payout = { id: string; phone: string | null; state: string; updatedAt: string };
type PayoutPage = { items: Payout[]; page: number; size: number; total: number };

export default function PrimesPage({ searchParams }: PageProps<"/primes">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Primes searchParams={searchParams} /></Suspense>;
}

async function PayoutNumbers() {
  const payouts = await readJson<PayoutPage>("/api/payout-numbers?page=0").catch(() => null);
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-bold text-primary">Numéros de paiement</h2>
      {!payouts ? <Alert variant="destructive"><AlertTitle>Les numéros sont indisponibles. Actualisez la page.</AlertTitle></Alert> : payouts.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun numéro de paiement enregistré.</p> : (
        <div className="grid gap-4">
          {payouts.items.map((payout) => (
            <Card key={payout.id}>
              <CardHeader className="gap-2">
                <CardTitle>{payoutStateLabel(payout.state)}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {payout.state === "ready" && payout.phone ? <p>Numéro de paiement : {payout.phone}</p> : null}
                <p>Enregistré le {reportedAtLabel(payout.updatedAt)}.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

async function Primes({ searchParams }: Pick<PageProps<"/primes">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const canReview = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const primes = await readJson<Page>(`/api/primes?page=${page}`).catch(() => null);
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Primes</h1>
      </div>
      <PayoutNumbers />
      {!primes ? <Alert variant="destructive"><AlertTitle>Les primes sont indisponibles. Actualisez la page.</AlertTitle></Alert> : primes.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucune prime proposée.</p> : (
        <>
          <div className="grid gap-4">
            {primes.items.map((tier) => (
              <Card key={tier.id}>
                <CardHeader className="gap-2">
                  <CardTitle>{francs(tier.amount)}</CardTitle>
                  <p className="text-sm font-bold">{primeStatusLabel(tier.status)} · palier de {tier.threshold} points</p>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <p>Enregistrée le {reportedAtLabel(tier.recordedAt)}.</p>
                  {tier.phone ? <p>Numéro de paiement : {tier.phone}</p> : null}
                  {tier.reviews.map((review) => (
                    <div key={review.id} className="grid gap-1">
                      <p className="font-bold">{primeStatusLabel(review.result)}</p>
                      {review.reason ? <p>{review.reason}</p> : null}
                      <p className="text-xs text-muted-foreground">{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
                    </div>
                  ))}
                  {canReview && tier.status === "proposed" ? <ReviewPrimeForm primeId={tier.id} /> : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination page={primes.page} size={primes.size} total={primes.total} label="Pagination des primes" />
        </>
      )}
    </section>
  );
}
