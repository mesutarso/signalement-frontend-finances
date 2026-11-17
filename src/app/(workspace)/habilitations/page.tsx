import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { readJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

type Catalogue = { roles: { code: string; label: string; description: string; permissions: string[] }[]; permissions: { code: string; group: string; label: string }[] };

export default function PermissionsPage() { return <Suspense fallback={<PageSkeleton />}><Permissions /></Suspense>; }

async function Permissions() {
  const current = await readCurrentAccount();
  if (!current) redirect("/connexion");
  if (!can(current, "rbac.read")) redirect("/");
  const catalogue = await readJson<Catalogue>("/api/access/roles");
  const groups = [...new Set(catalogue.permissions.map(p => p.group))];
  return <Page>
    <PageHeader title="Rôles et permissions" description="Les permissions sont héritées du rôle attribué à chaque utilisateur. L’administrateur dispose de tous les droits." />
    <p className="max-w-[75ch] text-sm leading-6">Le contrôle, le visa et l’autorisation d’un même état de paiement doivent être effectués par des personnes distinctes, y compris lorsqu’elles sont administrateurs.</p>
    {catalogue.roles.map(role => <PageSection key={role.code} title={role.label} description={role.description}>
      <Badge variant="outline">{role.permissions.length} permissions</Badge>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map(group => {
        const permissions = catalogue.permissions.filter(p => p.group === group && role.permissions.includes(p.code));
        return permissions.length ? <div key={group}><h3 className="mb-2 text-sm font-medium">{group}</h3><ul className="grid gap-1 text-sm text-muted-foreground">{permissions.map(p => <li key={p.code}>{p.label}</li>)}</ul></div> : null;
      })}</div>
    </PageSection>)}
  </Page>;
}
