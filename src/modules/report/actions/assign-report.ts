"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function assignReport(_current: string | null, formData: FormData): Promise<string> {
  const reportId = String(formData.get("reportId") ?? "");
  const version = Number(formData.get("version"));
  const priority = String(formData.get("priority") ?? "");
  const assignee = String(formData.get("assigneeId") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/assignment`, "PUT", {
    version,
    priority,
    assigneeId: assignee === "" ? null : assignee,
  });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/signalements");
  revalidatePath(`/signalements/${reportId}`);
  return "Affectation enregistrée.";
}
