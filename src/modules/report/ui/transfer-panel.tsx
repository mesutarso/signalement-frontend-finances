import { randomUUID } from "node:crypto";
import { ActionDialog } from "@/components/action-dialog";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";
import { PageSection } from "@/components/page";
import { francs } from "@/modules/report/model/reward";
import { reportedAtLabel } from "@/modules/report/model/report";
import { transferLabel, type PaymentService, type PaymentTransfer } from "@/modules/report/model/transfer";
import { TransferCheckForm, TransferForm } from "@/modules/report/ui/transfer-forms";

export function TransferDetails({ transfer, canCheck, statementId }: { transfer: PaymentTransfer; canCheck: boolean; statementId?: string }) {
  return <div className="grid gap-2">
    <p><Badge variant={transfer.state === "paid" ? "success" : transfer.state === "failed" ? "destructive" : "outline"}>{transferLabel(transfer)}</Badge></p>
    <p className="ref text-muted-foreground">{transfer.reference}</p>
    {transfer.transactionId ? <p className="ref break-all text-sm text-muted-foreground">Référence Araka : {transfer.transactionId}</p> : null}
    <p className="text-sm text-muted-foreground">{reportedAtLabel(transfer.updatedAt)}</p>
    {canCheck && !["paid", "failed"].includes(transfer.state) ? <TransferCheckForm id={transfer.id} statementId={statementId} /> : null}
  </div>;
}

export function TransferPanel({ service, canTest, canCheck }: { service: PaymentService; canTest: boolean; canCheck: boolean }) {
  return <PageSection title={service.environment === "sandbox" ? "Versements · Sandbox" : "Versements"}>
    {canTest && service.environment === "sandbox" ? <ActionDialog label="Nouveau test" title="Test Araka · 5 000 FC" size="sm">
      {service.configured ? <TransferForm requestId={randomUUID()} test sandbox /> : <p>Le service de paiement est indisponible.</p>}
    </ActionDialog> : null}
    {service.transfers.length === 0 ? <LedgerEmpty>Aucun versement.</LedgerEmpty> : <Ledger>
      {service.transfers.map(t => <LedgerItem key={t.id} title={`${francs(t.amount)} · ${t.provider}`} meta={t.wallet}>
        <TransferDetails transfer={t} canCheck={canCheck} />
      </LedgerItem>)}
    </Ledger>}
  </PageSection>;
}
