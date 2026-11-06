import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/modules/access/ui/login-form";

export const metadata: Metadata = { title: "Connexion | Signalements" };

export default function LoginPage() {
  return (
    <main id="contenu" className="login-page">
      <section aria-label="Ministère des Finances" className="login-identity">
        <div className="login-ministry">
          <span>République démocratique du Congo</span>
          <strong>Ministère des Finances</strong>
        </div>
        <div className="login-brand">
          <span aria-hidden="true" className="login-emblem">
            <Image src="/logo-finances-light.webp" alt="" width={380} height={148} priority />
          </span>
          <h1>Plateforme de<br />signalements</h1>
        </div>
        <div className="login-identity-footer">
          <span>Espace professionnel</span>
          <span>Finances publiques</span>
        </div>
      </section>
      <section aria-labelledby="connexion-title" className="login-access">
        <div className="login-form-container">
          <div className="login-heading">
            <span className="login-section-label">Accès à la plateforme</span>
            <h2 id="connexion-title">Connexion</h2>
            <p>Identifiez-vous pour accéder à votre espace.</p>
          </div>
          <LoginForm />
          <p className="login-assistance">Un problème d’accès ?<br /><span>Contactez votre administrateur.</span></p>
        </div>
        <p className="login-access-footer">Ministère des Finances</p>
      </section>
    </main>
  );
}
