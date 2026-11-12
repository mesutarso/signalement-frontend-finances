"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendMessage, sendTestSms } from "@/modules/report/actions/send-message";

export function SendMessageForm({ messageId }: { messageId: string }) {
  const [message, action, pending] = useActionState(sendMessage, null);
  return <form action={action} className="grid justify-items-start gap-2">
    <input type="hidden" name="messageId" value={messageId} />
    <Button type="submit" size="sm" disabled={pending}>{pending ? "Envoi…" : "Envoyer le SMS"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}

export function TestSmsForm() {
  const [message, action, pending] = useActionState(sendTestSms, null);
  return <form action={action} className="grid justify-items-start gap-2">
    <Button type="submit" variant="outline" disabled={pending}>{pending ? "Envoi…" : "SMS de test"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}
