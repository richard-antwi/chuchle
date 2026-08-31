import { useState, useEffect } from 'react'
import { useDisplayStore } from '../stores/useDisplayStore'
import TopStatusBar from '../components/dashboard/TopStatusBar'
import LeftNavRail from '../components/dashboard/LeftNavRail'
import BottomPreviewBar from '../components/dashboard/BottomPreviewBar'

import SlidesTab from './tabs/SlidesTab'
import ScriptureHymnalTab from './tabs/ScriptureHymnalTab'
import CameraVisualsTab from './tabs/CameraVisualsTab'
import AudioTab from './tabs/AudioTab'
import StreamingTab from './tabs/StreamingTab'
import RemoteAiTab from './tabs/RemoteAiTab'
import DisplaysSetupTab from './tabs/DisplaysSetupTab'

import { ObsControllerService } from '../services/ObsControllerService'
import { ReflowedSection } from '../utils/smartLyricReflow'

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState<string>('slides')

  // Web Remote state
  const [remoteUrl, setRemoteUrl] = useState('')

  // AI Transcriber states
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriberStatus, setTranscriberStatus] = useState('idle')
  const [transcriberMsg, setTranscriberMsg] = useState('')
  const [transcriptLog, setTranscriptLog] = useState<string[]>([])

  // OBS Automation connection status
  const [obsConnected, setObsConnected] = useState(false)

  // Zustand Store Hooks
  const activeLyrics = useDisplayStore((state) => state.currentLyrics)
  const stageInfo = useDisplayStore((state) => state.stageInfo)
  const activeBackground = useDisplayStore((state) => state.activeBackground)

  const setLyrics = useDisplayStore((state) => state.setLyrics)
  const setStageInfo = useDisplayStore((state) => state.setStageInfo)
  const setBackground = useDisplayStore((state) => state.setBackground)

  // Query remote server URL & OBS status on mount
  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-remote-url').then((url) => {
        setRemoteUrl(url)
      })
    }
    setObsConnected(ObsControllerService.getConnected())
  }, [])

  // Listen to AI Transcriber Web Worker messages
  useEffect(() => {
    let worker: Worker | null = null
    try {
      worker = new Worker(new URL('../workers/transcription.worker.ts', import.meta.url), {
        type: 'module'
      })

      worker.onmessage = (e: MessageEvent) => {
        const { type, status, text, message } = e.data
        if (type === 'status') {
          setTranscriberStatus(status)
          if (message) setTranscriberMsg(message)
        } else if (type === 'result') {
          if (text) {
            setTranscriptLog((prev) => [...prev, text])
          }
        }
      }
    } catch (e) {
      console.error('Failed to initialize Whisper Web Worker:', e)
    }

    return () => {
      if (worker) worker.terminate()
    }
  }, [])

  const handleToggleTranscribe = () => {
    setIsTranscribing(!isTranscribing)
  }

  // Slide Projection Handlers
  const handleProjectSlide = (section: ReflowedSection, slideText: string) => {
    const lines = slideText.split('\n')
    setLyrics(lines)
    ObsControllerService.handleSlideTransition(
      section.label,
      slideText,
      activeBackground.type === 'video'
    )
  }

  const handleProjectPdfSlide = (target: { slideNumber: number; imageUrl: string }) => {
    setBackground({ type: 'image', value: target.imageUrl })
    setLyrics([])
  }

  const handleProjectBible = (lines: string[]) => {
    setLyrics(lines)
    setStageInfo({ nextVerse: 'End of scripture reading.' })
  }

  const handleProjectHymn = (lines: string[]) => {
    setLyrics(lines)
  }

  const handleClearSlide = () => {
    setLyrics([])
  }

  const handleGoLive = () => {
    if (activeLyrics.length > 0) {
      setLyrics([...activeLyrics])
    }
  }

  return (
    <div className="h-screen w-screen bg-[#0B0E14] text-[#E8EAED] font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Persistent Top Status Bar */}
      <TopStatusBar
        isLive={activeLyrics.length > 0}
        displayCount={3}
        vlcStatus="Playing"
        obsConnected={obsConnected}
        remoteUrl={remoteUrl}
        isTranscribing={isTranscribing}
      />

      {/* 2. Main Content Body: Left Rail + Active Tab Subsystem */}
      <div className="flex-1 flex overflow-hidden">
        <LeftNavRail activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 bg-[#0B0E14] overflow-hidden">
          {activeTab === 'slides' && (
            <SlidesTab onProjectSlide={handleProjectSlide} onProjectPdfSlide={handleProjectPdfSlide} />
          )}

          {activeTab === 'scripture' && (
            <ScriptureHymnalTab onProjectBible={handleProjectBible} onProjectHymn={handleProjectHymn} />
          )}

          {activeTab === 'camera' && <CameraVisualsTab />}

          {activeTab === 'audio' && <AudioTab />}

          {activeTab === 'streaming' && <StreamingTab />}

          {activeTab === 'remote' && (
            <RemoteAiTab
              remoteUrl={remoteUrl}
              isTranscribing={isTranscribing}
              transcriberStatus={transcriberStatus}
              transcriberMsg={transcriberMsg}
              transcriptLog={transcriptLog}
              onToggleTranscribe={handleToggleTranscribe}
            />
          )}

          {activeTab === 'setup' && <DisplaysSetupTab />}
        </main>
      </div>

      {/* 3. Persistent Bottom Slide Preview Bar */}
      <BottomPreviewBar
        currentSlideText={activeLyrics.join('\n')}
        nextSlideText={stageInfo.nextVerse}
        onClear={handleClearSlide}
        onGoLive={handleGoLive}
      />
    </div>
  )
}
