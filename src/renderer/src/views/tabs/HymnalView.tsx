import { useState } from 'react'

interface HymnalViewProps {
  onProjectHymn: (lines: string[], hymnNum: number, verseNum: number, lang: 'English' | 'Twi') => void
}

export default function HymnalView({ onProjectHymn }: HymnalViewProps) {
  const [hymnQuery, setHymnQuery] = useState('1')
  const [hymnVerses, setHymnVerses] = useState<Record<string, any[]>>({ English: [], Twi: [] })
  const [activeHymnLanguage, setActiveHymnLanguage] = useState<'English' | 'Twi'>('English')

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
    <div className="h-full flex flex-col space-y-5 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Search Card */}
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" className="text-app-accent">
              <path d="M9 18V5l10-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="16" cy="16" r="3" />
            </svg>
            Methodist Dual-Language Hymnal (MHB)
          </h2>
          <span className="text-xs font-mono text-app-text-3">MHB ENGINE</span>
        </div>

        <div className="flex gap-3 items-end">
          <div className="space-y-1 flex-1 text-xs">
            <label className="text-[11px] text-app-text-3 uppercase font-bold">Hymn Number (e.g. 1 - 900)</label>
            <input
              type="number"
              value={hymnQuery}
              onChange={(e) => setHymnQuery(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none focus:border-app-accent focus:bg-app-panel"
            />
          </div>
          <button
            onClick={handleLoadHymn}
            className="px-6 py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-md shadow-app-accent/20"
          >
            Load Hymn Stanzas
          </button>
        </div>
      </div>

      {/* Hymn Stanzas Area */}
      {(hymnVerses.English.length > 0 || hymnVerses.Twi.length > 0) && (
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center border-b border-app-border pb-3">
            <span className="text-xs font-black text-app-text uppercase tracking-wider">
              MHB Hymn {hymnQuery} Stanzas
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveHymnLanguage('English')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition duration-150 cursor-pointer ${
                  activeHymnLanguage === 'English'
                    ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent shadow-sm'
                    : 'bg-app-toolbar border border-app-border text-app-text-2'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveHymnLanguage('Twi')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition duration-150 cursor-pointer ${
                  activeHymnLanguage === 'Twi'
                    ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent shadow-sm'
                    : 'bg-app-toolbar border border-app-border text-app-text-2'
                }`}
              >
                Twi (Asante)
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            {hymnVerses[activeHymnLanguage].map((v) => (
              <div
                key={v.id}
                onClick={() => projectHymnVerse(v.verse_number, activeHymnLanguage)}
                className="p-4 rounded-lg border border-app-border bg-app-toolbar hover:bg-app-accent-bg hover:border-app-accent cursor-pointer transition duration-150 text-xs font-semibold whitespace-pre-line text-app-text shadow-sm"
              >
                <div className="text-[10px] font-black text-app-accent uppercase tracking-wider mb-1">
                  Verse {v.verse_number} ({activeHymnLanguage}) — Click to Project
                </div>
                {v.stanza_text}
              </div>
            ))}
          </div>

          <div className="text-[11px] text-app-text-3 italic text-center pt-2 border-t border-app-border">
            Press the <kbd className="bg-app-toolbar px-1.5 py-0.5 border border-app-border rounded font-bold font-mono text-app-text">T</kbd> key during live projection to hot-swap languages!
          </div>
        </div>
      )}
    </div>
  )
}
