"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

type SmsResult = { status: string; code: string };
const ERRORS: Record<string, string> = {
  "recipient-blocked": "Ce destinataire n’est pas autorisé pour les essais.",
  "not-configured": "Le service SMS est indisponible.",
  "invalid-message": "Le SMS doit contenir entre 1 et 160 caractères.",
  "circuit-open": "Le service SMS est temporairement indisponible.",
  "busy": "Le service SMS est occupé.",
  "rate-limited": "La limite d’envoi est atteinte.",
  "provider-rejected": "L’envoi a été refusé.",
};

export async function sendMessage(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!account || !["SUPERVISOR", "ADMINISTRATOR"].includes(account.role)) return "Cette action n’est pas autorisée.";
  const id = String(data.get("messageId") ?? "");
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Message introuvable.";
  const result = await writeJson<SmsResult>(`/api/declarant-messages/${id}/deliveries`, "POST");
  if (!result.ok) return result.message;
  revalidatePath("/messages");
  return smsFeedback(result.body);
}

export async function sendTestSms(): Promise<string | null> {
  const account = await readCurrentAccount();
  if (account?.role !== "ADMINISTRATOR") return "Cette action n’est pas autorisée.";
  const result = await writeJson<SmsResult>("/api/sms/tests", "POST");
  return result.ok ? smsFeedback(result.body) : result.message;
}

function smsFeedback(result: SmsResult | null | undefined): string {
  if (result?.status === "accepted") return "SMS transmis.";
  if (result?.status === "unknown") return "Résultat de l’envoi à confirmer.";
  return ERRORS[result?.code ?? ""] ?? "L’envoi a échoué.";
}
