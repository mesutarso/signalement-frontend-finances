export type AccountRole = "AGENT" | "SUPERVISOR" | "AUDITOR" | "ADMINISTRATOR";

export type Account = {
  id: string;
  username: string;
  role: AccountRole;
  enabled: boolean;
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
};

type AccountPagePayload = {
  accounts: AccountPayload[];
  page: number;
  size: number;
  total: number;
};

const ROLE_LABELS: Record<AccountRole, string> = {
  AGENT: "Agent",
  SUPERVISOR: "Superviseur",
  AUDITOR: "Auditeur",
  ADMINISTRATOR: "Administrateur",
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
