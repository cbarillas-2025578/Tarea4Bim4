export interface Income {
  id: number;
  amount: number;
  source: string;
  description: string;
  transactionDate: string;
  createdAt: string;
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

export const INCOME_SOURCES: string[] = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Alquileres",
  "Ventas",
  "Bonos",
  "Otros",
];
