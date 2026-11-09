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
  StarIcon,
  Target02Icon,
  Ticket01Icon,
  UserAccountIcon,
  UserMultipleIcon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import type { Account, AccountRole } from "@/modules/access/model/account";

type Icon = typeof InboxIcon;

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  roles?: AccountRole[];
  keywords?: string;
};

export type NavSection = {
  id: string;
  label: string | null;
  items: NavItem[];
};

const READERS: AccountRole[] = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const OVERSIGHT: AccountRole[] = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

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
      { href: "/signalements", label: "Signalements", icon: InboxIcon, roles: READERS, keywords: "file de travail factures" },
      { href: "/imports", label: "Imports", icon: FileImportIcon, roles: ["AGENT", "SUPERVISOR", "ADMINISTRATOR"], keywords: "suivi récupération" },
      { href: "/dossiers", label: "Dossiers", icon: FolderOpenIcon, roles: READERS, keywords: "vendeurs constats numéro d'impôt" },
      { href: "/corrections", label: "Corrections", icon: PencilEdit02Icon, roles: READERS },
      { href: "/reexamens", label: "Réexamens", icon: RepeatIcon, roles: READERS, keywords: "contestation demande" },
      { href: "/messages", label: "Messages", icon: Message01Icon, roles: READERS, keywords: "déclarant modèles" },
      { href: "/courriers", label: "Courriers", icon: Mail01Icon, roles: OVERSIGHT, keywords: "dgi lettre semaine annexes" },
    ],
  },
  {
    id: "contribuables",
    label: "Contribuables",
    items: [
      { href: "/contribuables", label: "Contribuables", icon: Building03Icon, roles: READERS, keywords: "nif numéro d'impôt vendeurs" },
      { href: "/declarants", label: "Déclarants", icon: UserMultipleIcon, roles: READERS, keywords: "situation référence" },
    ],
  },
  {
    id: "recompenses",
    label: "Récompenses",
    items: [
      { href: "/points", label: "Points", icon: StarIcon, roles: READERS, keywords: "crédit annulation" },
      { href: "/primes", label: "Primes", icon: Award01Icon, roles: READERS, keywords: "paliers numéros de paiement" },
      { href: "/etats", label: "États de paiement", icon: Invoice01Icon, roles: ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"], keywords: "visa autorisation mobile money" },
      { href: "/echantillons", label: "Échantillons", icon: Target02Icon, roles: OVERSIGHT, keywords: "contrôle primes payées" },
      { href: "/tirages", label: "Tirages", icon: Ticket01Icon, roles: READERS, keywords: "tickets lots tombola" },
    ],
  },
  {
    id: "controle",
    label: "Contrôle",
    items: [
      { href: "/indicateurs", label: "Indicateurs", icon: ChartLineData01Icon, roles: READERS, keywords: "statistiques rapport semaine mois" },
      { href: "/supervision", label: "Contrôle", icon: SecurityCheckIcon, roles: OVERSIGHT, keywords: "supervision revoir décisions" },
      { href: "/indices", label: "Indices", icon: SearchList01Icon, roles: OVERSIGHT, keywords: "abus fraude suspension" },
      { href: "/regles", label: "Règles", icon: LegalDocument01Icon, roles: OVERSIGHT, keywords: "barème version paliers" },
      { href: "/journal", label: "Journal", icon: BookOpen01Icon, roles: OVERSIGHT, keywords: "audit actions historique" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [{ href: "/comptes", label: "Comptes", icon: UserSettings01Icon, roles: ["ADMINISTRATOR"], keywords: "utilisateurs rôles" }],
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
    items: section.items.filter((item) => !item.roles || item.roles.includes(account.role)),
  })).filter((section) => section.items.length > 0);
}

export function canReadReports(account: Account | null): boolean {
  return account != null && READERS.includes(account.role);
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
