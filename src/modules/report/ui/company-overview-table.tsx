import Link from "next/link";
import { LedgerEmpty } from "@/components/ledger";
import { TablePagination } from "@/components/table-pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CompanyOverview, ListPage } from "@/modules/report/model/administration";

export function CompanyOverviewTable({ overview, source, query }: {
  overview: ListPage<CompanyOverview> | null;
  source?: "dossiers" | "contribuables";
  query?: string;
}) {
  if (!overview) return <Alert variant="destructive"><AlertTitle>Les entreprises sont indisponibles. Actualisez la page.</AlertTitle></Alert>;
  if (!overview.items.length) return <LedgerEmpty>Aucune entreprise sur cette page.</LedgerEmpty>;

  return (
    <div className="grid gap-4">
      <Table aria-label="Dossiers par entreprise">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead scope="col">Entreprise</TableHead>
            <TableHead scope="col">Total hors doublons</TableHead>
            <TableHead scope="col">Signalements validés</TableHead>
            <TableHead scope="col">Signalements rejetés</TableHead>
            <TableHead scope="col">Signalements à traiter</TableHead>
            <TableHead scope="col">Doublons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{overview.items.map(item => {
          const name = item.name ?? "Nom non renseigné";
          const href = source ? companyHref(item, source, overview.page, query) : null;
          return <TableRow key={item.taxId ? `nif:${item.taxId}` : `nom:${item.name}`} className={href ? "relative" : undefined}>
            <TableCell>
              {href ? <Link href={href} className="font-medium text-primary hover:underline after:absolute after:inset-0">{name}</Link>
                : <p className="font-medium">{name}</p>}
              <p className="text-xs text-muted-foreground">{item.taxId ?? "NIF non renseigné"}</p>
            </TableCell>
            <TableCell className="tabular-nums">{item.total}</TableCell>
            <TableCell className="tabular-nums">{item.validated}</TableCell>
            <TableCell className="tabular-nums">{item.rejected}</TableCell>
            <TableCell className="tabular-nums">{item.pending}</TableCell>
            <TableCell className="tabular-nums">{item.duplicates}</TableCell>
          </TableRow>;
        })}</TableBody>
      </Table>
      <TablePagination page={overview.page} size={overview.size} total={overview.total} label="Pagination des entreprises" />
    </div>
  );
}
function companyHref(company: CompanyOverview, source: "dossiers" | "contribuables", page: number, query?: string) {
  const params = new URLSearchParams({ origine: source });
  if (company.taxId) params.set("nif", company.taxId);
  else if (company.name) params.set("nom", company.name);
  else return null;
  if (page > 0) params.set("retourPage", String(page));
  if (query) params.set("retourRecherche", query);
  return `/dossiers/entreprise?${params}`;
}
