interface BottomPreviewBarProps {
  currentSlideText?: string
  nextSlideText?: string
  onGoLive?: () => void
  onClear?: () => void
}

export default function BottomPreviewBar({
  currentSlideText = '',
  nextSlideText = '',
  onGoLive,
  onClear
}: BottomPreviewBarProps) {
  return (
    <footer className="h-16 bg-app-toolbar border-t border-app-border px-6 flex items-center justify-between gap-6 select-none z-20">
      {/* Current Slide Preview */}
      <div className="flex-1 flex items-center gap-3 bg-app-panel border border-app-border rounded-lg p-2.5 overflow-hidden shadow-sm">
        <span className="text-[10px] font-black text-app-live uppercase tracking-wider whitespace-nowrap px-2 py-0.5 bg-app-live-bg border border-app-live/30 rounded">
          ON AIR
        </span>
        <p className="text-xs font-bold text-app-text truncate leading-snug">
          {currentSlideText || <span className="text-app-text-3 italic">No active slide projected</span>}
        </p>
      </div>

      {/* Next Slide Preview */}
      <div className="flex-1 flex items-center gap-3 bg-app-panel border border-app-border rounded-lg p-2.5 overflow-hidden shadow-sm">
        <span className="text-[10px] font-black text-app-text-2 uppercase tracking-wider whitespace-nowrap px-2 py-0.5 bg-app-toolbar border border-app-border rounded">
          NEXT PREVIEW
        </span>
        <p className="text-xs font-semibold text-app-text-2 truncate leading-snug">
          {nextSlideText || <span className="text-app-text-3 italic">End of presentation</span>}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onClear}
          className="px-4 py-2 bg-app-panel hover:bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text rounded-lg text-xs font-bold transition duration-150 cursor-pointer shadow-sm"
        >
          Clear Slide
        </button>
        <button
          onClick={onGoLive}
          className="px-5 py-2 bg-app-live hover:opacity-90 active:scale-95 text-white font-black rounded-lg text-xs tracking-wider uppercase transition duration-150 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>GO LIVE</span>
          <span className="text-sm">▶</span>
        </button>
      </div>
    </footer>
  )
}
