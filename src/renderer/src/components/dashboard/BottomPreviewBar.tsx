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
    <footer className="h-16 bg-[#0B0E14] border-t border-[#232B38] px-6 flex items-center justify-between gap-6 select-none z-20">
      {/* Current Slide Preview */}
      <div className="flex-1 flex items-center gap-3 bg-[#141922] border border-[#232B38] rounded-lg p-2.5 overflow-hidden">
        <span className="text-[10px] font-extrabold text-[#F5A623] uppercase tracking-wider whitespace-nowrap px-1.5 py-0.5 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded">
          ON AIR
        </span>
        <p className="text-xs font-semibold text-[#E8EAED] truncate leading-snug">
          {currentSlideText || <span className="text-slate-600 italic">No active slide projected</span>}
        </p>
      </div>

      {/* Next Slide Preview */}
      <div className="flex-1 flex items-center gap-3 bg-[#141922] border border-[#232B38] rounded-lg p-2.5 overflow-hidden">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
          NEXT PREVIEW
        </span>
        <p className="text-xs font-medium text-slate-300 truncate leading-snug">
          {nextSlideText || <span className="text-slate-600 italic">End of presentation</span>}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onClear}
          className="px-4 py-2 bg-[#141922] hover:bg-[#232B38] border border-[#232B38] text-slate-300 hover:text-white rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
        >
          Clear Slide
        </button>
        <button
          onClick={onGoLive}
          className="px-5 py-2 bg-[#F5A623] hover:bg-[#d98f19] active:scale-95 text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase transition duration-150 shadow-lg shadow-[#F5A623]/20 flex items-center gap-1.5 cursor-pointer"
        >
          <span>GO LIVE</span>
          <span className="text-sm">▶</span>
        </button>
      </div>
    </footer>
  )
}
