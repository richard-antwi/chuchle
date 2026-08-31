import PixiStage from '../PixiStage'

interface OpenLpCenterPanelProps {
  // Staged Preview Item State
  stagedTitle: string
  stagedSlides: string[]
  stagedSlideIndex: number
  onSelectStagedSlide: (index: number) => void
  onSendLive: () => void

  // Live Item State
  liveTitle: string
  liveSlides: string[]
  liveSlideIndex: number
  isBlanked: boolean
  isCleared: boolean
  onSelectLiveSlideDirect: (index: number) => void
  onToggleBlank: () => void
  onToggleClear: () => void
}

export default function OpenLpCenterPanel({
  stagedTitle = 'No item staged',
  stagedSlides = [],
  stagedSlideIndex = 0,
  onSelectStagedSlide,
  onSendLive,

  liveTitle = 'No item live',
  liveSlides = [],
  liveSlideIndex = 0,
  isBlanked = false,
  isCleared = false,
  onSelectLiveSlideDirect,
  onToggleBlank,
  onToggleClear
}: OpenLpCenterPanelProps) {
  return (
    <div className="flex-1 bg-app-bg border-r border-app-border flex min-h-0 select-none">
      {/* LEFT HALF: PREVIEW PANEL (Matching Picture 1) */}
      <div className="flex-1 bg-app-panel border-r border-app-border flex flex-col min-h-0">
        {/* Header Bar */}
        <div className="p-2 border-b border-app-border bg-app-toolbar flex items-center justify-between">
          <span className="text-xs font-bold text-app-text flex items-center gap-1.5 truncate">
            <span>💻</span>
            <span>Preview — {stagedTitle}</span>
          </span>
        </div>

        {/* Top 50%: Verse Text Table (Matching Picture 1 Table View) */}
        <div className="h-1/2 border-b border-app-border overflow-y-auto bg-app-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-app-border text-[10px] text-app-text-3 uppercase bg-app-toolbar">
                <th className="p-1.5 w-8 font-mono">Tag</th>
                <th className="p-1.5 font-bold">Line / Verse Text</th>
              </tr>
            </thead>
            <tbody>
              {stagedSlides.length > 0 ? (
                stagedSlides.map((slide, idx) => {
                  const isSel = stagedSlideIndex === idx
                  const tag = idx === 0 ? 'V1' : idx === 1 ? 'V2' : idx === 2 ? 'C1' : `V${idx + 1}`
                  return (
                    <tr
                      key={idx}
                      onClick={() => onSelectStagedSlide(idx)}
                      onDoubleClick={onSendLive}
                      className={`border-b border-app-border/50 cursor-pointer font-sans transition ${
                        isSel ? 'bg-app-accent text-white font-bold' : 'text-app-text hover:bg-app-toolbar'
                      }`}
                    >
                      <td className="p-1.5 align-top font-mono text-[10px] text-app-text-3 font-bold">{tag}</td>
                      <td className="p-1.5 align-top whitespace-pre-line leading-relaxed">{slide}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-xs text-app-text-3 italic">
                    No slides in preview item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Middle Toolbar */}
        <div className="p-1.5 border-b border-app-border bg-app-toolbar flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              title="Move Previous Slide"
              onClick={() => stagedSlideIndex > 0 && onSelectStagedSlide(stagedSlideIndex - 1)}
              className="p-1 hover:bg-app-border rounded text-xs text-app-text-2 hover:text-app-text transition cursor-pointer"
            >
              ↑
            </button>
            <button
              title="Move Next Slide"
              onClick={() => stagedSlideIndex < stagedSlides.length - 1 && onSelectStagedSlide(stagedSlideIndex + 1)}
              className="p-1 hover:bg-app-border rounded text-xs text-app-text-2 hover:text-app-text transition cursor-pointer"
            >
              ↓
            </button>
          </div>

          <button
            onClick={onSendLive}
            className="px-3 py-1 bg-app-accent hover:opacity-90 text-white font-extrabold rounded text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>SEND LIVE ▶</span>
          </button>
        </div>

        {/* Bottom 50%: Slide Canvas Preview */}
        <div className="flex-1 bg-black flex items-center justify-center p-3 overflow-hidden relative">
          <div className="w-full aspect-video bg-black rounded border border-app-border flex items-center justify-center p-4 text-center text-white text-base md:text-lg font-bold shadow-inner overflow-hidden select-none">
            {stagedSlides[stagedSlideIndex] ? (
              <div className="whitespace-pre-line leading-relaxed">{stagedSlides[stagedSlideIndex]}</div>
            ) : (
              <span className="text-app-text-3 italic text-xs">Preview Canvas Standby</span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT HALF: LIVE PANEL (Matching Picture 1) */}
      <div className="flex-1 bg-app-panel flex flex-col min-h-0">
        {/* Header Bar */}
        <div className="p-2 border-b border-app-border bg-app-live-bg flex items-center justify-between">
          <span className="text-xs font-bold text-app-live flex items-center gap-1.5 truncate">
            <span className="h-2 w-2 rounded-full bg-app-live animate-pulse" />
            <span>Live — {liveTitle}</span>
          </span>
        </div>

        {/* Top 50%: Live Verse Text Table (Matching Picture 1 Table View) */}
        <div className="h-1/2 border-b border-app-border overflow-y-auto bg-app-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-app-border text-[10px] text-app-text-3 uppercase bg-app-toolbar">
                <th className="p-1.5 w-8 font-mono">Tag</th>
                <th className="p-1.5 font-bold">Line / Verse Text</th>
              </tr>
            </thead>
            <tbody>
              {liveSlides.length > 0 ? (
                liveSlides.map((slide, idx) => {
                  const isSel = liveSlideIndex === idx
                  const tag = idx === 0 ? 'V1' : idx === 1 ? 'V2' : idx === 2 ? 'C1' : `V${idx + 1}`
                  return (
                    <tr
                      key={idx}
                      onClick={() => onSelectLiveSlideDirect(idx)}
                      className={`border-b border-app-border/50 cursor-pointer font-sans transition ${
                        isSel ? 'bg-app-accent text-white font-bold' : 'text-app-text hover:bg-app-toolbar'
                      }`}
                    >
                      <td className="p-1.5 align-top font-mono text-[10px] text-app-text-3 font-bold">{tag}</td>
                      <td className="p-1.5 align-top whitespace-pre-line leading-relaxed">{slide}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-xs text-app-text-3 italic">
                    No slides live
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Middle Toolbar */}
        <div className="p-1.5 border-b border-app-border bg-app-toolbar flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              title="Previous Live Slide"
              onClick={() => liveSlideIndex > 0 && onSelectLiveSlideDirect(liveSlideIndex - 1)}
              className="p-1 hover:bg-app-border rounded text-xs text-app-text-2 hover:text-app-text transition cursor-pointer"
            >
              ↑
            </button>
            <button
              title="Next Live Slide"
              onClick={() => liveSlideIndex < liveSlides.length - 1 && onSelectLiveSlideDirect(liveSlideIndex + 1)}
              className="p-1 hover:bg-app-border rounded text-xs text-app-text-2 hover:text-app-text transition cursor-pointer"
            >
              ↓
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleBlank}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                isBlanked ? 'bg-app-live text-white' : 'bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text'
              }`}
            >
              📺 {isBlanked ? 'Unblank' : 'Blank'}
            </button>
            <button
              onClick={onToggleClear}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                isCleared ? 'bg-app-accent text-white' : 'bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text'
              }`}
            >
              ✉️ {isCleared ? 'Restore' : 'Clear'}
            </button>
          </div>
        </div>

        {/* Bottom 50%: Live WebGL Slide Canvas */}
        <div className="flex-1 bg-black flex items-center justify-center p-3 overflow-hidden relative">
          <div className="w-full aspect-video bg-black rounded border-2 border-app-live flex items-center justify-center p-4 text-center text-white text-base md:text-lg font-bold shadow-lg overflow-hidden select-none relative">
            {isBlanked ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center text-app-text-3 text-xs uppercase font-extrabold tracking-widest">
                [ LIVE SCREEN BLANKED ]
              </div>
            ) : isCleared ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-app-text-3 text-xs uppercase font-extrabold tracking-widest">
                [ TEXT OVERLAY CLEARED ]
              </div>
            ) : liveSlides[liveSlideIndex] ? (
              <PixiStage />
            ) : (
              <span className="text-app-text-3 italic text-xs">No live output projected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
