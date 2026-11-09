"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="grid max-w-2xl gap-5 py-8">
      <h1 className="text-[2rem] leading-[1.12] font-medium tracking-[-0.02em] md:text-[2.625rem]">Nous n’avons pas pu afficher cette page.</h1>
      <p className="text-[15px] leading-6 text-muted-foreground">Le service n’a pas répondu comme prévu. Vos saisies déjà enregistrées ne sont pas perdues. Réessayez dans un instant.</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => retry()}>Réessayer</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>Revenir au tableau de bord</Button>
      </div>
    </section>
  );
}
