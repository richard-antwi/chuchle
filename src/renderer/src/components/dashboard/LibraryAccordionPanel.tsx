import { useState } from 'react'
import { SongItem } from './LibraryPanel'

interface LibraryAccordionPanelProps {
  songs: SongItem[]
  selectedSongId: string
  onSelectSong: (song: SongItem) => void
  onAddToService: (song: SongItem) => void
  onSendLiveDirect: (song: SongItem) => void
}

export default function LibraryAccordionPanel({
  songs,
  selectedSongId,
  onSelectSong,
  onAddToService,
  onSendLiveDirect
}: LibraryAccordionPanelProps) {
  const [activeSection, setActiveSection] = useState<'songs' | 'bibles' | 'presentations' | 'images' | 'media' | 'custom'>('songs')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const activeSong = songs.find((s) => s.id === selectedSongId) || songs[0]

  return (
    <div className="w-[260px] bg-app-panel border-r border-app-border flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="p-2 border-b border-app-border bg-app-toolbar flex items-center justify-between">
        <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
          <span>Library</span>
          <span className="text-[10px] text-app-text-3 font-normal">
            ({activeSection.toUpperCase()})
          </span>
        </span>
      </div>

      {/* Accordion Active Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Icon Toolbar */}
        <div className="p-1.5 border-b border-app-border bg-app-toolbar flex items-center gap-1">
          <button
            title="New Song"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            📄
          </button>
          <button
            title="Edit Song"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ✏️
          </button>
          <button
            title="Delete Song"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            🗑️
          </button>

          <div className="w-[1px] h-4 bg-app-border mx-0.5" />

          <button
            title="Add to Service Queue"
            onClick={() => activeSong && onAddToService(activeSong)}
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ➕
          </button>
          <button
            title="Send Direct to Live"
            onClick={() => activeSong && onSendLiveDirect(activeSong)}
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ▶
          </button>
        </div>

        {/* Search Bar Row */}
        <div className="p-2 border-b border-app-border space-y-1.5 bg-app-panel">
          <div className="flex items-center gap-1">
            <span className="text-xs text-app-text-3">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="♫ Search Entire Song..."
              className="flex-1 bg-app-toolbar border border-app-border rounded px-2 py-1 text-xs text-app-text focus:outline-none focus:border-app-accent"
            />
          </div>
        </div>

        {/* Scrollable Song Item List */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          {activeSection === 'songs' ? (
            filteredSongs.map((s) => {
              const isSel = selectedSongId === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSong(s)}
                  onDoubleClick={() => onAddToService(s)}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                    isSel
                      ? 'bg-app-accent text-white shadow-sm font-bold'
                      : 'text-app-text hover:bg-app-toolbar'
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                  {s.author && (
                    <span className={`text-[10px] font-normal truncate ml-1 ${isSel ? 'text-blue-100' : 'text-app-text-3'}`}>
                      ({s.author})
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-app-text-3 italic">
              {activeSection.toUpperCase()} Section Loaded
            </div>
          )}
        </div>
      </div>

      {/* Bottom Accordion Section Tabs (Matching Picture 1) */}
      <div className="border-t border-app-border bg-app-toolbar flex flex-col">
        <button
          onClick={() => setActiveSection('songs')}
          className={`w-full px-3 py-2 text-left text-xs font-bold border-b border-app-border transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'songs' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>🎵</span>
          <span>Songs</span>
        </button>

        <button
          onClick={() => setActiveSection('bibles')}
          className={`w-full px-3 py-2 text-left text-xs font-bold border-b border-app-border transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'bibles' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>📖</span>
          <span>Bibles</span>
        </button>

        <button
          onClick={() => setActiveSection('presentations')}
          className={`w-full px-3 py-2 text-left text-xs font-bold border-b border-app-border transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'presentations' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>📊</span>
          <span>Presentations</span>
        </button>

        <button
          onClick={() => setActiveSection('images')}
          className={`w-full px-3 py-2 text-left text-xs font-bold border-b border-app-border transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'images' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>🖼️</span>
          <span>Images</span>
        </button>

        <button
          onClick={() => setActiveSection('media')}
          className={`w-full px-3 py-2 text-left text-xs font-bold border-b border-app-border transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'media' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>🎬</span>
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveSection('custom')}
          className={`w-full px-3 py-2 text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSection === 'custom' ? 'bg-app-panel text-app-text border-l-4 border-l-app-accent' : 'text-app-text-2 hover:bg-app-panel'
          }`}
        >
          <span>📝</span>
          <span>Custom Slides</span>
        </button>
      </div>
    </div>
  )
}
