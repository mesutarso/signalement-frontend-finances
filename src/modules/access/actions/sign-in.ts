"use server";

import { redirect } from "next/navigation";
import { writeJson } from "@/lib/api";
import { readLogin } from "@/modules/access/schema/credentials";

export async function signIn(_current: string | null, formData: FormData): Promise<string | null> {
  const input = readLogin(formData);
  if (typeof input === "string") {
    return input;
  }
  const result = await writeJson("/api/auth", "POST", input);
  if (!result.ok) {
    return result.message;
  }
  redirect("/signalements");
}
