import { pool } from "../../database/database";
import {
  CreateIncomeDTO,
  Income,
  IncomeFilters,
  IncomeRow,
  UpdateIncomeDTO,
  mapRowToIncome,
} from "../models/income.model";

export class IncomeService {
  async sum(userId?: number): Promise<number> {
    const result = userId === undefined
      ? await pool.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM ingresos`
        )
      : await pool.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM ingresos WHERE user_id = $1`,
          [userId]
        );
    return Number(result.rows[0].total);
  }

  async create(data: CreateIncomeDTO, userId: number): Promise<Income> {
    const result = await pool.query<IncomeRow>(
      `INSERT INTO ingresos (amount, source, description, transaction_date, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.amount, data.source, data.description || "", data.transactionDate, userId]
    );
    return mapRowToIncome(result.rows[0]);
  }

  async findAll(filters: IncomeFilters, userId: number): Promise<Income[]> {
    const conditions: string[] = [`user_id = $1`];
    const values: unknown[] = [userId];

    if (filters.source) {
      values.push(filters.source);
      conditions.push(`source = $${values.length}`);
    }
    if (filters.month) {
      values.push(filters.month);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${values.length}`);
    }
    if (filters.year) {
      values.push(filters.year);
      conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const result = await pool.query<IncomeRow>(
      `SELECT * FROM ingresos ${whereClause} ORDER BY transaction_date DESC`,
      values
    );
    return result.rows.map(mapRowToIncome);
  }

  async findById(id: number, userId: number): Promise<Income | null> {
    const result = await pool.query<IncomeRow>(
      `SELECT * FROM ingresos WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] ? mapRowToIncome(result.rows[0]) : null;
  }

  async update(id: number, data: UpdateIncomeDTO, userId: number): Promise<Income | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const amount = data.amount ?? existing.amount;
    const source = data.source ?? existing.source;
    const description = data.description ?? existing.description;
    const transactionDate = data.transactionDate ?? existing.transactionDate;

    const result = await pool.query<IncomeRow>(
      `UPDATE ingresos
       SET amount = $1, source = $2, description = $3, transaction_date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [amount, source, description, transactionDate, id, userId]
    );
    return mapRowToIncome(result.rows[0]);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM ingresos WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const incomeService = new IncomeService();
