export interface TotalMoney {
  amount: number;
  details?: readonly MoneyDetail[];
}

interface MoneyDetail {
  amount: number;
  item?: string;
}
