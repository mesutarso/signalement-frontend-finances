import { AdminMenuPage } from "@/modules/access/ui/admin-menu-page";

export default function SettingsPage() {
  return <AdminMenuPage title="Paramètres" items={[
    { href: "/regles", label: "Règles", description: "Gérer les critères de validation et le budget des récompenses." },
    { href: "/messages", label: "SMS aux déclarants", description: "Gérer les modèles et suivre les envois." },
    { href: "/courriers", label: "Courriers aux services", description: "Préparer les courriers et suivre les réponses." },
  ]} />;
}
