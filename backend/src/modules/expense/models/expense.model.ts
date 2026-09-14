export interface Expense {
  id: number;
  amount: number;
  category: string;
  transactionDate: string; // ISO date-time string
  createdAt: string;
}

// Forma cruda de la fila tal como la devuelve PostgreSQL (snake_case)
export interface ExpenseRow {
  id: number;
  amount: string;
  category: string;
  transaction_date: Date;
  created_at: Date;
}

export function mapRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    transactionDate: row.transaction_date.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

export interface CreateExpenseDTO {
  amount: number;
  category: string;
  transactionDate: string;
}

export interface UpdateExpenseDTO {
  amount?: number;
  category?: string;
  transactionDate?: string;
}

export interface ExpenseFilters {
  month?: number; // 1-12
  year?: number;
  category?: string;
}
