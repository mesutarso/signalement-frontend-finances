"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function requestAnotherPhoto(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/photos/${photoId}/requests`, "POST", { reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  return "Demande enregistrée. Le signalement d'origine n'est pas modifié.";
}
