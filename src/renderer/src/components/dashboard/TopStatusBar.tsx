import { useState, useEffect } from 'react'

interface TopStatusBarProps {
  isLive?: boolean
  displayCount?: number
  vlcStatus?: string
  obsConnected?: boolean
  remoteUrl?: string
  isTranscribing?: boolean
}

export default function TopStatusBar({
  isLive = true,
  displayCount = 3,
  vlcStatus = 'Idle',
  obsConnected = false,
  remoteUrl = '',
  isTranscribing = false
}: TopStatusBarProps) {
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const updateTimer = () => setTimeStr(new Date().toLocaleTimeString())
    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-12 bg-app-toolbar border-b border-app-border px-5 flex items-center justify-between select-none text-xs">
      {/* Left Title & Live Badge */}
      <div className="flex items-center gap-3">
        <span className="font-extrabold tracking-widest text-app-text text-sm">CHURCHLE</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-app-panel border border-app-border">
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-app-live animate-pulse' : 'bg-app-text-3'}`} />
          <span className={`font-mono font-extrabold text-[10px] tracking-wider uppercase ${isLive ? 'text-app-live' : 'text-app-text-3'}`}>
            {isLive ? 'LIVE' : 'OFF-AIR'}
          </span>
        </div>
      </div>

      {/* Center Subsystem Status Pills */}
      <div className="flex items-center gap-4 text-app-text">
        {/* Displays */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-app-text-3 font-sans text-[10px]">Disp:</span>
          <span className="text-app-accent font-bold">{displayCount}/3 ok</span>
        </div>

        <span className="text-app-border">|</span>

        {/* VLC Player */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-app-text-3 font-sans text-[10px]">VLC:</span>
          <span className="text-app-text-2 font-medium capitalize">{vlcStatus}</span>
        </div>

        <span className="text-app-border">|</span>

        {/* OBS Automation */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-app-text-3 font-sans text-[10px]">OBS:</span>
          <span className={obsConnected ? 'text-app-accent font-bold' : 'text-app-live font-bold'}>
            {obsConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>

        <span className="text-app-border">|</span>

        {/* Web Remote */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-app-text-3 font-sans text-[10px]">Remote:</span>
          <span className="text-app-text-2 truncate max-w-[140px]">{remoteUrl || 'Connecting...'}</span>
        </div>

        {/* AI Transcriber */}
        {isTranscribing && (
          <>
            <span className="text-app-border">|</span>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-app-accent animate-ping" />
              <span className="text-app-accent font-bold">AI Transcribing</span>
            </div>
          </>
        )}
      </div>

      {/* Right Live Clock */}
      <div className="font-mono text-sm font-bold text-app-text tracking-wider">
        {timeStr}
      </div>
    </header>
  )
}
