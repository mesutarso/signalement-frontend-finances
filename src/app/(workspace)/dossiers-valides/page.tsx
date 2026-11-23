import { Suspense } from "react";
import { PageSkeleton } from "@/components/page";
import { ReportsContent } from "@/modules/report/ui/reports-content";

export default function Page({ searchParams }: PageProps<"/dossiers-valides">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReportsContent searchParams={searchParams} validatedOnly />
    </Suspense>
  );
}
