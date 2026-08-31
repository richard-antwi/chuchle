import { useState } from 'react'
import { ServiceQueueItem } from '../../components/dashboard/OrderOfServicePanel'

interface PresentationsTabProps {
  onAddToService?: (item: ServiceQueueItem) => void
  onSendLiveDirect?: (item: ServiceQueueItem) => void
}

interface PresentationDeck {
  id: string
  name: string
  pageCount: number
  slides: string[]
}

export default function PresentationsTab({ onAddToService, onSendLiveDirect }: PresentationsTabProps) {
  const [decks] = useState<PresentationDeck[]>([
    {
      id: 'deck_sermon',
      name: 'Sunday_Sermon_Walking_By_Faith.pdf',
      pageCount: 4,
      slides: [
        'Slide 1: Walking by Faith — Pastor Richard',
        'Slide 2: Scripture Reading — 2 Corinthians 5:1-10',
        'Slide 3: Point 1: Faith replaces Fear with Trust',
        'Slide 4: Conclusion: Living for Eternity'
      ]
    },
    {
      id: 'deck_vision',
      name: 'Vision_2026_Building_Project.pdf',
      pageCount: 3,
      slides: [
        'Slide 1: Sanctuary Expansion Project 2026',
        'Slide 2: Architectural Layout & Seating Goal (1,500 Capacity)',
        'Slide 3: Financial Target & Pledge Sunday Details'
      ]
    }
  ])

  const [selectedDeckId, setSelectedDeckId] = useState<string>('deck_sermon')
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0)

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0]

  const handleQueueDeck = () => {
    if (!activeDeck || !onAddToService) return
    const queueItem: ServiceQueueItem = {
      id: `svc_deck_${Date.now()}`,
      title: activeDeck.name.replace('.pdf', ''),
      sub: `${activeDeck.pageCount} PDF presentation slides`,
      type: 'song',
      slides: activeDeck.slides
    }
    onAddToService(queueItem)
  }

  const handleSendSlideLive = (slideText: string) => {
    if (!onSendLiveDirect) return
    const queueItem: ServiceQueueItem = {
      id: `svc_slide_${Date.now()}`,
      title: `${activeDeck.name} (Slide ${selectedPageIndex + 1})`,
      sub: 'PDF slide projection',
      type: 'song',
      slides: [slideText]
    }
    onSendLiveDirect(queueItem)
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
          <span>📊</span>
          Presentation Decks & Sermon PDF Importer
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Open PDF Dialog triggered.')}
            className="px-3.5 py-1.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>📂</span>
            <span>Import PDF / Presentation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Installed Decks List */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-black text-app-accent uppercase tracking-wider">Loaded Presentation Decks</span>

            <div className="space-y-2">
              {decks.map((deck) => {
                const isSel = selectedDeckId === deck.id
                return (
                  <div
                    key={deck.id}
                    onClick={() => {
                      setSelectedDeckId(deck.id)
                      setSelectedPageIndex(0)
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSel
                        ? 'bg-app-accent-bg border-app-accent text-white font-bold shadow-sm'
                        : 'bg-app-toolbar border-app-border text-app-text hover:border-app-border-strong'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2">
                      <div className="text-xs truncate font-bold">{deck.name}</div>
                      <div className={`text-[10px] font-normal ${isSel ? 'text-blue-100' : 'text-app-text-3'}`}>
                        {deck.pageCount} Pages • PDF Document
                      </div>
                    </div>
                    <span className="text-xs">📄</span>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleQueueDeck}
            className="w-full py-2.5 bg-app-toolbar border border-app-border hover:bg-app-bg text-app-text font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Entire Deck to Service Queue</span>
          </button>
        </div>

        {/* Middle & Right 2 Columns: Slide Thumbnail Grid & Interactive Preview */}
        <div className="md:col-span-2 bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <span className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center justify-between">
              <span>Slide Page Thumbnails ({activeDeck.slides.length} Slides)</span>
              <span className="text-[10px] text-app-text-3 font-mono">{activeDeck.name}</span>
            </span>

            {/* Slide Page Thumbnail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeDeck.slides.map((slideText, idx) => {
                const isSel = selectedPageIndex === idx
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPageIndex(idx)}
                    onDoubleClick={() => handleSendSlideLive(slideText)}
                    className={`aspect-video rounded-lg border-2 p-2 flex flex-col justify-between text-[10px] font-semibold transition cursor-pointer ${
                      isSel
                        ? 'bg-app-accent text-white border-app-accent shadow-md font-bold'
                        : 'bg-app-toolbar border-app-border text-app-text hover:border-app-border-strong'
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-75">Page {idx + 1}</span>
                    <div className="truncate font-sans leading-tight my-auto">{slideText}</div>
                    <span className="text-[8px] opacity-50 text-right">PDF Slide</span>
                  </div>
                )
              })}
            </div>

            {/* Large Slide Preview Box */}
            <div className="flex-1 bg-black rounded-xl border border-app-border p-6 flex flex-col items-center justify-center text-center text-white space-y-2 relative overflow-hidden">
              <div className="text-xs font-mono text-app-accent font-bold uppercase tracking-widest">
                [ Slide Page {selectedPageIndex + 1} Preview ]
              </div>
              <div className="text-lg md:text-xl font-bold max-w-lg leading-relaxed">
                {activeDeck.slides[selectedPageIndex]}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-3 border-t border-app-border">
            <button
              onClick={() => handleSendSlideLive(activeDeck.slides[selectedPageIndex])}
              className="px-5 py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>▶</span>
              <span>Send Selected Page Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
