export const ACCOUNT_ROLES = ["AGENT", "SUPERVISOR", "DGI", "DGI_OPERATIONS", "CELLULE", "CABINET", "PAYMASTER", "AUDITOR", "ADMINISTRATOR"] as const;
export type AccountRole = typeof ACCOUNT_ROLES[number];

export type Account = {
  id: string;
  username: string;
  role: AccountRole;
  enabled: boolean;
  permissions: string[];
  lockedUntil: string | null;
  createdAt: string | null;
};

export type AccountPage = {
  accounts: Account[];
  page: number;
  size: number;
  total: number;
};

type AccountPayload = {
  id: string;
  username: string;
  role: AccountRole;
  enabled: boolean;
  permissions: string[];
  lockedUntil: string | null;
  createdAt: string | null;
};

type AccountPagePayload = {
  accounts: AccountPayload[];
  page: number;
  size: number;
  total: number;
};

const ROLE_LABELS: Record<AccountRole, string> = {
  "AGENT": "Agent de traitement",
  "SUPERVISOR": "Superviseur",
  "DGI": "DGI",
  "DGI_OPERATIONS": "Services opérationnels DGI",
  "CELLULE": "Cellule fiscale",
  "CABINET": "Cabinet du Ministre",
  "PAYMASTER": "Gestionnaire des fonds",
  "AUDITOR": "Auditeur",
  "ADMINISTRATOR": "Administrateur"
};

export function roleLabel(role: AccountRole): string {
  return ROLE_LABELS[role];
}

export function toAccount(payload: AccountPayload): Account {
  return {
    id: payload.id,
    username: payload.username,
    role: payload.role,
    enabled: payload.enabled,
    permissions: payload.permissions ?? [],
    lockedUntil: payload.lockedUntil ?? null,
    createdAt: payload.createdAt ?? null,
  };
}

export function toAccountPage(payload: AccountPagePayload): AccountPage {
  return {
    accounts: payload.accounts.map(toAccount),
    page: payload.page,
    size: payload.size,
    total: payload.total,
  };
}

export function can(account: Account | null, permission: string): boolean {
  return account != null && (account.role === "ADMINISTRATOR" || account.permissions.includes(permission));
}
