import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { readMissingJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, proofLabel, qualificationDecisionLabel, reportedAtLabel } from "@/modules/report/model/report";
import { LetterDecisionForm } from "@/modules/report/ui/letter-decision-form";
import { LetterResponseForm } from "@/modules/report/ui/letter-response-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

type Line = {
  id: string;
  annex: string;
  reportId: string;
  reportReference: string;
  taxId: string | null;
  sellerName: string | null;
  decision: string | null;
  finding: string | null;
  proof: string | null;
  documentNumber: string | null;
  issuedOn: string | null;
  amount: string | null;
  justification: string | null;
  missingElements: string | null;
  dgiReference: string | null;
  contentType: string | null;
};
type Letter = {
  id: string;
  reference: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  recipient: string | null;
  reason: string | null;
  preparedAt: string;
  decidedAt: string | null;
};
type Detail = { letter: Letter; lines: Line[]; responses: ResponseItem[] };
type ResponseItem = {
  id: string;
  receivedOn: string;
  service: string;
  reference: string;
  conclusion: string;
  contentType: string;
  recordedAt: string;
};

const ANNEXES = [
  { value: "company", label: "Entreprises" },
  { value: "invoice", label: "Factures" },
  { value: "sheet", label: "Fiches" },
  { value: "piece", label: "Pièces" },
];

export default function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<PageSkeleton />}><LetterDetail params={params} /></Suspense>;
}

async function LetterDetail({ params }: { params: Promise<{ id: string }> }) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (account.role === "AGENT") {
    redirect("/signalements");
  }
  const { id } = await params;
  const detail = await readMissingJson<Detail>(`/api/letters/${id}`);
  if (!detail) {
    notFound();
  }
  const canWrite = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const canDecide = canWrite && detail.letter.status === "draft";
  const canRespond = canWrite && detail.letter.status === "validated";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        back={{ href: "/courriers", label: "Courriers" }}
        title={<span className="tabular-nums">{detail.letter.reference}</span>}
        description={`Semaine du ${calendarLabel(detail.letter.periodStart)} au ${calendarLabel(detail.letter.periodEnd)}. Préparé le ${reportedAtLabel(detail.letter.preparedAt)}. Envoi non enregistré.`}
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<a href={`/courriers/${detail.letter.id}/annexes/company`} />}><HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} data-icon="inline-start" />Entreprises</Button>
            <Button variant="outline" nativeButton={false} render={<a href={`/courriers/${detail.letter.id}/annexes/invoice`} />}><HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} data-icon="inline-start" />Factures</Button>
          </>
        }
      >
        {detail.letter.recipient || detail.letter.reason ? (
          <div className="grid gap-1 text-sm leading-6">
            {detail.letter.recipient ? <p>Destinataire : <span className="font-medium">{detail.letter.recipient}</span></p> : null}
            {detail.letter.reason ? <p>Motif : {detail.letter.reason}</p> : null}
          </div>
        ) : null}
      </PageHeader>
      {ANNEXES.map((annex) => {
        const lines = detail.lines.filter((line) => line.annex === annex.value);
        return (
          <PageSection key={annex.value} title={annex.label} description={lines.length > 0 ? `${lines.length} constat${lines.length > 1 ? "s" : ""}` : undefined}>
            {lines.length === 0 ? <LedgerEmpty className="py-5">Aucun constat.</LedgerEmpty> : <Ledger>{lines.map((line) => <LetterLine key={line.id} line={line} />)}</Ledger>}
          </PageSection>
        );
      })}
      {canDecide ? <Card><CardHeader><CardTitle>Décision sur le courrier</CardTitle></CardHeader><CardContent className="max-w-lg"><LetterDecisionForm letterId={detail.letter.id} /></CardContent></Card> : null}
      <PageSection
        title="Réponses reçues"
        actions={canRespond ? <ActionDialog label="Enregistrer une réponse" title="Enregistrer une réponse" variant="default"><LetterResponseForm letterId={detail.letter.id} /></ActionDialog> : undefined}
      >
        {detail.responses.length === 0 ? <LedgerEmpty className="py-5">Aucune réponse enregistrée.</LedgerEmpty> : (
          <Ledger>
            {detail.responses.map((response) => (
              <LedgerItem key={response.id} className="py-4" title={response.service} meta={<span className="ref">{response.reference}</span>}>
                <p>{response.conclusion}</p>
                <p className="text-muted-foreground">Reçue le {calendarLabel(response.receivedOn)}. Enregistrée le {reportedAtLabel(response.recordedAt)}.</p>
                <a className="w-fit text-primary underline-offset-4 hover:underline" href={`/courriers/${detail.letter.id}/reponses/${response.id}`}>Télécharger la pièce</a>
              </LedgerItem>
            ))}
          </Ledger>
        )}
      </PageSection>
    </Page>
  );
}

function LetterLine({ line }: { line: Line }) {
  const finding = findingLabel(line.finding);
  const proof = proofLabel(line.proof);
  return (
    <LedgerItem
      className="py-4"
      title={line.taxId ? <span className="ref text-sm font-medium">{line.taxId}</span> : "Sans numéro"}
      meta={line.sellerName}
    >
      {line.decision ? <p className="font-medium">{qualificationDecisionLabel(line.decision)}{finding ? ` · ${finding}` : ""}{proof ? ` · ${proof}` : ""}</p> : null}
      {line.documentNumber || line.amount || line.issuedOn ? <p className="tabular-nums">{[line.documentNumber, line.issuedOn ? calendarLabel(line.issuedOn) : null, line.amount].filter(Boolean).join(" · ")}</p> : null}
      {line.justification ? <p>{line.justification}</p> : null}
      {line.missingElements ? <p>Éléments manquants : {line.missingElements}</p> : null}
      {line.dgiReference ? <p>Référence : {line.dgiReference}</p> : null}
      {line.contentType ? <p className="text-muted-foreground">Pièce {line.contentType}</p> : null}
      <ReportLink id={line.reportId} reference={line.reportReference} />
    </LedgerItem>
  );
}
