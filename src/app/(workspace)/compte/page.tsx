import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roleLabel } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { PasswordForm } from "@/modules/access/ui/password-form";
import { Page, PageHeader, PageSkeleton } from "@/components/page";

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader title="Mon compte" />
      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <dt className="text-[13px] text-muted-foreground">Identifiant</dt>
              <dd className="text-[15px]">{account.username}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-[13px] text-muted-foreground">Rôle</dt>
              <dd className="text-[15px]">{roleLabel(account.role)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm accountId={account.id} />
        </CardContent>
      </Card>
    </Page>
  );
}
