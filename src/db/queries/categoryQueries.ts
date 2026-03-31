import type { Category } from "../../shared/types/category";
import { getDatabase } from "../database";

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  sort_order: number;
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    "SELECT * FROM categories ORDER BY sort_order ASC"
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CategoryRow>(
    "SELECT * FROM categories WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
  };
}

export async function insertCategory(category: Category): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO categories (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)",
    [category.id, category.name, category.icon, category.color, category.sortOrder]
  );
}
