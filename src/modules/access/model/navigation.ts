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
  alternatePermission?: string;
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
      { href: "/dossiers-valides", label: "Dossiers validés", icon: FolderOpenIcon, permission: "report.read", keywords: "signalements acceptés" },
      { href: "/imports", label: "Imports", icon: FileImportIcon, permission: "import.read", keywords: "suivi récupération" },
      { href: "/dossiers", label: "Établissements", icon: Building03Icon, permission: "dossier.read", keywords: "entreprises vendeurs constats numéro d'impôt" },
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
      { href: "/recompenses", label: "Récompenses", icon: Award01Icon, permission: "reward.read", alternatePermission: "payment.execute", keywords: "montants numéros de paiement" },
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

const REPORTS: NavItem = { href: "/signalements", label: "Signalements", icon: InboxIcon, permission: "report.read", keywords: "file de travail factures" };
const DOSSIERS: NavItem = { href: "/dossiers-valides", label: "Dossiers", icon: FolderOpenIcon, permission: "report.read", keywords: "signalements validés" };

const WORKSPACE_MENU: NavSection = {
  id: "activite",
  label: null,
  items: [
    REPORTS,
    DOSSIERS,
    { href: "/recompenses", label: "Récompenses", icon: Award01Icon, permission: "reward.read" },
    { href: "/paiements", label: "Paiements", icon: Invoice01Icon, permission: "payment.read" },
    { href: "/regime-exception", label: "Régime d’exception", icon: LegalDocument01Icon, keywords: "validation et paiement groupés" },
    { href: "/declarants", label: "Déclarants", icon: UserMultipleIcon, permission: "declarant.read" },
    { href: "/contribuables", label: "Contribuables", icon: Building03Icon, permission: "taxpayer.read" },
  ],
};

const ADMIN_MENU: NavSection = {
  id: "administration",
  label: "Administration",
  items: [
    { href: "/comptes", label: "Utilisateurs", icon: UserSettings01Icon, permission: "user.read" },
    { href: "/securite", label: "Sécurité", icon: SecurityCheckIcon, permission: "rbac.read" },
    { href: "/parametres", label: "Paramètres", icon: LegalDocument01Icon, permission: "setting.read" },
    { href: "/imports", label: "Suivi des signalements", icon: ChartLineData01Icon, permission: "import.read", keywords: "réception FACNO OCR" },
  ],
};

const ADMIN_CHILDREN: Record<string, { parent: string; label: string }> = {
  "/habilitations": { parent: "/securite", label: "Rôles et permissions" },
  "/journal": { parent: "/securite", label: "Journal d’audit" },
  "/regles": { parent: "/parametres", label: "Règles" },
  "/messages": { parent: "/parametres", label: "SMS aux déclarants" },
  "/courriers": { parent: "/parametres", label: "Courriers aux services" },
  "/etats": { parent: "/paiements", label: "États de paiement" },
  "/echantillons": { parent: "/paiements", label: "Échantillons" },
  "/tirages": { parent: "/recompenses", label: "Tirages" },
  "/dossiers": { parent: "/contribuables", label: "Établissements" },
  "/indicateurs": { parent: "/imports", label: "Indicateurs" },
  "/supervision": { parent: "/imports", label: "Supervision" },
  "/indices": { parent: "/imports", label: "Indices d’abus" },
};

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
  const sections = account.role === "ADMINISTRATOR" ? [WORKSPACE_MENU, ADMIN_MENU]
    : account.role === "AGENT" ? [{ ...WORKSPACE_MENU, items: [REPORTS, DOSSIERS] }]
    : SECTIONS;
  return sections.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(account, item.permission)
      || (item.alternatePermission && can(account, item.alternatePermission))),
  })).filter((section) => section.items.length > 0);
}

export function canReadReports(account: Account | null): boolean {
  return can(account, "report.read");
}

function matchesRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavActive(pathname: string, href: string, account?: Account | null): boolean {
  return matchesRoute(pathname, href) || (account?.role === "ADMINISTRATOR"
    && Object.entries(ADMIN_CHILDREN).some(([route, item]) => item.parent === href && matchesRoute(pathname, route)));
}

export type Breadcrumb = { section: string | null; page: string; href: string; detail: string | null };

export function breadcrumbFor(pathname: string, account: Account | null): Breadcrumb {
  const sections = [...navigationFor(account), ...SECTIONS];
  if (account?.role === "ADMINISTRATOR") {
    const child = Object.entries(ADMIN_CHILDREN).find(([route]) => matchesRoute(pathname, route))?.[1];
    const parent = [...WORKSPACE_MENU.items, ...ADMIN_MENU.items].find(item => item.href === child?.parent);
    if (child && parent) return { section: null, page: parent.label, href: parent.href, detail: child.label };
  }
  const all = [...sections.flatMap((section) => section.items.map((item) => ({ item, section }))), { item: ACCOUNT_ITEM, section: null }];
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
