import { SMS_LIMIT } from "@/modules/report/model/message";

const KINDS = ["payout", "reexamination", "situation"];

export function modelBody(formData: FormData): { kind: string; body: string } | string {
  const kind = String(formData.get("kind") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!KINDS.includes(kind) || body.length === 0 || body.includes("%s") || /[\u0000-\u001f\u007f-\u009f]/u.test(body)) {
    return "Saisissez le message sur une seule ligne.";
  }
  if (body.length > SMS_LIMIT) return "Le SMS dépasse 100 caractères. Raccourcissez le texte.";
  return { kind, body };
}
