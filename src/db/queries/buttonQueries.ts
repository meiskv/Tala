import type { Button } from "../../shared/types/board";
import { getDatabase } from "../database";
import { getSymbolImageUrl } from "@/features/symbols/arasaacApi";

interface ButtonWithImageRow {
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
}

export interface ButtonWithImage extends Button {
  imagePath: string | null;
}

export async function getButtonsByBoardId(boardId: string): Promise<ButtonWithImage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ButtonWithImageRow>(
    `SELECT b.*, s.arasaac_id
     FROM buttons b
     LEFT JOIN symbols s ON b.symbol_id = s.id
     WHERE b.board_id = ?
     ORDER BY b.position ASC`,
    [boardId]
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

export async function searchButtons(query: string): Promise<ButtonWithImage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ButtonWithImageRow>(
    `SELECT b.*, s.arasaac_id
     FROM buttons b
     LEFT JOIN symbols s ON b.symbol_id = s.id
     WHERE b.label LIKE ?
     ORDER BY b.label ASC
     LIMIT 24`,
    [`%${query}%`]
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

export async function insertButton(button: Button): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO buttons (id, board_id, label, vocalization, symbol_id, action, target_board_id, position, bg_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      button.id,
      button.boardId,
      button.label,
      button.vocalization,
      button.symbolId,
      button.action,
      button.targetBoardId,
      button.position,
      button.bgColor,
    ]
  );
}

export async function getButtonCountForBoard(boardId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM buttons WHERE board_id = ?",
    [boardId]
  );
  return row?.count ?? 0;
}
