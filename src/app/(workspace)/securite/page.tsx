import { AdminMenuPage } from "@/modules/access/ui/admin-menu-page";

export default function SecurityPage() {
  return <AdminMenuPage title="Sécurité" items={[
    { href: "/habilitations", label: "Rôles et permissions", description: "Consulter les droits associés à chaque rôle." },
    { href: "/journal", label: "Journal d’audit", description: "Consulter l’historique des actions." },
  ]} />;
}
