import { useDisplayStore } from '../../stores/useDisplayStore'

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
  const uiThemeMode = useDisplayStore((state) => state.uiThemeMode)
  const toggleUiThemeMode = useDisplayStore((state) => state.toggleUiThemeMode)

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

      <button
        onClick={() => onModeChange('themes')}
        className={`tbtn ${activeMode === 'themes' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Themes
      </button>

      <button
        onClick={() => onModeChange('custom')}
        className={`tbtn ${activeMode === 'custom' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Custom
      </button>

      <button
        onClick={() => onModeChange('decks')}
        className={`tbtn ${activeMode === 'decks' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M2 3h20v14H2z" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        Decks
      </button>

      <button
        onClick={() => onModeChange('parallel')}
        className={`tbtn ${activeMode === 'parallel' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        Parallel
      </button>

      <button
        onClick={() => onModeChange('chords')}
        className={`tbtn ${activeMode === 'chords' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
        Chords
      </button>

      <button
        onClick={() => onModeChange('settings')}
        className={`tbtn ${activeMode === 'settings' ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
        Settings
      </button>

      <div className="toolbar-spacer" />

      {/* Light / Dark Mode Toggle Button */}
      <button
        onClick={toggleUiThemeMode}
        className="px-3 py-1.5 rounded-lg border border-app-border bg-app-panel text-app-text text-xs font-bold transition hover:border-app-accent cursor-pointer flex items-center gap-1.5 mr-2 shadow-sm"
        title="Toggle Light / Dark Mode"
      >
        <span>{uiThemeMode === 'dark' ? '☀️' : '🌙'}</span>
        <span>{uiThemeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Live / On Air Status Badge */}
      <div className="live-indicator">
        <span className="live-dot" />
        {isLive ? 'On air' : 'Standby'}
      </div>
    </div>
  )
}
