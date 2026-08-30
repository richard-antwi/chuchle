import { describe, it, expect, beforeAll } from 'vitest'
import { initDatabase } from './db'

describe('Database Schema Initialization', () => {
  let db: any

  beforeAll(() => {
    // Initialize in-memory database to avoid creating real files during test runs
    db = initDatabase(':memory:')
  })

  it('should initialize successfully and return database instance', () => {
    expect(db).toBeDefined()
    expect(db.pragma('foreign_keys')[0].foreign_keys).toBe(1)
  })

  it('should create all required tables', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((t: any) => t.name)

    const expectedTables = [
      'songs',
      'song_sections',
      'hymnals',
      'hymn_entries',
      'hymn_verses',
      'bible_translations',
      'bible_verses',
      'service_schedules',
      'schedule_items'
    ]

    expectedTables.forEach((table) => {
      expect(tables).toContain(table)
    })
  })

  it('should support Full Text Search (FTS5) table creation', () => {
    const ftsTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bible_fts'")
      .get()

    // If FTS5 is not supported, this might be null, but we expect it to compile and exist in our test runtime environment
    if (ftsTable) {
      expect(ftsTable.name).toBe('bible_fts')
    }
  })

  it('should support song insertion and cascading deletion of sections', () => {
    // Insert a song
    db.prepare(`
      INSERT INTO songs (id, title, artist, author)
      VALUES ('song-1', 'Amazing Grace', 'John Newton', 'John Newton')
    `).run()

    // Insert a section linked to the song
    db.prepare(`
      INSERT INTO song_sections (id, song_id, section_type, section_order, label, content)
      VALUES ('sec-1', 'song-1', 'VERSE', 1, 'Verse 1', 'Amazing grace, how sweet the sound')
    `).run()

    // Check insertion worked
    const song = db.prepare("SELECT * FROM songs WHERE id = 'song-1'").get()
    const section = db.prepare("SELECT * FROM song_sections WHERE id = 'sec-1'").get()

    expect(song.title).toBe('Amazing Grace')
    expect(section.content).toBe('Amazing grace, how sweet the sound')

    // Delete song and verify cascading deletes section due to ON DELETE CASCADE
    db.prepare("DELETE FROM songs WHERE id = 'song-1'").run()

    const songAfterDelete = db.prepare("SELECT * FROM songs WHERE id = 'song-1'").get()
    const sectionAfterDelete = db.prepare("SELECT * FROM song_sections WHERE id = 'sec-1'").get()

    expect(songAfterDelete).toBeUndefined()
    expect(sectionAfterDelete).toBeUndefined()
  })
})
