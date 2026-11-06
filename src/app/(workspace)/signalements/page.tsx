import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readReports } from "@/modules/report/queries/read-reports";
import { ReportList } from "@/modules/report/ui/report-list";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function Page({ searchParams }: PageProps<"/signalements">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
  const priority = first(params.priority);
  const requestedScope = first(params.scope);
  const scope = requestedScope || (account.role === "AGENT" ? "mine" : "all");
  const page = await readReports({
    page: Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0,
    q,
    state,
    priority,
    assigneeId: scope === "mine" ? account.id : undefined,
    unassigned: scope === "unassigned",
  });
  return (
    <ReportList
      page={page}
      canImport={account.role !== "AUDITOR"}
      q={q}
      state={state}
      priority={priority}
      scope={scope}
    />
  );
}
