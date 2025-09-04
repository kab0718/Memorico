export interface Allowance {
  total: number;
  title: string;
  details?: readonly AllowanceDetail[];
}

export interface AllowanceDetail {
  amount: number;
  name?: string;
}
