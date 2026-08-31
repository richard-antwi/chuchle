import { useAudioStore } from '../../stores/useAudioStore'
import { useDiagnosticsStore } from '../../stores/useDiagnosticsStore'

interface MockupStatusBarProps {
  audienceOk?: boolean
  stageOk?: boolean
  foyerOk?: boolean
  obsConnected?: boolean
}

export default function MockupStatusBar({
  audienceOk = true,
  stageOk = true
}: MockupStatusBarProps) {
  const masterLevel = useAudioStore((state) => state.masterLevel)
  const dbStatus = useDiagnosticsStore((state) => state.dbStatus)
  const rendererStatus = useDiagnosticsStore((state) => state.rendererStatus)
  const autosaveStatus = useDiagnosticsStore((state) => state.autosaveStatus)
  const appVersion = useDiagnosticsStore((state) => state.appVersion)

  return (
    <div className="statusbar flex items-center justify-between text-xs px-3 py-1 bg-app-toolbar border-t border-app-border text-app-text-2">
      <div className="flex items-center gap-3">
        <div className="stat flex items-center gap-1.5 font-semibold">
          <span className={`dot ${dbStatus === 'connected' ? 'ok' : 'warn'}`} />
          DB: {dbStatus}
        </div>

        <div className="stat flex items-center gap-1.5 font-semibold">
          <span className={`dot ${rendererStatus === 'ready' ? 'ok' : 'warn'}`} />
          WebGL: {rendererStatus}
        </div>

        <div className="stat flex items-center gap-1.5 font-semibold">
          <span className={`dot ${audienceOk ? 'ok' : 'warn'}`} />
          Audience: {audienceOk ? 'connected' : 'disconnected'}
        </div>

        <div className="stat flex items-center gap-1.5 font-semibold">
          <span className={`dot ${stageOk ? 'ok' : 'warn'}`} />
          Stage: {stageOk ? 'connected' : 'disconnected'}
        </div>

        <div className="stat flex items-center gap-1.5 font-semibold">
          <span className={`dot ${autosaveStatus === 'saved' ? 'ok' : 'warn'}`} />
          Autosave: {autosaveStatus}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Audio VU Meter */}
        <div className="stat flex items-center gap-2">
          <span className="font-bold text-[10px]">MASTER</span>
          <div className="vu w-20 h-1.5 bg-app-border rounded overflow-hidden">
            <div
              className="vu-fill h-full bg-app-accent"
              style={{ width: `${Math.min(100, Math.max(15, masterLevel * 100))}%` }}
            />
          </div>
        </div>

        <div className="text-[10px] font-mono text-app-text-3">v{appVersion}</div>
      </div>
    </div>
  )
}
