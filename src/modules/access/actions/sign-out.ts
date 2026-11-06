"use server";

import { redirect } from "next/navigation";
import { writeJson } from "@/lib/api";

export async function signOut(): Promise<void> {
  await writeJson("/api/auth", "DELETE");
  redirect("/connexion");
}
