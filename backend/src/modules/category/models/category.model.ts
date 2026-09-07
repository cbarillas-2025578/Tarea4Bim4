export interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CategoryRow {
  id: number;
  name: string;
  type: string;
  color: string;
  icon: string;
  created_at: Date;
}

export function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at.toISOString(),
  };
}

export interface CreateCategoryDTO {
  name: string;
  type: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: string;
  color?: string;
  icon?: string;
}
