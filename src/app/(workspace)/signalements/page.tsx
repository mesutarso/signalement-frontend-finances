import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readReports } from "@/modules/report/queries/read-reports";
import { ReportList } from "@/modules/report/ui/report-list";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function Page({ searchParams }: PageProps<"/signalements">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ReportsContent({ searchParams }: Pick<PageProps<"/signalements">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const params = await searchParams;
  const requestedPage = Number(params.page ?? 0);
  const q = first(params.q).trim();
  const state = first(params.state);
  const validation = account.role === "AGENT" ? "doubt" : first(params.validation);
  const priority = first(params.priority);
  const requestedScope = first(params.scope);
  const scope = requestedScope || "all";
  const page = await readReports({
    page: Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0,
    q,
    state,
    validation,
    priority,
    assigneeId: scope === "mine" ? account.id : undefined,
    unassigned: scope === "unassigned",
  });
  return (
    <ReportList
      page={page}
      canImport={account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR"}
      onlyDoubts={account.role === "AGENT"}
      validation={validation}
      result={first(params.result)}
      q={q}
      state={state}
      priority={priority}
      scope={scope}
    />
  );
}
