import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs } from "@/modules/report/model/prime";
import { paymentStatusLabel, type PaymentItem } from "@/modules/report/model/payment";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { PreparePaymentForm } from "@/modules/report/ui/prepare-payment-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

type Page = { items: PaymentItem[]; page: number; size: number; total: number };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"];

export default function PaymentStatementsPage({ searchParams }: PageProps<"/etats">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Statements searchParams={searchParams} /></Suspense>;
}

async function Statements({ searchParams }: Pick<PageProps<"/etats">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const statements = await readJson<Page>(`/api/payment-statements?page=${page}`).catch(() => null);
  const canPrepare = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">États de paiement</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">L&apos;état rassemble les primes approuvées. Le superviseur contrôle, la Cellule fiscale vise, le Cabinet autorise. Le gestionnaire de paiement simule ensuite Airtel Money, M-Pesa, Orange Money ou Afrimoney. La référence est produite ici. Aucun argent n&apos;est envoyé.</p>
      </div>
      {canPrepare ? <PreparePaymentForm /> : null}
      {!statements ? <Alert variant="destructive"><AlertTitle>Les états sont indisponibles. Actualisez la page.</AlertTitle></Alert> : statements.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun état de paiement.</p> : (
        <>
          <div className="grid gap-4">
            {statements.items.map((statement) => (
              <Card key={statement.id}>
                <CardHeader className="gap-2">
                  <CardTitle><Link className="underline-offset-4 hover:underline" href={`/etats/${statement.id}`}>{statement.reference}</Link></CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <p>{paymentStatusLabel(statement.status)} · {francs(statement.total)}</p>
                  <p>Préparé le {reportedAtLabel(statement.preparedAt)}.</p>
                  {statement.dueOn ? <p>Paiement groupé dû le {calendarLabel(statement.dueOn)}. Aucun paiement n&apos;est lancé.</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination page={statements.page} size={statements.size} total={statements.total} label="Pagination des états" />
        </>
      )}
    </section>
  );
}
