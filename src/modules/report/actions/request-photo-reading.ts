"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function requestPhotoReading(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/photos/${photoId}/readings`, "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  return null;
}
