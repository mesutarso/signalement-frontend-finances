"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordQualification(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const result = await writeJson(`/api/reports/${reportId}/qualifications`, "POST", {
    decision,
    finding: text(formData, "finding"),
    proof: text(formData, "proof"),
    justification: String(formData.get("justification") ?? ""),
    sellerName: text(formData, "sellerName"),
    sellerTaxId: text(formData, "sellerTaxId"),
    issuedOn: text(formData, "issuedOn"),
    amount: text(formData, "amount"),
    documentNumber: text(formData, "documentNumber"),
    code: text(formData, "code"),
    missingElements: text(formData, "missingElements"),
    dgiReference: text(formData, "dgiReference"),
  });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  if (decision === "confirm") {
    return "Constat retenu. Aucun point n'est attribué.";
  }
  if (decision === "wait") {
    return "Confirmation de la DGI attendue. Aucun point n'est attribué.";
  }
  return "Signalement écarté. Le dossier déposé reste inchangé.";
}

function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}
