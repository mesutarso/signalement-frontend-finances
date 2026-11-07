"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

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
  return decision === "confirm" ? "Doublon confirmé. Un seul dossier conserve la priorité." : "Rapprochement écarté. Les deux dossiers restent ouverts.";
}
