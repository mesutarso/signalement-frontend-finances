"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { transferLabel, type PaymentTransfer } from "@/modules/report/model/transfer";

const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
type Feedback = { message: string; terminal?: boolean; requestId?: string } | null;

export async function transferPayment(_current: Feedback, data: FormData): Promise<Feedback> {
  const account = await readCurrentAccount();
  const test = data.get("test") === "true";
  if (!account || (test ? account.role !== "ADMINISTRATOR" : account.role !== "PAYMASTER")) return { message: "Cette action n’est pas autorisée." };
  const requestId = String(data.get("requestId") ?? "");
  const statementId = String(data.get("statementId") ?? "");
  const lineId = String(data.get("lineId") ?? "");
  const operator = String(data.get("operator") ?? "");
  if (!UUID.test(requestId) || !["mpesa", "airtel", "orange", "afrimoney"].includes(operator)) return { message: "Choisissez un moyen de paiement." };
  if (!test && (!UUID.test(statementId) || !UUID.test(lineId))) return { message: "Ligne de paiement introuvable." };
  const body = test ? { requestId, operator, phone: String(data.get("phone") ?? "") } : { requestId, operator, lineId };
  try {
    const response = await writeJson<PaymentTransfer>(test ? "/api/payment-transfers/tests" : `/api/payment-statements/${statementId}/transfers`, "POST", body);
    if (!response.ok) return { message: response.message };
    revalidatePath("/etats");
    if (statementId) revalidatePath(`/etats/${statementId}`);
    return { message: response.body ? transferLabel(response.body) : "Demande enregistrée.", terminal: response.body?.state === "paid", requestId };
  } catch {
    // Keep the form's request ID. Repeating it only reads the already reserved order.
    return { message: "Résultat à confirmer. Vérifiez le statut avant un nouvel envoi." };
  }
}

export async function checkTransfer(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!account || !["PAYMASTER", "ADMINISTRATOR"].includes(account.role)) return "Cette action n’est pas autorisée.";
  const id = String(data.get("transferId") ?? "");
  const statementId = String(data.get("statementId") ?? "");
  if (!UUID.test(id)) return "Versement introuvable.";
  try {
    const response = await writeJson<PaymentTransfer>(`/api/payment-transfers/${id}/checks`, "POST");
    if (!response.ok) return response.message;
    revalidatePath("/etats");
    if (UUID.test(statementId)) revalidatePath(`/etats/${statementId}`);
    return response.body ? transferLabel(response.body) : "Statut actualisé.";
  } catch { return "Le statut est indisponible. Réessayez la vérification."; }
}
