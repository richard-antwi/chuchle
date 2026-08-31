import { useDisplayStore } from '../stores/useDisplayStore'

export default function FoyerView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)

  return (
    <div className="h-screen w-screen bg-app-bg text-app-text font-sans flex flex-col justify-between select-none">
      {/* Top Banner */}
      <header className="bg-app-toolbar border-b border-app-border px-8 py-4 flex justify-between items-center shadow-sm">
        <span className="text-2xl font-black tracking-widest text-app-text">WELCOME TO SANCTUARY</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-app-accent-bg border border-app-accent/30 rounded-full">
          <span className="h-2 w-2 rounded-full bg-app-accent animate-pulse" />
          <span className="text-xs font-extrabold text-app-accent uppercase tracking-wider">LIVE SANCTUARY FEED</span>
        </div>
      </header>

      {/* Main Grid: Left Schedule, Right Live Lyrics */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-8 overflow-hidden">
        {/* Left Side: Schedule */}
        <div className="md:col-span-1 bg-app-panel border border-app-border rounded-xl p-5 flex flex-col shadow-sm">
          <h2 className="text-sm font-extrabold text-app-text border-b border-app-border pb-3 mb-4 uppercase tracking-wider">
            TODAY'S SERVICE SCHEDULE
          </h2>
          <ul className="space-y-4 text-sm flex-1">
            <li className="flex gap-4">
              <span className="text-app-accent font-mono font-bold">09:00 AM</span>
              <span className="text-app-text-2 font-medium">Opening Hymn & Prayers</span>
            </li>
            <li className="flex gap-4">
              <span className="text-app-accent font-mono font-bold">09:30 AM</span>
              <span className="text-app-text-2 font-medium">Praise and Worship</span>
            </li>
            <li className="flex gap-4 border-l-2 border-app-accent pl-3 bg-app-accent-bg/40 py-1.5 rounded-r">
              <span className="text-app-accent font-mono font-extrabold">10:00 AM</span>
              <span className="text-app-text font-extrabold">Sermon: "Walking by Faith"</span>
            </li>
            <li className="flex gap-4">
              <span className="text-app-accent font-mono font-bold">10:45 AM</span>
              <span className="text-app-text-2 font-medium">Tithes, Offering & Benediction</span>
            </li>
          </ul>
        </div>

        {/* Right Side: Live Lyrics Display */}
        <div className="md:col-span-2 bg-app-panel border border-app-border rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-sm">
          <div className="absolute top-4 left-6 text-xs font-extrabold text-app-accent uppercase tracking-widest">
            SANCTUARY LYRIC OVERLAY
          </div>
          <div className="text-3xl md:text-5xl font-extrabold text-app-text text-center leading-relaxed max-w-xl whitespace-pre-wrap">
            {lyrics.length > 0 ? (
              lyrics.join('\n')
            ) : (
              <span className="text-app-text-3 italic text-2xl">Sanctuary lyrics feed standby</span>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Announcements Marquee */}
      <footer className="bg-app-toolbar border-t border-app-border py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-xs font-bold text-app-text-2 tracking-wider uppercase">
          ANNOUNCEMENT: Youth camp registration closes this Wednesday. Join us for mid-week bible study every Wednesday at 7 PM.
        </div>
      </footer>
    </div>
  )
}
