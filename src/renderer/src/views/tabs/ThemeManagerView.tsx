import { useState } from 'react'
import { useDisplayStore } from '../../stores/useDisplayStore'

export interface ThemePreset {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  textColor: string
  backgroundColor: string
  shadowEnabled: boolean
}

export default function ThemeManagerView() {
  const activeTheme = useDisplayStore((state) => state.activeTheme)
  const setTheme = useDisplayStore((state) => state.setTheme)

  const [presets, setPresets] = useState<ThemePreset[]>([
    {
      id: 'default_sanctuary',
      name: 'Default Sanctuary Light',
      fontFamily: 'Arial',
      fontSize: 48,
      textColor: '#ffffff',
      backgroundColor: '#000000',
      shadowEnabled: true
    },
    {
      id: 'worship_classic',
      name: 'Praise & Worship Bold',
      fontFamily: 'Inter',
      fontSize: 54,
      textColor: '#ffffff',
      backgroundColor: '#0f172a',
      shadowEnabled: true
    },
    {
      id: 'sermon_minimal',
      name: 'Sermon Scripture Clean',
      fontFamily: 'Georgia',
      fontSize: 44,
      textColor: '#f8fafc',
      backgroundColor: '#000000',
      shadowEnabled: false
    }
  ])

  const [activePresetId, setActivePresetId] = useState('default_sanctuary')
  const [newPresetName, setNewPresetName] = useState('')

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return
    const newPreset: ThemePreset = {
      id: `theme_${Date.now()}`,
      name: newPresetName.trim(),
      fontFamily: activeTheme.fontFamily || 'Arial',
      fontSize: activeTheme.fontSize || 48,
      textColor: activeTheme.textColor || '#ffffff',
      backgroundColor: '#000000',
      shadowEnabled: true
    }
    setPresets((prev) => [...prev, newPreset])
    setActivePresetId(newPreset.id)
    setNewPresetName('')
  }

  const handleApplyPreset = (preset: ThemePreset) => {
    setActivePresetId(preset.id)
    setTheme({
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      textColor: preset.textColor
    })
  }

  return (
    <div className="h-full flex flex-col space-y-5 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" className="text-app-accent">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Churchle Theme & Typography Preset Manager
          </h2>
          <span className="text-xs font-mono text-app-text-3">THEME ENGINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Preset Selector List */}
          <div className="space-y-3 bg-app-toolbar p-4 rounded-lg border border-app-border">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Saved Theme Presets</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {presets.map((p) => {
                const isSelected = activePresetId === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-app-accent-bg border-app-accent text-app-accent font-extrabold shadow-sm'
                        : 'bg-app-panel border-app-border text-app-text hover:border-app-border-strong'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{p.name}</div>
                      <div className="text-[10px] text-app-text-3 font-mono">
                        {p.fontFamily} • {p.fontSize}px
                      </div>
                    </div>
                    {isSelected && <span className="text-xs font-bold">✓ Active</span>}
                  </div>
                )
              })}
            </div>

            {/* Save New Preset Box */}
            <div className="pt-3 border-t border-app-border space-y-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="New Preset Name..."
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-1.5 text-xs text-app-text font-semibold focus:outline-none"
              />
              <button
                onClick={handleSavePreset}
                className="w-full py-2 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase transition cursor-pointer"
              >
                Save Current Styles as Preset
              </button>
            </div>
          </div>

          {/* Right 2 Columns: Live Customizer Controls */}
          <div className="md:col-span-2 space-y-4 bg-app-panel p-4 rounded-lg border border-app-border">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Active Preset Style Editor</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Font Family</label>
                <select
                  value={activeTheme.fontFamily}
                  onChange={(e) => setTheme({ fontFamily: e.target.value })}
                  className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none"
                >
                  <option value="Arial">Arial (Standard Clean)</option>
                  <option value="Roboto">Roboto (Modern Sans)</option>
                  <option value="Inter">Inter (High-Legibility)</option>
                  <option value="Georgia">Georgia (Classic Serif)</option>
                  <option value="Courier New">Courier New (Monospace)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Base Font Size: {activeTheme.fontSize}px</label>
                <input
                  type="range"
                  min="28"
                  max="84"
                  step="2"
                  value={activeTheme.fontSize}
                  onChange={(e) => setTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-app-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Text Fill Color</label>
                <input
                  type="color"
                  value={activeTheme.textColor}
                  onChange={(e) => setTheme({ textColor: e.target.value })}
                  className="w-full h-9 bg-app-toolbar border border-app-border rounded-lg cursor-pointer p-1"
                />
              </div>
            </div>

            {/* Live WebGL Stage Preview Box */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-app-text-3 uppercase block mb-2">Live WebGL Sample Output</span>
              <div className="w-full aspect-video bg-black rounded-lg border border-app-border flex items-center justify-center p-6 text-center text-white font-bold text-xl shadow-inner">
                <span style={{ fontFamily: activeTheme.fontFamily, fontSize: `${(activeTheme.fontSize || 48) / 2}px`, color: activeTheme.textColor }}>
                  Amazing grace how sweet the sound
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
