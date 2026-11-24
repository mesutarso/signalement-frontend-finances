import { LedgerEmpty } from "@/components/ledger";
import { TablePagination } from "@/components/table-pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CompanyOverview, ListPage } from "@/modules/report/model/administration";

export function CompanyOverviewTable({ overview }: { overview: ListPage<CompanyOverview> | null }) {
  if (!overview) return <Alert variant="destructive"><AlertTitle>Les entreprises sont indisponibles. Actualisez la page.</AlertTitle></Alert>;
  if (!overview.items.length) return <LedgerEmpty>Aucune entreprise sur cette page.</LedgerEmpty>;

  return (
    <div className="grid gap-4">
      <Table aria-label="Dossiers par entreprise">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead scope="col">Entreprise</TableHead>
            <TableHead scope="col">Registre fiscal</TableHead>
            <TableHead scope="col">Dossiers hors doublons</TableHead>
            <TableHead scope="col">Avec manquement</TableHead>
            <TableHead scope="col">Sans manquement retenu</TableHead>
            <TableHead scope="col">À examiner</TableHead>
            <TableHead scope="col">Doublons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{overview.items.map(item => (
          <TableRow key={item.taxId ? `nif:${item.taxId}` : `nom:${item.name}`}>
            <TableCell>
              <p className="font-medium">{item.name ?? "Nom non renseigné"}</p>
              <p className="text-xs text-muted-foreground">{item.taxId ?? "NIF non renseigné"}</p>
            </TableCell>
            <TableCell>
              {item.registryVerified == null ? <span className="text-muted-foreground">{item.taxId ? "Non inscrite" : "Non rapprochée"}</span> : (
                <Badge variant={item.registryVerified ? "success" : "secondary"}>{item.registryVerified ? "Vérifiée" : "Reprise"}</Badge>
              )}
            </TableCell>
            <TableCell className="tabular-nums">{item.total}</TableCell>
            <TableCell className="tabular-nums">{item.validated}</TableCell>
            <TableCell className="tabular-nums">{item.rejected}</TableCell>
            <TableCell className="tabular-nums">{item.pending}</TableCell>
            <TableCell className="tabular-nums">{item.duplicates}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <TablePagination page={overview.page} size={overview.size} total={overview.total} label="Pagination des entreprises" />
    </div>
  );
}
