import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { KeepTaxpayersForm } from "@/modules/report/ui/keep-taxpayers-form";
import { VerifyTaxpayerForm } from "@/modules/report/ui/verify-taxpayer-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Item = { id: string; taxId: string; name: string | null; verified: boolean; recordedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function TaxpayersPage() {
  return <Suspense fallback={<PageSkeleton />}><Taxpayers /></Suspense>;
}

async function Taxpayers() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const taxpayers = await readJson<Page>("/api/taxpayers?page=0").catch(() => null);
  const canKeep = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Contribuables"
        actions={canKeep ? <KeepTaxpayersForm /> : undefined}
      />
      {!taxpayers ? <Alert variant="destructive"><AlertTitle>Les contribuables sont indisponibles. Actualisez la page.</AlertTitle></Alert> : taxpayers.items.length === 0 ? <LedgerEmpty>Aucun contribuable.</LedgerEmpty> : (
        <Ledger>
          {taxpayers.items.map((taxpayer) => (
            <LedgerItem
              key={taxpayer.id}
              title={<span className="ref text-sm font-medium">{taxpayer.taxId}</span>}
              status={<Badge variant={taxpayer.verified ? "success" : "warning"}>{taxpayer.verified ? "Vérifié" : "Non vérifié"}</Badge>}
              action={canKeep && !taxpayer.verified ? <VerifyTaxpayerForm id={taxpayer.id} /> : undefined}
            >
              {taxpayer.name ? <p className="font-medium">{taxpayer.name}</p> : null}
              <p className="text-muted-foreground">Retenu le {reportedAtLabel(taxpayer.recordedAt)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
