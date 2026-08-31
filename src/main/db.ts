import Database from 'better-sqlite3'
import { app } from 'electron'
import { seedDatabase } from './dbSeeder'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDatabasePath(): string {
  let userDataPath: string
  try {
    userDataPath = app.getPath('userData')
  } catch (e) {
    userDataPath = process.cwd()
  }

  const dbDir = join(userDataPath, 'database')
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
  return join(dbDir, 'churchle.db')
}

export function initDatabase(pathOverride?: string): Database.Database {
  if (db && !pathOverride) return db

  const dbPath = pathOverride || getDatabasePath()
  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables as specified in Section 4 of PRD
  db.exec(`
    -- 1. Songs Library
    CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT,
        author TEXT,
        ccli_number TEXT,
        copyright TEXT,
        key_signature TEXT,
        tempo INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS song_sections (
        id TEXT PRIMARY KEY,
        song_id TEXT NOT NULL,
        section_type TEXT NOT NULL, -- Verse, Chorus, Bridge, Tag, Vamp
        section_order INTEGER NOT NULL,
        label TEXT NOT NULL,
        content TEXT NOT NULL,
        chords TEXT,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );

    -- 2. Multi-Language Hymnal Database
    CREATE TABLE IF NOT EXISTS hymnals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        denomination TEXT,
        primary_language TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hymn_entries (
        id TEXT PRIMARY KEY,
        hymnal_id TEXT NOT NULL,
        hymn_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        tune_name TEXT,
        meter TEXT,
        author TEXT,
        language TEXT NOT NULL,
        parallel_group_id TEXT,
        FOREIGN KEY (hymnal_id) REFERENCES hymnals(id)
    );

    CREATE TABLE IF NOT EXISTS hymn_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hymn_entry_id TEXT NOT NULL,
        verse_number INTEGER NOT NULL,
        stanza_text TEXT NOT NULL,
        chorus_text TEXT,
        FOREIGN KEY (hymn_entry_id) REFERENCES hymn_entries(id)
    );

    -- 3. Parallel Bible Translations & Verses
    CREATE TABLE IF NOT EXISTS bible_translations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        language TEXT NOT NULL,
        copyright TEXT,
        is_installed INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bible_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        translation_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        book_name TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (translation_id) REFERENCES bible_translations(id)
    );
  `)

  // Create standard indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_verses(translation_id, book_id, chapter, verse);
  `)

  // FTS5 table for scriptures
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS bible_fts USING fts5(
        translation_id,
        book_name,
        chapter,
        verse,
        text
      );
    `)
  } catch (e) {
    console.error('Failed to create FTS5 table. FTS5 might not be supported in this SQLite package.', e)
  }

  // 4. Service Schedules & Playlists
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_schedules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        service_date DATE NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedule_items (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        item_order INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        reference_id TEXT,
        custom_title TEXT,
        slide_data TEXT,
        FOREIGN KEY (schedule_id) REFERENCES service_schedules(id) ON DELETE CASCADE
    );
  `)

  seedDatabase(db)

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    return initDatabase()
  }
  return db
}
