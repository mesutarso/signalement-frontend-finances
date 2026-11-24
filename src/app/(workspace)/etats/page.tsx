import { can } from "@/modules/access/model/account";
import { TransferPanel } from "@/modules/report/ui/transfer-panel";
import type { PaymentService } from "@/modules/report/model/transfer";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs } from "@/modules/report/model/reward";
import { paymentStatusLabel, paymentStatusVariant, type PaymentItem } from "@/modules/report/model/payment";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { PreparePaymentForm } from "@/modules/report/ui/prepare-payment-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem, LedgerLink } from "@/components/ledger";

type Page = { items: PaymentItem[]; page: number; size: number; total: number };


export default function PaymentStatementsPage({ searchParams }: PageProps<"/etats">) {
  return <Suspense fallback={<PageSkeleton />}><Statements searchParams={searchParams} /></Suspense>;
}

async function Statements({ searchParams }: Pick<PageProps<"/etats">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "payment.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const [statements, service] = await Promise.all([readJson<Page>(`/api/payment-statements?page=${page}`).catch(() => null), readJson<PaymentService>("/api/payment-transfers").catch(() => null)]);
  const canPrepare = can(account, "payment.prepare");
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="États de paiement"
        actions={canPrepare ? <PreparePaymentForm /> : undefined}
      />
      {!statements ? <Alert variant="destructive"><AlertTitle>Les états sont indisponibles. Actualisez la page.</AlertTitle></Alert> : statements.items.length === 0 ? <LedgerEmpty>Aucun état de paiement.</LedgerEmpty> : (
        <div className="grid gap-5">
          <Ledger>
            {statements.items.map((statement) => (
              <LedgerItem
                key={statement.id}
                title={<span className="ref">{statement.reference}</span>}
                status={<Badge variant={paymentStatusVariant(statement.status)}>{statement.exceptional ? "Autorisation exceptionnelle" : paymentStatusLabel(statement.status)}</Badge>}
                action={<LedgerLink href={`/etats/${statement.id}`}>Ouvrir l’état<span className="sr-only"> {statement.reference}</span></LedgerLink>}
              >
                <p className="text-[15px] font-medium tabular-nums">{francs(statement.total)}</p>
                <p className="text-muted-foreground">Préparé le {reportedAtLabel(statement.preparedAt)}.{statement.dueOn ? ` Paiement groupé dû le ${calendarLabel(statement.dueOn)}.` : ""}</p>
              </LedgerItem>
            ))}
          </Ledger>
          <TablePagination page={statements.page} size={statements.size} total={statements.total} label="Pagination des états" />
        </div>
      )}
      {service ? <TransferPanel service={service} canTest={can(account, "payment.test")} canCheck={can(account, "payment.check")} /> : <Alert variant="destructive"><AlertTitle>Le service de paiement est indisponible.</AlertTitle></Alert>}
    </Page>
  );
}
