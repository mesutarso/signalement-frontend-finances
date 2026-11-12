import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readAssignees } from "@/modules/report/queries/read-assignees";
import { readReport } from "@/modules/report/queries/read-report";
import { readJson } from "@/lib/api";
import { ReportScreen } from "@/modules/report/ui/report-screen";
import type { AssessmentView } from "@/modules/report/model/assessment";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
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
  const legacy = report.validationState === "legacy";
  const [assignees, assessment] = await Promise.all([
    canAssign ? readAssignees() : Promise.resolve([]),
    legacy ? Promise.resolve(null) : readJson<AssessmentView>(`/api/reports/${id}/assessment`),
  ]);
  return <ReportScreen report={report} canAssign={canAssign} canRequest={canRequest} assignees={assignees} assessment={assessment} />;
}
