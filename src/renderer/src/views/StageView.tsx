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
    <div className="h-screen w-screen bg-[#eef0f3] text-[#22262c] font-sans p-8 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <header className="flex justify-between items-center border-b border-[#d7dbe1] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold tracking-widest text-[#5b6270] uppercase">
            STAGE CONFIDENCE DISPLAY
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#fdeceb] border border-[#f4c6c2]">
            <span className="h-2 w-2 rounded-full bg-[#d8352c] animate-pulse" />
            <span className="font-mono font-bold text-[10px] tracking-wider text-[#d8352c] uppercase">
              LIVE ON AIR
            </span>
          </div>
        </div>
        <span className="text-3xl font-mono font-bold text-[#22262c]">{time}</span>
      </header>

      {/* Main Lyric Display Area */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="text-xs font-extrabold tracking-wider text-[#2f6fed] mb-3 uppercase">
          CURRENT SLIDE
        </div>
        <div className="text-5xl md:text-7xl font-extrabold leading-tight tracking-wide text-[#22262c] whitespace-pre-wrap">
          {lyrics.length > 0 ? (
            lyrics.join('\n')
          ) : (
            <span className="text-[#9399a4] italic text-4xl">No active slide text</span>
          )}
        </div>
      </main>

      {/* Bottom Row: Next Slide Preview & Chords */}
      <footer className="border-t border-[#d7dbe1] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#d7dbe1] p-5 rounded-lg">
          <span className="text-xs font-extrabold tracking-wider text-[#5b6270] block uppercase">
            NEXT SLIDE PREVIEW
          </span>
          <span className="text-2xl font-bold text-[#22262c] italic mt-2 block whitespace-pre-wrap">
            {stageInfo.nextVerse || 'End of presentation'}
          </span>
        </div>
        {stageInfo.chords && (
          <div className="bg-white border border-[#d7dbe1] p-5 rounded-lg">
            <span className="text-xs font-extrabold tracking-wider text-[#5b6270] block uppercase">
              ACTIVE CHORDS
            </span>
            <span className="text-2xl font-mono font-extrabold text-[#2f6fed] mt-2 block tracking-wider">
              {stageInfo.chords}
            </span>
          </div>
        )}
      </footer>
    </div>
  )
}
