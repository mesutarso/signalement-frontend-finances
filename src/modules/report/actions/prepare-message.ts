"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function prepareMessage(_current: string | null, formData: FormData): Promise<string | null> {
  const reference = String(formData.get("reference") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (!reference || !["photo", "payout", "reexamination", "situation"].includes(kind)) {
    return "Le message n'est pas accepté.";
  }
  const result = await writeJson("/api/declarant-messages", "POST", { reference, kind });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/messages");
  return null;
}
