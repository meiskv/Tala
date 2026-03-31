import { getDatabase } from "../database";
import type { ButtonWithImage } from "./buttonQueries";
import { getSymbolImageUrl } from "@/features/symbols/arasaacApi";
import type { Button } from "../../shared/types/board";

export async function recordSymbolUsage(symbolId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO symbol_usage (symbol_id, tap_count, last_used_at)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(symbol_id) DO UPDATE SET
       tap_count = tap_count + 1,
       last_used_at = datetime('now')`,
    [symbolId]
  );
}

export async function getTopUsedButtons(
  limit = 12
): Promise<ButtonWithImage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    board_id: string;
    label: string;
    vocalization: string | null;
    symbol_id: string | null;
    action: string;
    target_board_id: string | null;
    position: number;
    bg_color: string | null;
    arasaac_id: number | null;
    tap_count: number;
  }>(
    `SELECT b.*, s.arasaac_id, su.tap_count
     FROM symbol_usage su
     JOIN buttons b ON b.symbol_id = su.symbol_id OR b.id = su.symbol_id
     LEFT JOIN symbols s ON b.symbol_id = s.id
     GROUP BY b.id
     ORDER BY su.tap_count DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({
    id: row.id,
    boardId: row.board_id,
    label: row.label,
    vocalization: row.vocalization,
    symbolId: row.symbol_id,
    action: row.action as Button["action"],
    targetBoardId: row.target_board_id,
    position: row.position,
    bgColor: row.bg_color,
    imagePath: row.arasaac_id ? getSymbolImageUrl(row.arasaac_id) : null,
  }));
}
