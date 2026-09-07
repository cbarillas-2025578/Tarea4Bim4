import { pool } from "../../database/database";
import {
  CategoryReportRow,
  MonthlyReportRow,
  ReportData,
  ReportSummary,
  SourceReportRow,
} from "../models/report.model";

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export class ReportService {
  async getReport(year: number, month?: number): Promise<ReportData> {
    const [summary, monthly, expenseByCategory, incomeBySource] = await Promise.all([
      this.getSummary(year, month),
      this.getMonthly(year, month),
      this.getExpenseByCategory(year, month),
      this.getIncomeBySource(year, month),
    ]);

    return { year, month, summary, monthly, expenseByCategory, incomeBySource };
  }

  private async getSummary(year: number, month?: number): Promise<ReportSummary> {
    const conditions = ["EXTRACT(YEAR FROM transaction_date) = $1"];
    const values: unknown[] = [year];
    if (month) {
      values.push(month);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $2`);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const [incomeResult, expenseResult] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM ingresos ${where}`, values),
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM expenses ${where}`, values),
    ]);

    const totalIncome = Number(incomeResult.rows[0].total);
    const totalExpenses = Number(expenseResult.rows[0].total);
    const incomeCount = Number(incomeResult.rows[0].count);
    const expenseCount = Number(expenseResult.rows[0].count);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeCount,
      expenseCount,
      transactionCount: incomeCount + expenseCount,
    };
  }

  private async getMonthly(year: number, month?: number): Promise<MonthlyReportRow[]> {
    const rows: MonthlyReportRow[] = MONTH_LABELS.map((label, i) => ({
      month: i + 1,
      label,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    if (month) {
      const single = rows[month - 1];
      const [inc, exp] = await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM ingresos
           WHERE EXTRACT(YEAR FROM transaction_date) = $1 AND EXTRACT(MONTH FROM transaction_date) = $2`,
          [year, month]
        ),
        pool.query(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
           WHERE EXTRACT(YEAR FROM transaction_date) = $1 AND EXTRACT(MONTH FROM transaction_date) = $2`,
          [year, month]
        ),
      ]);
      single.income = Number(inc.rows[0].total);
      single.expense = Number(exp.rows[0].total);
      single.balance = single.income - single.expense;
      return rows;
    }

    const [incResult, expResult] = await Promise.all([
      pool.query(
        `SELECT EXTRACT(MONTH FROM transaction_date)::int AS month, COALESCE(SUM(amount), 0) AS total
         FROM ingresos WHERE EXTRACT(YEAR FROM transaction_date) = $1 GROUP BY month`,
        [year]
      ),
      pool.query(
        `SELECT EXTRACT(MONTH FROM transaction_date)::int AS month, COALESCE(SUM(amount), 0) AS total
         FROM expenses WHERE EXTRACT(YEAR FROM transaction_date) = $1 GROUP BY month`,
        [year]
      ),
    ]);

    incResult.rows.forEach((r) => {
      const idx = Number(r.month) - 1;
      if (rows[idx]) rows[idx].income = Number(r.total);
    });
    expResult.rows.forEach((r) => {
      const idx = Number(r.month) - 1;
      if (rows[idx]) rows[idx].expense = Number(r.total);
    });

    rows.forEach((r) => {
      r.balance = r.income - r.expense;
    });

    return rows;
  }

  private async getExpenseByCategory(year: number, month?: number): Promise<CategoryReportRow[]> {
    const conditions = ["EXTRACT(YEAR FROM transaction_date) = $1"];
    const values: unknown[] = [year];
    if (month) {
      values.push(month);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $2`);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await pool.query(
      `SELECT category AS name, COALESCE(SUM(amount), 0) AS amount, COUNT(*) AS count
       FROM expenses ${where} GROUP BY category ORDER BY amount DESC`,
      values
    );

    const total = result.rows.reduce((s: number, r: any) => s + Number(r.amount), 0);
    return result.rows.map((r: any) => ({
      name: r.name,
      amount: Number(r.amount),
      count: Number(r.count),
      percent: total > 0 ? Math.round((Number(r.amount) / total) * 100) : 0,
    }));
  }

  private async getIncomeBySource(year: number, month?: number): Promise<SourceReportRow[]> {
    const conditions = ["EXTRACT(YEAR FROM transaction_date) = $1"];
    const values: unknown[] = [year];
    if (month) {
      values.push(month);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $2`);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await pool.query(
      `SELECT source AS name, COALESCE(SUM(amount), 0) AS amount, COUNT(*) AS count
       FROM ingresos ${where} GROUP BY source ORDER BY amount DESC`,
      values
    );

    const total = result.rows.reduce((s: number, r: any) => s + Number(r.amount), 0);
    return result.rows.map((r: any) => ({
      name: r.name,
      amount: Number(r.amount),
      count: Number(r.count),
      percent: total > 0 ? Math.round((Number(r.amount) / total) * 100) : 0,
    }));
  }
}

export const reportService = new ReportService();
