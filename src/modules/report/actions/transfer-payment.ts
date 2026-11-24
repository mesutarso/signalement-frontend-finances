"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { TRANSFER_OPERATORS, transferLabel, type PaymentTransfer, type TransferEnvironment } from "@/modules/report/model/transfer";

const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
type Feedback = { message: string; terminal?: boolean; requestId?: string } | null;

type RewardOrder = {
  lineId: string;
  previousTransferId: string | null;
  environment: TransferEnvironment;
  operator: string;
};

export async function payReward(rewardId: string, order: RewardOrder): Promise<{ state: string; message: string }> {
  if (!can(await readCurrentAccount(), "payment.execute")) {
    return { state: "rejected", message: "Cette action n’est pas autorisée." };
  }
  if (!order || !UUID.test(rewardId) || !UUID.test(order.lineId)
      || (order.previousTransferId !== null && !UUID.test(order.previousTransferId))
      || !["production", "sandbox"].includes(order.environment)
      || !TRANSFER_OPERATORS.some(([operator]) => operator === order.operator)) {
    return { state: "rejected", message: "Vérifiez le numéro de ligne et l’opérateur." };
  }
  const uncertain = { state: "unknown", message: "Résultat à confirmer. Consultez le statut du versement." };
  try {
    const response = await writeJson<PaymentTransfer>(`/api/rewards/${rewardId}/transfers`, "POST", order);
    if (!response.ok) return response.status >= 500 ? uncertain : { state: "rejected", message: response.message };
    if (response.body) return { state: response.body.state, message: transferLabel(response.body) };
  } catch {
    return uncertain;
  }
  return uncertain;
}

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
    revalidatePath("/paiements");
    revalidatePath("/recompenses");
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
    revalidatePath("/paiements");
    revalidatePath("/recompenses");
    if (UUID.test(statementId)) revalidatePath(`/etats/${statementId}`);
    return response.body ? transferLabel(response.body) : "Statut actualisé.";
  } catch { return "Le statut est indisponible. Réessayez la vérification."; }
}
