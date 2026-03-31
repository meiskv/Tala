export type ButtonAction = "speak" | "navigate" | "modifier";

export interface Button {
  id: string;
  boardId: string;
  label: string;
  vocalization: string | null;
  symbolId: string | null;
  action: ButtonAction;
  targetBoardId: string | null;
  position: number;
  bgColor: string | null;
}

export interface Board {
  id: string;
  name: string;
  categoryId: string | null;
  gridRows: number;
  gridCols: number;
}
