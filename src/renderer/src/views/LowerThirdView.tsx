import { useDisplayStore } from '../stores/useDisplayStore'

export default function LowerThirdView() {
  const lyrics = useDisplayStore((state) => state.currentLyrics)
  const theme = useDisplayStore((state) => state.activeTheme)

  return (
    <div className="h-screen w-screen bg-transparent text-app-text flex flex-col justify-end p-10 overflow-hidden select-none">
      {lyrics.length > 0 && (
        <div
          className="w-full max-w-5xl mx-auto mb-4 bg-app-panel/95 border-l-4 border-l-app-accent border border-app-border rounded-xl px-10 py-5 shadow-2xl backdrop-blur-sm flex items-center justify-center min-h-[85px] transition duration-200"
          style={{ fontFamily: theme.fontFamily || 'Arial' }}
        >
          <p className="text-xl sm:text-2xl font-black text-center leading-relaxed text-app-text tracking-wide whitespace-pre-line drop-shadow-sm">
            {lyrics.join('\n')}
          </p>
        </div>
      )}
    </div>
  )
}
