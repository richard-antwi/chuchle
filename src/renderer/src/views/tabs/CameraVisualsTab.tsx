import { useState, useEffect } from 'react'
import { CameraService, CameraDevice } from '../../services/CameraService'
import { useDisplayStore } from '../../stores/useDisplayStore'
import PixiStage from '../../components/PixiStage'

export default function CameraVisualsTab() {
  const [cameras, setCameras] = useState<CameraDevice[]>([])

  const activeCameraDeviceId = useDisplayStore((state) => state.activeCameraDeviceId)
  const colorGrading = useDisplayStore((state) => state.colorGrading)
  const chromaKeyConfig = useDisplayStore((state) => state.chromaKey)

  const setCameraDeviceId = useDisplayStore((state) => state.setCameraDeviceId)
  const setColorGrading = useDisplayStore((state) => state.setColorGrading)
  const setChromaKey = useDisplayStore((state) => state.setChromaKey)

  useEffect(() => {
    CameraService.getCameras().then((devs) => {
      setCameras(devs)
    })
  }, [])

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Controls */}
        <div className="md:col-span-2 space-y-4">
          {/* Camera Selection */}
          <div className="bg-[#141922] border border-[#232B38] p-4 rounded-lg space-y-3">
            <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider">Video Camera Feed</h3>
            <select
              value={activeCameraDeviceId}
              onChange={(e) => setCameraDeviceId(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#232B38] rounded px-3 py-2 text-xs text-[#E8EAED] focus:outline-none"
            >
              <option value="">No Camera Ingestion (Disabled)</option>
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${c.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Color Grading Shaders */}
          <div className="bg-[#141922] border border-[#232B38] p-4 rounded-lg space-y-4">
            <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Color Matrix Grading</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Brightness: {colorGrading.brightness.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={colorGrading.brightness}
                  onChange={(e) => setColorGrading({ brightness: parseFloat(e.target.value) })}
                  className="w-full accent-[#F5A623] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Contrast: {colorGrading.contrast.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={colorGrading.contrast}
                  onChange={(e) => setColorGrading({ contrast: parseFloat(e.target.value) })}
                  className="w-full accent-[#F5A623] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Saturation: {colorGrading.saturation.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={colorGrading.saturation}
                  onChange={(e) => setColorGrading({ saturation: parseFloat(e.target.value) })}
                  className="w-full accent-[#F5A623] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* GPU Chroma Keying */}
          <div className="bg-[#141922] border border-[#232B38] p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider">GPU Chroma Keyer</h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chromaKeyConfig.enabled}
                  onChange={(e) => setChromaKey({ enabled: e.target.checked })}
                  className="rounded border-[#232B38] text-[#3FA9F5] focus:ring-[#3FA9F5] accent-[#3FA9F5]"
                />
                Enable Keying
              </label>
            </div>

            {chromaKeyConfig.enabled && (
              <div className="grid grid-cols-3 gap-4 text-xs pt-2 border-t border-[#232B38]">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Key Color</label>
                  <input
                    type="color"
                    value={chromaKeyConfig.color}
                    onChange={(e) => setChromaKey({ color: e.target.value })}
                    className="w-full h-8 bg-[#0B0E14] border border-[#232B38] rounded cursor-pointer p-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Similarity: {chromaKeyConfig.similarity.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.02"
                    value={chromaKeyConfig.similarity}
                    onChange={(e) => setChromaKey({ similarity: parseFloat(e.target.value) })}
                    className="w-full accent-[#3FA9F5] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Smoothness: {chromaKeyConfig.smoothness.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.02"
                    value={chromaKeyConfig.smoothness}
                    onChange={(e) => setChromaKey({ smoothness: parseFloat(e.target.value) })}
                    className="w-full accent-[#3FA9F5] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Composite Thumbnail Preview */}
        <div className="bg-[#141922] border border-[#232B38] p-4 rounded-lg flex flex-col space-y-3">
          <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider flex items-center justify-between">
            <span>Composited Output Preview</span>
            <span className="h-2 w-2 rounded-full bg-[#F5A623] animate-pulse" />
          </h3>
          <div className="flex-1 bg-black rounded-lg border border-[#232B38] overflow-hidden min-h-[260px] relative flex items-center justify-center">
            <PixiStage />
          </div>
          <div className="text-[10px] text-slate-500 italic text-center">
            Real-time WebGL composite preview displaying shaders and keying.
          </div>
        </div>
      </div>
    </div>
  )
}
