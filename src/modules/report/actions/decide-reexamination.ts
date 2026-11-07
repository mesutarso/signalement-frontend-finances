"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function decideReexamination(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  const result = String(formData.get("result") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["maintained", "modified"].includes(result)) {
    return "La décision n'est pas acceptée.";
  }
  const response = await writeJson(`/api/reexaminations/${id}/decisions`, "POST", { result, comment: comment || null });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/reexamens");
  return null;
}
