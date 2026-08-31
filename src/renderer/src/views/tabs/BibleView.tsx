import { useState, useEffect } from 'react'

interface VerseResult {
  id: number
  translation_id: string
  book_name: string
  chapter: number
  verse: number
  text: string
}

interface BibleViewProps {
  onProjectBible?: (lines: string[]) => void
  onAddToService?: (item: any) => void
}

export default function BibleView({ onProjectBible, onAddToService }: BibleViewProps) {
  const [bibleTranslations, setBibleTranslations] = useState<any[]>([])
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(['KJV'])
  const [referenceQuery, setReferenceQuery] = useState('John 3:16-18')
  
  const [bibleBook, setBibleBook] = useState('John')
  const [bibleChapter, setBibleChapter] = useState('3')
  const [bibleVerseStart, setBibleVerseStart] = useState('16')
  const [bibleVerseEnd, setBibleVerseEnd] = useState('18')
  
  const [bibleResults, setBibleResults] = useState<Record<string, VerseResult[]>>({})
  const [selectedVerseIds, setSelectedVerseIds] = useState<number[]>([])

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-installed-translations').then((res) => {
        setBibleTranslations(res || [])
      })
      handleBibleSearch()
    }
  }, [])

  const handleParseReference = (query: string) => {
    setReferenceQuery(query)
    const match = query.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/)
    if (match) {
      setBibleBook(match[1])
      setBibleChapter(match[2])
      setBibleVerseStart(match[3])
      setBibleVerseEnd(match[4] || match[3])
    }
  }

  const handleBibleSearch = async () => {
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke(
        'lookup-scripture',
        bibleBook,
        Number(bibleChapter),
        Number(bibleVerseStart),
        Number(bibleVerseEnd),
        selectedTranslations
      )
      setBibleResults(res || {})
    }
  }

  const toggleSelectVerse = (verseId: number, index: number, shiftKey: boolean, primaryList: VerseResult[]) => {
    if (shiftKey && selectedVerseIds.length > 0) {
      const firstIdx = primaryList.findIndex((v) => v.id === selectedVerseIds[0])
      if (firstIdx !== -1) {
        const start = Math.min(firstIdx, index)
        const end = Math.max(firstIdx, index)
        const rangeIds = primaryList.slice(start, end + 1).map((v) => v.id)
        setSelectedVerseIds(rangeIds)
        return
      }
    }

    if (selectedVerseIds.includes(verseId)) {
      setSelectedVerseIds(selectedVerseIds.filter((id) => id !== verseId))
    } else {
      setSelectedVerseIds([...selectedVerseIds, verseId])
    }
  }

  const primaryTranslation = selectedTranslations[0] || 'KJV'
  const primaryVerses = bibleResults[primaryTranslation] || []

  const handleAddToQueue = (verses: VerseResult[]) => {
    if (verses.length === 0 || !onAddToService) return
    const slides = verses.map((v) => `${v.book_name} ${v.chapter}:${v.verse}\n"${v.text}"`)
    onAddToService({
      id: `svc_scripture_${Date.now()}`,
      title: `${bibleBook} ${bibleChapter}:${bibleVerseStart}-${bibleVerseEnd} (${primaryTranslation})`,
      sub: `${verses.length} Verses`,
      type: 'scripture',
      slides
    })
  }

  const handleProjectDirect = (verses: VerseResult[]) => {
    if (verses.length === 0 || !onProjectBible) return
    const lines = verses.map((v) => `${v.book_name} ${v.chapter}:${v.verse} (${v.translation_id}) | ${v.text}`)
    onProjectBible(lines)
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Persistent Search Card */}
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" className="text-app-accent">
              <path d="M4 5c4 0 6 1 8 3 2-2 4-3 8-3v14c-4 0-6 1-8 3-2-2-4-3-8-3z" />
            </svg>
            OpenLP Pattern Scripture Explorer
          </h2>
          <div className="flex items-center gap-2">
            {bibleTranslations.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTranslations([t.id])}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedTranslations.includes(t.id) ? 'bg-app-accent text-white' : 'bg-app-toolbar text-app-text-2'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Input Bar */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] text-app-text-2 uppercase font-bold">Quick Scripture Reference</label>
            <input
              type="text"
              value={referenceQuery}
              onChange={(e) => handleParseReference(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-bold focus:outline-none focus:border-app-accent focus:bg-app-panel"
              placeholder="e.g. John 3:16-18, Genesis 1:1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-app-text-2 uppercase font-bold">Book Name</label>
            <input
              type="text"
              value={bibleBook}
              onChange={(e) => setBibleBook(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none focus:border-app-accent focus:bg-app-panel"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-app-text-2 uppercase font-bold">Chapter</label>
            <input
              type="number"
              value={bibleChapter}
              onChange={(e) => setBibleChapter(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none focus:border-app-accent focus:bg-app-panel"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-app-text-2 uppercase font-bold">Verse Range</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={bibleVerseStart}
                onChange={(e) => setBibleVerseStart(e.target.value)}
                className="w-full bg-app-toolbar border border-app-border rounded-lg px-2 py-2 text-app-text font-semibold focus:outline-none text-center"
              />
              <span className="text-app-text-3">-</span>
              <input
                type="number"
                value={bibleVerseEnd}
                onChange={(e) => setBibleVerseEnd(e.target.value)}
                className="w-full bg-app-toolbar border border-app-border rounded-lg px-2 py-2 text-app-text font-semibold focus:outline-none text-center"
              />
            </div>
          </div>

          <button
            onClick={handleBibleSearch}
            className="w-full py-2 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            Search Scripture
          </button>
        </div>
      </div>

      {/* Scrollable Verse List-of-Results */}
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm flex-1 flex flex-col space-y-3 min-h-[350px]">
        <div className="flex justify-between items-center border-b border-app-border pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-app-text uppercase tracking-wider">
              {bibleBook} {bibleChapter}:{bibleVerseStart}-{bibleVerseEnd} Verse Results
            </span>
            <span className="text-[10px] text-app-text-3 font-mono">
              (Shift-click for multi-verse range)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAddToQueue(primaryVerses)}
              className="px-3 py-1.5 bg-app-accent-bg border border-app-accent/30 text-app-accent font-extrabold rounded-lg text-xs hover:bg-app-accent hover:text-white transition cursor-pointer"
            >
              + Add Entire Passage to Service
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {primaryVerses.length > 0 ? (
            primaryVerses.map((v, idx) => {
              const isSelected = selectedVerseIds.includes(v.id)
              return (
                <div
                  key={v.id || idx}
                  onClick={(e) => toggleSelectVerse(v.id, idx, e.shiftKey, primaryVerses)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-app-accent-bg border-app-accent text-app-text shadow-sm'
                      : 'bg-app-toolbar border-app-border text-app-text hover:border-app-border-strong'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-app-accent font-mono">
                        {v.book_name} {v.chapter}:{v.verse}
                      </span>
                      <span className="text-[10px] text-app-text-3 font-mono">({v.translation_id})</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed italic">"{v.text}"</p>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToQueue([v])
                      }}
                      className="px-2.5 py-1 bg-app-panel border border-app-border rounded text-[10px] font-bold text-app-text-2 hover:text-app-accent hover:border-app-accent transition cursor-pointer"
                    >
                      + Queue Item
                    </button>
                    {onProjectBible && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProjectDirect([v])
                        }}
                        className="px-2.5 py-1 bg-app-live text-white rounded text-[10px] font-bold hover:opacity-90 transition cursor-pointer"
                      >
                        Send Live ▶
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-app-text-3 italic">
              No verses found matching reference. Search above to view results.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
