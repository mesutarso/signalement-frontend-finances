"use server";
import { revalidatePath } from "next/cache";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { writeJson } from "@/lib/api";
export async function sendPhotoRequest(_previous: string | null, data: FormData): Promise<string | null> {
  if(!can(await readCurrentAccount(), "report.review")) return "Cette action n’est pas autorisée.";
  const id=String(data.get("reportId")||""); const request=String(data.get("requestId")||"");
  if(!/^[a-f\d-]{36}$/i.test(id) || !/^[a-f\d-]{36}$/i.test(request)) return "Demande introuvable.";
  const result=await writeJson<{status:string}>(`/api/reports/${id}/photo-requests/${request}/deliveries`,"POST");
  revalidatePath(`/signalements/${id}`); revalidatePath("/messages");
  if(!result.ok) return result.message;
  if(result.body?.status === "unknown") return "L’envoi reste à confirmer. Ne renvoyez pas ce SMS.";
  return result.body?.status === "accepted" ? "SMS transmis." : "Le SMS n’a pas pu être transmis. Vérifiez le numéro du déclarant.";
}
