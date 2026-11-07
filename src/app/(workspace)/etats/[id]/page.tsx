import Link from "next/link";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs } from "@/modules/report/model/prime";
import { paymentAttemptLabel, paymentOperatorLabel, paymentStatusLabel, type PaymentStatement } from "@/modules/report/model/payment";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { PaymentAttemptForm } from "@/modules/report/ui/payment-attempt-form";
import { PaymentDecisionForm } from "@/modules/report/ui/payment-decision-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"];

export default async function PaymentStatementPage({ params }: PageProps<"/etats/[id]">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const { id } = await params;
  const statement = await readJson<PaymentStatement>(`/api/payment-statements/${id}`).catch(() => null);
  const step = statement?.status === "draft" && (account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR")
    ? "control"
    : statement?.status === "controlled" && account.role === "CELLULE"
      ? "visa"
      : statement?.status === "visaed" && account.role === "CABINET"
        ? "authorize"
        : null;
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <p><Link className="text-sm font-bold text-primary underline-offset-4 hover:underline" href="/etats">États de paiement</Link></p>
      {!statement ? <Alert variant="destructive"><AlertTitle>Cet état est indisponible. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold text-primary">{statement.reference}</h1>
            <p className="text-sm text-muted-foreground">{paymentStatusLabel(statement.status)} · {francs(statement.total)}. Simulation : Airtel Money, M-Pesa, Orange Money, Afrimoney. Aucun argent n&apos;est envoyé.</p>
            <p className="text-sm">Préparé le {reportedAtLabel(statement.preparedAt)}.</p>
            {statement.dueOn ? <p className="text-sm">Paiement groupé dû le {calendarLabel(statement.dueOn)}.</p> : null}
            {statement.reason ? <p className="text-sm">{statement.reason}</p> : null}
          </div>
          <div className="grid gap-4">
            {statement.lines.map((line) => (
              <Card key={line.id}>
                <CardHeader className="gap-2">
                  <CardTitle>{francs(line.amount)}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <p>{line.threshold} points</p>
                  <p>Numéro de paiement : {line.phone}</p>
                  {line.attempts.map((attempt) => (
                    <p key={attempt.id}>{paymentOperatorLabel(attempt.operator)} · {paymentAttemptLabel(attempt.result)} le {reportedAtLabel(attempt.recordedAt)}.{attempt.reference ? ` Référence ${attempt.reference}.` : ""}{attempt.reason ? ` ${attempt.reason}` : ""}</p>
                  ))}
                  {statement.status === "authorized" && account.role === "PAYMASTER" && !line.attempts.some((attempt) => attempt.result === "paid") ? (
                    <PaymentAttemptForm statementId={statement.id} lineId={line.id} settle={line.attempts.at(-1)?.result === "unknown"} />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          {statement.exclusions.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="text-xl font-bold text-primary">Primes écartées</h2>
              {statement.exclusions.map((exclusion) => <p key={exclusion.primeId} className="text-sm">{exclusion.reason}</p>)}
            </section>
          ) : null}
          {step ? <PaymentDecisionForm id={statement.id} step={step} /> : null}
        </>
      )}
    </section>
  );
}
