interface PreviewStagePanelProps {
  itemTitle?: string
  slideText?: string
  slides?: string[]
  selectedIndex?: number
  onSelectSlide: (index: number) => void
  onSendLive: () => void
}

export default function PreviewStagePanel({
  itemTitle = 'No item staged',
  slideText = '',
  slides = [],
  selectedIndex = 0,
  onSelectSlide,
  onSendLive
}: PreviewStagePanelProps) {
  return (
    <div className="mockup-panel mockup-stage flex-1 border-r border-app-border">
      <div className="stage-split h-full flex flex-col justify-between">
        {/* Header Label */}
        <div className="stage-label prev flex items-center justify-between px-3 py-2 border-b border-app-border bg-app-toolbar">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-wider text-app-text-2 uppercase">
              PREVIEW (STAGING AREA)
            </span>
          </div>
          <span className="text-[10px] font-mono text-app-accent font-extrabold truncate max-w-[160px]">
            {itemTitle}
          </span>
        </div>

        {/* Staged Large Slide Display */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-0 overflow-hidden">
          <div className="slide-canvas w-full max-w-xl aspect-video bg-black rounded-lg border border-app-border flex items-center justify-center p-6 text-center text-white text-xl md:text-2xl font-bold shadow-sm overflow-hidden select-none">
            {slideText ? (
              <div className="whitespace-pre-line leading-relaxed">{slideText}</div>
            ) : (
              <span className="text-app-text-3 italic text-sm">Select a service item to preview</span>
            )}
          </div>
        </div>

        {/* Thumbnail Row */}
        {slides.length > 0 && (
          <div className="thumb-row p-3 border-t border-app-border bg-app-toolbar overflow-x-auto flex gap-2">
            {slides.map((st, idx) => {
              const isSel = selectedIndex === idx
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSlide(idx)}
                  className={`thumb flex-shrink-0 w-24 aspect-video rounded border-2 p-1 text-[9px] font-semibold text-white bg-black flex items-center justify-center text-center cursor-pointer transition ${
                    isSel ? 'border-app-accent shadow-md scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="truncate whitespace-pre-line max-h-full">{st}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Send Live Commit Button */}
        <div className="p-3 border-t border-app-border bg-app-panel">
          <button
            onClick={onSendLive}
            disabled={!slideText}
            className="w-full py-2.5 bg-app-accent hover:opacity-90 active:scale-98 disabled:opacity-40 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>SEND LIVE TO CONGREGATION</span>
            <span className="text-sm">▶</span>
          </button>
        </div>
      </div>
    </div>
  )
}
