"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function verifyTaxpayer(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return "Ce contribuable est introuvable.";
  }
  const result = await writeJson(`/api/taxpayers/${id}/verifications`, "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/contribuables");
  return null;
}
