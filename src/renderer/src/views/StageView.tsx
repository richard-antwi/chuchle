import { useState, useEffect } from 'react'
import { useDisplayStore } from '../stores/useDisplayStore'

export default function StageView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)
  const stageInfo = useDisplayStore((state) => state.stageInfo)
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen w-screen bg-app-bg text-app-text font-sans p-8 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <header className="flex justify-between items-center border-b border-app-border pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold tracking-widest text-app-text-2 uppercase">
            STAGE CONFIDENCE DISPLAY
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-app-live-bg border border-app-live/30">
            <span className="h-2 w-2 rounded-full bg-app-live animate-pulse" />
            <span className="font-mono font-bold text-[10px] tracking-wider text-app-live uppercase">
              LIVE ON AIR
            </span>
          </div>
        </div>
        <span className="text-3xl font-mono font-bold text-app-text">{time}</span>
      </header>

      {/* Main Lyric Display Area */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="text-xs font-extrabold tracking-wider text-app-accent mb-3 uppercase">
          CURRENT SLIDE
        </div>
        <div className="text-5xl md:text-7xl font-extrabold leading-tight tracking-wide text-app-text whitespace-pre-wrap">
          {lyrics.length > 0 ? (
            lyrics.join('\n')
          ) : (
            <span className="text-app-text-3 italic text-4xl">No active slide text</span>
          )}
        </div>
      </main>

      {/* Bottom Row: Next Slide Preview & Chords */}
      <footer className="border-t border-app-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-app-panel border border-app-border p-5 rounded-lg shadow-sm">
          <span className="text-xs font-extrabold tracking-wider text-app-text-2 block uppercase">
            NEXT SLIDE PREVIEW
          </span>
          <span className="text-2xl font-bold text-app-text italic mt-2 block whitespace-pre-wrap">
            {stageInfo.nextVerse || 'End of presentation'}
          </span>
        </div>
        {stageInfo.chords && (
          <div className="bg-app-panel border border-app-border p-5 rounded-lg shadow-sm">
            <span className="text-xs font-extrabold tracking-wider text-app-text-2 block uppercase">
              ACTIVE CHORDS
            </span>
            <span className="text-2xl font-mono font-extrabold text-app-accent mt-2 block tracking-wider">
              {stageInfo.chords}
            </span>
          </div>
        )}
      </footer>
    </div>
  )
}
