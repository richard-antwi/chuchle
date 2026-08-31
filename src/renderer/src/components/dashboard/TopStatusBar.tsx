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
    <header className="h-12 bg-[#0B0E14] border-b border-[#232B38] px-5 flex items-center justify-between select-none text-xs">
      {/* Left Title & Live Badge */}
      <div className="flex items-center gap-3">
        <span className="font-extrabold tracking-widest text-[#E8EAED] text-sm">CHURCHLE</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#141922] border border-[#232B38]">
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-[#F5A623] animate-pulse' : 'bg-slate-600'}`} />
          <span className={`font-mono font-extrabold text-[10px] tracking-wider uppercase ${isLive ? 'text-[#F5A623]' : 'text-slate-500'}`}>
            {isLive ? 'LIVE' : 'OFF-AIR'}
          </span>
        </div>
      </div>

      {/* Center Subsystem Status Pills */}
      <div className="flex items-center gap-4 text-[#E8EAED]">
        {/* Displays */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-500 font-sans text-[10px]">Disp:</span>
          <span className="text-[#3FA9F5] font-bold">{displayCount}/3 ok</span>
        </div>

        <span className="text-[#232B38]">|</span>

        {/* VLC Player */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-500 font-sans text-[10px]">VLC:</span>
          <span className="text-slate-300 font-medium capitalize">{vlcStatus}</span>
        </div>

        <span className="text-[#232B38]">|</span>

        {/* OBS Automation */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-500 font-sans text-[10px]">OBS:</span>
          <span className={obsConnected ? 'text-[#3FA9F5] font-bold' : 'text-rose-500 font-bold'}>
            {obsConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>

        <span className="text-[#232B38]">|</span>

        {/* Web Remote */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-500 font-sans text-[10px]">Remote:</span>
          <span className="text-slate-300 truncate max-w-[140px]">{remoteUrl || 'Connecting...'}</span>
        </div>

        {/* AI Transcriber */}
        {isTranscribing && (
          <>
            <span className="text-[#232B38]">|</span>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623] animate-ping" />
              <span className="text-[#F5A623] font-bold">AI Transcribing</span>
            </div>
          </>
        )}
      </div>

      {/* Right Live Clock */}
      <div className="font-mono text-sm font-bold text-[#E8EAED] tracking-wider">
        {timeStr}
      </div>
    </header>
  )
}
