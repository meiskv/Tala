import type { AACSymbol } from "../../shared/types/symbol";
import { getDatabase } from "../database";

interface SymbolRow {
  id: string;
  label: string;
  arasaac_id: number | null;
  local_cache_path: string | null;
  tags: string | null;
}

function rowToSymbol(row: SymbolRow): AACSymbol {
  return {
    id: row.id,
    label: row.label,
    arasaacId: row.arasaac_id,
    localCachePath: row.local_cache_path,
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

export async function getSymbolById(id: string): Promise<AACSymbol | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SymbolRow>(
    "SELECT * FROM symbols WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return rowToSymbol(row);
}

export async function getSymbolsByIds(ids: string[]): Promise<AACSymbol[]> {
  if (ids.length === 0) return [];
  const db = await getDatabase();
  const placeholders = ids.map(() => "?").join(", ");
  const rows = await db.getAllAsync<SymbolRow>(
    `SELECT * FROM symbols WHERE id IN (${placeholders})`,
    ids
  );
  return rows.map(rowToSymbol);
}

export async function insertSymbol(symbol: AACSymbol): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO symbols (id, label, arasaac_id, local_cache_path, tags) VALUES (?, ?, ?, ?, ?)",
    [symbol.id, symbol.label, symbol.arasaacId, symbol.localCachePath, JSON.stringify(symbol.tags)]
  );
}

export async function updateSymbolCachePath(id: string, path: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE symbols SET local_cache_path = ? WHERE id = ?",
    [path, id]
  );
}
