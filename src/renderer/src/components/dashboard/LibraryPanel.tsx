import { useState, useEffect } from 'react'

export interface SongItem {
  id: string
  title: string
  artist?: string
  author?: string
}

interface LibraryPanelProps {
  selectedSongId?: string
  onSelectSong: (song: SongItem) => void
}

export default function LibraryPanel({ selectedSongId, onSelectSong }: LibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [songs, setSongs] = useState<SongItem[]>([
    { id: 'song_amazing_grace', title: 'Amazing Grace', author: 'John Newton' },
    { id: 'song_how_great', title: 'How Great Thou Art', author: 'Carl Boberg' },
    { id: 'song_blessed', title: 'Blessed Assurance', author: 'Fanny Crosby' },
    { id: 'song_faithfulness', title: 'Great Is Thy Faithfulness', author: 'Thomas Chisholm' },
    { id: 'song_well', title: 'It Is Well', author: 'Horatio Spafford' }
  ])

  const [recentlyUsed] = useState<SongItem[]>([
    { id: 'song_nyame_ye', title: 'Nyame Ye', author: 'Traditional' },
    { id: 'song_10000_reasons', title: '10,000 Reasons', author: 'Matt Redman' }
  ])

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke('search-songs', searchQuery)
        .then((res: SongItem[]) => {
          if (res && res.length > 0) {
            setSongs(res)
          }
        })
        .catch(() => {})
    }
  }, [searchQuery])

  return (
    <div className="mockup-panel mockup-library">
      {/* Search Input */}
      <div className="library-search">
        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search songs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Library Songs List */}
      <div className="library-list">
        <div className="lib-section-label">Songs</div>
        {songs.map((song) => {
          const isSelected = selectedSongId === song.id
          return (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={`lib-item ${isSelected ? 'sel' : ''}`}
            >
              <svg viewBox="0 0 24 24">
                <path d="M9 18V5l10-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="16" cy="16" r="3" />
              </svg>
              <span>{song.title}</span>
            </div>
          )
        })}

        <div className="lib-section-label">Recently used</div>
        {recentlyUsed.map((song) => {
          const isSelected = selectedSongId === song.id
          return (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={`lib-item ${isSelected ? 'sel' : ''}`}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span>{song.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
