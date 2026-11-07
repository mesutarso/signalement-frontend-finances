import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel, reportedAtLabel } from "@/modules/report/model/report";
import { PrepareLetterForm } from "@/modules/report/ui/prepare-letter-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/table-pagination";

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
type Page = { items: Letter[]; page: number; size: number; total: number };

const FILTERS = [
  { value: "all", label: "Tous" },
  { value: "waiting", label: "En attente de réponse" },
];

const STATUS: Record<string, string> = {
  draft: "Brouillon",
  validated: "Validé",
  returned: "Renvoyé",
};

export default function LettersPage({ searchParams }: PageProps<"/courriers">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Letters searchParams={searchParams} /></Suspense>;
}

async function Letters({ searchParams }: Pick<PageProps<"/courriers">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (account.role === "AGENT") {
    redirect("/signalements");
  }
  const params = await searchParams;
  const status = FILTERS.some((filter) => filter.value === params.status) ? String(params.status) : "all";
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const letters = await readJson<Page>(`/api/letters?status=${status}&page=${page}`).catch(() => null);
  const canPrepare = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Courriers</h1>
      </div>
      {canPrepare ? <PrepareLetterForm /> : null}
      <form className="flex flex-wrap gap-2" method="get">
        {FILTERS.map((filter) => (
          <Button key={filter.value} type="submit" name="status" value={filter.value} variant={filter.value === status ? "default" : "outline"}>{filter.label}</Button>
        ))}
      </form>
      {!letters ? <Alert variant="destructive"><AlertTitle>Les courriers sont indisponibles. Actualisez la page.</AlertTitle></Alert> : letters.items.length === 0 ? <p className="text-sm text-muted-foreground">{status === "waiting" ? "Aucun courrier validé n'attend de réponse." : "Aucun courrier."}</p> : (
        <>
          <div className="grid gap-4">
            {letters.items.map((letter) => (
              <Card key={letter.id}>
                <CardHeader className="gap-2">
                  <CardTitle>{letter.reference}</CardTitle>
                  <p className="text-sm font-bold">{STATUS[letter.status] ?? letter.status}</p>
                  <p className="text-sm text-muted-foreground">Semaine du {calendarLabel(letter.periodStart)} au {calendarLabel(letter.periodEnd)}</p>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <p className="text-xs text-muted-foreground">Préparé le {reportedAtLabel(letter.preparedAt)}. Envoi non enregistré.</p>
                  {letter.reason ? <p className="text-sm">Motif : {letter.reason}</p> : null}
                  <Link href={`/courriers/${letter.id}`} className="w-fit text-sm text-primary underline-offset-4 hover:underline">Ouvrir le courrier</Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination page={letters.page} size={letters.size} total={letters.total} label="Pagination des courriers" />
        </>
      )}
    </section>
  );
}
