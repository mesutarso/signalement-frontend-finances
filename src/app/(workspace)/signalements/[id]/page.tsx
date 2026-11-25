import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageSkeleton } from "@/components/page";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { ReportDetails } from "@/modules/report/ui/report-details";

export default function Page(props: PageProps<"/signalements/[id]">) {
  return <Suspense fallback={<PageSkeleton />}><ReportContent {...props} /></Suspense>;
}

async function ReportContent({ params, searchParams }: PageProps<"/signalements/[id]">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!can(account, "report.read")) redirect("/");
  const [{ id }, search] = await Promise.all([params, searchParams]);
  return <ReportDetails account={account} id={id} search={search} />;
}
