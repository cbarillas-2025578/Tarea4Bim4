export interface Income {
  id: number;
  amount: number;
  source: string;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface IncomeRow {
  id: number;
  amount: string;
  source: string;
  description: string;
  transaction_date: Date;
  created_at: Date;
}

export function mapRowToIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    amount: Number(row.amount),
    source: row.source,
    description: row.description || "",
    transactionDate: row.transaction_date.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

export interface CreateIncomeDTO {
  amount: number;
  source: string;
  description?: string;
  transactionDate: string;
}

export interface UpdateIncomeDTO {
  amount?: number;
  source?: string;
  description?: string;
  transactionDate?: string;
}

export interface IncomeFilters {
  month?: number;
  year?: number;
  source?: string;
}
