"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function preparePaymentStatement(): Promise<string | null> {
  const result = await writeJson("/api/payment-statements", "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/etats");
  return null;
}
