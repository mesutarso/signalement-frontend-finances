import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readOutcome } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Figure, Figures } from "@/components/figures";
import { Ledger } from "@/components/ledger";
import { BeneficiaryForm } from "@/modules/report/ui/beneficiary-form";

type Report = { id: string; reference: string; status: string; points: number };
type Situation = {
  reference: string;
  points: number;
  primeAmount: number;
  paidAmount: number;
  ceiling: number;
  remainder: number;
  tickets: number;
  lots: number;
  primeApproved: boolean;
  primePaid: boolean;
  reports: Report[];
};

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const STATUS: Record<string, string> = {
  received: "Reçu",
  review: "En vérification",
  rejected: "Non retenu",
  confirmed: "Confirmé",
  points: "Points crédités",
};

export default function DeclarantsPage({ searchParams }: PageProps<"/declarants">) {
  return <Suspense fallback={<PageSkeleton />}><Declarants searchParams={searchParams} /></Suspense>;
}

async function Declarants({ searchParams }: Pick<PageProps<"/declarants">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const reference = String((await searchParams).reference ?? "").trim();
  const situation = reference ? await readOutcome<Situation>(`/api/declarants?reference=${encodeURIComponent(reference)}`) : null;
  const canVerify = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const beneficiary = reference && account.role !== "AGENT"
    ? await readOutcome<{ verified: boolean; accounts: number; reservedAmount: number; remainder: number }>(`/api/beneficiaries?reference=${encodeURIComponent(reference)}`)
    : null;
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Situation du déclarant"
        description="La situation part de la référence d'un signalement. Elle ne reprend aucune information fiscale du vendeur. Les points et les primes affichés suivent la version du signalement consulté. Une autre version reste à part."
      />
      <form className="flex max-w-2xl flex-wrap items-end gap-2" method="get">
        <label className="grid min-w-64 flex-1 gap-2 text-[13px] font-medium">Référence du signalement
          <input className="h-11 rounded-md border border-input bg-card px-3 text-base font-normal md:text-[15px]" name="reference" defaultValue={reference} maxLength={80} required />
        </label>
        <Button type="submit" className="h-11">Consulter</Button>
      </form>
      {!situation ? null : !situation.ok ? <Alert variant="destructive"><AlertTitle>{situation.message}</AlertTitle></Alert> : (
        <>
          <div className="grid gap-4">
            <p className="ref text-sm font-medium">{situation.body.reference}</p>
            <Figures>
              <Figure label="Points" value={situation.body.points.toLocaleString("fr-FR")} />
              <Figure label="Primes (FC)" value={situation.body.primeAmount.toLocaleString("fr-FR")} />
              <Figure label="Payé (FC)" value={situation.body.paidAmount.toLocaleString("fr-FR")} />
              <Figure label="Solde (FC)" value={situation.body.remainder.toLocaleString("fr-FR")} note={`Plafond de ${situation.body.ceiling.toLocaleString("fr-FR")} FC`} />
            </Figures>
            <p className="text-sm leading-6 text-muted-foreground">{situation.body.tickets} ticket{situation.body.tickets > 1 ? "s" : ""} · {situation.body.lots} lot{situation.body.lots > 1 ? "s" : ""} · {situation.body.primeApproved ? "Prime approuvée" : "Aucune prime approuvée"} · {situation.body.primePaid ? "Prime payée" : "Aucune prime payée"}</p>
          </div>
          <PageSection title="Signalements">
            <Ledger>
              {situation.body.reports.map((report) => (
                <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-sm">
                  <span className="ref">{report.reference}</span>
                  <span className="flex items-center gap-4"><Badge variant="secondary">{STATUS[report.status] ?? report.status}</Badge><span className="w-20 text-right tabular-nums">{report.points.toLocaleString("fr-FR")} points</span></span>
                </li>
              ))}
            </Ledger>
          </PageSection>
          {beneficiary?.ok ? (
            <PageSection title="Identité et plafond du bénéficiaire">
              {beneficiary.body.verified ? <p className="text-sm">Identité vérifiée · {beneficiary.body.accounts} compte(s) rattaché(s) · {beneficiary.body.reservedAmount.toLocaleString("fr-FR")} FC approuvés ou payés, toutes versions confondues · {beneficiary.body.remainder.toLocaleString("fr-FR")} FC disponibles.</p>
                : <><p className="text-sm">Une vérification de l’identité est requise avant toute approbation de prime.</p>{canVerify ? <BeneficiaryForm reference={reference} /> : null}</>}
            </PageSection>
          ) : null}
        </>
      )}
    </Page>
  );
}
