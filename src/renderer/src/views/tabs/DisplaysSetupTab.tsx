import { useDisplayStore } from '../../stores/useDisplayStore'

export default function DisplaysSetupTab() {
  const activeTheme = useDisplayStore((state) => state.activeTheme)
  const setTheme = useDisplayStore((state) => state.setTheme)

  const handleFocusWindow = (name: 'audience' | 'stage' | 'foyer') => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('focus-window', name)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Output Windows Manager & One-Click Recovery */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col">
          <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider flex items-center justify-between">
            <span>Multi-Display Output Window Manager</span>
            <span className="text-[10px] font-mono text-slate-400">3/3 Output Windows Active</span>
          </h3>
          <p className="text-xs text-slate-400">
            If projection windows are covered or misplaced, use the one-click recovery buttons below to bring them directly to the front.
          </p>

          <div className="space-y-3 flex-1">
            {/* Audience Window Card */}
            <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-[#E8EAED] uppercase tracking-wider block">Audience Main Output</span>
                <span className="text-[10px] font-mono text-[#3FA9F5]">Route: /audience (WebGL 60 FPS)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('audience')}
                className="px-3.5 py-1.5 bg-[#3FA9F5] hover:bg-[#2e93db] text-slate-950 font-bold rounded text-xs transition cursor-pointer"
              >
                Bring to Front ➔
              </button>
            </div>

            {/* Stage Confidence Monitor Card */}
            <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-[#E8EAED] uppercase tracking-wider block">Stage Confidence Monitor</span>
                <span className="text-[10px] font-mono text-[#F5A623]">Route: /stage (High-Contrast)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('stage')}
                className="px-3.5 py-1.5 bg-[#F5A623] hover:bg-[#d98f19] text-slate-950 font-bold rounded text-xs transition cursor-pointer"
              >
                Bring to Front ➔
              </button>
            </div>

            {/* Foyer Announcements Display Card */}
            <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-[#E8EAED] uppercase tracking-wider block">Foyer TV Announcements</span>
                <span className="text-[10px] font-mono text-emerald-400">Route: /foyer (Schedule + Lyrics)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('foyer')}
                className="px-3.5 py-1.5 bg-emerald-650 hover:bg-emerald-600 text-white font-bold rounded text-xs transition cursor-pointer"
              >
                Bring to Front ➔
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Font Configuration */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Projection Typography & Styling</h3>

            <div className="space-y-3 bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Font Family</label>
                <select
                  value={activeTheme.fontFamily}
                  onChange={(e) => setTheme({ fontFamily: e.target.value })}
                  className="w-full bg-[#141922] border border-[#232B38] rounded px-3 py-1.5 text-[#E8EAED] focus:outline-none"
                >
                  <option value="Arial">Arial</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Base Font Size: {activeTheme.fontSize}px</label>
                <input
                  type="range"
                  min="28"
                  max="80"
                  step="2"
                  value={activeTheme.fontSize}
                  onChange={(e) => setTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[#F5A623] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Text Color</label>
                <input
                  type="color"
                  value={activeTheme.textColor}
                  onChange={(e) => setTheme({ textColor: e.target.value })}
                  className="w-full h-8 bg-[#141922] border border-[#232B38] rounded cursor-pointer p-1"
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic bg-[#0B0E14] p-3 rounded border border-[#232B38]">
            Note: Typography settings sync instantaneously to the hardware-accelerated Audience WebGL canvas.
          </div>
        </div>
      </div>
    </div>
  )
}
