import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { OrganizeDrawForm, PrepareTicketsForm } from "@/modules/report/ui/draw-forms";
import { HandoverForm } from "@/modules/report/ui/handover-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Ticket = { id: string; reportReference: string; kind: string; periodStart: string };
type Draw = { id: string; reference: string; kind: string; periodStart: string; witness: string; status: string };
type Result = { id: string; reference: string; label: string; reportReference: string };
type Prize = { id: string; reference: string; label: string; reportReference: string; handed: boolean };
type Page = { tickets: Ticket[]; draws: Draw[]; results: Result[]; prizes: Prize[] };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function DrawsPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Draws /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Tirages</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Un signalement confirmé donne un ticket pour le mois et un ticket pour le tirage final d&apos;avril 2027. Une personne ne gagne qu&apos;un lot. La publication ne montre pas l&apos;identité. La remise du lot est suivie à part.</p>
      </div>
      {canOrganize ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <PrepareTicketsForm />
          <OrganizeDrawForm kind="monthly" />
          <OrganizeDrawForm kind="final" />
        </div>
      ) : null}
      {!draws ? <Alert variant="destructive"><AlertTitle>Les tirages sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <>
          {draws.tickets.length === 0 ? <p className="text-sm text-muted-foreground">Aucun ticket.</p> : (
            <div className="grid gap-4">
              {draws.tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader className="gap-2"><CardTitle>{ticket.reportReference}</CardTitle></CardHeader>
                  <CardContent className="text-sm">{kindLabel(ticket.kind)} · {calendarLabel(ticket.periodStart)}</CardContent>
                </Card>
              ))}
            </div>
          )}
          <h2 className="text-xl font-bold text-primary">Remise des lots</h2>
          {draws.prizes.length === 0 ? <p className="text-sm text-muted-foreground">Aucun lot à remettre.</p> : draws.prizes.map((prize) => (
            <Card key={prize.id}>
              <CardHeader className="gap-2"><CardTitle>{prize.reference} · {prize.label}</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p>{prize.reportReference} · {prize.handed ? "Remis" : "Pas encore remis"}</p>
                {canOrganize && !prize.handed ? <HandoverForm id={prize.id} /> : null}
              </CardContent>
            </Card>
          ))}
          <h2 className="text-xl font-bold text-primary">Résultats publiés</h2>
          {draws.results.length === 0 ? <p className="text-sm text-muted-foreground">Aucun résultat publié.</p> : draws.results.map((result) => (
            <p key={`${result.id}-${result.reportReference}-${result.label}`} className="text-sm">{result.reference} · {result.label} · {result.reportReference}</p>
          ))}
        </>
      )}
    </section>
  );
}
