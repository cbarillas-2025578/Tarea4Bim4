// frontend/src/app/models/expense.model.ts
export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: Date | string;
  type: TransactionType;
  user_id?: number;
  notes?: string;
  attachment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Income extends Expense {
  type: 'income';
  source: string;
}

export interface ExpenseItem extends Expense {
  type: 'expense';
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  formattedDate?: string;
  formattedAmount?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categoryTotals: {
    [key: string]: number;
  };
  monthlyAverage: number;
  highestExpense: Expense | null;
  lowestExpense: Expense | null;
  transactionCount: number;
}

export interface ExpenseFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  categories?: string[];
  types?: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  sortBy?: 'date' | 'amount' | 'category';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ExpenseChartData {
  labels: string[];
  datasets: {
    data: number[];
    label: string;
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export enum ExpenseCategory {
  // Gastos
  TRANSPORTE = 'Transporte',
  ALIMENTACION = 'Alimentación',
  EDUCACION = 'Educación',
  VIVIENDA = 'Vivienda',
  SERVICIOS = 'Servicios',
  SALUD = 'Salud',
  ENTRETENIMIENTO = 'Entretenimiento',
  COMPRAS = 'Compras',
  OTROS = 'Otros',
  
  // Ingresos
  SALARIO = 'Salario',
  FREELANCE = 'Freelance',
  INVERSIONES = 'Inversiones',
  REGALOS = 'Regalos',
  BONOS = 'Bonos',
  OTROS_INGRESOS = 'Otros Ingresos'
}

export const CategoryIcons: Record<ExpenseCategory, string> = {
  [ExpenseCategory.TRANSPORTE]: '🚗',
  [ExpenseCategory.ALIMENTACION]: '🍽️',
  [ExpenseCategory.EDUCACION]: '📚',
  [ExpenseCategory.VIVIENDA]: '🏠',
  [ExpenseCategory.SERVICIOS]: '💡',
  [ExpenseCategory.SALUD]: '🏥',
  [ExpenseCategory.ENTRETENIMIENTO]: '🎮',
  [ExpenseCategory.COMPRAS]: '🛍️',
  [ExpenseCategory.OTROS]: '📦',
  [ExpenseCategory.SALARIO]: '💰',
  [ExpenseCategory.FREELANCE]: '💻',
  [ExpenseCategory.INVERSIONES]: '📈',
  [ExpenseCategory.REGALOS]: '🎁',
  [ExpenseCategory.BONOS]: '🏆',
  [ExpenseCategory.OTROS_INGRESOS]: '💵'
};

export const CategoryColors: Record<ExpenseCategory, string> = {
  [ExpenseCategory.TRANSPORTE]: '#F59E0B',
  [ExpenseCategory.ALIMENTACION]: '#10B981',
  [ExpenseCategory.EDUCACION]: '#8B5CF6',
  [ExpenseCategory.VIVIENDA]: '#3B82F6',
  [ExpenseCategory.SERVICIOS]: '#EC4899',
  [ExpenseCategory.SALUD]: '#EF4444',
  [ExpenseCategory.ENTRETENIMIENTO]: '#F472B6',
  [ExpenseCategory.COMPRAS]: '#F97316',
  [ExpenseCategory.OTROS]: '#6B7280',
  [ExpenseCategory.SALARIO]: '#10B981',
  [ExpenseCategory.FREELANCE]: '#3B82F6',
  [ExpenseCategory.INVERSIONES]: '#8B5CF6',
  [ExpenseCategory.REGALOS]: '#F59E0B',
  [ExpenseCategory.BONOS]: '#EC4899',
  [ExpenseCategory.OTROS_INGRESOS]: '#6B7280'
};