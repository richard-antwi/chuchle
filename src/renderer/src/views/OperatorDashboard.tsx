import { useState, useEffect } from 'react'
import MenuBar from '../components/dashboard/MenuBar'
import DashboardToolbar from '../components/dashboard/DashboardToolbar'
import LibraryPanel, { SongItem } from '../components/dashboard/LibraryPanel'
import OrderOfServicePanel, { ServiceQueueItem } from '../components/dashboard/OrderOfServicePanel'
import StagePreviewPanel from '../components/dashboard/StagePreviewPanel'
import MockupStatusBar from '../components/dashboard/MockupStatusBar'

import BibleView from './tabs/BibleView'
import ScriptureHymnalTab from './tabs/ScriptureHymnalTab'
import CameraVisualsTab from './tabs/CameraVisualsTab'
import AudioTab from './tabs/AudioTab'
import StreamingTab from './tabs/StreamingTab'
import RemoteAiTab from './tabs/RemoteAiTab'

import { useDisplayStore } from '../stores/useDisplayStore'
import { ObsControllerService } from '../services/ObsControllerService'

export default function OperatorDashboard() {
  const [activeMode, setActiveMode] = useState<string>('slides')

  // Service Queue State matching approved mockup HTML
  const [serviceQueue, setServiceQueue] = useState<ServiceQueueItem[]>([
    {
      id: 'svc_psalm_100',
      title: 'Call to worship — Psalm 100',
      sub: 'Scripture reading',
      type: 'scripture',
      slides: ['Make a joyful noise unto the LORD,\nall ye lands.\nServe the LORD with gladness.']
    },
    {
      id: 'svc_amazing_grace',
      title: 'Amazing Grace',
      sub: 'Verse 2 of 4 — on air',
      type: 'song',
      isCurrent: true,
      slides: [
        'Amazing grace how sweet the sound\nThat saved a wretch like me',
        'Twas grace that taught\nmy heart to fear',
        'And grace my fears\nrelieved',
        'How precious did\nthat grace appear'
      ]
    },
    {
      id: 'svc_how_great',
      title: 'How Great Thou Art',
      sub: '4 verses, 1 chorus',
      type: 'song',
      slides: ['O Lord my God,\nWhen I in awesome wonder', 'Then sings my soul,\nMy Saviour God, to Thee']
    },
    {
      id: 'svc_announcements',
      title: 'Announcements',
      sub: 'PDF import — 3 slides',
      type: 'pdf',
      slides: ['Welcome to Churchle Sanctuary', 'Youth Camp Registration Open']
    },
    {
      id: 'svc_john_316',
      title: 'Sermon text — John 3:16',
      sub: 'Parallel KJV / NIV',
      type: 'scripture',
      slides: ['For God so loved the world | For God so loved the world']
    },
    {
      id: 'svc_nyame_ye',
      title: 'Nyame Ye',
      sub: 'Twi / English hymnal',
      type: 'hymnal',
      slides: ['Nyame ye pa | God is good']
    },
    {
      id: 'svc_offering',
      title: 'Offering',
      sub: 'Background loop',
      type: 'other',
      slides: ['Tithes & Offering']
    },
    {
      id: 'svc_blessed',
      title: 'Blessed Assurance',
      sub: 'Closing hymn',
      type: 'song',
      slides: ['Blessed assurance, Jesus is mine!']
    }
  ])

  const [currentQueueItemId, setCurrentQueueItemId] = useState<string>('svc_amazing_grace')
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(1)
  const [selectedSongId, setSelectedSongId] = useState<string>('song_amazing_grace')

  // OBS WebSocket state
  const [obsConnected, setObsConnected] = useState(false)

  // Web Remote state
  const [remoteUrl, setRemoteUrl] = useState('')

  // AI Transcriber state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriberStatus, setTranscriberStatus] = useState('idle')
  const [transcriberMsg, setTranscriberMsg] = useState('')
  const [transcriptLog, setTranscriptLog] = useState<string[]>([])

  // Zustand Display Store Hooks
  const activeLyrics = useDisplayStore((state) => state.currentLyrics)
  const stageInfo = useDisplayStore((state) => state.stageInfo)
  const activeBackground = useDisplayStore((state) => state.activeBackground)

  const setLyrics = useDisplayStore((state) => state.setLyrics)
  const setStageInfo = useDisplayStore((state) => state.setStageInfo)

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-remote-url').then((url) => {
        setRemoteUrl(url)
      })
    }
    setObsConnected(ObsControllerService.getConnected())
  }, [])

  // Listen to AI Transcriber Web Worker
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
          if (text) setTranscriptLog((prev) => [...prev, text])
        }
      }
    } catch (e) {
      console.error('Whisper worker initialization error:', e)
    }
    return () => {
      if (worker) worker.terminate()
    }
  }, [])

  // Active Queue Item details
  const activeQueueItem = serviceQueue.find((item) => item.id === currentQueueItemId) || serviceQueue[1]
  const currentSlides = activeQueueItem.slides || []

  // Selection Handlers
  const handleSelectSongFromLibrary = (song: SongItem) => {
    setSelectedSongId(song.id)
    const newQueueItem: ServiceQueueItem = {
      id: `svc_${song.id}_${Date.now()}`,
      title: song.title,
      sub: song.author || 'Song library item',
      type: 'song',
      isCurrent: true,
      slides: [
        `${song.title}\nVerse 1`,
        'Amazing grace how sweet the sound\nThat saved a wretch like me',
        'Was blind but now I see'
      ]
    }
    setServiceQueue((prev) => [newQueueItem, ...prev.map((i) => ({ ...i, isCurrent: false }))])
    setCurrentQueueItemId(newQueueItem.id)
    setSelectedSlideIndex(0)
    setLyrics([newQueueItem.slides![0]])
    setStageInfo({ nextVerse: newQueueItem.slides![1] || 'End of song' })
  }

  const handleSelectQueueItem = (item: ServiceQueueItem) => {
    setCurrentQueueItemId(item.id)
    setServiceQueue((prev) =>
      prev.map((i) => ({
        ...i,
        isCurrent: i.id === item.id
      }))
    )
    setSelectedSlideIndex(0)
    const itemSlides = item.slides || []
    if (itemSlides.length > 0) {
      setLyrics([itemSlides[0]])
      setStageInfo({ nextVerse: itemSlides[1] || 'End of presentation' })
      ObsControllerService.handleSlideTransition(item.title, itemSlides[0], activeBackground.type === 'video')
    }
  }

  const handleSelectSlideIndex = (idx: number) => {
    setSelectedSlideIndex(idx)
    if (currentSlides[idx]) {
      setLyrics([currentSlides[idx]])
      setStageInfo({ nextVerse: currentSlides[idx + 1] || 'End of presentation' })
      ObsControllerService.handleSlideTransition(
        activeQueueItem.title,
        currentSlides[idx],
        activeBackground.type === 'video'
      )
    }
  }

  // Handlers for Subsystem Handoffs
  const handleProjectBible = (lines: string[]) => {
    setLyrics(lines)
    setStageInfo({ nextVerse: 'End of scripture reading.' })
    setActiveMode('slides')
  }

  const handleProjectHymn = (lines: string[]) => {
    setLyrics(lines)
    setActiveMode('slides')
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#eef0f3] text-[#22262c] font-sans overflow-hidden select-none">
      {/* 1. Menu Bar */}
      <MenuBar />

      {/* 2. Toolbar */}
      <DashboardToolbar activeMode={activeMode} onModeChange={setActiveMode} isLive={activeLyrics.length > 0} />

      {/* 3. Main 3-Pane Body */}
      <div className="mockup-main">
        {/* Left Pane: Song Library */}
        <LibraryPanel selectedSongId={selectedSongId} onSelectSong={handleSelectSongFromLibrary} />

        {/* Middle & Right Panes */}
        {activeMode === 'slides' && (
          <>
            <OrderOfServicePanel
              queueItems={serviceQueue}
              currentQueueItemId={currentQueueItemId}
              onSelectQueueItem={handleSelectQueueItem}
            />

            <StagePreviewPanel
              liveText={activeLyrics.join('\n')}
              nextText={stageInfo.nextVerse}
              slides={currentSlides}
              currentSlideIndex={selectedSlideIndex}
              onSelectSlideIndex={handleSelectSlideIndex}
            />
          </>
        )}

        {/* Subsystem Overlays */}
        {activeMode !== 'slides' && (
          <div className="flex-1 bg-white p-0 overflow-hidden border-r border-[#d7dbe1]">
            {activeMode === 'bible' ? (
              <BibleView onProjectBible={handleProjectBible} />
            ) : activeMode === 'hymnal' ? (
              <ScriptureHymnalTab onProjectBible={handleProjectBible} onProjectHymn={handleProjectHymn} />
            ) : activeMode === 'camera' ? (
              <CameraVisualsTab />
            ) : activeMode === 'audio' ? (
              <AudioTab />
            ) : activeMode === 'stream' ? (
              <StreamingTab />
            ) : activeMode === 'remote' ? (
              <RemoteAiTab
                remoteUrl={remoteUrl}
                isTranscribing={isTranscribing}
                transcriberStatus={transcriberStatus}
                transcriberMsg={transcriberMsg}
                transcriptLog={transcriptLog}
                onToggleTranscribe={() => setIsTranscribing(!isTranscribing)}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* 4. Status Bar Footer */}
      <MockupStatusBar audienceOk={true} stageOk={true} foyerOk={true} obsConnected={obsConnected} />
    </div>
  )
}
