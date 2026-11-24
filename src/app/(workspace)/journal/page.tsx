import { can } from "@/modules/access/model/account";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FilterBar, FilterDateRange } from "@/components/filter-bar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";

type Entry = {
  id: string;
  actorName: string | null;
  action: string;
  objectType: string;
  objectId: string | null;
  result: string;
  recordedAt: string;
};
type Page = { entries: Entry[]; page: number; size: number; total: number };

const ACTIONS: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  assignment: "Affectation",
  qualification: "Qualification",
  duplicate: "Doublon",
  "photo-request": "Demande de photo",
  "photo-link": "Rattachement de photo",
  password: "Mot de passe",
  "abuse-note": "Indice",
  supervision: "Contrôle",
  letter: "Courrier",
  "letter-decision": "Validation du courrier",
  "letter-response": "Réponse reçue",
  "reward-approval": "Approbation de la récompense",
  "reward-return": "Renvoi de la récompense",
  "payout-record": "Numéro de paiement",
  "payment-sandbox-test": "Essai de versement Araka",
  "payment-transfer": "Versement Araka",
  "payment-transfer-check": "Vérification du versement",
  "payment-statement": "État de paiement",
  "payment-control": "Contrôle de l'état",
  "payment-visa": "Visa de l'état",
  "payment-authorization": "Autorisation de l'état",
  "payment-return": "Renvoi de l'état",
  "payment-refusal": "Refus de l'état",
  "payment-paid": "Paiement enregistré",
  "payment-failed": "Échec de paiement",
  "payment-unknown": "Résultat à confirmer",
  "taxpayer-keep": "Contribuables retenus",
  "taxpayer-verification": "Vérification du numéro",
  "payment-sample": "Échantillon",
  "payment-sample-review": "Contrôle de l'échantillon",
  "draw-tickets": "Tickets de tirage",
  draw: "Tirage",
  "draw-publication": "Publication du tirage",
  "confirmation-fall": "Confirmation tombée",
  reexamination: "Réexamen",
  "reexamination-decision": "Décision de réexamen",
  "declarant-message": "Message préparé",
  "sms-accepted": "SMS transmis",
  "sms-rejected": "SMS refusé",
  "sms-unavailable": "SMS indisponible",
  "sms-unknown": "SMS à confirmer",
  "message-model": "Modèle de message",
  "reward-suspension": "Droit aux récompenses",
  "prize-handover": "Remise du lot",
  import: "Import",
};
function journalHref(objectType: string, objectId: string | null): string | null {
  if (!objectId) {
    return null;
  }
  if (objectType === "letter") {
    return `/courriers/${objectId}`;
  }
  if (objectType === "report") {
    return `/signalements/${objectId}`;
  }
  if (objectType === "transfer") return "/etats";
  if (objectType === "payment") {
    return `/etats/${objectId}`;
  }
  if (objectType === "reward" || objectType === "payout") {
    return "/recompenses";
  }
  if (objectType === "taxpayer") {
    return "/contribuables";
  }
  if (objectType === "payment-sample") {
    return `/echantillons/${objectId}`;
  }
  if (objectType === "draw") {
    return "/tirages";
  }
  if (objectType === "correction") {
    return "/corrections";
  }
  if (objectType === "reexamination") {
    return "/reexamens";
  }
  if (objectType === "message") {
    return "/messages";
  }
  if (objectType === "suspension") {
    return "/indices";
  }
  if (objectType === "prize") {
    return "/tirages";
  }
  if (objectType === "rule") {
    return "/regles";
  }
  return null;
}

const OBJECTS: Record<string, string> = {
  session: "Session",
  report: "Signalement",
  account: "Compte",
  index: "Indice",
  letter: "Courrier",
  reward: "Récompense",
  payout: "Numéro de paiement",
  payment: "État de paiement",
  taxpayer: "Contribuable",
  "payment-sample": "Échantillon",
  draw: "Tirage",
  correction: "Correction",
  reexamination: "Réexamen",
  message: "Message",
  suspension: "Droit aux récompenses",
  prize: "Lot",
  rule: "Règle",
  import: "Import",
};

export default function JournalPage({ searchParams }: PageProps<"/journal">) {
  return <Suspense fallback={<PageSkeleton />}><Journal searchParams={searchParams} /></Suspense>;
}

async function Journal({ searchParams }: Pick<PageProps<"/journal">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "audit.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const from = text(params.from);
  const to = text(params.to);
  const objectId = text(params.objectId);
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const query = new URLSearchParams({ page: String(page) });
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (objectId) query.set("objectId", objectId);
  const journal = await readJson<Page>(`/api/audit?${query}`).catch(() => null);
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Journal" />
      <FilterBar
        key={JSON.stringify([objectId, from, to])}
        action="/journal"
        label="Filtres du journal"
        clearHref={objectId || from || to ? "/journal" : undefined}
        advanced={{
          count: Number(Boolean(objectId)),
          fields: (
            <Field className="max-w-lg">
              <FieldLabel htmlFor="filter-object">Objet</FieldLabel>
              <Input id="filter-object" name="objectId" type="search" defaultValue={objectId} maxLength={80} />
            </Field>
          ),
        }}
      >
        <FilterDateRange from={{ name: "from", value: from }} to={{ name: "to", value: to }} />
      </FilterBar>
      {!journal ? <Alert variant="destructive"><AlertTitle>Le journal est indisponible. Actualisez la page.</AlertTitle></Alert> : (
        <div className="grid gap-4">
          <Table aria-label="Journal des actions">
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Action</TableHead><TableHead>Objet</TableHead><TableHead>Résultat</TableHead><TableHead>Auteur</TableHead></TableRow></TableHeader>
            <TableBody>
              {journal.entries.map((entry) => {
                const href = journalHref(entry.objectType, entry.objectId);
                const object = OBJECTS[entry.objectType] ?? entry.objectType;
                return <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{reportedAtLabel(entry.recordedAt)}</TableCell>
                  <TableCell className="font-medium">{ACTIONS[entry.action] ?? entry.action}</TableCell>
                  <TableCell><div className="flex items-center justify-between gap-3">
                    <span>{object}</span>
                    {href ? <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href} />}>Ouvrir<span className="sr-only"> · {object}</span></Button> : null}
                  </div></TableCell>
                  <TableCell><Badge variant={entry.result === "allowed" ? "success" : "destructive"}>{entry.result === "allowed" ? "Aboutie" : "Refusée"}</Badge></TableCell>
                  <TableCell>{entry.actorName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                </TableRow>;
              })}
              {journal.entries.length === 0 ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune action pour ces critères.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
          <TablePagination page={journal.page} size={journal.size} total={journal.total} label="Pagination du journal" />
        </div>
      )}
    </Page>
  );
}

function text(value: string | string[] | undefined): string {
  const chosen = Array.isArray(value) ? value[0] : value;
  return chosen?.trim() ?? "";
}
