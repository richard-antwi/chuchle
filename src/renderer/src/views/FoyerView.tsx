import { useDisplayStore } from '../stores/useDisplayStore'

export default function FoyerView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)

  return (
    <div className="h-screen w-screen bg-[#eef0f3] text-[#22262c] font-sans flex flex-col justify-between select-none">
      {/* Top Banner */}
      <header className="bg-[#f6f7f9] border-b border-[#d7dbe1] px-8 py-4 flex justify-between items-center shadow-sm">
        <span className="text-2xl font-black tracking-widest text-[#22262c]">WELCOME TO SANCTUARY</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#e8f0fe] border border-[#c6d9fb] rounded-full">
          <span className="h-2 w-2 rounded-full bg-[#2f6fed] animate-pulse" />
          <span className="text-xs font-extrabold text-[#2f6fed] uppercase tracking-wider">LIVE SANCTUARY FEED</span>
        </div>
      </header>

      {/* Main Grid: Left Schedule, Right Live Lyrics */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-8 overflow-hidden">
        {/* Left Side: Schedule */}
        <div className="md:col-span-1 bg-white border border-[#d7dbe1] rounded-xl p-5 flex flex-col shadow-sm">
          <h2 className="text-sm font-extrabold text-[#22262c] border-b border-[#d7dbe1] pb-3 mb-4 uppercase tracking-wider">
            TODAY'S SERVICE SCHEDULE
          </h2>
          <ul className="space-y-4 text-sm flex-1">
            <li className="flex gap-4">
              <span className="text-[#2f6fed] font-mono font-bold">09:00 AM</span>
              <span className="text-[#5b6270] font-medium">Opening Hymn & Prayers</span>
            </li>
            <li className="flex gap-4">
              <span className="text-[#2f6fed] font-mono font-bold">09:30 AM</span>
              <span className="text-[#5b6270] font-medium">Praise and Worship</span>
            </li>
            <li className="flex gap-4 border-l-2 border-[#2f6fed] pl-3 bg-[#e8f0fe]/40 py-1.5 rounded-r">
              <span className="text-[#2f6fed] font-mono font-extrabold">10:00 AM</span>
              <span className="text-[#22262c] font-extrabold">Sermon: "Walking by Faith"</span>
            </li>
            <li className="flex gap-4">
              <span className="text-[#2f6fed] font-mono font-bold">10:45 AM</span>
              <span className="text-[#5b6270] font-medium">Tithes, Offering & Benediction</span>
            </li>
          </ul>
        </div>

        {/* Right Side: Live Lyrics Display */}
        <div className="md:col-span-2 bg-white border border-[#d7dbe1] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-sm">
          <div className="absolute top-4 left-6 text-xs font-extrabold text-[#2f6fed] uppercase tracking-widest">
            SANCTUARY LYRIC OVERLAY
          </div>
          <div className="text-3xl md:text-5xl font-extrabold text-[#22262c] text-center leading-relaxed max-w-xl whitespace-pre-wrap">
            {lyrics.length > 0 ? (
              lyrics.join('\n')
            ) : (
              <span className="text-[#9399a4] italic text-2xl">Sanctuary lyrics feed standby</span>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Announcements Marquee */}
      <footer className="bg-[#f6f7f9] border-t border-[#d7dbe1] py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-xs font-bold text-[#5b6270] tracking-wider uppercase">
          ANNOUNCEMENT: Youth camp registration closes this Wednesday. Join us for mid-week bible study every Wednesday at 7 PM.
        </div>
      </footer>
    </div>
  )
}
