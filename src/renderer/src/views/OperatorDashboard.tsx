import { useState, useEffect } from 'react'
import { parseAndReflowRawLyrics, ReflowedSection } from '../utils/smartLyricReflow'
import { useDisplayStore } from '../stores/useDisplayStore'
import { useAudioStore } from '../stores/useAudioStore'
import { WebAudioMixer } from '../services/WebAudioMixer'
import { CameraService, CameraDevice } from '../services/CameraService'
import { TranscriptionService } from '../services/TranscriptionService'
import { ObsControllerService } from '../services/ObsControllerService'
import { SlideImporter } from '../services/SlideImporter'

interface DisplayInfo {
  id: number
  bounds: { x: number; y: number; width: number; height: number }
  scaleFactor: number
}

export default function OperatorDashboard() {
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [vlcStatus, setVlcStatus] = useState<string>('Disconnected')
  const [inputText, setInputText] = useState<string>(
    `[Verse 1]\nAmazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\n[Chorus]\nTwas grace that taught my heart to fear\nAnd grace my fears relieved`
  )
  const [reflowed, setReflowed] = useState<ReflowedSection[]>([])
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  
  // VLC and Audio Mixer states
  const [vlcInfo, setVlcInfo] = useState<any>(null)
  const [micActive, setMicActive] = useState(false)
  const [musicActive, setMusicActive] = useState(false)

  // Web Remote state
  const [remoteUrl, setRemoteUrl] = useState('')

  // AI Transcriber states
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriberStatus, setTranscriberStatus] = useState('idle')
  const [transcriberMsg, setTranscriberMsg] = useState('')
  const [transcriptLog, setTranscriptLog] = useState<string[]>([])

  // OBS Automation states
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

  // Center Presentation Deck states
  const [activeCenterTab, setActiveCenterTab] = useState<'lyrics' | 'pdf'>('lyrics')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractingPdf, setExtractingPdf] = useState(false)
  const [pdfSlides, setPdfSlides] = useState<{ slideNumber: number; imageUrl: string }[]>([])
  const [selectedPdfSlideIndex, setSelectedPdfSlideIndex] = useState<number | null>(null)

  // Zustand Store Hooks
  const activeLyrics = useDisplayStore((state) => state.currentLyrics)
  const setLyrics = useDisplayStore((state) => state.setLyrics)
  const setStageInfo = useDisplayStore((state) => state.setStageInfo)
  const activeBackground = useDisplayStore((state) => state.activeBackground)
  const setBackground = useDisplayStore((state) => state.setBackground)

  const activeCameraDeviceId = useDisplayStore((state) => state.activeCameraDeviceId)
  const colorGrading = useDisplayStore((state) => state.colorGrading)
  const chromaKeyConfig = useDisplayStore((state) => state.chromaKey)
  const setCameraDeviceId = useDisplayStore((state) => state.setCameraDeviceId)
  const setColorGrading = useDisplayStore((state) => state.setColorGrading)
  const setChromaKey = useDisplayStore((state) => state.setChromaKey)

  // Audio Mixer Zustand hooks
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

  const projectSlide = (section: ReflowedSection, slideText: string, slideIndex: number): void => {
    setLyrics(slideText.split('\n'))

    let nextSlideText = ''
    if (slideIndex + 1 < section.slides.length) {
      nextSlideText = section.slides[slideIndex + 1]
    } else {
      const sectionIndex = reflowed.findIndex((s) => s.label === section.label)
      if (sectionIndex !== -1 && sectionIndex + 1 < reflowed.length) {
        const nextSec = reflowed[sectionIndex + 1]
        nextSlideText = `${nextSec.label}:\n${nextSec.slides[0]}`
      }
    }
    setStageInfo({ nextVerse: nextSlideText })

    // Trigger OBS scene switching
    ObsControllerService.handleSlideTransition(
      section.label,
      slideText,
      activeBackground.type === 'video'
    )
  }

  useEffect(() => {
    // Query connected monitors via our Electron IPC handler
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-displays').then((res) => {
        setDisplays(res)
      })
    }
    // Query camera sources
    CameraService.getCameras().then((res) => {
      setCameras(res)
    })

    // Setup VLC status polling
    let intervalId: any = null
    if (window.electron && window.electron.ipcRenderer) {
      const queryStatus = async () => {
        const res = await window.electron.ipcRenderer.invoke('vlc-control', 'status')
        if (res) {
          setVlcInfo(res)
          setVlcStatus(res.state.toUpperCase())
        } else {
          setVlcStatus('Disconnected')
        }
      }
      queryStatus()
      intervalId = setInterval(queryStatus, 1000)
    }

    // Query remote server URL
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-remote-url').then((url) => {
        setRemoteUrl(url)
      })
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      WebAudioMixer.cleanup()
      TranscriptionService.destroy()
      ObsControllerService.disconnect()
    }
  }, [])

  const triggerReposition = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('reposition-displays')
    }
  }

  // Listen to mobile remote actions
  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.on('remote-slide-action', (_event, action) => {
        handleRemoteSlideAction(action)
      })
    }
    return () => {
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('remote-slide-action')
      }
    }
  }, [reflowed, activeLyrics])

  const handleReflow = () => {
    const res = parseAndReflowRawLyrics(inputText, 2)
    setReflowed(res)
  }

  // Audio Mixer Change Handlers
  const handleMusicVolumeChange = (vol: number) => {
    setMusicVolume(vol)
    WebAudioMixer.setMusicGain(vol)
  }

  const handleMicVolumeChange = (vol: number) => {
    setMicVolume(vol)
    WebAudioMixer.setMicGain(vol)
  }

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol)
    WebAudioMixer.setMasterGain(vol)
  }

  const toggleMic = async () => {
    if (micActive) {
      WebAudioMixer.stopMicrophone()
      setMicActive(false)
    } else {
      const success = await WebAudioMixer.startMicrophone()
      if (success) {
        setMicActive(true)
        WebAudioMixer.setMicGain(micVolume)
      }
    }
  }

  const toggleMusic = () => {
    if (musicActive) {
      WebAudioMixer.stopMockMusic()
      setMusicActive(false)
    } else {
      WebAudioMixer.startMockMusic()
      setMusicActive(true)
      WebAudioMixer.setMusicGain(musicVolume)
    }
  }

  // VLC Action Handlers
  const triggerVlcCommand = async (action: string, arg?: any) => {
    if (window.electron && window.electron.ipcRenderer) {
      const res = await window.electron.ipcRenderer.invoke('vlc-control', action, arg)
      if (res) {
        setVlcInfo(res)
      }
    }
  }

  const handleVlcSeek = (time: number) => {
    triggerVlcCommand('seek', time)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Web Remote Slide Actions
  const handleRemoteSlideAction = (action: 'next' | 'prev') => {
    const flatSlides: { section: ReflowedSection; slide: string; slideIdx: number }[] = []
    reflowed.forEach((sec) => {
      sec.slides.forEach((slide, idx) => {
        flatSlides.push({ section: sec, slide, slideIdx: idx })
      })
    })

    if (flatSlides.length === 0) return

    const currentText = activeLyrics.join('\n')
    const currentIdx = flatSlides.findIndex((item) => item.slide === currentText)

    let targetIdx = -1
    if (action === 'next') {
      if (currentIdx === -1) targetIdx = 0
      else if (currentIdx + 1 < flatSlides.length) targetIdx = currentIdx + 1
    } else {
      if (currentIdx > 0) targetIdx = currentIdx - 1
    }

    if (targetIdx !== -1) {
      const target = flatSlides[targetIdx]
      projectSlide(target.section, target.slide, target.slideIdx)
    }
  }

  // AI Transcription Toggler
  const toggleTranscription = () => {
    if (isTranscribing) {
      TranscriptionService.stop()
      setIsTranscribing(false)
      setTranscriberStatus('idle')
      setTranscriberMsg('Stopped.')
    } else {
      setIsTranscribing(true)
      setTranscriberStatus('loading')
      TranscriptionService.start((status, text) => {
        setTranscriberStatus(status)
        if (status === 'loading' || status === 'ready' || status === 'error') {
          setTranscriberMsg(text || '')
        } else if (status === 'result' && text) {
          setTranscriptLog((prev) => [...prev, text])
        }
      })
    }
  }

  // OBS Connect Handler
  const toggleObsConnection = async () => {
    if (obsConnected) {
      await ObsControllerService.disconnect()
      setObsConnected(false)
      setObsStatusMsg('Disconnected.')
      setObsScenes([])
    } else {
      setObsStatusMsg('Connecting...')
      const success = await ObsControllerService.connect(
        obsHost,
        Number(obsPort),
        obsPassword,
        (connected, msg) => {
          setObsConnected(connected)
          setObsStatusMsg(msg || '')
          if (connected) {
            setObsScenes(ObsControllerService.getScenes())
          }
        }
      )
      if (!success) {
        setObsConnected(false)
      }
    }
  }

  const updateObsMapping = (category: string, scene: string) => {
    const updated = { ...obsMappings, [category]: scene }
    setObsMappings(updated)
    ObsControllerService.setMappings(updated)
  }

  // PDF Slide Importer Handlers
  const handleImportPdf = async () => {
    if (!pdfFile) return
    setExtractingPdf(true)
    try {
      const slides = await SlideImporter.extractSlidesFromPdf(pdfFile)
      setPdfSlides(slides)
      setSelectedPdfSlideIndex(null)
    } catch (error) {
      console.error('Failed to extract PDF slides:', error)
    } finally {
      setExtractingPdf(false)
    }
  }

  const projectPdfSlide = (index: number) => {
    setSelectedPdfSlideIndex(index)
    const target = pdfSlides[index]
    if (target) {
      setBackground({ type: 'image', value: target.imageUrl })
      setLyrics([])
      setStageInfo({ nextVerse: `Slide ${index + 2} of ${pdfSlides.length}` })
    }
  }

  const clearPdfSlides = () => {
    setPdfSlides([])
    setSelectedPdfSlideIndex(null)
    setPdfFile(null)
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 font-sans p-6 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CHURCHLE OPERATOR CONTROL
          </h1>
          <p className="text-xs text-slate-500 mt-1">Universal Presentation & Stage Management Suite v4.0</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={triggerReposition}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition duration-200 text-sm font-semibold rounded-lg shadow-md shadow-indigo-900/40"
          >
            Align Output Windows
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Col: Mapped Displays */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Output Windows
          </h2>
          <div className="space-y-4">
            {displays.length === 0 ? (
              <p className="text-slate-500 text-sm">Querying active screens...</p>
            ) : (
              displays.map((disp, idx) => (
                <div key={disp.id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">Display #{idx + 1} {idx === 0 && '(Primary Dashboard)'}</span>
                    <span className="text-slate-500">ID: {disp.id}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div>Resolution: {disp.bounds.width} × {disp.bounds.height} px</div>
                    <div>Position: X:{disp.bounds.x}, Y:{disp.bounds.y}</div>
                    <div>Scale Factor: {disp.scaleFactor}x</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-purple-950/20 border border-purple-800/30 rounded-lg">
            <h3 className="text-sm font-bold text-purple-400">Multi-Target looks status</h3>
            <ul className="mt-2 text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Audience screen: Running</li>
              <li>Stage monitor: Ready</li>
              <li>Foyer feed: Active</li>
            </ul>
          </div>

          {/* Camera Ingestion & GPU Shaders Controls */}
          <div className="mt-6 border-t border-slate-800 pt-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Live Video Ingestion
            </h2>

            {/* Camera Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">SELECT CAMERA SOURCE</label>
              <select
                value={activeCameraDeviceId}
                onChange={(e) => setCameraDeviceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- No Camera (Black Background) --</option>
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Grading Faders */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 block border-b border-slate-800 pb-1">
                GPU COLOR GRADING
              </label>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 w-24">Brightness: {colorGrading.brightness.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={colorGrading.brightness}
                    onChange={(e) => setColorGrading({ brightness: parseFloat(e.target.value) })}
                    className="w-1/2 accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 w-24">Contrast: {colorGrading.contrast.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={colorGrading.contrast}
                    onChange={(e) => setColorGrading({ contrast: parseFloat(e.target.value) })}
                    className="w-1/2 accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 w-24">Saturation: {colorGrading.saturation.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={colorGrading.saturation}
                    onChange={(e) => setColorGrading({ saturation: parseFloat(e.target.value) })}
                    className="w-1/2 accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Chroma Keying */}
            <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">GPU CHROMA KEYING</label>
                <input
                  type="checkbox"
                  checked={chromaKeyConfig.enabled}
                  onChange={(e) => setChromaKey({ enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-500 h-4 w-4 cursor-pointer"
                />
              </div>

              {chromaKeyConfig.enabled && (
                <div className="space-y-3 pt-2 text-xs border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Key Color:</span>
                    <input
                      type="color"
                      value={chromaKeyConfig.color}
                      onChange={(e) => setChromaKey({ color: e.target.value })}
                      className="h-6 w-10 border border-slate-800 rounded cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Similarity: {chromaKeyConfig.similarity.toFixed(2)}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={chromaKeyConfig.similarity}
                      onChange={(e) => setChromaKey({ similarity: parseFloat(e.target.value) })}
                      className="w-1/2 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Smoothness: {chromaKeyConfig.smoothness.toFixed(2)}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={chromaKeyConfig.smoothness}
                      onChange={(e) => setChromaKey({ smoothness: parseFloat(e.target.value) })}
                      className="w-1/2 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wireless Web Remote */}
            <div className="mt-6 border-t border-slate-800 pt-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                Wireless Web Remote
              </h2>
              {remoteUrl ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    SCAN OR GO TO URL
                  </div>
                  <a
                    href={remoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline font-mono break-all block"
                  >
                    {remoteUrl}
                  </a>
                  <div className="text-slate-500 text-[10px]">
                    Ensure mobile device is on the same WiFi/local network.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Initializing remote network url...</p>
              )}
            </div>

            {/* AI Speech-to-Text Transcriber */}
            <div className="mt-6 border-t border-slate-800 pt-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                AI Local Transcriber
              </h2>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Local Whisper Speech-to-Text</span>
                <button
                  onClick={toggleTranscription}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition duration-150 cursor-pointer ${
                    isTranscribing
                      ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isTranscribing ? 'Stop Transcriber' : 'Start Transcriber'}
                </button>
              </div>

              {/* Status Indicator */}
              {transcriberStatus !== 'idle' && (
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        transcriberStatus === 'loading'
                          ? 'bg-yellow-500 animate-pulse'
                          : transcriberStatus === 'ready'
                            ? 'bg-emerald-500 animate-pulse'
                            : 'bg-rose-500'
                      }`}
                    ></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Status: {transcriberStatus}
                    </span>
                  </div>
                  {transcriberMsg && <p className="text-[10px] text-slate-500">{transcriberMsg}</p>}
                </div>
              )}

              {/* Log output */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  REAL-TIME TRANSCRIPT LOG
                </span>
                <div className="h-24 bg-slate-950 border border-slate-850 rounded-lg p-2 overflow-y-auto text-[11px] font-mono text-slate-400 space-y-1.5 animate-pulse-slow">
                  {transcriptLog.length === 0 ? (
                    <span className="text-slate-600 italic">No speech captured yet.</span>
                  ) : (
                    transcriptLog.map((line, idx) => (
                      <div key={idx} className="border-b border-slate-900/50 pb-1">
                        <span className="text-[9px] text-indigo-500">[{idx + 1}]</span> {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* OBS Studio Automation */}
            <div className="mt-6 border-t border-slate-800 pt-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                OBS Studio Automation
              </h2>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Port</label>
                    <input
                      type="number"
                      value={obsPort}
                      onChange={(e) => setObsPort(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Password</label>
                    <input
                      type="password"
                      value={obsPassword}
                      onChange={(e) => setObsPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        obsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                      }`}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {obsStatusMsg}
                    </span>
                  </div>
                  <button
                    onClick={toggleObsConnection}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-855 border border-slate-800 transition duration-150 rounded text-xs font-bold cursor-pointer text-slate-300"
                  >
                    {obsConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {obsConnected && obsScenes.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    OBS SCENE MAPPINGS
                  </span>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                    {Object.keys(obsMappings).map((category) => (
                      <div key={category} className="flex items-center justify-between gap-3 text-slate-400">
                        <span className="font-mono text-[10px] uppercase font-bold">{category}:</span>
                        <select
                          value={obsMappings[category]}
                          onChange={(e) => updateObsMapping(category, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
                        >
                          <option value="">-- No Action --</option>
                          {obsScenes.map((scene) => (
                            <option key={scene} value={scene}>
                              {scene}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Center/Right Col: Lyric Reflow Parser Sandbox / PDF Slide Importer */}
        <section className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-lg font-bold text-slate-300">Presentation Deck Console</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCenterTab('lyrics')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-155 cursor-pointer ${
                  activeCenterTab === 'lyrics'
                    ? 'bg-indigo-600 text-slate-50 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lyrics Reflow Sandbox
              </button>
              <button
                onClick={() => setActiveCenterTab('pdf')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-155 cursor-pointer ${
                  activeCenterTab === 'pdf'
                    ? 'bg-indigo-600 text-slate-50 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                PDF Slide Importer
              </button>
            </div>
          </div>

          {activeCenterTab === 'lyrics' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <p className="text-xs text-slate-500">
                Test the live lyric parser. Paste raw lyrics below, set lines per slide (tested with 2 lines/slide), and generate slides.
              </p>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="[Verse 1]&#10;This is raw lyric lines...&#10;Paste song text here."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
              />

              <div className="flex gap-4 items-center">
                <button
                  onClick={handleReflow}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition duration-150 rounded-lg text-xs font-bold text-slate-100 shadow-md shadow-indigo-950/20 cursor-pointer"
                >
                  Parse & Reflow Lyrics
                </button>
                <div className="text-xs text-slate-500">
                  Auto-formats sections like Verse, Chorus, Bridge, tags, etc.
                </div>
              </div>

              {reflowed.length > 0 && (
                <div className="mt-3 flex-1 flex flex-col space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    REFLOWED SECTIONS
                  </span>

                  <div className="space-y-4 overflow-y-auto max-h-[300px] bg-slate-950/40 p-4 border border-slate-850 rounded-lg">
                    {reflowed.map((section, secIdx) => (
                      <div key={secIdx} className="space-y-2">
                        <div className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                          {section.label}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {section.slides.map((slide, slideIdx) => {
                            const isSelected = activeLyrics.join('\n') === slide
                            return (
                              <div
                                key={slideIdx}
                                onClick={() => projectSlide(section, slide, slideIdx)}
                                className={`p-3 rounded-lg border text-left cursor-pointer transition duration-155 text-xs font-medium leading-relaxed whitespace-pre-line ${
                                  isSelected
                                    ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 shadow-sm'
                                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                {slide}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCenterTab === 'pdf' && (
            <div className="space-y-5 flex-1 flex flex-col">
              <p className="text-xs text-slate-500">
                Upload a multi-page PDF presentation deck. Each page will be extracted as a high-resolution slide texture.
              </p>

              <div className="flex items-center gap-4 bg-slate-950/50 p-4 border border-slate-855 rounded-lg">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-350 focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-855 cursor-pointer file:cursor-pointer flex-1"
                />
                <button
                  onClick={handleImportPdf}
                  disabled={!pdfFile || extractingPdf}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition duration-150 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  {extractingPdf ? 'Extracting...' : 'Extract Slides'}
                </button>
              </div>

              {pdfSlides.length > 0 && (
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      EXTRACTED SLIDES ({pdfSlides.length})
                    </span>
                    <button
                      onClick={clearPdfSlides}
                      className="text-xs text-rose-455 hover:text-rose-400 font-bold transition duration-155 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto max-h-[300px] bg-slate-950/40 p-3 border border-slate-850 rounded-lg">
                    {pdfSlides.map((slide, idx) => (
                      <div
                        key={slide.slideNumber}
                        onClick={() => projectPdfSlide(idx)}
                        className={`group relative aspect-[4/3] border rounded-lg overflow-hidden cursor-pointer transition duration-155 ${
                          selectedPdfSlideIndex === idx
                            ? 'border-indigo-500 shadow-md shadow-indigo-950/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${slide.slideNumber}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/15 flex items-end justify-between p-2">
                          <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded text-slate-300 font-mono font-bold">
                            Pg {slide.slideNumber}
                          </span>
                          {selectedPdfSlideIndex === idx && (
                            <span className="text-[9px] bg-indigo-600 px-1.5 py-0.5 rounded text-slate-100 font-bold uppercase tracking-wider">
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Grid for Media & Audio Mixer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Col: Web Audio Mixer */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md space-y-5">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500"></span>
            Web Audio API Mixer
          </h2>

          {/* Toggles */}
          <div className="flex gap-3">
            <button
              onClick={toggleMusic}
              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition duration-150 cursor-pointer ${
                musicActive
                  ? 'bg-teal-950 border-teal-500 text-teal-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {musicActive ? 'Stop Music Pad' : 'Play Music Pad'}
            </button>
            <button
              onClick={toggleMic}
              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition duration-150 cursor-pointer ${
                micActive
                  ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {micActive ? 'Mic Ingestion: On' : 'Start Mic Input'}
            </button>
          </div>

          {/* Faders */}
          <div className="space-y-4 pt-2">
            {/* Music Fader */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>MUSIC PAD VOLUME</span>
                <span>{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="h-2 w-full bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 transition-all duration-75"
                  style={{ width: `${musicLevel * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Mic Fader */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>VOCAL MIC VOLUME</span>
                <span>{Math.round(micVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={micVolume}
                onChange={(e) => handleMicVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="h-2 w-full bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 transition-all duration-75"
                  style={{ width: `${micLevel * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Master Fader */}
            <div className="space-y-1.5 border-t border-slate-800 pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>MASTER OUTPUT VOLUME</span>
                <span>{Math.round(masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="h-2 w-full bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 transition-all duration-75"
                  style={{ width: `${masterLevel * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Auto Ducking Panel */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center font-semibold">
              <span className="font-bold text-slate-400">AUTO-DUCKING SYSTEM</span>
              <input
                type="checkbox"
                checked={duckingEnabled}
                onChange={(e) => setDuckingEnabled(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 accent-teal-500 h-4 w-4 cursor-pointer"
              />
            </div>

            {duckingEnabled && (
              <div className="space-y-3 border-t border-slate-800 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Threshold: {duckingThreshold} dB</span>
                  <input
                    type="range"
                    min="-60"
                    max="-10"
                    step="1"
                    value={duckingThreshold}
                    onChange={(e) => setDuckingThreshold(parseInt(e.target.value))}
                    className="w-1/2 accent-teal-500 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ducking Level: {Math.round(duckingDepth * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={duckingDepth}
                    onChange={(e) => setDuckingDepth(parseFloat(e.target.value))}
                    className="w-1/2 accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Center/Right Col: VLC Remote control */}
        <section className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            VLC Media Player Remote Control
          </h2>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                ACTIVE PLAYBACK STATUS
              </span>
              {vlcInfo ? (
                <div>
                  <h3 className="text-sm font-bold text-slate-200 line-clamp-1">
                    {vlcInfo.filename}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="capitalize px-2 py-0.5 bg-orange-950/40 border border-orange-900/30 text-orange-400 rounded-md">
                      {vlcInfo.state}
                    </span>
                    <span>Volume: {Math.round((vlcInfo.volume / 256) * 100)}%</span>
                    <span>Fullscreen: {vlcInfo.fullscreen ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <h3 className="text-sm font-bold text-slate-400">VLC Remote Offline</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Start VLC on port 8080 with password 'churchpassword' to synchronize controls.
                  </p>
                </div>
              )}
            </div>

            {/* Timeline seek fader */}
            {vlcInfo && vlcInfo.length > 0 && (
              <div className="space-y-1.5 pt-4">
                <input
                  type="range"
                  min="0"
                  max={vlcInfo.length}
                  value={vlcInfo.time}
                  onChange={(e) => handleVlcSeek(parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{formatTime(vlcInfo.time)}</span>
                  <span>{formatTime(vlcInfo.length)}</span>
                </div>
              </div>
            )}

            {/* Playback Control Deck */}
            <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => triggerVlcCommand('play')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-xs font-bold rounded-lg text-slate-100 transition shadow-md shadow-orange-900/20 cursor-pointer"
                >
                  Play
                </button>
                <button
                  onClick={() => triggerVlcCommand('pause')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-xs font-bold rounded-lg text-slate-300 transition cursor-pointer"
                >
                  Pause
                </button>
                <button
                  onClick={() => triggerVlcCommand('stop')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-xs font-bold rounded-lg text-slate-300 transition cursor-pointer"
                >
                  Stop
                </button>
              </div>

              {/* VLC Volume Slider */}
              {vlcInfo && (
                <div className="flex items-center gap-3 w-1/3 text-xs text-slate-500">
                  <span className="w-16">VLC Vol:</span>
                  <input
                    type="range"
                    min="0"
                    max="256"
                    value={vlcInfo.volume}
                    onChange={(e) => triggerVlcCommand('volume', parseInt(e.target.value))}
                    className="flex-1 accent-orange-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer Info bar */}
      <footer className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-600">
        <div>SQLite Database: Active | Path: AppData/Roaming/churchle/database/churchle.db</div>
        <div>VLC Remote Bridge: Status: {vlcStatus}</div>
      </footer>
    </div>
  )
}
