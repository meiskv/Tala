export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS symbols (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  arasaac_id INTEGER,
  local_cache_path TEXT,
  tags TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  grid_rows INTEGER NOT NULL DEFAULT 4,
  grid_cols INTEGER NOT NULL DEFAULT 6
);

CREATE TABLE IF NOT EXISTS buttons (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  vocalization TEXT,
  symbol_id TEXT REFERENCES symbols(id),
  action TEXT NOT NULL DEFAULT 'speak',
  target_board_id TEXT REFERENCES boards(id),
  position INTEGER NOT NULL,
  bg_color TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0,
  custom_image_path TEXT
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL DEFAULT 'adult',
  complexity_level TEXT NOT NULL DEFAULT 'core',
  grid_rows INTEGER NOT NULL DEFAULT 3,
  grid_cols INTEGER NOT NULL DEFAULT 5,
  is_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentence_history (
  id TEXT PRIMARY KEY,
  symbols_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  profile_id TEXT
);

CREATE TABLE IF NOT EXISTS symbol_usage (
  symbol_id TEXT NOT NULL,
  tap_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (symbol_id)
);
`;
