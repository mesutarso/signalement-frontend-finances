"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { redirect } from "next/navigation";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export async function requestPhotoReading(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const refresh = formData.get("refresh") === "true";
  const result = await writeJson(`/api/reports/${reportId}/photos/${photoId}/readings?refresh=${refresh}`, "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath("/signalements");
  const account = await readCurrentAccount();
  if (account?.role === "AGENT") redirect("/signalements?result=analyzing");
  return null;
}
