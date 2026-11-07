"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function decidePaymentStatement(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  const step = String(formData.get("step") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["control", "visa", "authorize"].includes(step) || !["accept", "return", "refuse"].includes(result)) {
    return "La décision n'est pas acceptée.";
  }
  const path = step === "visa" ? "visas" : step === "authorize" ? "authorizations" : "controls";
  const response = await writeJson(`/api/payment-statements/${id}/${path}`, "POST", { result, reason: reason || null });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/etats");
  revalidatePath(`/etats/${id}`);
  return null;
}
