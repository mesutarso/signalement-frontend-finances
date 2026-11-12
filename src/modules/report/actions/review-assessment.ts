"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import type { AssessmentView } from "@/modules/report/model/assessment";

export async function reviewAssessment(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!account || !["AGENT", "SUPERVISOR", "ADMINISTRATOR"].includes(account.role)) return "Cette action n’est pas autorisée.";
  const id = String(data.get("reportId") ?? "");
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Le signalement est introuvable.";
  const revision = Number(data.get("revision"));
  if (!Number.isSafeInteger(revision) || revision < 0) return "Actualisez le dossier avant d’enregistrer.";
  const names = ["photoId", "sellerName", "sellerTaxId", "documentNumber", "documentDate", "vatStatus", "vatEvidence", "normalization",
    "normalizationEvidence", "purchaseConformity", "purchaseEvidence", "vatCharged", "vatChargeEvidence", "uniqueness", "uniquenessEvidence"];
  const body: Record<string, string | number | null> = { revision };
  for (const name of names) body[name] = String(data.get(name) ?? "").trim() || null;
  const result = await writeJson<AssessmentView>(`/api/reports/${id}/assessment`, "POST", body);
  if (!result.ok) return result.message;
  revalidatePath("/signalements");
  revalidatePath(`/signalements/${id}`);
  revalidatePath("/recompenses");
  revalidatePath("/indicateurs");
  const state = result.body?.assessment.state;
  if (account.role === "AGENT" && state && state !== "doubt") redirect(`/signalements?result=${state}`);
  return result.body?.assessment.reason ?? "Vérifications enregistrées.";
}

export async function requestAnalysis(_current: string | null, data: FormData): Promise<string | null> {
  const id = String(data.get("reportId") ?? "");
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Le signalement est introuvable.";
  const result = await writeJson(`/api/reports/${id}/analysis`, "POST");
  if (!result.ok) return result.message;
  revalidatePath(`/signalements/${id}`);
  revalidatePath("/signalements");
  return "Analyse demandée.";
}
