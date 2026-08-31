import { useState } from 'react'

export default function SettingsView() {
  const [defaultTranslation, setDefaultTranslation] = useState('KJV')
  const [ccliLicenseNumber, setCcliLicenseNumber] = useState('CCLI-10928374')
  const [showCcliOnSlides, setShowCcliOnSlides] = useState(true)
  const [audienceMonitor, setAudienceMonitor] = useState('Display 2 (Primary Projection)')
  const [stageMonitor, setStageMonitor] = useState('Display 3 (Musicians Monitor)')
  const [windowPersistence, setWindowPersistence] = useState(true)

  const handleSaveSettings = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="h-full flex flex-col space-y-5 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" className="text-app-accent">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Churchle System & Display Preferences
          </h2>
          <span className="text-xs font-mono text-app-text-3">SYSTEM CONFIG</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Default Translation & CCLI Copyright */}
          <div className="space-y-4 bg-app-toolbar p-4 rounded-lg border border-app-border">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Defaults & Copyright Licensing</h3>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Default Bible Translation</label>
              <select
                value={defaultTranslation}
                onChange={(e) => setDefaultTranslation(e.target.value)}
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none"
              >
                <option value="KJV">King James Version (KJV)</option>
                <option value="NIV">New International Version (NIV)</option>
                <option value="ASV">American Standard Version (ASV)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">CCLI License Number</label>
              <input
                type="text"
                value={ccliLicenseNumber}
                onChange={(e) => setCcliLicenseNumber(e.target.value)}
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-app-text-2 cursor-pointer font-bold pt-1">
              <input
                type="checkbox"
                checked={showCcliOnSlides}
                onChange={(e) => setShowCcliOnSlides(e.target.checked)}
                className="rounded border-app-border text-app-accent focus:ring-app-accent accent-app-accent"
              />
              Display CCLI License Notice on Song Slides Footer
            </label>
          </div>

          {/* Section 2: Display Monitor Assignments */}
          <div className="space-y-4 bg-app-toolbar p-4 rounded-lg border border-app-border">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Physical Monitor Mapping</h3>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Audience Main Output Monitor</label>
              <select
                value={audienceMonitor}
                onChange={(e) => setAudienceMonitor(e.target.value)}
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none"
              >
                <option value="Display 2 (Primary Projection)">Display 2 (Primary Projection - 1920x1080)</option>
                <option value="Display 1 (Primary Desktop)">Display 1 (Primary Desktop - 2560x1440)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Stage Confidence Monitor</label>
              <select
                value={stageMonitor}
                onChange={(e) => setStageMonitor(e.target.value)}
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text font-semibold focus:outline-none"
              >
                <option value="Display 3 (Musicians Monitor)">Display 3 (Musicians Monitor - 1920x1080)</option>
                <option value="Display 1 (Primary Desktop)">Display 1 (Primary Desktop - 2560x1440)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-app-text-2 cursor-pointer font-bold pt-1">
              <input
                type="checkbox"
                checked={windowPersistence}
                onChange={(e) => setWindowPersistence(e.target.checked)}
                className="rounded border-app-border text-app-accent focus:ring-app-accent accent-app-accent"
              />
              Persist Output Window Position & Bounds Across Sessions
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            className="w-full py-3 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
          >
            Save Preference Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
