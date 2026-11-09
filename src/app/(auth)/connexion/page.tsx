import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/modules/access/ui/login-form";

export const metadata: Metadata = { title: "Connexion | Signalements" };

export default function LoginPage() {
  return (
    <main id="contenu" className="login">
      <section aria-label="Ministère des Finances" className="login-aside">
        <span aria-hidden="true" className="guilloche" />
        <p className="login-state">
          <span>République démocratique du Congo</span>
          <span>Ministère des Finances</span>
        </p>
        <p className="login-title">Plateforme de signalements</p>
      </section>
      <section aria-labelledby="connexion-title" className="login-sheet">
        <Image src="/logo-finances.webp" alt="Ministère des Finances" width={384} height={143} priority className="h-14 w-auto self-start max-[899px]:hidden" />
        <div className="login-form">
          <h1 id="connexion-title" className="text-[2.25rem] leading-tight font-medium tracking-[-0.02em]">Connexion</h1>
          <p className="mt-2 mb-8 text-[15px] leading-6 text-muted-foreground">Espace réservé aux agents habilités.</p>
          <LoginForm />
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">Un problème d’accès ? Contactez votre administrateur.</p>
      </section>
    </main>
  );
}
