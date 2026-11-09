import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { readAccounts } from "@/modules/access/queries/read-accounts";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { AccountsTable } from "@/modules/access/ui/accounts-table";
import { CreateAccountDialog } from "@/modules/access/ui/create-account-dialog";
import { Page, PageHeader, PageSkeleton } from "@/components/page";

export default function AccountsPage({ searchParams }: PageProps<"/comptes">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountsContent({ searchParams }: Pick<PageProps<"/comptes">, "searchParams">) {
  const current = await readCurrentAccount();
  if (!current) {
    redirect("/connexion");
  }
  if (current.role !== "ADMINISTRATOR") {
    return (
      <section className="max-w-3xl">
        <Alert variant="destructive">
          <AlertTitle>Cette action n&apos;est pas autorisée.</AlertTitle>
        </Alert>
      </section>
    );
  }

  const params = await searchParams;
  const requestedPage = Number(params.page ?? 0);
  const search = typeof params.search === "string" ? params.search.slice(0, 80) : "";
  const role = typeof params.role === "string" && ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"].includes(params.role) ? params.role : "";
  const enabled = params.enabled === "true" || params.enabled === "false" ? params.enabled : "";
  const page = await readAccounts(Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0, { search, role, enabled });
  if (page.page > 0 && page.accounts.length === 0) {
    const nextParams = new URLSearchParams({ search, role, enabled });
    redirect(`/comptes?${nextParams}`);
  }

  return (
    <Page>
      <PageHeader title="Comptes" actions={<CreateAccountDialog />} />
      <div className="flex flex-col gap-8">
        <form action="/comptes" method="get" key={`${search}-${role}-${enabled}`}>
          <FieldGroup className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
            <Field><FieldLabel htmlFor="search">Rechercher un compte</FieldLabel><Input id="search" name="search" defaultValue={search} maxLength={80} placeholder="Identifiant" className="h-10" /></Field>
            <Field><FieldLabel htmlFor="filter-role">Rôle</FieldLabel><NativeSelect id="filter-role" name="role" size="sm" defaultValue={role} className="w-full"><NativeSelectOption value="">Tous les rôles</NativeSelectOption><NativeSelectOption value="AGENT">Agent</NativeSelectOption><NativeSelectOption value="SUPERVISOR">Superviseur</NativeSelectOption><NativeSelectOption value="AUDITOR">Auditeur</NativeSelectOption><NativeSelectOption value="ADMINISTRATOR">Administrateur</NativeSelectOption><NativeSelectOption value="CELLULE">Cellule fiscale</NativeSelectOption><NativeSelectOption value="CABINET">Cabinet</NativeSelectOption><NativeSelectOption value="PAYMASTER">Gestionnaire de paiement</NativeSelectOption></NativeSelect></Field>
            <Field><FieldLabel htmlFor="filter-enabled">État</FieldLabel><NativeSelect id="filter-enabled" name="enabled" size="sm" defaultValue={enabled} className="w-full"><NativeSelectOption value="">Tous les états</NativeSelectOption><NativeSelectOption value="true">Actif</NativeSelectOption><NativeSelectOption value="false">Inactif</NativeSelectOption></NativeSelect></Field>
            <div className="flex gap-2"><Button type="submit" variant="outline">Filtrer</Button>{search || role || enabled ? <Button variant="ghost" nativeButton={false} render={<Link href="/comptes" />}>Effacer</Button> : null}</div>
          </FieldGroup>
        </form>
        <AccountsTable page={page} />
      </div>
    </Page>
  );
}
