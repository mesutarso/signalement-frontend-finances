import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { readMissingJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, findingLabel, proofLabel, qualificationDecisionLabel, reportedAtLabel } from "@/modules/report/model/report";
import { LetterDecisionForm } from "@/modules/report/ui/letter-decision-form";
import { LetterResponseForm } from "@/modules/report/ui/letter-response-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><LetterDetail params={params} /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">{detail.letter.reference}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Semaine du {calendarLabel(detail.letter.periodStart)} au {calendarLabel(detail.letter.periodEnd)}. Préparé le {reportedAtLabel(detail.letter.preparedAt)}. Envoi non enregistré.</p>
        {detail.letter.recipient ? <p className="text-sm font-bold">Destinataire : {detail.letter.recipient}</p> : null}
        {detail.letter.reason ? <p className="text-sm">Motif : {detail.letter.reason}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <a className="text-primary underline-offset-4 hover:underline" href={`/courriers/${detail.letter.id}/annexes/company`}>Télécharger les entreprises</a>
        <a className="text-primary underline-offset-4 hover:underline" href={`/courriers/${detail.letter.id}/annexes/invoice`}>Télécharger les factures</a>
      </div>
      {ANNEXES.map((annex) => {
        const lines = detail.lines.filter((line) => line.annex === annex.value);
        return (
          <Card key={annex.value}>
            <CardHeader><CardTitle>{annex.label}</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {lines.length === 0 ? <p className="text-sm text-muted-foreground">Aucun constat.</p> : lines.map((line) => <LetterLine key={line.id} line={line} />)}
            </CardContent>
          </Card>
        );
      })}
      {canDecide ? <LetterDecisionForm letterId={detail.letter.id} /> : null}
      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Réponses reçues</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {detail.responses.length === 0 ? <p className="text-sm text-muted-foreground">Aucune réponse enregistrée.</p> : detail.responses.map((response) => (
            <article key={response.id} className="grid gap-1 rounded-lg border p-4 text-sm">
              <p className="font-bold">{response.service} · {response.reference}</p>
              <p>Reçue le {calendarLabel(response.receivedOn)}. Enregistrée le {reportedAtLabel(response.recordedAt)}.</p>
              <p>{response.conclusion}</p>
              <a className="w-fit text-primary underline-offset-4 hover:underline" href={`/courriers/${detail.letter.id}/reponses/${response.id}`}>Télécharger la pièce</a>
            </article>
          ))}
          {canRespond ? <LetterResponseForm letterId={detail.letter.id} /> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function LetterLine({ line }: { line: Line }) {
  const finding = findingLabel(line.finding);
  const proof = proofLabel(line.proof);
  return (
    <article className="grid gap-1 rounded-lg border p-4 text-sm">
      <p className="font-bold">{line.taxId ? `Numéro d'impôt ${line.taxId}` : "Sans numéro"}{line.sellerName ? ` · ${line.sellerName}` : ""}</p>
      {line.decision ? <p>{qualificationDecisionLabel(line.decision)}{finding ? ` · ${finding}` : ""}{proof ? ` · ${proof}` : ""}</p> : null}
      {line.documentNumber || line.amount || line.issuedOn ? <p>{[line.documentNumber, line.issuedOn ? calendarLabel(line.issuedOn) : null, line.amount].filter(Boolean).join(" · ")}</p> : null}
      {line.justification ? <p>{line.justification}</p> : null}
      {line.missingElements ? <p>Éléments manquants : {line.missingElements}</p> : null}
      {line.dgiReference ? <p>Référence : {line.dgiReference}</p> : null}
      {line.contentType ? <p>Pièce {line.contentType}</p> : null}
      <Link href={`/signalements/${line.reportId}`} className="w-fit text-primary underline-offset-4 hover:underline">Ouvrir le signalement {line.reportReference}</Link>
    </article>
  );
}
