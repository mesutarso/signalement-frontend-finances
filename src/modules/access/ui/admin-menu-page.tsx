import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Page, PageHeader, PageSkeleton } from "@/components/page";

type Item = { href: string; label: string; description: string };
type Props = { title: string; items: Item[] };

export function AdminMenuPage(props: Props) {
  return <Suspense fallback={<PageSkeleton />}><Content {...props} /></Suspense>;
}

async function Content({ title, items }: Props) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (account.role !== "ADMINISTRATOR") redirect("/signalements");

  return (
    <Page className="max-w-4xl">
      <PageHeader title={title} />
      <ul className="divide-y rounded-md border">
        {items.map(item => (
          <li key={item.href}>
            <Link href={item.href} className="block px-5 py-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
              <span className="font-bold text-primary">{item.label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
