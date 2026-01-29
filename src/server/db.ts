import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Use /data for Railway volume in production, local file for dev
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/graveyard.db' 
  : './graveyard.db'

const sqlite = new Database(dbPath)

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

// Initialize the database tables if they don't exist
sqlite.exec(`
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
  )
`)

// Migration: Add respect_count column if it doesn't exist
try {
  sqlite.exec(`ALTER TABLE graves ADD COLUMN respect_count INTEGER NOT NULL DEFAULT 0`)
} catch (e) {
  // Column already exists, ignore error
}
