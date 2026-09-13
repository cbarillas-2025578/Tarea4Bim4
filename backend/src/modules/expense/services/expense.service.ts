import { pool } from "../../database/database";
import {
  CreateExpenseDTO,
  Expense,
  ExpenseFilters,
  ExpenseRow,
  UpdateExpenseDTO,
  mapRowToExpense,
} from "../models/expense.model";

export class ExpenseService {
  async sum(excludeId?: number): Promise<number> {
    const result = excludeId === undefined
      ? await pool.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses`
        )
      : await pool.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE id <> $1`,
          [excludeId]
        );
    return Number(result.rows[0].total);
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const result = await pool.query<ExpenseRow>(
      `INSERT INTO expenses (amount, category, transaction_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.amount, data.category, data.transactionDate]
    );
    return mapRowToExpense(result.rows[0]);
  }

  async findAll(filters: ExpenseFilters): Promise<Expense[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.category) {
      values.push(filters.category);
      conditions.push(`category = $${values.length}`);
    }
    if (filters.month) {
      values.push(filters.month);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${values.length}`);
    }
    if (filters.year) {
      values.push(filters.year);
      conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query<ExpenseRow>(
      `SELECT * FROM expenses ${whereClause} ORDER BY transaction_date DESC`,
      values
    );
    return result.rows.map(mapRowToExpense);
  }

  async findById(id: number): Promise<Expense | null> {
    const result = await pool.query<ExpenseRow>(
      `SELECT * FROM expenses WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapRowToExpense(result.rows[0]) : null;
  }

  async update(id: number, data: UpdateExpenseDTO): Promise<Expense | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const amount = data.amount ?? existing.amount;
    const category = data.category ?? existing.category;
    const transactionDate = data.transactionDate ?? existing.transactionDate;

    const result = await pool.query<ExpenseRow>(
      `UPDATE expenses
       SET amount = $1, category = $2, transaction_date = $3
       WHERE id = $4
       RETURNING *`,
      [amount, category, transactionDate, id]
    );
    return mapRowToExpense(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM expenses WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const expenseService = new ExpenseService();
