"use server";

import { can } from "@/modules/access/model/account";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export async function startReportAnalysis(reportId: string): Promise<boolean> {
  const account = await readCurrentAccount();
  if (!can(account, "report.analyze") || !/^[a-f\d-]{36}$/i.test(reportId)) return false;
  const result = await writeJson(`/api/reports/${reportId}/analysis/start`, "POST");
  return result.ok;
}

export async function reviewFiscalStatus(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!can(account, "report.review")) return "Cette action n’est pas autorisée.";
  const id = String(data.get("reportId") ?? "");
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Le signalement est introuvable.";
  const revision = Number(data.get("revision"));
  if (!Number.isSafeInteger(revision) || revision < 0) return "Actualisez le dossier avant d’enregistrer.";
  const vatStatus = String(data.get("vatStatus") ?? "");
  if (!["registered", "unregistered"].includes(vatStatus)) return "Indiquez si l’établissement est assujetti à la TVA.";
  const vatEvidence = String(data.get("vatEvidence") ?? "").trim();
  if (!vatEvidence) return "Indiquez la référence de votre vérification.";
  const result = await writeJson(`/api/reports/${id}/assessment/fiscal-status`, "POST", { revision, vatStatus, vatEvidence })
    .catch(() => ({ ok: false as const, message: "L’enregistrement n’a pas pu être confirmé. Actualisez le dossier avant de réessayer." }));
  if (!result.ok) return result.message;
  refreshAssessment(id);
  return null;
}

function refreshAssessment(id: string): void {
  revalidatePath("/signalements");
  revalidatePath("/dossiers-valides");
  revalidatePath(`/signalements/${id}`);
  revalidatePath("/declarants");
  revalidatePath("/dossiers");
  revalidatePath("/dossiers/entreprise");
  revalidatePath("/contribuables");
  revalidatePath("/recompenses");
  revalidatePath("/paiements");
  revalidatePath("/indicateurs");
}

export async function decideAssessment(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!can(account, "report.review")) return "Cette action n’est pas autorisée.";
  const id = String(data.get("reportId") ?? "");
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Le signalement est introuvable.";
  const revision = Number(data.get("revision"));
  if (!Number.isSafeInteger(revision) || revision < 0) return "Actualisez le dossier avant d’enregistrer.";
  const decision = String(data.get("decision") ?? "");
  const code = String(data.get("code") ?? "");
  if (!["validate", "reject"].includes(decision) || !code) return "Choisissez la catégorie ou le motif.";
  const result = await writeJson(`/api/reports/${id}/assessment/decision`, "POST", { revision, decision, code })
    .catch(() => ({ ok: false as const, message: "L’enregistrement n’a pas pu être confirmé. Actualisez le dossier avant de réessayer." }));
  if (!result.ok) return result.message;
  refreshAssessment(id);
  return null;
}
