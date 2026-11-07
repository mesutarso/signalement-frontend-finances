"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { ruleBody } from "@/modules/report/schema/rule-form";

export async function recordRule(_current: string | null, formData: FormData): Promise<string | null> {
  const body = ruleBody(formData);
  if (typeof body === "string") {
    return body;
  }
  const result = await writeJson("/api/rules", "POST", body);
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/regles");
  return null;
}

export async function activateRule(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "").trim();
  const result = await writeJson(`/api/rules/${id}/activation`, "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/regles");
  return null;
}
