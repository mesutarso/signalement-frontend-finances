"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordReexamination(_current: string | null, formData: FormData): Promise<string | null> {
  const reference = String(formData.get("reference") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const receivedOn = String(formData.get("receivedOn") ?? "");
  if (!reference || !text || !/^\d{4}-\d{2}-\d{2}$/.test(receivedOn)) {
    return "Indiquez la référence, la demande et la date de réception.";
  }
  const result = await writeJson("/api/reexaminations", "POST", { reference, text, receivedOn });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/reexamens");
  return null;
}
