import {
  Award01Icon,
  BookOpen01Icon,
  Building03Icon,
  ChartLineData01Icon,
  DashboardSquare01Icon,
  FileImportIcon,
  FolderOpenIcon,
  InboxIcon,
  Invoice01Icon,
  LegalDocument01Icon,
  Mail01Icon,
  Message01Icon,
  PencilEdit02Icon,
  RepeatIcon,
  SearchList01Icon,
  SecurityCheckIcon,
  Target02Icon,
  Ticket01Icon,
  UserAccountIcon,
  UserMultipleIcon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import { can, type Account } from "@/modules/access/model/account";

type Icon = typeof InboxIcon;

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  permission?: string;
  keywords?: string;
};

export type NavSection = {
  id: string;
  label: string | null;
  items: NavItem[];
};


const SECTIONS: NavSection[] = [
  {
    id: "accueil",
    label: null,
    items: [{ href: "/", label: "Tableau de bord", icon: DashboardSquare01Icon, keywords: "accueil" }],
  },
  {
    id: "instruction",
    label: "Instruction",
    items: [
      { href: "/signalements", label: "Signalements", icon: InboxIcon, permission: "report.read", keywords: "file de travail factures" },
      { href: "/imports", label: "Imports", icon: FileImportIcon, permission: "import.read", keywords: "suivi récupération" },
      { href: "/dossiers", label: "Dossiers", icon: FolderOpenIcon, permission: "dossier.read", keywords: "vendeurs constats numéro d'impôt" },
      { href: "/corrections", label: "Corrections", icon: PencilEdit02Icon, permission: "correction.read" },
      { href: "/reexamens", label: "Réexamens", icon: RepeatIcon, permission: "reexam.read", keywords: "contestation demande" },
      { href: "/messages", label: "Messages", icon: Message01Icon, permission: "message.read", keywords: "déclarant modèles" },
      { href: "/courriers", label: "Courriers", icon: Mail01Icon, permission: "letter.read", keywords: "dgi lettre semaine annexes" },
    ],
  },
  {
    id: "contribuables",
    label: "Contribuables",
    items: [
      { href: "/contribuables", label: "Contribuables", icon: Building03Icon, permission: "taxpayer.read", keywords: "nif numéro d'impôt vendeurs" },
      { href: "/declarants", label: "Déclarants", icon: UserMultipleIcon, permission: "declarant.read", keywords: "situation référence" },
    ],
  },
  {
    id: "recompenses",
    label: "Récompenses",
    items: [
      { href: "/recompenses", label: "Récompenses", icon: Award01Icon, permission: "reward.read", keywords: "montants numéros de paiement" },
      { href: "/etats", label: "États de paiement", icon: Invoice01Icon, permission: "payment.read", keywords: "visa autorisation mobile money" },
      { href: "/echantillons", label: "Échantillons", icon: Target02Icon, permission: "sample.read", keywords: "contrôle récompenses payées" },
      { href: "/tirages", label: "Tirages", icon: Ticket01Icon, permission: "draw.read", keywords: "tickets lots tombola" },
    ],
  },
  {
    id: "controle",
    label: "Contrôle",
    items: [
      { href: "/indicateurs", label: "Indicateurs", icon: ChartLineData01Icon, permission: "indicator.read", keywords: "statistiques rapport semaine mois" },
      { href: "/supervision", label: "Contrôle", icon: SecurityCheckIcon, permission: "supervision.read", keywords: "supervision revoir décisions" },
      { href: "/indices", label: "Indices", icon: SearchList01Icon, permission: "abuse.read", keywords: "abus fraude suspension" },
      { href: "/regles", label: "Règles", icon: LegalDocument01Icon, permission: "setting.read", keywords: "critères montant récompense" },
      { href: "/journal", label: "Journal", icon: BookOpen01Icon, permission: "audit.read", keywords: "audit actions" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [{ href: "/comptes", label: "Utilisateurs", icon: UserSettings01Icon, permission: "user.read", keywords: "utilisateurs rôles" }, { href: "/habilitations", label: "Rôles et permissions", icon: SecurityCheckIcon, permission: "rbac.read", keywords: "rbac droits accès" }],
  },
];

export const ACCOUNT_ITEM: NavItem = { href: "/compte", label: "Mon compte", icon: UserAccountIcon, keywords: "mot de passe profil" };

const DETAIL_LABELS: Record<string, string> = {
  "/signalements": "Fiche du signalement",
  "/courriers": "Courrier",
  "/etats": "État de paiement",
  "/echantillons": "Échantillon",
};

export function navigationFor(account: Account | null): NavSection[] {
  if (!account) {
    return [];
  }
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(account, item.permission))
      .map(item => account.role === "AGENT" && item.href === "/signalements" ? { ...item, label: "À vérifier" } : item),
  })).filter((section) => section.items.length > 0);
}

export function canReadReports(account: Account | null): boolean {
  return can(account, "report.read");
}

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export type Breadcrumb = { section: string | null; page: string; href: string; detail: string | null };

export function breadcrumbFor(pathname: string): Breadcrumb {
  const all = [...SECTIONS.flatMap((section) => section.items.map((item) => ({ item, section }))), { item: ACCOUNT_ITEM, section: null }];
  const match = all.find(({ item }) => isNavActive(pathname, item.href));
  if (!match) {
    return { section: null, page: "Page introuvable", href: pathname, detail: null };
  }
  const nested = pathname !== match.item.href;
  return {
    section: match.section?.label ?? null,
    page: match.item.label,
    href: match.item.href,
    detail: nested ? DETAIL_LABELS[match.item.href] ?? null : null,
  };
}
