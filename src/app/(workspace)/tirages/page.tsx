import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { OrganizeDrawForm, PrepareTicketsForm } from "@/modules/report/ui/draw-forms";
import { HandoverForm } from "@/modules/report/ui/handover-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Ticket = { id: string; reportReference: string; kind: string; periodStart: string };
type Draw = { id: string; reference: string; kind: string; periodStart: string; witness: string; status: string };
type Result = { id: string; reference: string; label: string; reportReference: string };
type Prize = { id: string; reference: string; label: string; reportReference: string; handed: boolean };
type Page = { tickets: Ticket[]; draws: Draw[]; results: Result[]; prizes: Prize[] };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function DrawsPage() {
  return <Suspense fallback={<PageSkeleton />}><Draws /></Suspense>;
}

function kindLabel(kind: string): string {
  return kind === "final" ? "Final" : "Mensuel";
}

async function Draws() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const draws = await readJson<Page>("/api/draws").catch(() => null);
  const canOrganize = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Tirages"
        actions={canOrganize ? (
          <>
            <ActionDialog label="Retenir les tickets" title="Retenir les tickets du mois"><PrepareTicketsForm /></ActionDialog>
            <ActionDialog label="Tirage du mois" title="Organiser le tirage du mois"><OrganizeDrawForm kind="monthly" /></ActionDialog>
            <ActionDialog label="Tirage final" title="Organiser le tirage final"><OrganizeDrawForm kind="final" /></ActionDialog>
          </>
        ) : undefined}
      />
      {!draws ? <Alert variant="destructive"><AlertTitle>Les tirages sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <>
          <PageSection title="Remise des lots">
            {draws.prizes.length === 0 ? <LedgerEmpty>Aucun lot à remettre.</LedgerEmpty> : (
              <Ledger>
                {draws.prizes.map((prize) => (
                  <LedgerItem
                    key={prize.id}
                    title={prize.label}
                    status={<Badge variant={prize.handed ? "success" : "warning"}>{prize.handed ? "Remis" : "Pas encore remis"}</Badge>}
                    action={canOrganize && !prize.handed ? <ActionDialog label="Enregistrer la remise" title="Enregistrer la remise" description={`${prize.reference} · ${prize.label}`} variant="default" size="sm"><HandoverForm id={prize.id} /></ActionDialog> : undefined}
                  >
                    <p className="ref">{prize.reference}</p>
                    <p className="ref text-muted-foreground">{prize.reportReference}</p>
                  </LedgerItem>
                ))}
              </Ledger>
            )}
          </PageSection>
          <PageSection title="Résultats publiés">
            {draws.results.length === 0 ? <LedgerEmpty>Aucun résultat publié.</LedgerEmpty> : (
              <Ledger>
                {draws.results.map((result) => (
                  <LedgerItem key={`${result.id}-${result.reportReference}-${result.label}`} title={result.label} className="py-3.5">
                    <p className="ref">{result.reference} · {result.reportReference}</p>
                  </LedgerItem>
                ))}
              </Ledger>
            )}
          </PageSection>
          <PageSection title="Tickets" description={`${draws.tickets.length.toLocaleString("fr-FR")} ticket${draws.tickets.length > 1 ? "s" : ""}`}>
            {draws.tickets.length === 0 ? <LedgerEmpty>Aucun ticket.</LedgerEmpty> : (
              <ul className="grid border-t border-foreground sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
                {draws.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex items-baseline justify-between gap-3 border-b py-2.5">
                    <span className="ref">{ticket.reportReference}</span>
                    <span className="text-[13px] text-muted-foreground">{kindLabel(ticket.kind)} · {calendarLabel(ticket.periodStart)}</span>
                  </li>
                ))}
              </ul>
            )}
          </PageSection>
        </>
      )}
    </Page>
  );
}
