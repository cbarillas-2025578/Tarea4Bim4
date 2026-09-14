export interface Expense {
  id: number;
  amount: number;
  category: string;
  transactionDate: string;
  createdAt: string;
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
  month?: number;
  year?: number;
  category?: string;
}

// Categorías fijas del alcance del proyecto (se puede ampliar más adelante)
export const EXPENSE_CATEGORIES: string[] = [
  "Alimentación",
  "Transporte",
  "Servicios",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Otros",
];
