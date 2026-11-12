import Link from "next/link";
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
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Page = { items: PaymentItem[]; page: number; size: number; total: number };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"];

export default function PaymentStatementsPage({ searchParams }: PageProps<"/etats">) {
  return <Suspense fallback={<PageSkeleton />}><Statements searchParams={searchParams} /></Suspense>;
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
    <Page className="max-w-6xl">
      <PageHeader
        title="États de paiement · Simulation"
        actions={canPrepare ? <PreparePaymentForm /> : undefined}
      />
      {!statements ? <Alert variant="destructive"><AlertTitle>Les états sont indisponibles. Actualisez la page.</AlertTitle></Alert> : statements.items.length === 0 ? <LedgerEmpty>Aucun état de paiement.</LedgerEmpty> : (
        <div className="grid gap-5">
          <Ledger>
            {statements.items.map((statement) => (
              <LedgerItem
                key={statement.id}
                title={<Link className="ref text-sm font-medium underline-offset-4 hover:text-primary hover:underline" href={`/etats/${statement.id}`}>{statement.reference}</Link>}
                status={<Badge variant={paymentStatusVariant(statement.status)}>{paymentStatusLabel(statement.status)}</Badge>}
              >
                <p className="text-[15px] font-medium tabular-nums">{francs(statement.total)}</p>
                <p className="text-muted-foreground">Préparé le {reportedAtLabel(statement.preparedAt)}.{statement.dueOn ? ` Paiement groupé dû le ${calendarLabel(statement.dueOn)}.` : ""}</p>
              </LedgerItem>
            ))}
          </Ledger>
          <TablePagination page={statements.page} size={statements.size} total={statements.total} label="Pagination des états" />
        </div>
      )}
    </Page>
  );
}
