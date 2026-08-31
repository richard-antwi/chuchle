import Database from 'better-sqlite3'

export function seedDatabase(db: Database.Database) {
  const translationsCount = db.prepare('SELECT COUNT(*) as count FROM bible_translations').get() as { count: number }
  if (translationsCount.count > 0) {
    return
  }

  console.log('Seeding initial Bible, Hymnal, and Song database...')

  // 1. Bible translations
  const insertTranslation = db.prepare(
    'INSERT INTO bible_translations (id, name, language, copyright) VALUES (?, ?, ?, ?)'
  )
  insertTranslation.run('KJV', 'King James Version', 'English', 'Public Domain')
  insertTranslation.run('NIV', 'New International Version', 'English', 'Copyright Biblica')
  insertTranslation.run('ASV', 'American Standard Version', 'English', 'Public Domain')

  // 2. Bible verses
  const insertVerse = db.prepare(
    'INSERT INTO bible_verses (translation_id, book_id, book_name, chapter, verse, text) VALUES (?, ?, ?, ?, ?, ?)'
  )

  // John 3:16
  insertVerse.run('KJV', 43, 'John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.')
  insertVerse.run('NIV', 43, 'John', 3, 16, 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.')
  insertVerse.run('ASV', 43, 'John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.')

  // Psalm 23:1
  insertVerse.run('KJV', 19, 'Psalms', 23, 1, 'The LORD is my shepherd; I shall not want.')
  insertVerse.run('NIV', 19, 'Psalms', 23, 1, 'The LORD is my shepherd, I lack nothing.')
  insertVerse.run('ASV', 19, 'Psalms', 23, 1, 'Jehovah is my shepherd; I shall not want.')

  // Genesis 1:1
  insertVerse.run('KJV', 1, 'Genesis', 1, 1, 'In the beginning God created the heaven and the earth.')
  insertVerse.run('NIV', 1, 'Genesis', 1, 1, 'In the beginning God created the heavens and the earth.')
  insertVerse.run('ASV', 1, 'Genesis', 1, 1, 'In the beginning God created the heavens and the earth.')

  // Seed FTS5 if table exists
  try {
    db.exec(`
      INSERT INTO bible_fts (translation_id, book_name, chapter, verse, text)
      SELECT translation_id, book_name, chapter, verse, text FROM bible_verses;
    `)
  } catch (e) {
    console.error('FTS5 seeding skipped:', e)
  }

  // 3. Hymnals
  const insertHymnal = db.prepare(
    'INSERT INTO hymnals (id, title, denomination, primary_language) VALUES (?, ?, ?, ?)'
  )
  insertHymnal.run('MHB', 'Methodist Hymn Book', 'Methodist', 'Multi')

  // 4. Hymn Entries
  const insertHymnEntry = db.prepare(
    'INSERT INTO hymn_entries (id, hymnal_id, hymn_number, title, tune_name, meter, author, language, parallel_group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  insertHymnEntry.run('MHB_1_EN', 'MHB', 1, 'O for a thousand tongues to sing', 'Richmond', 'C.M.', 'Charles Wesley', 'English', 'mhb_1')
  insertHymnEntry.run('MHB_1_TW', 'MHB', 1, 'O sɛ me tɛkrɛma bɛyɛ mpem', 'Richmond', 'C.M.', 'Charles Wesley', 'Twi', 'mhb_1')

  // 5. Hymn Verses
  const insertHymnVerse = db.prepare(
    'INSERT INTO hymn_verses (hymn_entry_id, verse_number, stanza_text, chorus_text) VALUES (?, ?, ?, ?)'
  )

  // MHB 1 English verses
  insertHymnVerse.run('MHB_1_EN', 1, 'O for a thousand tongues to sing\nMy great Redeemer\'s praise,\nThe glories of my God and King,\nThe triumphs of His grace!', null)
  insertHymnVerse.run('MHB_1_EN', 2, 'My gracious Master and my God,\nAssist me to proclaim,\nTo spread through all the earth abroad\nThe honors of Thy name.', null)

  // MHB 1 Twi verses
  insertHymnVerse.run('MHB_1_TW', 1, 'O sɛ me tɛkrɛma bɛyɛ mpem\nA mɛkamfo me Hene,\nN\'adom kɛse a ɔde akyɛ me,\nNe ne nkunimdi pa!', null)
  insertHymnVerse.run('MHB_1_TW', 2, 'Me Nyankopɔn ne me Hene,\nBoa me na minni wo mu,\nNa mempae mu nkyerɛ wiase\nWo dinto pa no kɛse.', null)

  // 6. Songs
  const insertSong = db.prepare(
    'INSERT INTO songs (id, title, artist, author, copyright, tempo) VALUES (?, ?, ?, ?, ?, ?)'
  )
  insertSong.run('song_amazing_grace', 'Amazing Grace', 'John Newton', 'John Newton', 'Public Domain', 80)

  const insertSongSection = db.prepare(
    'INSERT INTO song_sections (id, song_id, section_type, section_order, label, content, chords) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  insertSongSection.run('song_amazing_grace_v1', 'song_amazing_grace', 'Verse', 1, 'Verse 1', 'Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see', 'G | C | G | D')
  insertSongSection.run('song_amazing_grace_c1', 'song_amazing_grace', 'Chorus', 2, 'Chorus', 'Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed', 'G | C | G | D')
}
