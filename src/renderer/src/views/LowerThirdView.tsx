import { useDisplayStore } from '../stores/useDisplayStore'

export default function LowerThirdView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)
  const theme = useDisplayStore((state) => state.activeTheme)

  return (
    <div className="h-screen w-screen bg-transparent text-slate-100 flex flex-col justify-end p-12 overflow-hidden select-none">
      {lyrics.length > 0 && (
        <div
          className="w-full max-w-5xl mx-auto mb-4 bg-slate-950/85 border border-slate-900/50 rounded-2xl px-10 py-6 backdrop-blur-md shadow-2xl flex items-center justify-center min-h-[90px] transition duration-200"
          style={{ fontFamily: theme.fontFamily || 'Arial' }}
        >
          <p className="text-xl sm:text-2xl font-extrabold text-center leading-relaxed text-slate-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] tracking-wide whitespace-pre-line">
            {lyrics.join('\n')}
          </p>
        </div>
      )}
    </div>
  )
}
