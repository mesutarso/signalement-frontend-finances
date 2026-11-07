"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordHandover(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!id) {
    return "Ce lot est introuvable.";
  }
  const result = await writeJson(`/api/draws/prizes/${id}/handover`, "POST", { note });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/tirages");
  return null;
}
