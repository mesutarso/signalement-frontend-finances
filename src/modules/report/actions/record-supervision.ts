"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordSupervision(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const response = await writeJson(`/api/reports/${reportId}/supervision`, "POST", { result, reason });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/supervision");
  revalidatePath(`/signalements/${reportId}`);
  return result === "upheld"
    ? "Décision maintenue. La qualification déjà enregistrée reste en place."
    : "Dossier renvoyé. La qualification déjà enregistrée reste en place.";
}
