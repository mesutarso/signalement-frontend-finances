"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? <Spinner data-icon="inline-start" /> : <HugeiconsIcon icon={Refresh01Icon} strokeWidth={1.75} data-icon="inline-start" />}
      Actualiser
    </Button>
  );
}
