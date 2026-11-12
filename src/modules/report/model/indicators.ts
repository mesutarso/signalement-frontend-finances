export type Figures = {
  from: string | null;
  to: string | null;
  received: number;
  treated: number;
  findings: number;
  transmissions: number;
  responses: number;
  rewards: number;
  paidAmount: number;
  payments: number;
  draws: number;
  alerts: number;
};

export type Indicators = {
  from: string | null;
  to: string | null;
  finding: string | null;
  figures: Figures;
  week: Figures;
  month: Figures;
  asOf: string;
};
