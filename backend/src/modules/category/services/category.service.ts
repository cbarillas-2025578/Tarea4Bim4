import { pool } from "../../database/database";
import {
  Category,
  CategoryRow,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  mapRowToCategory,
} from "../models/category.model";

export class CategoryService {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const result = await pool.query<CategoryRow>(
      `INSERT INTO categorias (name, type, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.type, data.color || "#38BDF8", data.icon || "📁"]
    );
    return mapRowToCategory(result.rows[0]);
  }

  async findAll(type?: string): Promise<Category[]> {
    let whereClause = "";
    const values: unknown[] = [];
    if (type) {
      values.push(type);
      whereClause = `WHERE type = $1`;
    }
    const result = await pool.query<CategoryRow>(
      `SELECT * FROM categorias ${whereClause} ORDER BY name ASC`,
      values
    );
    return result.rows.map(mapRowToCategory);
  }

  async findById(id: number): Promise<Category | null> {
    const result = await pool.query<CategoryRow>(
      `SELECT * FROM categorias WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapRowToCategory(result.rows[0]) : null;
  }

  async update(id: number, data: UpdateCategoryDTO): Promise<Category | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const name = data.name ?? existing.name;
    const type = data.type ?? existing.type;
    const color = data.color ?? existing.color;
    const icon = data.icon ?? existing.icon;

    const result = await pool.query<CategoryRow>(
      `UPDATE categorias
       SET name = $1, type = $2, color = $3, icon = $4
       WHERE id = $5
       RETURNING *`,
      [name, type, color, icon, id]
    );
    return mapRowToCategory(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM categorias WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const categoryService = new CategoryService();
