"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import type { ImportResult } from "@/modules/report/model/report";

export async function importReports(_current: string | null, data: FormData): Promise<string> {
  const start = String(data.get("start") ?? "");
  const end = String(data.get("end") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) return "Choisissez une période valide.";
  try {
    const result = await writeJson<ImportResult>("/api/report-imports", "POST", { start, end });
    revalidatePath("/imports");
    return result.ok ? "Import lancé. Le suivi se met à jour automatiquement." : result.message;
  } catch { return "L’import n’a pas pu être lancé. Réessayez."; }
}

export async function retryImport(id: string): Promise<string> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return "Import introuvable.";
  try {
    const result = await writeJson<ImportResult>(`/api/report-imports/${id}/retry`, "POST");
    revalidatePath("/imports");
    return result.ok ? "Relance demandée." : result.message;
  } catch { return "La relance a échoué. Réessayez."; }
}

export async function retryFailedAnalyses(): Promise<void> {
  const account = await readCurrentAccount();
  if (account?.role !== "ADMINISTRATOR") redirect("/signalements");
  const result = await writeJson<{ queued: number }>("/api/report-analysis/retry", "POST").catch(() => null);
  if (!result?.ok || !result.body) redirect("/imports?relance=erreur");
  revalidatePath("/imports");
  revalidatePath("/signalements");
  redirect(`/imports?relance=${result.body.queued}`);
}
