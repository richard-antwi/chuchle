import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react'
import { CameraService, CameraDevice } from '../../services/CameraService'
import { useDisplayStore } from '../../stores/useDisplayStore'
import PixiStage from '../../components/PixiStage'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class CameraErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Camera tab preview error caught:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-app-toolbar rounded-lg border border-app-border text-center space-y-2">
          <span className="text-sm font-black text-app-accent">Camera Preview Standby</span>
          <span className="text-xs text-app-text-3">
            {this.state.error?.message || 'WebGL canvas / video hardware currently locked or in use.'}
          </span>
        </div>
      )
    }
    return this.props.children
  }
}

export default function CameraVisualsTab() {
  const [cameras, setCameras] = useState<CameraDevice[]>([])

  const activeCameraDeviceId = useDisplayStore((state) => state.activeCameraDeviceId)
  const colorGrading = useDisplayStore((state) => state.colorGrading)
  const chromaKeyConfig = useDisplayStore((state) => state.chromaKey)

  const setCameraDeviceId = useDisplayStore((state) => state.setCameraDeviceId)
  const setColorGrading = useDisplayStore((state) => state.setColorGrading)
  const setChromaKey = useDisplayStore((state) => state.setChromaKey)

  useEffect(() => {
    CameraService.getCameras()
      .then((devs) => {
        setCameras(devs || [])
      })
      .catch((err) => {
        console.warn('CameraService getCameras error:', err)
      })
  }, [])

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Controls */}
        <div className="md:col-span-2 space-y-4">
          {/* Camera Selection */}
          <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-3">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Video Camera Feed</h3>
            <select
              value={activeCameraDeviceId}
              onChange={(e) => setCameraDeviceId(e.target.value)}
              className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-semibold focus:outline-none"
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
          <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Color Matrix Grading</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Brightness: {colorGrading.brightness.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={colorGrading.brightness}
                  onChange={(e) => setColorGrading({ brightness: parseFloat(e.target.value) })}
                  className="w-full accent-app-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Contrast: {colorGrading.contrast.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={colorGrading.contrast}
                  onChange={(e) => setColorGrading({ contrast: parseFloat(e.target.value) })}
                  className="w-full accent-app-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Saturation: {colorGrading.saturation.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={colorGrading.saturation}
                  onChange={(e) => setColorGrading({ saturation: parseFloat(e.target.value) })}
                  className="w-full accent-app-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* GPU Chroma Keying */}
          <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">GPU Chroma Keyer</h3>
              <label className="flex items-center gap-2 text-xs text-app-text-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={chromaKeyConfig.enabled}
                  onChange={(e) => setChromaKey({ enabled: e.target.checked })}
                  className="rounded border-app-border text-app-accent focus:ring-app-accent accent-app-accent"
                />
                Enable Keying
              </label>
            </div>

            {chromaKeyConfig.enabled && (
              <div className="grid grid-cols-3 gap-4 text-xs pt-2 border-t border-app-border">
                <div className="space-y-1">
                  <label className="text-[10px] text-app-text-3 uppercase font-bold">Key Color</label>
                  <input
                    type="color"
                    value={chromaKeyConfig.color}
                    onChange={(e) => setChromaKey({ color: e.target.value })}
                    className="w-full h-8 bg-app-toolbar border border-app-border rounded cursor-pointer p-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-app-text-3 uppercase font-bold">Similarity: {chromaKeyConfig.similarity.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.02"
                    value={chromaKeyConfig.similarity}
                    onChange={(e) => setChromaKey({ similarity: parseFloat(e.target.value) })}
                    className="w-full accent-app-accent cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-app-text-3 uppercase font-bold">Smoothness: {chromaKeyConfig.smoothness.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.02"
                    value={chromaKeyConfig.smoothness}
                    onChange={(e) => setChromaKey({ smoothness: parseFloat(e.target.value) })}
                    className="w-full accent-app-accent cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Composite Thumbnail Preview */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm flex flex-col space-y-3">
          <h3 className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center justify-between">
            <span>Composited Output Preview</span>
            <span className="h-2 w-2 rounded-full bg-app-accent animate-pulse" />
          </h3>
          <div className="flex-1 bg-black rounded-lg border border-app-border overflow-hidden min-h-[260px] relative flex items-center justify-center">
            <CameraErrorBoundary>
              <PixiStage />
            </CameraErrorBoundary>
          </div>
          <div className="text-[10px] text-app-text-3 italic text-center">
            Real-time WebGL composite preview displaying shaders and keying.
          </div>
        </div>
      </div>
    </div>
  )
}
