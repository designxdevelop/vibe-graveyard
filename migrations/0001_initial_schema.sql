-- Initial schema for vibe-graveyard
-- Migrated from better-sqlite3 inline CREATE TABLE statements

CREATE TABLE IF NOT EXISTS graves (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  death_date TEXT NOT NULL,
  cause_of_death TEXT NOT NULL,
  epitaph TEXT NOT NULL,
  tech_stack TEXT NOT NULL,
  star_count INTEGER,
  respect_count INTEGER NOT NULL DEFAULT 0,
  submitted_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS global_stats (
  id TEXT PRIMARY KEY,
  respect_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO global_stats (id, respect_count, updated_at)
VALUES ('global', 0, datetime('now'));

CREATE TABLE IF NOT EXISTS ghost_hunter_scores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_graves_status ON graves(status);
CREATE INDEX IF NOT EXISTS idx_graves_created_at ON graves(created_at);
CREATE INDEX IF NOT EXISTS idx_ghost_hunter_scores_score ON ghost_hunter_scores(score);
