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
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: OBS WebSocket Connection */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider flex items-center justify-between">
              <span>OBS Studio WebSocket v5 Automation</span>
              <span className={`h-2 w-2 rounded-full ${obsConnected ? 'bg-[#3FA9F5]' : 'bg-rose-500'}`} />
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Port</label>
                <input
                  type="number"
                  value={obsPort}
                  onChange={(e) => setObsPort(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-2.5 py-1.5 text-[#E8EAED] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Password</label>
                <input
                  type="password"
                  value={obsPassword}
                  onChange={(e) => setObsPassword(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-2.5 py-1.5 text-[#E8EAED] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleConnectObs}
              className="w-full py-2 bg-[#3FA9F5] hover:bg-[#2e93db] text-slate-950 font-extrabold rounded text-xs uppercase tracking-wider transition cursor-pointer"
            >
              {obsConnected ? 'Reconnect OBS' : 'Connect OBS WebSocket'}
            </button>

            <div className="text-[11px] font-mono text-slate-400 italic bg-[#0B0E14] p-2.5 rounded border border-[#232B38]">
              {obsStatusMsg}
            </div>
          </div>

          {/* Lower Third Link */}
          <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg space-y-2">
            <span className="text-[10px] font-extrabold text-[#F5A623] uppercase">Lower-Third Browser Source</span>
            <p className="text-xs text-slate-300">Add this URL as a Browser Source in OBS or vMix for transparent lower-thirds:</p>
            <div className="font-mono text-[11px] text-[#3FA9F5] bg-[#141922] p-2 rounded border border-[#232B38] select-all">
              http://localhost:5173/#/lowerthird
            </div>
          </div>
        </div>

        {/* Right Column: Category Scene Mapping */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col">
          <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Slide Category Scene Mapping</h3>
          <p className="text-xs text-slate-400">
            Map slide section categories to program scenes in OBS. When projected, Churchle automatically commands OBS to switch scenes.
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {Object.keys(obsMappings).map((cat) => (
              <div key={cat} className="flex justify-between items-center bg-[#0B0E14] border border-[#232B38] p-3 rounded-lg text-xs">
                <span className="font-extrabold text-[#F5A623] tracking-wider">{cat}</span>
                <select
                  value={obsMappings[cat]}
                  onChange={(e) => handleMappingChange(cat, e.target.value)}
                  disabled={!obsConnected}
                  className="bg-[#141922] border border-[#232B38] rounded px-3 py-1.5 text-[#E8EAED] focus:outline-none w-48 text-xs"
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
