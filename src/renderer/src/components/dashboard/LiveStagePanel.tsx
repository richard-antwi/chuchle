import PixiStage from '../PixiStage'

interface LiveStagePanelProps {
  itemTitle?: string
  slideText?: string
  slides?: string[]
  selectedIndex?: number
  isBlanked?: boolean
  isCleared?: boolean
  onSelectSlideDirect: (index: number) => void
  onToggleBlank: () => void
  onToggleClear: () => void
}

export default function LiveStagePanel({
  itemTitle = 'No item live',
  slideText = '',
  slides = [],
  selectedIndex = 0,
  isBlanked = false,
  isCleared = false,
  onSelectSlideDirect,
  onToggleBlank,
  onToggleClear
}: LiveStagePanelProps) {
  return (
    <div className="mockup-panel mockup-stage flex-1 border-l border-app-border">
      <div className="stage-split h-full flex flex-col justify-between">
        {/* Header Label with Red Live Indicator */}
        <div className="stage-label live flex items-center justify-between px-3 py-2 border-b border-app-border bg-app-live-bg">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-app-live animate-pulse" />
            <span className="text-[11px] font-black tracking-wider text-app-live uppercase">
              LIVE (ON AIR OUTPUT)
            </span>
          </div>
          <span className="text-[10px] font-mono text-app-live font-extrabold truncate max-w-[160px]">
            {itemTitle}
          </span>
        </div>

        {/* Live Output Viewport Card (Red Border) */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-0 overflow-hidden">
          <div className="slide-canvas w-full max-w-xl aspect-video bg-black rounded-lg border-2 border-app-live flex items-center justify-center p-6 text-center text-white text-xl md:text-2xl font-bold shadow-lg overflow-hidden relative select-none">
            {isBlanked ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center text-app-text-3 text-xs uppercase font-extrabold tracking-widest">
                [ LIVE SCREEN BLANKED / BLACK ]
              </div>
            ) : isCleared ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-app-text-3 text-xs uppercase font-extrabold tracking-widest">
                [ TEXT OVERLAY CLEARED ]
              </div>
            ) : slideText ? (
              <PixiStage />
            ) : (
              <span className="text-app-text-3 italic text-sm">No live output projected</span>
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
                  onClick={() => onSelectSlideDirect(idx)}
                  className={`thumb flex-shrink-0 w-24 aspect-video rounded border-2 p-1 text-[9px] font-semibold text-white bg-black flex items-center justify-center text-center cursor-pointer transition ${
                    isSel ? 'border-app-live shadow-md scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="truncate whitespace-pre-line max-h-full">{st}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Blank / Clear Hotkey Controls */}
        <div className="p-3 border-t border-app-border bg-app-panel grid grid-cols-2 gap-2">
          <button
            onClick={onToggleBlank}
            className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              isBlanked
                ? 'bg-app-live text-white shadow-sm'
                : 'bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text'
            }`}
          >
            {isBlanked ? 'Unblank Screen (Esc)' : 'Blank Screen (Esc)'}
          </button>
          <button
            onClick={onToggleClear}
            className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              isCleared
                ? 'bg-app-accent text-white shadow-sm'
                : 'bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text'
            }`}
          >
            {isCleared ? 'Restore Text (C)' : 'Clear Text (C)'}
          </button>
        </div>
      </div>
    </div>
  )
}
