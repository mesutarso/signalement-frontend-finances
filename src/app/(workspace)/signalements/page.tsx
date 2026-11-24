import { Suspense } from "react";
import { Page, PageHeader } from "@/components/page";
import { ReportsContent } from "@/modules/report/ui/reports-content";
import { ReportsTableSkeleton } from "@/modules/report/ui/reports-table";

export default function SignalementsPage({ searchParams }: PageProps<"/signalements">) {
  return (
    <Suspense fallback={
      <Page className="gap-8 md:gap-8">
        <PageHeader title="Signalements" />
        <ReportsTableSkeleton />
      </Page>
    }>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}
