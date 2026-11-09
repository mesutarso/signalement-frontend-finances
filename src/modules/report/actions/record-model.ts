"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { modelBody } from "@/modules/report/schema/model-form";

export async function recordModel(_current: string | null, formData: FormData): Promise<string | null> {
  const body = modelBody(formData);
  if (typeof body === "string") {
    return body;
  }
  const result = await writeJson("/api/document-models", "POST", body);
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/messages");
  return null;
}
