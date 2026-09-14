export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  transactionCount: number;
}

export interface MonthlyReportRow {
  month: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryReportRow {
  name: string;
  amount: number;
  percent: number;
  count: number;
}

export interface SourceReportRow {
  name: string;
  amount: number;
  percent: number;
  count: number;
}

export interface ReportData {
  year: number;
  month?: number;
  summary: ReportSummary;
  monthly: MonthlyReportRow[];
  expenseByCategory: CategoryReportRow[];
  incomeBySource: SourceReportRow[];
}
