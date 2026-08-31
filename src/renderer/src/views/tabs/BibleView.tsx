import { useState, useEffect } from 'react'

interface BibleViewProps {
  onProjectBible: (lines: string[]) => void
}

export default function BibleView({ onProjectBible }: BibleViewProps) {
  const [bibleTranslations, setBibleTranslations] = useState<any[]>([])
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(['KJV', 'NIV'])
  const [bibleBook, setBibleBook] = useState('John')
  const [bibleChapter, setBibleChapter] = useState('3')
  const [bibleVerseStart, setBibleVerseStart] = useState('16')
  const [bibleVerseEnd, setBibleVerseEnd] = useState('16')
  const [bibleResults, setBibleResults] = useState<any>(null)

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-installed-translations').then((res) => {
        setBibleTranslations(res || [])
      })
    }
  }, [])

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
      setBibleResults(res)
    }
  }

  const projectBiblePassage = () => {
    if (!bibleResults) return
    const lines: string[] = []
    const headerParts: string[] = []
    selectedTranslations.forEach((tId) => {
      headerParts.push(`${bibleBook} ${bibleChapter}:${bibleVerseStart} (${tId})`)
    })
    lines.push(headerParts.join(' | '))

    const start = Number(bibleVerseStart)
    const end = Number(bibleVerseEnd)
    for (let v = start; v <= end; v++) {
      const colParts: string[] = []
      selectedTranslations.forEach((tId) => {
        const verseObj = (bibleResults[tId] || []).find((rv: any) => rv.verse === v)
        colParts.push(verseObj ? verseObj.text : '')
      })
      lines.push(colParts.join(' | '))
    }
    onProjectBible(lines)
  }

  return (
    <div className="h-full flex flex-col space-y-5 overflow-y-auto p-6 select-none bg-[#eef0f3] text-[#22262c]">
      {/* Top Search Card */}
      <div className="bg-white border border-[#d7dbe1] p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#d7dbe1] pb-3">
          <h2 className="text-sm font-black text-[#22262c] uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#2f6fed" fill="none" strokeWidth="2">
              <path d="M4 5c4 0 6 1 8 3 2-2 4-3 8-3v14c-4 0-6 1-8 3-2-2-4-3-8-3z" />
            </svg>
            Scripture Lookup & Parallel Translations
          </h2>
          <span className="text-xs font-mono text-[#5b6270]">BIBLE ENGINE</span>
        </div>

        {/* Translation Pills Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#5b6270] uppercase font-bold tracking-wider">
            Parallel Translations (Select up to 3)
          </label>
          <div className="flex gap-2 flex-wrap">
            {bibleTranslations.map((t) => {
              const isSelected = selectedTranslations.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedTranslations.length > 1) {
                        setSelectedTranslations(selectedTranslations.filter((id) => id !== t.id))
                      }
                    } else {
                      if (selectedTranslations.length < 3) {
                        setSelectedTranslations([...selectedTranslations, t.id])
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#e8f0fe] border border-[#c6d9fb] text-[#2f6fed] shadow-sm'
                      : 'bg-[#f6f7f9] border border-[#d7dbe1] text-[#5b6270] hover:text-[#22262c]'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[#2f6fed]' : 'bg-slate-400'}`} />
                  {t.name} ({t.id})
                </button>
              )
            })}
          </div>
        </div>

        {/* Passage Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-end pt-1">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] text-[#5b6270] uppercase font-bold">Book Name</label>
            <input
              type="text"
              value={bibleBook}
              onChange={(e) => setBibleBook(e.target.value)}
              className="w-full bg-[#f6f7f9] border border-[#d7dbe1] rounded-lg px-3 py-2 text-[#22262c] font-semibold focus:outline-none focus:border-[#2f6fed] focus:bg-white"
              placeholder="e.g. John, Genesis, Psalms"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#5b6270] uppercase font-bold">Chapter</label>
            <input
              type="number"
              value={bibleChapter}
              onChange={(e) => setBibleChapter(e.target.value)}
              className="w-full bg-[#f6f7f9] border border-[#d7dbe1] rounded-lg px-3 py-2 text-[#22262c] font-semibold focus:outline-none focus:border-[#2f6fed] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#5b6270] uppercase font-bold">Verse</label>
            <input
              type="number"
              value={bibleVerseStart}
              onChange={(e) => {
                setBibleVerseStart(e.target.value)
                setBibleVerseEnd(e.target.value)
              }}
              className="w-full bg-[#f6f7f9] border border-[#d7dbe1] rounded-lg px-3 py-2 text-[#22262c] font-semibold focus:outline-none focus:border-[#2f6fed] focus:bg-white"
            />
          </div>

          <button
            onClick={handleBibleSearch}
            className="w-full py-2 bg-[#2f6fed] hover:bg-[#1d5cd4] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-md shadow-[#2f6fed]/20"
          >
            Look Up Scripture
          </button>
        </div>
      </div>

      {/* Parallel Results Area */}
      {bibleResults && (
        <div className="bg-white border border-[#d7dbe1] p-5 rounded-xl shadow-sm flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center border-b border-[#d7dbe1] pb-3">
            <span className="text-xs font-black text-[#22262c] uppercase tracking-wider">
              {bibleBook} {bibleChapter}:{bibleVerseStart} Passage Results
            </span>
            <span className="text-[11px] font-bold text-[#2f6fed] bg-[#e8f0fe] px-2.5 py-0.5 rounded border border-[#c6d9fb]">
              {selectedTranslations.length} Translations Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {selectedTranslations.map((tId) => {
              const verseObj = (bibleResults[tId] || []).find((v: any) => v.verse === Number(bibleVerseStart))
              return (
                <div key={tId} className="bg-[#f6f7f9] border border-[#d7dbe1] p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#2f6fed] uppercase tracking-wider">{tId} Translation</span>
                    <span className="text-[10px] text-[#9399a4] font-mono">Verse {bibleVerseStart}</span>
                  </div>
                  <p className="text-sm font-medium text-[#22262c] leading-relaxed italic bg-white p-3 rounded border border-[#d7dbe1]">
                    "{verseObj ? verseObj.text : 'Verse not found in this translation database.'}"
                  </p>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-[#d7dbe1]">
            <button
              onClick={projectBiblePassage}
              className="w-full py-3 bg-[#d8352c] hover:bg-[#ba271f] active:scale-98 text-white font-black rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-lg shadow-[#d8352c]/20 flex items-center justify-center gap-2"
            >
              <span>SEND PARALLEL SCRIPTURE TO LIVE STAGE</span>
              <span>▶</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
