import { useState, useEffect, useCallback } from 'react'
import MenuBar from '../components/dashboard/MenuBar'
import DashboardToolbar from '../components/dashboard/DashboardToolbar'
import LibraryPanel, { SongItem } from '../components/dashboard/LibraryPanel'
import OrderOfServicePanel, { ServiceQueueItem } from '../components/dashboard/OrderOfServicePanel'
import PreviewStagePanel from '../components/dashboard/PreviewStagePanel'
import LiveStagePanel from '../components/dashboard/LiveStagePanel'
import MockupStatusBar from '../components/dashboard/MockupStatusBar'

import BibleView from './tabs/BibleView'
import HymnalView from './tabs/HymnalView'
import CameraVisualsTab from './tabs/CameraVisualsTab'
import AudioTab from './tabs/AudioTab'
import StreamingTab from './tabs/StreamingTab'
import RemoteAiTab from './tabs/RemoteAiTab'
import ThemeManagerView from './tabs/ThemeManagerView'
import SettingsView from './tabs/SettingsView'

import { useDisplayStore } from '../stores/useDisplayStore'
import { ObsControllerService } from '../services/ObsControllerService'

export default function OperatorDashboard() {
  const [activeMode, setActiveMode] = useState<string>('slides')

  // Service Queue State
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
    }
  ])

  // 2-STAGE COMMIT STATES
  // Stage 1: Preview Staging
  const [stagedItemId, setStagedItemId] = useState<string>('svc_how_great')
  const [stagedSlideIndex, setStagedSlideIndex] = useState<number>(0)

  // Stage 2: Live On-Air Output
  const [liveItemId, setLiveItemId] = useState<string>('svc_amazing_grace')
  const [liveSlideIndex, setLiveSlideIndex] = useState<number>(0)

  const [isBlanked, setIsBlanked] = useState<boolean>(false)
  const [isCleared, setIsCleared] = useState<boolean>(false)

  const [selectedSongId, setSelectedSongId] = useState<string>('song_amazing_grace')
  const [obsConnected, setObsConnected] = useState(false)
  const [remoteUrl, setRemoteUrl] = useState('')

  // AI Transcriber state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriberStatus] = useState('idle')
  const [transcriberMsg] = useState('')
  const [transcriptLog] = useState<string[]>([])

  // Zustand Display Store Hooks
  const updateStoreLyrics = useDisplayStore((state) => state.setLyrics)
  const setStageInfo = useDisplayStore((state) => state.setStageInfo)
  const activeBackground = useDisplayStore((state) => state.activeBackground)

  // Derived Items
  const stagedItem = serviceQueue.find((i) => i.id === stagedItemId) || serviceQueue[0]
  const stagedSlides = stagedItem ? stagedItem.slides || [] : []
  const stagedSlideText = stagedSlides[stagedSlideIndex] || ''

  const liveItem = serviceQueue.find((i) => i.id === liveItemId) || serviceQueue[1]
  const liveSlides = liveItem ? liveItem.slides || [] : []
  const liveSlideText = liveSlides[liveSlideIndex] || ''

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('get-remote-url').then((url) => {
        setRemoteUrl(url)
      })
    }
    setObsConnected(ObsControllerService.getConnected())
  }, [])

  // Send updates to WebGL Audience outputs & IPC state
  const broadcastLiveState = useCallback(
    (itemTitle: string, text: string, nextText: string) => {
      updateStoreLyrics([text])
      setStageInfo({ nextVerse: nextText })
      ObsControllerService.handleSlideTransition(itemTitle, text, activeBackground.type === 'video')

      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('update-projection-state', {
          currentLyrics: [text],
          stageInfo: { nextVerse: nextText }
        })
      }
    },
    [updateStoreLyrics, setStageInfo, activeBackground]
  )

  // COMMIT FUNCTION: Send Preview -> Live
  const handleCommitPreviewToLive = useCallback(() => {
    setLiveItemId(stagedItemId)
    setLiveSlideIndex(stagedSlideIndex)
    setIsBlanked(false)

    setServiceQueue((prev) =>
      prev.map((i) => ({
        ...i,
        isCurrent: i.id === stagedItemId
      }))
    )

    const nextText = stagedSlides[stagedSlideIndex + 1] || 'End of item'
    broadcastLiveState(stagedItem.title, stagedSlideText, nextText)
  }, [stagedItemId, stagedSlideIndex, stagedItem, stagedSlides, stagedSlideText, broadcastLiveState])

  // Direct Live Jump (within current live item)
  const handleSelectLiveSlideDirect = (idx: number) => {
    setLiveSlideIndex(idx)
    setIsBlanked(false)
    const text = liveSlides[idx] || ''
    const nextText = liveSlides[idx + 1] || 'End of item'
    broadcastLiveState(liveItem.title, text, nextText)
  }

  // Stage 1: Single Click in Service Queue -> Load into Preview
  const handleStageServiceItem = (item: ServiceQueueItem) => {
    setStagedItemId(item.id)
    setStagedSlideIndex(0)
  }

  const handleAddToServiceQueue = (item: ServiceQueueItem) => {
    setServiceQueue((prev) => [...prev, item])
    setStagedItemId(item.id)
    setStagedSlideIndex(0)
  }

  // Double Click in Library -> Add to Service Queue & Stage in Preview
  const handleSelectSongFromLibrary = (song: SongItem) => {
    setSelectedSongId(song.id)
    const newQueueItem: ServiceQueueItem = {
      id: `svc_${song.id}_${Date.now()}`,
      title: song.title,
      sub: song.author || 'Song library item',
      type: 'song',
      slides: [
        `${song.title}\nVerse 1`,
        'Amazing grace how sweet the sound\nThat saved a wretch like me',
        'Was blind but now I see'
      ]
    }
    handleAddToServiceQueue(newQueueItem)
  }

  // Disk Service File Save / Open Handlers
  const handleSaveServiceFile = async () => {
    if (window.electron && window.electron.ipcRenderer) {
      await window.electron.ipcRenderer.invoke('save-service-file', serviceQueue)
    }
  }

  const handleOpenServiceFile = async () => {
    if (window.electron && window.electron.ipcRenderer) {
      const loaded = await window.electron.ipcRenderer.invoke('open-service-file')
      if (Array.isArray(loaded)) {
        setServiceQueue(loaded)
        if (loaded[0]) {
          setStagedItemId(loaded[0].id)
          setStagedSlideIndex(0)
        }
      }
    }
  }

  // Keyboard Shortcuts (Section 2 OpenLP-Pattern)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        const currentIdx = serviceQueue.findIndex((i) => i.id === stagedItemId)
        if (currentIdx > 0) {
          const nextItem = serviceQueue[currentIdx - 1]
          setStagedItemId(nextItem.id)
          setStagedSlideIndex(0)
        }
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        const currentIdx = serviceQueue.findIndex((i) => i.id === stagedItemId)
        if (currentIdx !== -1 && currentIdx < serviceQueue.length - 1) {
          const nextItem = serviceQueue[currentIdx + 1]
          setStagedItemId(nextItem.id)
          setStagedSlideIndex(0)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (stagedSlideIndex < stagedSlides.length - 1) {
          setStagedSlideIndex(stagedSlideIndex + 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (stagedSlideIndex > 0) {
          setStagedSlideIndex(stagedSlideIndex - 1)
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleCommitPreviewToLive()
      } else if (e.key === 'Escape' || e.code === 'KeyB') {
        e.preventDefault()
        setIsBlanked((prev) => !prev)
      } else if (e.code === 'KeyC') {
        e.preventDefault()
        setIsCleared((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [serviceQueue, stagedItemId, stagedSlideIndex, stagedSlides, handleCommitPreviewToLive])

  // Subsystem Handoffs
  const handleProjectBible = (lines: string[]) => {
    const newQueueItem: ServiceQueueItem = {
      id: `svc_bible_${Date.now()}`,
      title: lines[0] || 'Scripture Passage',
      sub: 'Scripture lookup',
      type: 'scripture',
      slides: lines
    }
    handleAddToServiceQueue(newQueueItem)
    setActiveMode('slides')
  }

  const handleProjectHymn = (lines: string[]) => {
    const newQueueItem: ServiceQueueItem = {
      id: `svc_hymn_${Date.now()}`,
      title: lines[0] || 'Methodist Hymn',
      sub: 'MHB Hymnal',
      type: 'hymnal',
      slides: lines
    }
    handleAddToServiceQueue(newQueueItem)
    setActiveMode('slides')
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-app-bg text-app-text font-sans overflow-hidden select-none">
      {/* 1. Menu Bar */}
      <MenuBar />

      {/* 2. Toolbar */}
      <DashboardToolbar activeMode={activeMode} onModeChange={setActiveMode} isLive={liveSlides.length > 0} />

      {/* 3. Main OpenLP 4-Panel Body */}
      <div className="mockup-main flex-1 flex min-h-0">
        {/* Panel 1: Song Library */}
        <LibraryPanel selectedSongId={selectedSongId} onSelectSong={handleSelectSongFromLibrary} />

        {/* Panel 2 & 3 & 4 (OpenLP Staging Model) */}
        {activeMode === 'slides' && (
          <>
            {/* Panel 2: Service Queue */}
            <OrderOfServicePanel
              queueItems={serviceQueue}
              currentQueueItemId={stagedItemId}
              onSelectQueueItem={handleStageServiceItem}
              onSaveService={handleSaveServiceFile}
              onOpenService={handleOpenServiceFile}
            />

            {/* Panel 3: Preview (Staging Area) */}
            <PreviewStagePanel
              itemTitle={stagedItem.title}
              slideText={stagedSlideText}
              slides={stagedSlides}
              selectedIndex={stagedSlideIndex}
              onSelectSlide={setStagedSlideIndex}
              onSendLive={handleCommitPreviewToLive}
            />

            {/* Panel 4: Live (On-Air Congregation Output) */}
            <LiveStagePanel
              itemTitle={liveItem.title}
              slideText={liveSlideText}
              slides={liveSlides}
              selectedIndex={liveSlideIndex}
              isBlanked={isBlanked}
              isCleared={isCleared}
              onSelectSlideDirect={handleSelectLiveSlideDirect}
              onToggleBlank={() => setIsBlanked(!isBlanked)}
              onToggleClear={() => setIsCleared(!isCleared)}
            />
          </>
        )}

        {/* Dedicated Subsystem Tabs */}
        {activeMode !== 'slides' && (
          <div className="flex-1 bg-app-panel p-0 overflow-hidden border-r border-app-border">
            {activeMode === 'bible' ? (
              <BibleView onProjectBible={handleProjectBible} onAddToService={handleAddToServiceQueue} />
            ) : activeMode === 'hymnal' ? (
              <HymnalView onProjectHymn={handleProjectHymn} onAddToService={handleAddToServiceQueue} />
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
            ) : activeMode === 'themes' ? (
              <ThemeManagerView />
            ) : activeMode === 'settings' ? (
              <SettingsView />
            ) : null}
          </div>
        )}
      </div>

      {/* 4. Status Bar Footer */}
      <MockupStatusBar audienceOk={true} stageOk={true} foyerOk={true} obsConnected={obsConnected} />
    </div>
  )
}
