import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs, payoutStateLabel, primeStatusLabel, primeStatusVariant, type PrimeTier } from "@/modules/report/model/prime";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ReviewPrimeForm } from "@/modules/report/ui/review-prime-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Page = { items: PrimeTier[]; page: number; size: number; total: number };
type Payout = { id: string; phone: string | null; state: string; updatedAt: string };
type PayoutPage = { items: Payout[]; page: number; size: number; total: number };

export default function PrimesPage({ searchParams }: PageProps<"/primes">) {
  return <Suspense fallback={<PageSkeleton />}><Primes searchParams={searchParams} /></Suspense>;
}

async function PayoutNumbers() {
  const payouts = await readJson<PayoutPage>("/api/payout-numbers?page=0").catch(() => null);
  return (
    <PageSection title="Numéros de paiement">
      {!payouts ? <Alert variant="destructive"><AlertTitle>Les numéros sont indisponibles. Actualisez la page.</AlertTitle></Alert> : payouts.items.length === 0 ? <LedgerEmpty>Aucun numéro de paiement enregistré.</LedgerEmpty> : (
        <Ledger>
          {payouts.items.map((payout) => (
            <LedgerItem key={payout.id} title={payoutStateLabel(payout.state)} className="py-3.5">
              {payout.state === "ready" && payout.phone ? <p className="tabular-nums">{payout.phone}</p> : null}
              <p className="text-muted-foreground">Enregistré le {reportedAtLabel(payout.updatedAt)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </PageSection>
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
    <Page className="max-w-6xl">
      <PageHeader title="Primes" />
      {!primes ? <Alert variant="destructive"><AlertTitle>Les primes sont indisponibles. Actualisez la page.</AlertTitle></Alert> : primes.items.length === 0 ? <LedgerEmpty>Aucune prime proposée.</LedgerEmpty> : (
        <div className="grid gap-5">
          <Ledger>
            {primes.items.map((tier) => (
              <LedgerItem
                key={tier.id}
                title={<span className="tabular-nums">{francs(tier.amount)}</span>}
                status={<Badge variant={primeStatusVariant(tier.status)}>{primeStatusLabel(tier.status)}</Badge>}
                meta={`Palier de ${tier.threshold} points`}
                action={canReview && tier.status === "proposed" ? (
                  <ActionDialog label="Examiner" title="Examiner la prime" description={`${francs(tier.amount)} · palier de ${tier.threshold} points`} variant="default" size="sm">
                    <ReviewPrimeForm primeId={tier.id} />
                  </ActionDialog>
                ) : undefined}
              >
                <p className="text-muted-foreground">Enregistrée le {reportedAtLabel(tier.recordedAt)}.</p>
                {tier.phone ? <p>Numéro de paiement : <span className="tabular-nums">{tier.phone}</span></p> : null}
                {tier.reviews.map((review) => (
                  <div key={review.id} className="grid gap-0.5">
                    <p>{primeStatusLabel(review.result)}{review.reason ? ` : ${review.reason}` : ""}</p>
                    <p className="text-[13px] text-muted-foreground">{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
                  </div>
                ))}
              </LedgerItem>
            ))}
          </Ledger>
          <TablePagination page={primes.page} size={primes.size} total={primes.total} label="Pagination des primes" />
        </div>
      )}
      <PayoutNumbers />
    </Page>
  );
}
