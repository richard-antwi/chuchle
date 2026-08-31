interface DashboardToolbarProps {
  activeMode: string
  onModeChange: (mode: string) => void
  isLive?: boolean
}

export default function DashboardToolbar({
  activeMode,
  onModeChange,
  isLive = true
}: DashboardToolbarProps) {
  return (
    <div className="toolbar">
      {/* File Action Buttons */}
      <button className="tbtn">
        <svg viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New service
      </button>

      <button className="tbtn">
        <svg viewBox="0 0 24 24">
          <path d="M4 4h16v16H4z" />
          <path d="M4 9h16" />
        </svg>
        Open
      </button>

      <button className="tbtn">
        <svg viewBox="0 0 24 24">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v6h8V4" />
        </svg>
        Save
      </button>

      <div className="tdiv" />

      {/* Mode Switcher Buttons */}
      <button
        onClick={() => onModeChange('slides')}
        className={`tbtn ${activeMode === 'slides' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M7 9h10M7 13h6" />
        </svg>
        Slides
      </button>

      <button
        onClick={() => onModeChange('bible')}
        className={`tbtn ${activeMode === 'bible' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M4 5c4 0 6 1 8 3 2-2 4-3 8-3v14c-4 0-6 1-8 3-2-2-4-3-8-3z" />
        </svg>
        Bible
      </button>

      <button
        onClick={() => onModeChange('hymnal')}
        className={`tbtn ${activeMode === 'hymnal' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
        Hymnal
      </button>

      <button
        onClick={() => onModeChange('camera')}
        className={`tbtn ${activeMode === 'camera' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
        Camera
      </button>

      <button
        onClick={() => onModeChange('audio')}
        className={`tbtn ${activeMode === 'audio' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M4 15h3l4 4V5l-4 4H4z" />
          <path d="M15 9a4 4 0 010 6M18 6a8 8 0 010 12" />
        </svg>
        Audio
      </button>

      <button
        onClick={() => onModeChange('stream')}
        className={`tbtn ${activeMode === 'stream' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <rect x="3" y="6" width="14" height="12" rx="1" />
          <path d="M21 8l-4 3 4 3z" />
        </svg>
        Streaming
      </button>

      <button
        onClick={() => onModeChange('remote')}
        className={`tbtn ${activeMode === 'remote' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
        Remote
      </button>

      <div className="toolbar-spacer" />

      {/* Live / On Air Status Badge */}
      <div className="live-indicator">
        <span className="live-dot" />
        {isLive ? 'On air' : 'Standby'}
      </div>
    </div>
  )
}
