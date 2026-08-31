import { useState, useEffect } from 'react'
import { ObsControllerService } from '../../services/ObsControllerService'

export default function StreamingTab() {
  const [obsConnected, setObsConnected] = useState(false)
  const [obsStatusMsg, setObsStatusMsg] = useState('Disconnected.')
  const [obsScenes, setObsScenes] = useState<string[]>([])
  const obsHost = '127.0.0.1'
  const [obsPort, setObsPort] = useState('4455')
  const [obsPassword, setObsPassword] = useState('')
  const [obsMappings, setObsMappings] = useState<Record<string, string>>({
    VERSE: '',
    CHORUS: '',
    BRIDGE: '',
    BIBLE: '',
    VIDEO: '',
    OTHER: ''
  })

  useEffect(() => {
    setObsConnected(ObsControllerService.getConnected())
  }, [])

  const handleConnectObs = async () => {
    setObsStatusMsg('Connecting to OBS WebSocket...')
    const ok = await ObsControllerService.connect(obsHost, Number(obsPort), obsPassword)
    setObsConnected(ok)
    if (ok) {
      setObsStatusMsg('Connected to OBS Studio!')
      const scenes = ObsControllerService.getScenes()
      setObsScenes(scenes)
    } else {
      setObsStatusMsg('Connection failed. Verify OBS WebSocket settings.')
    }
  }

  const handleMappingChange = (category: string, sceneName: string) => {
    const next = { ...obsMappings, [category]: sceneName }
    setObsMappings(next)
    ObsControllerService.setMappings(next)
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: OBS WebSocket Connection */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center justify-between">
              <span>OBS Studio WebSocket v5 Automation</span>
              <span className={`h-2.5 w-2.5 rounded-full ${obsConnected ? 'bg-app-accent' : 'bg-app-live'}`} />
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Port</label>
                <input
                  type="number"
                  value={obsPort}
                  onChange={(e) => setObsPort(e.target.value)}
                  className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-1.5 text-app-text font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Password</label>
                <input
                  type="password"
                  value={obsPassword}
                  onChange={(e) => setObsPassword(e.target.value)}
                  className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-1.5 text-app-text font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleConnectObs}
              className="w-full py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              {obsConnected ? 'Reconnect OBS' : 'Connect OBS WebSocket'}
            </button>

            <div className="text-[11px] font-mono text-app-text-2 italic bg-app-toolbar p-2.5 rounded border border-app-border">
              {obsStatusMsg}
            </div>
          </div>

          {/* Lower Third Link */}
          <div className="bg-app-toolbar border border-app-border p-4 rounded-lg space-y-2">
            <span className="text-[10px] font-extrabold text-app-accent uppercase">Lower-Third Browser Source</span>
            <p className="text-xs text-app-text-2">Add this URL as a Browser Source in OBS or vMix for transparent lower-thirds:</p>
            <div className="font-mono text-[11px] text-app-accent bg-app-panel p-2 rounded border border-app-border select-all">
              http://localhost:5173/#/lowerthird
            </div>
          </div>
        </div>

        {/* Right Column: Category Scene Mapping */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col">
          <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Slide Category Scene Mapping</h3>
          <p className="text-xs text-app-text-2">
            Map slide section categories to program scenes in OBS. When projected, Churchle automatically commands OBS to switch scenes.
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {Object.keys(obsMappings).map((cat) => (
              <div key={cat} className="flex justify-between items-center bg-app-toolbar border border-app-border p-3 rounded-lg text-xs">
                <span className="font-extrabold text-app-accent tracking-wider">{cat}</span>
                <select
                  value={obsMappings[cat]}
                  onChange={(e) => handleMappingChange(cat, e.target.value)}
                  disabled={!obsConnected}
                  className="bg-app-panel border border-app-border rounded-lg px-3 py-1.5 text-app-text font-semibold focus:outline-none w-48 text-xs"
                >
                  <option value="">No Automatic Switch</option>
                  {obsScenes.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
