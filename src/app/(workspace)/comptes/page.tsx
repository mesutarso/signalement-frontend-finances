import { ACCOUNT_ROLES, roleLabel, can } from "@/modules/access/model/account";
import { FilterBar } from "@/components/filter-bar";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
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
  if (!can(current, "user.read")) {
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
  const role = typeof params.role === "string" && ACCOUNT_ROLES.some(value => value === params.role) ? params.role : "";
  const enabled = params.enabled === "true" || params.enabled === "false" ? params.enabled : "";
  const page = await readAccounts(Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0, { search, role, enabled });
  if (page.page > 0 && page.accounts.length === 0) {
    const nextParams = new URLSearchParams({ search, role, enabled });
    redirect(`/comptes?${nextParams}`);
  }

  return (
    <Page>
      <PageHeader title="Utilisateurs" actions={can(current, "user.create") ? <CreateAccountDialog /> : undefined} />
      <div className="flex flex-col gap-8">
        <FilterBar
          key={JSON.stringify([search, role, enabled])}
          action="/comptes"
          label="Filtres des utilisateurs"
          clearHref={search || role || enabled ? "/comptes" : undefined}
          secondary={
            <Field className="min-w-0">
              <FieldLabel htmlFor="filter-role">Rôle</FieldLabel>
              <NativeSelect id="filter-role" name="role" defaultValue={role} className="w-full">
                <NativeSelectOption value="">Tous les rôles</NativeSelectOption>
                {ACCOUNT_ROLES.map((role) => <NativeSelectOption key={role} value={role}>{roleLabel(role)}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
          }
          advanced={{
            count: Number(Boolean(enabled)),
            fields: (
              <Field className="max-w-xs">
                <FieldLabel htmlFor="filter-enabled">État</FieldLabel>
                <NativeSelect id="filter-enabled" name="enabled" defaultValue={enabled} className="w-full">
                  <NativeSelectOption value="">Tous les états</NativeSelectOption>
                  <NativeSelectOption value="true">Actif</NativeSelectOption>
                  <NativeSelectOption value="false">Inactif</NativeSelectOption>
                </NativeSelect>
              </Field>
            ),
          }}
        >
          <Field className="min-w-0">
            <FieldLabel htmlFor="search">Recherche</FieldLabel>
            <Input id="search" name="search" type="search" defaultValue={search} maxLength={80} placeholder="Identifiant" />
          </Field>
        </FilterBar>
        <AccountsTable page={page} currentId={current.id} canManage={can(current, "user.update")} />
      </div>
    </Page>
  );
}
