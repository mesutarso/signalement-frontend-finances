"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function linkPhotoRequest(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const referenceCode = String(formData.get("referenceCode") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/photo-requests/${requestId}/links`, "POST", { referenceCode });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  return "La nouvelle pièce est rattachée. L'historique est conservé.";
}
