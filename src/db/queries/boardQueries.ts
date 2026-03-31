import type { Board } from "../../shared/types/board";
import { getDatabase } from "../database";

interface BoardRow {
  id: string;
  name: string;
  category_id: string | null;
  grid_rows: number;
  grid_cols: number;
}

export async function getBoardsByCategoryId(categoryId: string): Promise<Board[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BoardRow>(
    "SELECT * FROM boards WHERE category_id = ?",
    [categoryId]
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    gridRows: row.grid_rows,
    gridCols: row.grid_cols,
  }));
}

export async function getBoardById(id: string): Promise<Board | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BoardRow>(
    "SELECT * FROM boards WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    gridRows: row.grid_rows,
    gridCols: row.grid_cols,
  };
}

export async function insertBoard(board: Board): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO boards (id, name, category_id, grid_rows, grid_cols) VALUES (?, ?, ?, ?, ?)",
    [board.id, board.name, board.categoryId, board.gridRows, board.gridCols]
  );
}
