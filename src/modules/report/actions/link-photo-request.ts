"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { writeJson } from "@/lib/api";

export async function linkPhotoRequest(_current: string | null, formData: FormData): Promise<string | null> {
  if (!can(await readCurrentAccount(), "report.review")) return "Cette action n’est pas autorisée.";
  const reportId = String(formData.get("reportId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const referenceCode = String(formData.get("referenceCode") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/photo-requests/${requestId}/links`, "POST", { referenceCode });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath("/signalements");
  return "Nouvelle pièce rattachée.";
}
