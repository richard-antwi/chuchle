import { useState, useEffect } from 'react'

interface HymnalViewProps {
  onProjectHymn?: (lines: string[]) => void
  onAddToService?: (item: any) => void
}

export default function HymnalView({ onProjectHymn, onAddToService }: HymnalViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hymnResults, setHymnResults] = useState<any[]>([])
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number>(1)
  const [activeHymnLanguage, setActiveHymnLanguage] = useState<'English' | 'Twi'>('English')
  const [hymnStanzas, setHymnStanzas] = useState<Record<string, any[]>>({})

  useEffect(() => {
    handleSearchHymns('1')
  }, [])

  const handleSearchHymns = async (query: string) => {
    setSearchQuery(query)
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke('search-hymns', query || '1')
      setHymnResults(res || [])
      if (res && res.length > 0) {
        loadHymnVerses(res[0].hymn_number)
      }
    }
  }

  const loadHymnVerses = async (hymnNum: number) => {
    setSelectedHymnNumber(hymnNum)
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke('get-hymn-verses-parallel', hymnNum)
      setHymnStanzas(res || {})
    }
  }

  const currentStanzas = hymnStanzas[activeHymnLanguage] || []

  const handleAddHymnToQueue = () => {
    if (currentStanzas.length === 0 || !onAddToService) return
    const slides = currentStanzas.map((s) => `MHB ${selectedHymnNumber} - Stanza ${s.verse_number}\n"${s.verse_text}"`)
    onAddToService({
      id: `svc_hymn_${Date.now()}`,
      title: `MHB ${selectedHymnNumber} (${activeHymnLanguage})`,
      sub: `${currentStanzas.length} Stanzas`,
      type: 'hymnal',
      slides
    })
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Search Card */}
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" className="text-app-accent">
              <path d="M9 18V5l10-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="16" cy="16" r="3" />
            </svg>
            Methodist Hymnal Book (MHB) Explorer
          </h2>
          <span className="text-xs font-mono text-app-text-3">HYMN ENGINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] text-app-text-2 uppercase font-bold">Search by Hymn Number or First Line</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchHymns(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-bold focus:outline-none focus:border-app-accent focus:bg-app-panel"
              placeholder="e.g. 1, O for a thousand tongues to sing"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveHymnLanguage('English')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeHymnLanguage === 'English'
                  ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent font-extrabold shadow-sm'
                  : 'bg-app-toolbar border border-app-border text-app-text-2'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveHymnLanguage('Twi')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeHymnLanguage === 'Twi'
                  ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent font-extrabold shadow-sm'
                  : 'bg-app-toolbar border border-app-border text-app-text-2'
              }`}
            >
              Twi
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Index List, Right Stanza Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[350px]">
        {/* Left Index */}
        <div className="bg-app-panel border border-app-border p-4 rounded-xl shadow-sm flex flex-col space-y-3">
          <span className="text-xs font-black text-app-text uppercase tracking-wider border-b border-app-border pb-2">
            Hymn Index
          </span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {hymnResults.map((h) => {
              const isSel = selectedHymnNumber === h.hymn_number
              return (
                <div
                  key={h.id}
                  onClick={() => loadHymnVerses(h.hymn_number)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                    isSel
                      ? 'bg-app-accent-bg border-app-accent text-app-accent font-extrabold shadow-sm'
                      : 'bg-app-toolbar border-app-border text-app-text hover:border-app-border-strong'
                  }`}
                >
                  <span className="truncate">MHB {h.hymn_number}: {h.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Stanza Results */}
        <div className="md:col-span-2 bg-app-panel border border-app-border p-4 rounded-xl shadow-sm flex flex-col space-y-3">
          <div className="flex justify-between items-center border-b border-app-border pb-2">
            <span className="text-xs font-black text-app-text uppercase tracking-wider">
              MHB {selectedHymnNumber} Stanzas ({activeHymnLanguage})
            </span>
            <button
              onClick={handleAddHymnToQueue}
              className="px-3 py-1.5 bg-app-accent text-white font-extrabold rounded-lg text-xs hover:opacity-90 transition cursor-pointer shadow-sm"
            >
              + Add Entire Hymn to Service
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {currentStanzas.length > 0 ? (
              currentStanzas.map((st) => (
                <div
                  key={st.id}
                  className="bg-app-toolbar border border-app-border p-3.5 rounded-lg space-y-1 flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-extrabold text-app-accent font-mono">
                      Stanza {st.verse_number}
                    </span>
                    <p className="text-xs font-medium leading-relaxed italic text-app-text mt-1">
                      "{st.verse_text}"
                    </p>
                  </div>
                  {onProjectHymn && (
                    <button
                      onClick={() => onProjectHymn([`MHB ${selectedHymnNumber} Stanza ${st.verse_number} | ${st.verse_text}`])}
                      className="px-2.5 py-1 bg-app-live text-white rounded text-[10px] font-bold hover:opacity-90 transition cursor-pointer flex-shrink-0"
                    >
                      Send Live ▶
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-app-text-3 italic">
                Select a hymn from the index to view stanzas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
