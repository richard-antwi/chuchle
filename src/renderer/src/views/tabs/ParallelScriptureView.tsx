import { useState } from 'react'
import { ServiceQueueItem } from '../../components/dashboard/OrderOfServicePanel'

interface ParallelScriptureViewProps {
  onProjectBible?: (lines: string[]) => void
  onAddToService?: (item: ServiceQueueItem) => void
}

interface ParallelVersePair {
  verseNum: number
  primaryText: string
  secondaryText: string
}

export default function ParallelScriptureView({ onProjectBible, onAddToService }: ParallelScriptureViewProps) {
  const [primaryLang, setPrimaryLang] = useState('KJV')
  const [secondaryLang, setSecondaryLang] = useState('TWI')
  const [book, setBook] = useState('John')
  const [chapter, setChapter] = useState('3')
  const [verseStart, setVerseStart] = useState('16')
  const [verseEnd, setVerseEnd] = useState('18')

  const [verses] = useState<ParallelVersePair[]>([
    {
      verseNum: 16,
      primaryText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      secondaryText: 'Na sɛnea Nyankopɔn dɔɔ ewiase ni, sɛ ɔde ne Ba a ɔwoo no koro no mae, na obiara a ɔgye no di no anyera, na mmom wanya daa nkwa.'
    },
    {
      verseNum: 17,
      primaryText: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
      secondaryText: 'Efisɛ Nyankopɔn ansoma ne Ba no ewiase sɛ ɔmmɛbu ewiase fɔ, na mmom sɛ nkwagye mbra ewiase nam ne so.'
    },
    {
      verseNum: 18,
      primaryText: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
      secondaryText: 'Deɛ ɔgye no di no, wɔmbu no fɔ; na deɛ ɔnnye no ndi no, wɔabu no fɔ dada, efisɛ ɔnnye Nyankopɔn Ba a ɔwoo no koro no din ndi.'
    }
  ])

  const buildParallelLines = (): string[] => {
    return verses.map(
      (v) =>
        `${book} ${chapter}:${v.verseNum}\n[${primaryLang}] ${v.primaryText}\n[${secondaryLang}] ${v.secondaryText}`
    )
  }

  const handleQueueParallelItem = () => {
    if (!onAddToService) return
    const queueItem: ServiceQueueItem = {
      id: `svc_parallel_${Date.now()}`,
      title: `${book} ${chapter}:${verseStart}-${verseEnd} (${primaryLang} / ${secondaryLang})`,
      sub: 'Parallel Scripture Dual Translation',
      type: 'scripture',
      slides: buildParallelLines()
    }
    onAddToService(queueItem)
  }

  const handleProjectLive = () => {
    if (onProjectBible) {
      onProjectBible(buildParallelLines())
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
          <span>🌐</span>
          Parallel Multi-Language Scripture Dual-Column Projection
        </h2>

        <div className="flex items-center gap-2">
          {onAddToService && (
            <button
              onClick={handleQueueParallelItem}
              className="px-3.5 py-1.5 bg-app-toolbar border border-app-border hover:bg-app-bg text-app-text font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Queue Parallel Scripture</span>
            </button>
          )}

          <button
            onClick={handleProjectLive}
            className="px-4 py-1.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>▶</span>
            <span>Send Parallel Live</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Dual Language Selector & Scripture Reference */}
      <div className="bg-app-panel border border-app-border p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4 text-xs items-end">
        {/* Primary Language */}
        <div className="space-y-1">
          <label className="text-[10px] text-app-text-3 uppercase font-bold">Primary Translation</label>
          <select
            value={primaryLang}
            onChange={(e) => setPrimaryLang(e.target.value)}
            className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-bold focus:outline-none"
          >
            <option value="KJV">English (KJV)</option>
            <option value="NIV">English (NIV)</option>
            <option value="ESV">English (ESV)</option>
          </select>
        </div>

        {/* Secondary Language */}
        <div className="space-y-1">
          <label className="text-[10px] text-app-text-3 uppercase font-bold">Secondary Parallel</label>
          <select
            value={secondaryLang}
            onChange={(e) => setSecondaryLang(e.target.value)}
            className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-accent font-bold focus:outline-none"
          >
            <option value="TWI">Asante Twi (TWIBIB)</option>
            <option value="GA">Ga Language (GABIB)</option>
            <option value="EWE">Ewe Language (EWEBIB)</option>
            <option value="SPANISH">Spanish (RVR1960)</option>
          </select>
        </div>

        {/* Book */}
        <div className="space-y-1">
          <label className="text-[10px] text-app-text-3 uppercase font-bold">Book</label>
          <input
            type="text"
            value={book}
            onChange={(e) => setBook(e.target.value)}
            className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-bold focus:outline-none"
          />
        </div>

        {/* Chapter */}
        <div className="space-y-1">
          <label className="text-[10px] text-app-text-3 uppercase font-bold">Chapter</label>
          <input
            type="number"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-bold focus:outline-none"
          />
        </div>

        {/* Verse Start/End */}
        <div className="space-y-1">
          <label className="text-[10px] text-app-text-3 uppercase font-bold">Verses (From - To)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={verseStart}
              onChange={(e) => setVerseStart(e.target.value)}
              className="w-12 bg-app-toolbar border border-app-border rounded-lg px-2 py-2 text-app-text font-bold text-center focus:outline-none"
            />
            <span className="text-app-text-3">-</span>
            <input
              type="number"
              value={verseEnd}
              onChange={(e) => setVerseEnd(e.target.value)}
              className="w-12 bg-app-toolbar border border-app-border rounded-lg px-2 py-2 text-app-text font-bold text-center focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => alert(`Searched ${book} ${chapter}:${verseStart}-${verseEnd}`)}
          className="py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
        >
          Explore Parallel
        </button>
      </div>

      {/* Side-by-Side Dual Column Table View */}
      <div className="flex-1 bg-app-panel border border-app-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-3 bg-app-toolbar border-b border-app-border flex items-center justify-between">
          <span className="text-xs font-bold text-app-text">
            Side-by-Side Dual-Column Scripture Results — {book} {chapter}:{verseStart}-{verseEnd}
          </span>
          <span className="text-[10px] font-mono text-app-accent font-bold">
            {primaryLang} ⚡ {secondaryLang} Parallel Mode
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {verses.map((v) => (
            <div
              key={v.verseNum}
              className="p-4 rounded-xl bg-app-toolbar border border-app-border grid grid-cols-1 md:grid-cols-2 gap-6 hover:border-app-accent transition"
            >
              {/* Column 1: Primary Translation */}
              <div className="space-y-1 border-r border-app-border/40 pr-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-app-accent">
                    {book} {chapter}:{v.verseNum} ({primaryLang})
                  </span>
                  <span className="text-[9px] uppercase font-extrabold text-app-text-3">Primary</span>
                </div>
                <p className="text-xs font-serif leading-relaxed text-app-text">{v.primaryText}</p>
              </div>

              {/* Column 2: Secondary Parallel Translation */}
              <div className="space-y-1 pl-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-app-live">
                    {book} {chapter}:{v.verseNum} ({secondaryLang})
                  </span>
                  <span className="text-[9px] uppercase font-extrabold text-app-text-3">Parallel</span>
                </div>
                <p className="text-xs font-serif leading-relaxed text-app-text font-semibold">{v.secondaryText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
