import type { SentenceHistoryEntry } from "../../shared/types/sentence";
import { getDatabase } from "../database";

export async function saveSentenceHistory(
  id: string,
  symbolsJson: string,
  profileId?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO sentence_history (id, symbols_json, profile_id) VALUES (?, ?, ?)",
    [id, symbolsJson, profileId ?? null]
  );
}

export async function getSentenceHistory(
  limit = 50
): Promise<SentenceHistoryEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    symbols_json: string;
    created_at: string;
  }>("SELECT * FROM sentence_history ORDER BY created_at DESC LIMIT ?", [
    limit,
  ]);
  return rows.map((row) => ({
    id: row.id,
    symbolsJson: row.symbols_json,
    createdAt: row.created_at,
  }));
}

export async function deleteSentenceHistory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sentence_history WHERE id = ?", [id]);
}

export async function clearSentenceHistory(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sentence_history");
}
