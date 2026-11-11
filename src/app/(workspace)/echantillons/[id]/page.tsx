import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { paymentOperatorLabel } from "@/modules/report/model/payment";
import { ReviewSampleForm } from "@/modules/report/ui/review-sample-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerItem } from "@/components/ledger";

type Line = { id: string; reference: string; operator: string; amount: number; result: string | null; reason: string | null };
type Detail = { id: string; reference: string; periodStart: string; periodEnd: string; lines: Line[] };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function SamplePage({ params }: PageProps<"/echantillons/[id]">) {
  return <Suspense fallback={<PageSkeleton />}><Sample params={params} /></Suspense>;
}

function resultLabel(result: string | null): string {
  if (result === "conform") {
    return "Conforme";
  }
  if (result === "anomaly") {
    return "Anomalie";
  }
  return "En attente";
}

async function Sample({ params }: Pick<PageProps<"/echantillons/[id]">, "params">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const { id } = await params;
  const sample = await readJson<Detail>(`/api/payment-samples/${id}`).catch(() => null);
  const canReview = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      {!sample ? (
        <>
          <PageHeader back={{ href: "/echantillons", label: "Échantillons" }} title="Échantillon introuvable" />
          <Alert variant="destructive"><AlertTitle>Cet échantillon est introuvable.</AlertTitle></Alert>
        </>
      ) : (
        <>
          <PageHeader
            back={{ href: "/echantillons", label: "Échantillons" }}
            title={<span className="tabular-nums">{sample.reference}</span>}
            description={`Du ${calendarLabel(sample.periodStart)} au ${calendarLabel(sample.periodEnd)}`}
          />
          <Ledger>
            {sample.lines.map((line) => (
              <LedgerItem
                key={line.id}
                title={<span className="ref text-sm font-medium">{line.reference}</span>}
                status={<Badge variant={line.result === "conform" ? "success" : line.result === "anomaly" ? "destructive" : "warning"}>{resultLabel(line.result)}</Badge>}
                action={canReview && !line.result ? <ActionDialog label="Contrôler" title="Contrôler la ligne" description={line.reference} variant="default" size="sm"><ReviewSampleForm lineId={line.id} sampleId={sample.id} /></ActionDialog> : undefined}
              >
                <p className="tabular-nums">{paymentOperatorLabel(line.operator)} · {line.amount.toLocaleString("fr-FR")} FC</p>
                {line.reason ? <p className="text-muted-foreground">{line.reason}</p> : null}
              </LedgerItem>
            ))}
          </Ledger>
        </>
      )}
    </Page>
  );
}
