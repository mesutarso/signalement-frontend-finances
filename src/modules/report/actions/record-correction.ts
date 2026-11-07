"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordCorrection(_current: string | null, formData: FormData): Promise<string | null> {
  const reference = String(formData.get("reference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reference || !reason) {
    return "Indiquez la référence et le motif.";
  }
  const result = await writeJson("/api/corrections", "POST", { reference, reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/corrections");
  return null;
}
