import { useDisplayStore } from '../stores/useDisplayStore'

export default function FoyerView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between select-none">
      {/* Top Banner */}
      <header className="bg-indigo-900 px-8 py-4 flex justify-between items-center shadow-lg">
        <span className="text-2xl font-black tracking-widest text-indigo-100">WELCOME TO SANCTUARY</span>
        <span className="text-sm font-semibold bg-indigo-800 px-3 py-1 rounded-full text-indigo-300">LIVE FEED</span>
      </header>

      {/* Main Grid: Left Schedule, Right Live Lyrics */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-8 overflow-hidden">
        {/* Left Side: Schedule */}
        <div className="md:col-span-1 bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 flex flex-col">
          <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-3 mb-4">TODAY'S SCHEDULE</h2>
          <ul className="space-y-4 text-sm flex-1">
            <li className="flex gap-4">
              <span className="text-indigo-400 font-mono font-semibold">09:00 AM</span>
              <span className="text-slate-300 font-medium">Opening Hymn & Prayers</span>
            </li>
            <li className="flex gap-4">
              <span className="text-indigo-400 font-mono font-semibold">09:30 AM</span>
              <span className="text-slate-300 font-medium">Praise and Worship</span>
            </li>
            <li className="flex gap-4 border-l-2 border-indigo-500 pl-3">
              <span className="text-indigo-400 font-mono font-semibold">10:00 AM</span>
              <span className="text-slate-100 font-bold">Sermon: "Walking by Faith"</span>
            </li>
            <li className="flex gap-4">
              <span className="text-indigo-400 font-mono font-semibold">10:45 AM</span>
              <span className="text-slate-300 font-medium">Tithes, Offering & Benediction</span>
            </li>
          </ul>
        </div>

        {/* Right Side: Live Lyrics Display */}
        <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/50 rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-4 left-6 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            SANCTUARY LYRIC OVERLAY
          </div>
          <div className="text-3xl md:text-5xl font-extrabold text-slate-200 text-center leading-relaxed max-w-xl whitespace-pre-wrap">
            {lyrics.join('\n')}
          </div>
        </div>
      </main>

      {/* Bottom Announcements Marquee */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-sm font-semibold text-indigo-300 tracking-wider">
          📢 ANNOUNCEMENT: Youth camp registration closes this Wednesday. Join us for mid-week bible study every Wednesday at 7 PM.
        </div>
      </footer>
    </div>
  )
}
