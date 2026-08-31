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
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Multi-Channel Audio Mixer */}
        <div className="md:col-span-2 bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-6 flex flex-col justify-between">
          <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Multi-Channel Web Audio Mixer</h3>

          {/* Faders Grid */}
          <div className="grid grid-cols-3 gap-6 items-end">
            {/* Music Channel */}
            <div className="space-y-3 bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">MUSIC DECK</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-[#F5A623] cursor-pointer"
                />
                <div className="h-full w-2.5 bg-slate-900 rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-[#F5A623]" style={{ height: `${musicLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#E8EAED]">{Math.round(musicVolume * 100)}%</span>
            </div>

            {/* Mic Channel */}
            <div className="space-y-3 bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-[#3FA9F5] uppercase">VOCAL MIC</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={micVolume}
                  onChange={(e) => setMicVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-[#3FA9F5] cursor-pointer"
                />
                <div className="h-full w-2.5 bg-slate-900 rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-[#3FA9F5]" style={{ height: `${micLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#E8EAED]">{Math.round(micVolume * 100)}%</span>
            </div>

            {/* Master Channel */}
            <div className="space-y-3 bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">MASTER BUS</span>
              <div className="h-32 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 w-32 accent-emerald-400 cursor-pointer"
                />
                <div className="h-full w-2.5 bg-slate-900 rounded overflow-hidden flex flex-col-reverse">
                  <div className="w-full bg-emerald-400" style={{ height: `${masterLevel * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#E8EAED]">{Math.round(masterVolume * 100)}%</span>
            </div>
          </div>

          {/* Sidechain Auto-Ducking Controls */}
          <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#F5A623] uppercase">Vocal Sidechain Auto-Ducking</span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={duckingEnabled}
                  onChange={(e) => setDuckingEnabled(e.target.checked)}
                  className="rounded border-[#232B38] text-[#F5A623] accent-[#F5A623]"
                />
                Enable Ducking
              </label>
            </div>

            {duckingEnabled && (
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-[#232B38]">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Threshold: {(duckingThreshold * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.3"
                    step="0.01"
                    value={duckingThreshold}
                    onChange={(e) => setDuckingThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#F5A623] cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Depth (Attenuation): {(duckingDepth * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={duckingDepth}
                    onChange={(e) => setDuckingDepth(parseFloat(e.target.value))}
                    className="w-full accent-[#F5A623] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: VLC Media Remote Deck */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider">VLC Media Player Transport</h3>

          <div className="space-y-3 bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className="font-mono text-[#3FA9F5] font-bold capitalize">{vlcInfo?.state || 'Disconnected'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Position:</span>
              <span className="font-mono text-slate-300">
                {vlcInfo ? `${Math.round(vlcInfo.time || 0)}s / ${Math.round(vlcInfo.length || 0)}s` : '--:--'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVlcControl('play')}
              className="py-2.5 bg-[#3FA9F5] hover:bg-[#2e93db] text-slate-950 font-black rounded text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Play ▶
            </button>
            <button
              onClick={() => handleVlcControl('pause')}
              className="py-2.5 bg-[#141922] border border-[#232B38] hover:bg-[#232B38] text-slate-200 font-bold rounded text-xs uppercase transition cursor-pointer"
            >
              Pause ❚❚
            </button>
            <button
              onClick={() => handleVlcControl('stop')}
              className="col-span-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Stop Playback ◼
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
