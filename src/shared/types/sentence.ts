export interface SentenceHistoryEntry {
  id: string;
  symbolsJson: string;
  createdAt: string;
}

export interface SentenceSymbol {
  symbolId: string;
  label: string;
  vocalization: string;
  imagePath: string | null;
}
