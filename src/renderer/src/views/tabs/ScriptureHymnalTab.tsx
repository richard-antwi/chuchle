import { useState, useEffect } from 'react'

interface ScriptureHymnalTabProps {
  onProjectBible: (lines: string[]) => void
  onProjectHymn: (lines: string[], hymnNum: number, verseNum: number, lang: 'English' | 'Twi') => void
}

export default function ScriptureHymnalTab({ onProjectBible, onProjectHymn }: ScriptureHymnalTabProps) {
  // Bible states
  const [bibleTranslations, setBibleTranslations] = useState<any[]>([])
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(['KJV', 'NIV'])
  const [bibleBook, setBibleBook] = useState('John')
  const [bibleChapter, setBibleChapter] = useState('3')
  const [bibleVerseStart, setBibleVerseStart] = useState('16')
  const [bibleVerseEnd, setBibleVerseEnd] = useState('16')
  const [bibleResults, setBibleResults] = useState<any>(null)

  // Hymnal states
  const [hymnQuery, setHymnQuery] = useState('1')
  const [hymnVerses, setHymnVerses] = useState<Record<string, any[]>>({ English: [], Twi: [] })
  const [activeHymnLanguage, setActiveHymnLanguage] = useState<'English' | 'Twi'>('English')

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

  const handleLoadHymn = async () => {
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke('get-hymn-verses-parallel', Number(hymnQuery))
      setHymnVerses(res || { English: [], Twi: [] })
    }
  }

  const projectHymnVerse = (verseNum: number, lang: 'English' | 'Twi') => {
    const list = hymnVerses[lang] || []
    const verseObj = list.find((v) => v.verse_number === verseNum)
    if (verseObj) {
      const lines = verseObj.stanza_text.split('\n')
      onProjectHymn(lines, Number(hymnQuery), verseNum, lang)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Bible Scripture Lookup */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col">
          <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#3FA9F5]" />
            Scripture Lookup & Parallel Translations
          </h3>

          {/* Translations List */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Select Translations</label>
            <div className="flex gap-4 flex-wrap text-xs">
              {bibleTranslations.map((t) => (
                <label key={t.id} className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTranslations.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTranslations([...selectedTranslations, t.id])
                      } else {
                        setSelectedTranslations(selectedTranslations.filter((id) => id !== t.id))
                      }
                    }}
                    className="rounded border-[#232B38] text-[#F5A623] focus:ring-[#F5A623] accent-[#F5A623]"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          {/* Passage Inputs */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Book</label>
              <input
                type="text"
                value={bibleBook}
                onChange={(e) => setBibleBook(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-2.5 py-1.5 text-[#E8EAED] focus:outline-none focus:border-[#3FA9F5]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Chap</label>
              <input
                type="number"
                value={bibleChapter}
                onChange={(e) => setBibleChapter(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-2.5 py-1.5 text-[#E8EAED] focus:outline-none focus:border-[#3FA9F5]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Verse</label>
              <input
                type="number"
                value={bibleVerseStart}
                onChange={(e) => {
                  setBibleVerseStart(e.target.value)
                  setBibleVerseEnd(e.target.value)
                }}
                className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-2.5 py-1.5 text-[#E8EAED] focus:outline-none focus:border-[#3FA9F5]"
              />
            </div>
          </div>

          <button
            onClick={handleBibleSearch}
            className="w-full py-2 bg-[#3FA9F5] hover:bg-[#2e93db] text-slate-950 font-extrabold rounded text-xs uppercase tracking-wider transition duration-150 cursor-pointer"
          >
            Look Up Verse
          </button>

          {/* Scripture Results */}
          {bibleResults && (
            <div className="space-y-3 pt-3 border-t border-[#232B38] flex-1 flex flex-col justify-between">
              <div className="space-y-2 text-xs leading-relaxed bg-[#0B0E14] p-3 rounded-md border border-[#232B38]">
                {selectedTranslations.map((tId) => {
                  const verseObj = (bibleResults[tId] || []).find((v: any) => v.verse === Number(bibleVerseStart))
                  return (
                    <div key={tId} className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-[#3FA9F5] uppercase">{tId}:</span>
                      <p className="italic text-slate-300">"{verseObj ? verseObj.text : 'Verse not found.'}"</p>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={projectBiblePassage}
                className="w-full py-2 bg-[#F5A623] hover:bg-[#d98f19] text-slate-950 font-black rounded text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-md"
              >
                Send Parallel Scripture to Slides ▶
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Dual-Language Hymnal Deck */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col">
          <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
            Methodist Dual-Language Hymnal (MHB)
          </h3>

          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1 text-xs">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Hymn Number</label>
              <input
                type="number"
                value={hymnQuery}
                onChange={(e) => setHymnQuery(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-3 py-1.5 text-[#E8EAED] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
            <button
              onClick={handleLoadHymn}
              className="px-5 py-2 bg-[#F5A623] hover:bg-[#d98f19] text-slate-950 font-black rounded text-xs uppercase transition duration-150 cursor-pointer"
            >
              Load Hymn
            </button>
          </div>

          {(hymnVerses.English.length > 0 || hymnVerses.Twi.length > 0) && (
            <div className="space-y-3 pt-3 border-t border-[#232B38] flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">MHB HYMN {hymnQuery}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveHymnLanguage('English')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition cursor-pointer ${
                      activeHymnLanguage === 'English' ? 'bg-[#3FA9F5] text-slate-950' : 'bg-[#0B0E14] text-slate-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setActiveHymnLanguage('Twi')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition cursor-pointer ${
                      activeHymnLanguage === 'Twi' ? 'bg-[#3FA9F5] text-slate-950' : 'bg-[#0B0E14] text-slate-400'
                    }`}
                  >
                    Twi (Asante)
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] bg-[#0B0E14] p-2 border border-[#232B38] rounded-md">
                {hymnVerses[activeHymnLanguage].map((v) => (
                  <div
                    key={v.id}
                    onClick={() => projectHymnVerse(v.verse_number, activeHymnLanguage)}
                    className="p-3 rounded border border-[#232B38] bg-[#141922] hover:border-[#F5A623]/60 cursor-pointer transition duration-150 text-xs font-semibold whitespace-pre-line text-slate-300"
                  >
                    <div className="text-[9px] font-extrabold text-[#F5A623] uppercase mb-1">
                      Verse {v.verse_number} ({activeHymnLanguage})
                    </div>
                    {v.stanza_text}
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 italic text-center">
                Press the <kbd className="bg-[#0B0E14] px-1 border border-[#232B38] rounded font-bold font-mono">T</kbd> key to hot-swap projected languages live!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
