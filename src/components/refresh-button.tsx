"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? <Spinner data-icon="inline-start" /> : null}Actualiser</Button>;
}
