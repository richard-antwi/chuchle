import { useDisplayStore } from '../stores/useDisplayStore'

export default function LowerThirdView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)
  const theme = useDisplayStore((state) => state.activeTheme)

  return (
    <div className="h-screen w-screen bg-transparent text-[#22262c] flex flex-col justify-end p-10 overflow-hidden select-none">
      {lyrics.length > 0 && (
        <div
          className="w-full max-w-5xl mx-auto mb-4 bg-white/95 border-l-4 border-l-[#2f6fed] border border-[#d7dbe1] rounded-xl px-10 py-5 shadow-2xl backdrop-blur-sm flex items-center justify-center min-h-[85px] transition duration-200"
          style={{ fontFamily: theme.fontFamily || 'Arial' }}
        >
          <p className="text-xl sm:text-2xl font-black text-center leading-relaxed text-[#22262c] tracking-wide whitespace-pre-line drop-shadow-sm">
            {lyrics.join('\n')}
          </p>
        </div>
      )}
    </div>
  )
}
