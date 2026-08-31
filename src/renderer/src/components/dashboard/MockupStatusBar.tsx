import { useAudioStore } from '../../stores/useAudioStore'

interface MockupStatusBarProps {
  audienceOk?: boolean
  stageOk?: boolean
  foyerOk?: boolean
  obsConnected?: boolean
}

export default function MockupStatusBar({
  audienceOk = true,
  stageOk = true,
  foyerOk = true,
  obsConnected = true
}: MockupStatusBarProps) {
  const masterLevel = useAudioStore((state) => state.masterLevel)

  return (
    <div className="statusbar">
      <div className="stat">
        <span className={`dot ${audienceOk ? 'ok' : 'warn'}`} />
        Audience display {audienceOk ? 'connected' : 'disconnected'}
      </div>
      <div className="stat">
        <span className={`dot ${stageOk ? 'ok' : 'warn'}`} />
        Stage monitor {stageOk ? 'connected' : 'disconnected'}
      </div>
      <div className="stat">
        <span className={`dot ${foyerOk ? 'warn' : 'ok'}`} />
        Foyer display {foyerOk ? 'windowed' : 'connected'}
      </div>
      <div className="stat">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="6" width="14" height="12" rx="1" />
          <path d="M21 8l-4 3 4 3z" />
        </svg>
        OBS {obsConnected ? 'connected' : 'disconnected'}
      </div>

      <div className="fill" />

      {/* Live Audio VU Meter */}
      <div className="stat">
        Master
        <div className="vu">
          <div
            className="vu-fill"
            style={{ width: `${Math.min(100, Math.max(15, masterLevel * 100))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
