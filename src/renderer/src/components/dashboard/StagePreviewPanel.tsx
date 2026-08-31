interface StagePreviewPanelProps {
  liveText: string
  nextText: string
  slides: string[]
  currentSlideIndex: number
  onSelectSlideIndex: (index: number) => void
}

export default function StagePreviewPanel({
  liveText,
  nextText,
  slides,
  currentSlideIndex,
  onSelectSlideIndex
}: StagePreviewPanelProps) {
  return (
    <div className="mockup-panel mockup-stage">
      <div className="stage-split">
        {/* Top Block: Live Output */}
        <div className="stage-block">
          <div className="stage-label live">
            <span className="live-dot" />
            Live output
          </div>
          <div className="slide-canvas">
            {liveText ? (
              <div className="whitespace-pre-line">{liveText}</div>
            ) : (
              <span className="text-slate-600 italic text-sm">No live output</span>
            )}
          </div>
          <div className="thumb-row">
            {slides.map((sText, idx) => {
              const isCurrent = currentSlideIndex === idx
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSlideIndex(idx)}
                  className={`thumb ${isCurrent ? 'on-air' : ''}`}
                >
                  <div className="whitespace-pre-line">{sText}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Block: Preview Next Slide */}
        <div className="stage-block">
          <div className="stage-label prev">Preview — next slide</div>
          <div className="slide-canvas" style={{ fontSize: '20px' }}>
            {nextText ? (
              <div className="whitespace-pre-line">{nextText}</div>
            ) : (
              <span className="text-slate-600 italic text-sm">End of song / presentation</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
