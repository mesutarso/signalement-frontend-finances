import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="contenu" className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-6 py-16 md:px-16">
      <span aria-hidden="true" className="guilloche absolute top-1/2 right-[-18vh] -z-10 aspect-square w-[110vh] -translate-y-1/2 text-primary opacity-[0.14]" />
      <p className="text-sm text-muted-foreground">Ministère des Finances</p>
      <h1 className="mt-3 max-w-[14ch] text-[2.75rem] leading-[1.05] font-medium tracking-[-0.03em] md:text-[4.5rem]">Cette page n’existe pas.</h1>
      <p className="mt-5 max-w-[52ch] text-[15px] leading-6 text-muted-foreground">Le lien est peut-être incomplet, ou le dossier demandé n’est plus accessible avec votre compte.</p>
      <Button className="mt-8 w-fit" nativeButton={false} render={<Link href="/" />}>Revenir au tableau de bord</Button>
    </main>
  );
}
