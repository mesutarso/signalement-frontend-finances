import { can } from "@/modules/access/model/account";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readAssignees } from "@/modules/report/queries/read-assignees";
import { readReports } from "@/modules/report/queries/read-reports";
import { listContext, listHref, workParams } from "@/modules/report/model/work-filters";
import { readReport } from "@/modules/report/queries/read-report";
import { readJson } from "@/lib/api";
import { ReportScreen } from "@/modules/report/ui/report-screen";
import type { AssessmentView } from "@/modules/report/model/assessment";

export default function Page({ params, searchParams }: PageProps<"/signalements/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReportContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReportContent({ params, searchParams }: PageProps<"/signalements/[id]">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "report.read")) redirect("/");
  const { id } = await params;
  const search=await searchParams;
  const rawList=typeof search.list === "string" ? search.list : account.role==="AGENT" ? "validation=doubt&scope=mine" : "";
  const context=listContext(rawList);
  const encoded=encodeURIComponent(workParams(context).toString());
  const safePage=Math.max(0,Number(context.page)||0);
  const queue=await readReports({...context,page:safePage,
    assigneeId:context.scope==="mine"?account.id:context.agent || undefined,unassigned:context.scope==="unassigned"});
  const index=queue.reports.findIndex(r=>r.id===id);
  const previous=index>0?queue.reports[index-1]:undefined;
  let next=queue.reports[index<0?0:index+1];
  let nextPage=safePage;
  if(!next && (safePage+1)*queue.size<queue.total) {
    const more=await readReports({...context,page:safePage+1,assigneeId:context.scope==="mine"?account.id:context.agent || undefined,unassigned:context.scope==="unassigned"});
    next=more.reports[0];nextPage=safePage+1;
  }
  const nextList=encodeURIComponent(workParams({...context,page:String(nextPage)}).toString());
  const report = await readReport(id);
  if (!report) {
    notFound();
  }
  const canAssign = can(account, "report.assign");
  const canReview = can(account, "report.review") && (account.role !== "AGENT" || report.validationState === "doubt");
  const canDecide = canReview && (report.validationState === "doubt"
    || (account.role === "ADMINISTRATOR" && ["validated", "rejected"].includes(report.validationState)));
  const legacy = report.validationState === "legacy";
  const [assignees, assessment] = await Promise.all([
    canAssign ? readAssignees() : Promise.resolve([]),
    legacy ? Promise.resolve(null) : readJson<AssessmentView>(`/api/reports/${id}/assessment`),
  ]);
  return <ReportScreen report={report} canAssign={canAssign} canReview={canReview} canDecide={canDecide} assignees={assignees} assessment={assessment} backHref={listHref(rawList)} nextHref={next ? `/signalements/${next.id}?list=${nextList}` : undefined} previousHref={previous ? `/signalements/${previous.id}?list=${encoded}` : undefined} />;
}
