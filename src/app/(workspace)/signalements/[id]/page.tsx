import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readAssignees } from "@/modules/report/queries/read-assignees";
import { readReport } from "@/modules/report/queries/read-report";
import { readJson } from "@/lib/api";
import type { PointMovement } from "@/modules/report/ui/points-panel";
import type { PrimeAccount } from "@/modules/report/model/prime";
import { ReportScreen } from "@/modules/report/ui/report-screen";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ReportContent params={params} />
    </Suspense>
  );
}

async function ReportContent({ params }: { params: Promise<{ id: string }> }) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const { id } = await params;
  const report = await readReport(id);
  if (!report) {
    notFound();
  }
  const canAssign = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const canRequest = account.role !== "AUDITOR";
  const assignees = canAssign ? await readAssignees() : [];
  const points = await readJson<{ items: PointMovement[]; net: number }>(`/api/reports/${id}/points`).catch(() => null);
  const prime = await readJson<PrimeAccount>(`/api/reports/${id}/prime`).catch(() => null);
  return <ReportScreen report={report} canAssign={canAssign} canRequest={canRequest} assignees={assignees} points={points} prime={prime} />;
}
