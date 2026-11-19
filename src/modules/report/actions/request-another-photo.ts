"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { writeJson } from "@/lib/api";

export async function requestAnotherPhoto(_current: string | null, formData: FormData): Promise<string | null> {
  if (!can(await readCurrentAccount(), "report.review")) return "Cette action n’est pas autorisée.";
  const reportId = String(formData.get("reportId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/photos/${photoId}/requests`, "POST", { reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath("/signalements");
  return "Demande préparée. Vous pouvez envoyer le SMS.";
}
