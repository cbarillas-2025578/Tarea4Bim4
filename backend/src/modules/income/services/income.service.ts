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
  async sum(): Promise<number> {
    const result = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM ingresos`
    );
    return Number(result.rows[0].total);
  }

  async create(data: CreateIncomeDTO): Promise<Income> {
    const result = await pool.query<IncomeRow>(
      `INSERT INTO ingresos (amount, source, description, transaction_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.amount, data.source, data.description || "", data.transactionDate]
    );
    return mapRowToIncome(result.rows[0]);
  }

  async findAll(filters: IncomeFilters): Promise<Income[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

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

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query<IncomeRow>(
      `SELECT * FROM ingresos ${whereClause} ORDER BY transaction_date DESC`,
      values
    );
    return result.rows.map(mapRowToIncome);
  }

  async findById(id: number): Promise<Income | null> {
    const result = await pool.query<IncomeRow>(
      `SELECT * FROM ingresos WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapRowToIncome(result.rows[0]) : null;
  }

  async update(id: number, data: UpdateIncomeDTO): Promise<Income | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const amount = data.amount ?? existing.amount;
    const source = data.source ?? existing.source;
    const description = data.description ?? existing.description;
    const transactionDate = data.transactionDate ?? existing.transactionDate;

    const result = await pool.query<IncomeRow>(
      `UPDATE ingresos
       SET amount = $1, source = $2, description = $3, transaction_date = $4
       WHERE id = $5
       RETURNING *`,
      [amount, source, description, transactionDate, id]
    );
    return mapRowToIncome(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM ingresos WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const incomeService = new IncomeService();
