import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { roleLabel } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { PasswordForm } from "@/modules/access/ui/password-form";

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AccountContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function AccountContent() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-bold text-primary">Mon compte</h1>
      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-bold text-muted-foreground">Identifiant</dt>
              <dd>{account.username}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-bold text-muted-foreground">Rôle</dt>
              <dd>{roleLabel(account.role)}</dd>
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
    </section>
  );
}
