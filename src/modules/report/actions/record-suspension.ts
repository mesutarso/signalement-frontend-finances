"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordSuspension(_current: string | null, formData: FormData): Promise<string | null> {
  const reference = String(formData.get("reference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  if (!reference || !reason) {
    return "Indiquez la référence et le motif.";
  }
  const result = await writeJson("/api/prime-suspensions", "POST", { reference, action, reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/indices");
  return null;
}
