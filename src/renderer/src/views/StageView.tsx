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
    <div className="h-screen w-screen bg-black text-yellow-400 font-sans p-8 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <header className="flex justify-between items-center border-b-2 border-yellow-400/40 pb-4">
        <span className="text-xl font-bold tracking-widest text-slate-400 uppercase">STAGE CONFIDENCE DISPLAY</span>
        <span className="text-3xl font-mono font-bold">{time}</span>
      </header>

      {/* Main Lyric Display Area */}
      <main className="flex-1 flex flex-col justify-center py-10">
        <div className="text-sm font-semibold tracking-wider text-slate-500 mb-2 uppercase">CURRENT SLIDE</div>
        <div className="text-5xl md:text-7xl font-extrabold leading-tight tracking-wide text-yellow-400 whitespace-pre-wrap">
          {lyrics.join('\n')}
        </div>
      </main>

      {/* Bottom Row: Next Slide Preview & Chords */}
      <footer className="border-t-2 border-yellow-400/40 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span className="text-sm font-semibold tracking-wider text-slate-500 block uppercase">NEXT SLIDE PREVIEW</span>
          <span className="text-2xl font-bold text-slate-300 italic mt-2 block whitespace-pre-wrap">
            {stageInfo.nextVerse || 'End of Song'}
          </span>
        </div>
        {stageInfo.chords && (
          <div className="bg-slate-900 border border-yellow-400/30 rounded-lg p-4">
            <span className="text-sm font-semibold tracking-wider text-slate-500 block uppercase">ACTIVE CHORDS</span>
            <span className="text-2xl font-mono font-bold text-yellow-500 mt-2 block tracking-wider">
              {stageInfo.chords}
            </span>
          </div>
        )}
      </footer>
    </div>
  )
}
