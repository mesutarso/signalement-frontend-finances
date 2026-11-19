"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export function ReportNavigation({nextHref,previousHref}:{nextHref?:string;previousHref?:string}) {
  // Preserve the neighbours after the dossier leaves its filtered queue.
  const [neighbours]=useState({nextHref,previousHref});
  return <>
    {neighbours.previousHref ? <Button variant="outline" nativeButton={false} render={<Link href={neighbours.previousHref} />}>Précédent</Button> : null}
    {neighbours.nextHref ? <Button variant="outline" nativeButton={false} render={<Link href={neighbours.nextHref} />}>Suivant</Button> : null}
  </>;
}
