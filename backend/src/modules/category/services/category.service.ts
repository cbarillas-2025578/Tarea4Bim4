import { pool } from "../../database/database";
import {
  Category,
  CategoryRow,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  mapRowToCategory,
} from "../models/category.model";

export class CategoryService {
  async create(data: CreateCategoryDTO, userId: number): Promise<Category> {
    const result = await pool.query<CategoryRow>(
      `INSERT INTO categorias (name, type, color, icon, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.type, data.color || "#38BDF8", data.icon || "📁", userId]
    );
    return mapRowToCategory(result.rows[0]);
  }

  async findAll(type: string | undefined, userId: number): Promise<Category[]> {
    let whereClause = "WHERE user_id = $1";
    const values: unknown[] = [userId];
    if (type) {
      values.push(type);
      whereClause += ` AND type = $${values.length}`;
    }
    const result = await pool.query<CategoryRow>(
      `SELECT * FROM categorias ${whereClause} ORDER BY name ASC`,
      values
    );
    return result.rows.map(mapRowToCategory);
  }

  async findById(id: number, userId: number): Promise<Category | null> {
    const result = await pool.query<CategoryRow>(
      `SELECT * FROM categorias WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] ? mapRowToCategory(result.rows[0]) : null;
  }

  async update(id: number, data: UpdateCategoryDTO, userId: number): Promise<Category | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const name = data.name ?? existing.name;
    const type = data.type ?? existing.type;
    const color = data.color ?? existing.color;
    const icon = data.icon ?? existing.icon;

    const result = await pool.query<CategoryRow>(
      `UPDATE categorias
       SET name = $1, type = $2, color = $3, icon = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, type, color, icon, id, userId]
    );
    return mapRowToCategory(result.rows[0]);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM categorias WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const categoryService = new CategoryService();
