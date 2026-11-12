"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { redirect } from "next/navigation";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export async function decideDuplicate(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const alertId = String(formData.get("alertId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/duplicates/${alertId}`, "POST", { decision, reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath(`/signalements/${String(formData.get("otherReportId") ?? "")}`);
  revalidatePath("/signalements");
  const account = await readCurrentAccount();
  if (account?.role === "AGENT") redirect("/signalements?result=analyzing");
  return decision === "confirm" ? "Doublon confirmé. Un seul dossier conserve la priorité." : "Rapprochement écarté. Les deux dossiers restent ouverts.";
}
