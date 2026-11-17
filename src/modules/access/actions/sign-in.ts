"use server";

import { redirect } from "next/navigation";
import { writeJson } from "@/lib/api";
import { readLogin } from "@/modules/access/schema/credentials";
import { can, type Account } from "@/modules/access/model/account";

export async function signIn(_current: string | null, formData: FormData): Promise<string | null> {
  const input = readLogin(formData);
  if (typeof input === "string") {
    return input;
  }
  const result = await writeJson<Account>("/api/auth", "POST", input);
  if (!result.ok) {
    return result.message;
  }
  const account = result.body;
  redirect(can(account, "report.read") ? "/signalements" : can(account, "payment.read") ? "/etats" : can(account, "letter.read") ? "/courriers" : "/compte");
}
