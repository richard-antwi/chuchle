import { useState } from 'react'
import { useAudioStore } from '../../stores/useAudioStore'

export default function AudioTab() {
  const musicVolume = useAudioStore((state) => state.musicVolume)
  const micVolume = useAudioStore((state) => state.micVolume)
  const masterVolume = useAudioStore((state) => state.masterVolume)
  const musicLevel = useAudioStore((state) => state.musicLevel)
  const micLevel = useAudioStore((state) => state.micLevel)
  const masterLevel = useAudioStore((state) => state.masterLevel)
  const duckingEnabled = useAudioStore((state) => state.duckingEnabled)
  const duckingThreshold = useAudioStore((state) => state.duckingThreshold)
  const duckingDepth = useAudioStore((state) => state.duckingDepth)

  const setMusicVolume = useAudioStore((state) => state.setMusicVolume)
  const setMicVolume = useAudioStore((state) => state.setMicVolume)
  const setMasterVolume = useAudioStore((state) => state.setMasterVolume)
  const setDuckingEnabled = useAudioStore((state) => state.setDuckingEnabled)
  const setDuckingThreshold = useAudioStore((state) => state.setDuckingThreshold)
  const setDuckingDepth = useAudioStore((state) => state.setDuckingDepth)

  // VLC state
  const [vlcInfo, setVlcInfo] = useState<any>(null)

  const handleVlcControl = async (action: string, val?: any) => {
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke('vlc-control', action, val)
      if (res) setVlcInfo(res)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Multi-Channel Audio Mixer */}
        <div className="md:col-span-2 bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-6 flex flex-col justify-between">
          <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Multi-Channel Web Audio Mixer</h3>

          {/* Faders Grid */}
          <div className="grid grid-cols-3 gap-6 items-end">
            {/* Music Channel */}
            <div className="space-y-3 bg-app-toolbar border border-app-border p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-app-text-2 uppercase">MUSIC DECK</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-app-accent cursor-pointer"
                />
                <div className="h-full w-2.5 bg-app-border rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-app-accent" style={{ height: `${musicLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-app-text">{Math.round(musicVolume * 100)}%</span>
            </div>

            {/* Mic Channel */}
            <div className="space-y-3 bg-app-toolbar border border-app-border p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-app-accent uppercase">VOCAL MIC</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={micVolume}
                  onChange={(e) => setMicVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-app-accent cursor-pointer"
                />
                <div className="h-full w-2.5 bg-app-border rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-app-accent" style={{ height: `${micLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-app-text">{Math.round(micVolume * 100)}%</span>
            </div>

            {/* Master Channel */}
            <div className="space-y-3 bg-app-toolbar border border-app-border p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-app-live uppercase">MASTER BUS</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-app-live cursor-pointer"
                />
                <div className="h-full w-2.5 bg-app-border rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-app-live" style={{ height: `${masterLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-app-text">{Math.round(masterVolume * 100)}%</span>
            </div>
          </div>

          {/* Sidechain Auto-Ducking Controls */}
          <div className="bg-app-toolbar border border-app-border p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-app-accent uppercase">Vocal Sidechain Auto-Ducking</span>
              <label className="flex items-center gap-2 text-xs text-app-text-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={duckingEnabled}
                  onChange={(e) => setDuckingEnabled(e.target.checked)}
                  className="rounded border-app-border text-app-accent accent-app-accent"
                />
                Enable Ducking
              </label>
            </div>

            {duckingEnabled && (
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-app-border">
                <div className="space-y-1">
                  <label className="text-[10px] text-app-text-3 uppercase font-bold">Threshold: {(duckingThreshold * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.3"
                    step="0.01"
                    value={duckingThreshold}
                    onChange={(e) => setDuckingThreshold(parseFloat(e.target.value))}
                    className="w-full accent-app-accent cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-app-text-3 uppercase font-bold">Depth (Attenuation): {(duckingDepth * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={duckingDepth}
                    onChange={(e) => setDuckingDepth(parseFloat(e.target.value))}
                    className="w-full accent-app-accent cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: VLC Media Remote Deck */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">VLC Media Player Transport</h3>

          <div className="space-y-3 bg-app-toolbar border border-app-border p-4 rounded-lg text-xs">
            <div className="flex justify-between items-center">
              <span className="text-app-text-2 font-medium">Status:</span>
              <span className="font-mono text-app-accent font-bold capitalize">{vlcInfo?.state || 'Disconnected'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-app-text-2 font-medium">Position:</span>
              <span className="font-mono text-app-text">
                {vlcInfo ? `${Math.round(vlcInfo.time || 0)}s / ${Math.round(vlcInfo.length || 0)}s` : '--:--'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVlcControl('play')}
              className="py-2.5 bg-app-accent hover:opacity-90 text-white font-black rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Play ▶
            </button>
            <button
              onClick={() => handleVlcControl('pause')}
              className="py-2.5 bg-app-toolbar border border-app-border hover:bg-app-bg text-app-text font-bold rounded-lg text-xs uppercase transition cursor-pointer"
            >
              Pause ❚❚
            </button>
            <button
              onClick={() => handleVlcControl('stop')}
              className="col-span-2 py-2.5 bg-app-live hover:opacity-90 text-white font-black rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Stop Playback ◼
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
