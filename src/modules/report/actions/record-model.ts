"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { modelBody } from "@/modules/report/schema/model-form";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export type ModelResult = { saved: boolean; message: string } | null;

export async function recordModel(_current: ModelResult, formData: FormData): Promise<ModelResult> {
  const account = await readCurrentAccount();
  if (!account || !["ADMINISTRATOR", "SUPERVISOR"].includes(account.role)) return { saved: false, message: "Cette action n’est pas autorisée." };
  const body = modelBody(formData);
  if (typeof body === "string") {
    return { saved: false, message: body };
  }
  const result = await writeJson("/api/document-models", "POST", body);
  if (!result.ok) {
    return { saved: false, message: result.message };
  }
  revalidatePath("/messages");
  return { saved: true, message: "Modèle enregistré." };
}
