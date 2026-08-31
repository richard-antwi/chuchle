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
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Output Windows Manager & One-Click Recovery */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col">
          <h3 className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center justify-between">
            <span>Multi-Display Output Window Manager</span>
            <span className="text-[10px] font-mono text-app-text-3">3/3 Output Windows Active</span>
          </h3>
          <p className="text-xs text-app-text-2">
            If projection windows are covered or misplaced, use the one-click recovery buttons below to bring them directly to the front.
          </p>

          <div className="space-y-3 flex-1">
            {/* Audience Window Card */}
            <div className="bg-app-toolbar border border-app-border p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-app-text uppercase tracking-wider block">Audience Main Output</span>
                <span className="text-[10px] font-mono text-app-accent">Route: /audience (WebGL 60 FPS)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('audience')}
                className="px-3.5 py-1.5 bg-app-accent hover:opacity-90 text-white font-bold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm"
              >
                Bring to Front ➔
              </button>
            </div>

            {/* Stage Confidence Monitor Card */}
            <div className="bg-app-toolbar border border-app-border p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-app-text uppercase tracking-wider block">Stage Confidence Monitor</span>
                <span className="text-[10px] font-mono text-app-accent">Route: /stage (High-Contrast)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('stage')}
                className="px-3.5 py-1.5 bg-app-accent hover:opacity-90 text-white font-bold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm"
              >
                Bring to Front ➔
              </button>
            </div>

            {/* Foyer Announcements Display Card */}
            <div className="bg-app-toolbar border border-app-border p-4 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-app-text uppercase tracking-wider block">Foyer TV Announcements</span>
                <span className="text-[10px] font-mono text-app-accent">Route: /foyer (Schedule + Lyrics)</span>
              </div>
              <button
                onClick={() => handleFocusWindow('foyer')}
                className="px-3.5 py-1.5 bg-app-accent hover:opacity-90 text-white font-bold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm"
              >
                Bring to Front ➔
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Font Configuration */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Projection Typography & Styling</h3>

            <div className="space-y-3 bg-app-toolbar border border-app-border p-4 rounded-lg text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Font Family</label>
                <select
                  value={activeTheme.fontFamily}
                  onChange={(e) => setTheme({ fontFamily: e.target.value })}
                  className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-1.5 text-app-text font-semibold focus:outline-none"
                >
                  <option value="Arial">Arial</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Base Font Size: {activeTheme.fontSize}px</label>
                <input
                  type="range"
                  min="28"
                  max="80"
                  step="2"
                  value={activeTheme.fontSize}
                  onChange={(e) => setTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-app-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Text Color</label>
                <input
                  type="color"
                  value={activeTheme.textColor}
                  onChange={(e) => setTheme({ textColor: e.target.value })}
                  className="w-full h-8 bg-app-panel border border-app-border rounded-lg cursor-pointer p-1"
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-app-text-3 italic bg-app-toolbar p-3 rounded border border-app-border">
            Note: Typography settings sync instantaneously to the hardware-accelerated Audience WebGL canvas.
          </div>
        </div>
      </div>
    </div>
  )
}
