import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs } from "@/modules/report/model/reward";
import { paymentAttemptLabel, paymentOperatorLabel, paymentStatusLabel, paymentStatusVariant, type PaymentStatement } from "@/modules/report/model/payment";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { randomUUID } from "node:crypto";
import { isSandboxWallet, type PaymentService } from "@/modules/report/model/transfer";
import { TransferForm } from "@/modules/report/ui/transfer-forms";
import { TransferDetails } from "@/modules/report/ui/transfer-panel";
import { PaymentDecisionForm } from "@/modules/report/ui/payment-decision-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerItem } from "@/components/ledger";

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"];

export default function PaymentStatementPage({ params }: PageProps<"/etats/[id]">) {
  return <Suspense fallback={<PageSkeleton />}><Statement params={params} /></Suspense>;
}

async function Statement({ params }: Pick<PageProps<"/etats/[id]">, "params">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const { id } = await params;
  const [statement, service] = await Promise.all([readJson<PaymentStatement>(`/api/payment-statements/${id}`).catch(() => null), readJson<PaymentService>(`/api/payment-transfers?statementId=${id}`).catch(() => null)]);
  const step = statement?.status === "draft" && (account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR")
    ? "control"
    : statement?.status === "controlled" && account.role === "CELLULE"
      ? "visa"
      : statement?.status === "visaed" && account.role === "CABINET"
        ? "authorize"
        : null;
  return (
    <Page className="max-w-6xl">
      {!statement ? (
        <>
          <PageHeader back={{ href: "/etats", label: "États de paiement" }} title="État indisponible" />
          <Alert variant="destructive"><AlertTitle>Cet état est indisponible. Actualisez la page.</AlertTitle></Alert>
        </>
      ) : (
        <>
          <PageHeader
            back={{ href: "/etats", label: "États de paiement" }}
            title={<span className="tabular-nums">{francs(statement.total)}</span>}
            description={<>Référence <span className="ref text-foreground">{statement.reference}</span></>}
            actions={<div className="flex gap-2">{service?.environment === "sandbox" ? <Badge variant="outline">Sandbox</Badge> : null}<Badge variant={paymentStatusVariant(statement.status)}>{paymentStatusLabel(statement.status)}</Badge></div>}
          />
          <ol aria-label="Étapes de validation" className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            {([["Préparé", statement.preparedAt], ["Contrôlé", statement.controlledAt], ["Visé", statement.visaedAt], ["Autorisé", statement.authorizedAt]] as const).map(([label, at]) => (
              <li key={label} className={at ? "grid gap-1 border-t-2 border-primary pt-2.5" : "grid gap-1 border-t-2 border-border pt-2.5"}>
                <p className={at ? "text-sm font-bold" : "text-sm text-muted-foreground"}>{label}</p>
                <p className="text-[13px] leading-5 text-muted-foreground">{at ? reportedAtLabel(at) : "À venir"}</p>
              </li>
            ))}
          </ol>
          {statement.dueOn || statement.reason ? (
            <div className="-mt-4 grid gap-1 text-sm leading-6">
              {statement.dueOn ? <p>Paiement groupé dû le {calendarLabel(statement.dueOn)}.</p> : null}
              {statement.reason ? <p>{statement.reason}</p> : null}
            </div>
          ) : null}
          <PageSection title="Lignes de l'état">
            <Ledger>
              {statement.lines.map((line) => (
                <LedgerItem
                  key={line.id}
                  title={<span className="tabular-nums">{francs(line.amount)}</span>}
                  meta="Récompense par signalement"
                  action={statement.status === "authorized" && account.role === "PAYMASTER" && service?.configured && (service.environment !== "sandbox" || isSandboxWallet(line.phone)) && !line.attempts.some((attempt) => attempt.result === "paid") && !service.transfers.some(t => t.lineId === line.id && t.state !== "failed") ? (
                    <ActionDialog label={service.environment === "sandbox" ? "Tester le versement" : "Effectuer le paiement"} title={service.environment === "sandbox" ? "Versement sandbox" : "Versement Mobile Money"} description={`${francs(line.amount)} · ${line.phone}`} variant="default" size="sm">
                      <TransferForm requestId={randomUUID()} statementId={statement.id} lineId={line.id} sandbox={service.environment === "sandbox"} />
                    </ActionDialog>
                  ) : undefined}
                >
                  {service?.environment === "sandbox" && !isSandboxWallet(line.phone) ? <Badge variant="outline">Paiement réel désactivé</Badge> : null}
                  <p>Numéro de paiement : <span className="tabular-nums">{line.phone}</span></p>
                  {service?.transfers.find(t => t.lineId === line.id) ? <TransferDetails transfer={service.transfers.find(t => t.lineId === line.id)!} canCheck={["PAYMASTER", "ADMINISTRATOR"].includes(account.role)} statementId={id} /> : null}
                  {line.attempts.map((attempt) => (
                    <p key={attempt.id} className="text-muted-foreground">{paymentOperatorLabel(attempt.operator)} · {paymentAttemptLabel(attempt.result)} le {reportedAtLabel(attempt.recordedAt)}.{attempt.reference ? ` Référence ${attempt.reference}.` : ""}{attempt.reason ? ` ${attempt.reason}` : ""}</p>
                  ))}
                </LedgerItem>
              ))}
            </Ledger>
          </PageSection>
          {statement.exclusions.length > 0 ? (
            <PageSection title="Récompenses écartées">
              <Ledger>
                {statement.exclusions.map((exclusion) => <li key={exclusion.primeId} className="border-b py-3.5 text-sm leading-6">{exclusion.reason}</li>)}
              </Ledger>
            </PageSection>
          ) : null}
          {step ? <Card><CardHeader><CardTitle>Décision</CardTitle></CardHeader><CardContent className="max-w-lg"><PaymentDecisionForm id={statement.id} step={step} /></CardContent></Card> : null}
        </>
      )}
    </Page>
  );
}
