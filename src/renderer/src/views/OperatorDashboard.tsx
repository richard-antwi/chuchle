import { useState, useEffect, useCallback } from 'react'
import MenuBar from '../components/dashboard/MenuBar'
import DashboardToolbar from '../components/dashboard/DashboardToolbar'
import LibraryAccordionPanel from '../components/dashboard/LibraryAccordionPanel'
import OpenLpCenterPanel from '../components/dashboard/OpenLpCenterPanel'
import ServiceAndThemesPanel from '../components/dashboard/ServiceAndThemesPanel'
import MockupStatusBar from '../components/dashboard/MockupStatusBar'
import { SongItem } from '../components/dashboard/LibraryPanel'
import { ServiceQueueItem } from '../components/dashboard/OrderOfServicePanel'

import BibleView from './tabs/BibleView'
import HymnalView from './tabs/HymnalView'
import CameraVisualsTab from './tabs/CameraVisualsTab'
import AudioTab from './tabs/AudioTab'
import StreamingTab from './tabs/StreamingTab'
import RemoteAiTab from './tabs/RemoteAiTab'
import ThemeManagerView from './tabs/ThemeManagerView'
import SettingsView from './tabs/SettingsView'
import CustomSlidesTab from './tabs/CustomSlidesTab'
import PresentationsTab from './tabs/PresentationsTab'
import ParallelScriptureView from './tabs/ParallelScriptureView'
import MusicianStageTab from './tabs/MusicianStageTab'

import { useDisplayStore } from '../stores/useDisplayStore'
import { ObsControllerService } from '../services/ObsControllerService'

export default function OperatorDashboard() {
  const [activeMode, setActiveMode] = useState<string>('slides')

  // Sample Songs Library
  const [songLibrary] = useState<SongItem[]>([
    { id: 'song_my_hope', title: '"My Hope Is Built on Nothing Less"', author: 'Anonymous' },
    { id: 'song_with_everything', title: '"With Everything"', author: 'Hillsong United' },
    { id: 'song_apostles_creed', title: 'Apostles Creed ( )', author: '' },
    { id: 'song_cantic1', title: 'CANTICLE 1 ( )', author: '' },
    { id: 'song_cantic2', title: 'CANTICLE 2 ( )', author: '' },
    { id: 'song_great_is_thy', title: 'great is thy faithfulness', author: 'Anonymous' },
    { id: 'song_mhb1', title: 'MHB1 (Charles Wesley)', author: 'Charles Wesley' },
    { id: 'song_mhb2', title: 'MHB2 (William Kethe, d)', author: 'William Kethe' },
    { id: 'song_mhb3', title: 'MHB3 (Isaac Watts, alt. by John Wesley)', author: 'Isaac Watts' },
    { id: 'song_mhb4', title: 'MHB4 (Isaac Watts, 1674-1748)', author: 'Isaac Watts' }
  ])

  const [selectedSongId, setSelectedSongId] = useState<string>('song_apostles_creed')

  // Service Queue State
  const [serviceQueue, setServiceQueue] = useState<ServiceQueueItem[]>([
    {
      id: 'svc_apostles_creed',
      title: 'Apostles Creed',
      sub: 'Creed Confession',
      type: 'song',
      slides: [
        'I Believe in God the Father Almighty,\nMaker of heaven and earth:\nAnd in Jesus Christ his only son rendering,\nBorn of the Virgin Mary,',
        'Suffered under Pontius Pilate, Was Crucified, dead, and buried,\nHe descended into hell; The third day He rose again from the dead.\nHe ascended into heaven',
        'And sitteth on the right hand of God the Father Almighty;\nFrom thence He shall come to judge the quick and the dead.\nI believe in the Holy Ghost; The holy Catholic church;',
        'The communion of Saints; The Forgiveness of sins;\nThe Resurrection of the body, And the life everlasting. Amen'
      ]
    },
    {
      id: 'svc_amazing_grace',
      title: 'Amazing Grace',
      sub: 'Verse 2 of 4 — on air',
      type: 'song',
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
    }
  ])

  // 2-STAGE COMMIT STATES
  const [stagedItemId, setStagedItemId] = useState<string>('svc_apostles_creed')
  const [stagedSlideIndex, setStagedSlideIndex] = useState<number>(0)

  const [liveItemId, setLiveItemId] = useState<string>('svc_apostles_creed')
  const [liveSlideIndex, setLiveSlideIndex] = useState<number>(0)

  const [isBlanked, setIsBlanked] = useState<boolean>(false)
  const [isCleared, setIsCleared] = useState<boolean>(false)

  const [obsConnected, setObsConnected] = useState(false)
  const [remoteUrl, setRemoteUrl] = useState('')

  // Zustand Display Store Hooks
  const updateStoreLyrics = useDisplayStore((state) => state.setLyrics)
  const setStageInfo = useDisplayStore((state) => state.setStageInfo)
  const activeBackground = useDisplayStore((state) => state.activeBackground)

  // Derived Items
  const stagedItem = serviceQueue.find((i) => i.id === stagedItemId) || serviceQueue[0]
  const stagedSlides = stagedItem ? stagedItem.slides || [] : []

  const liveItem = serviceQueue.find((i) => i.id === liveItemId) || serviceQueue[0]
  const liveSlides = liveItem ? liveItem.slides || [] : []

  const uiThemeMode = useDisplayStore((state) => state.uiThemeMode)

  useEffect(() => {
    const root = document.documentElement
    if (uiThemeMode === 'light') {
      root.style.setProperty('--bg', '#eef0f3')
      root.style.setProperty('--panel', '#ffffff')
      root.style.setProperty('--border', '#d7dbe1')
      root.style.setProperty('--border-strong', '#b9c0ca')
      root.style.setProperty('--text', '#22262c')
      root.style.setProperty('--text-2', '#5b6270')
      root.style.setProperty('--text-3', '#9399a4')
      root.style.setProperty('--accent', '#2f6fed')
      root.style.setProperty('--accent-bg', '#e8f0fe')
      root.style.setProperty('--toolbar', '#f6f7f9')
      root.style.setProperty('--live', '#d8352c')
      root.style.setProperty('--live-bg', '#fdeceb')
    } else {
      root.style.setProperty('--bg', '#1e1e1e')
      root.style.setProperty('--panel', '#2d2d2d')
      root.style.setProperty('--border', '#3e3e42')
      root.style.setProperty('--border-strong', '#505054')
      root.style.setProperty('--text', '#ffffff')
      root.style.setProperty('--text-2', '#bbbbbb')
      root.style.setProperty('--text-3', '#888888')
      root.style.setProperty('--accent', '#2b73d2')
      root.style.setProperty('--accent-bg', '#1b4985')
      root.style.setProperty('--toolbar', '#252526')
      root.style.setProperty('--live', '#d8352c')
      root.style.setProperty('--live-bg', '#3f1917')
    }
  }, [uiThemeMode])

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

    const liveText = stagedSlides[stagedSlideIndex] || ''
    const nextText = stagedSlides[stagedSlideIndex + 1] || 'End of item'
    broadcastLiveState(stagedItem.title, liveText, nextText)
  }, [stagedItemId, stagedSlideIndex, stagedItem, stagedSlides, broadcastLiveState])

  // Direct Live Jump
  const handleSelectLiveSlideDirect = (idx: number) => {
    setLiveSlideIndex(idx)
    setIsBlanked(false)
    const text = liveSlides[idx] || ''
    const nextText = liveSlides[idx + 1] || 'End of item'
    broadcastLiveState(liveItem.title, text, nextText)
  }

  // Queue Item Stage Action
  const handleStageServiceItem = (item: ServiceQueueItem) => {
    setStagedItemId(item.id)
    setStagedSlideIndex(0)
  }

  const handleAddToServiceQueue = (item: ServiceQueueItem) => {
    setServiceQueue((prev) => [...prev, item])
    setStagedItemId(item.id)
    setStagedSlideIndex(0)
  }

  const handleSelectSongFromLibrary = (song: SongItem) => {
    setSelectedSongId(song.id)
    const existing = serviceQueue.find((i) => i.title.toLowerCase().includes(song.title.toLowerCase()))
    if (existing) {
      setStagedItemId(existing.id)
      setStagedSlideIndex(0)
    }
  }

  const handleSendSongDirectToLive = (song: SongItem) => {
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
    setServiceQueue((prev) => [...prev, newQueueItem])
    setStagedItemId(newQueueItem.id)
    setStagedSlideIndex(0)
    setLiveItemId(newQueueItem.id)
    setLiveSlideIndex(0)
    broadcastLiveState(newQueueItem.title, newQueueItem.slides![0], newQueueItem.slides![1])
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

      {/* 2. Mode Switcher Toolbar */}
      <DashboardToolbar activeMode={activeMode} onModeChange={setActiveMode} isLive={liveSlides.length > 0} />

      {/* 3. Main OpenLP 3-Column Body (Matching Picture 1) */}
      <div className="mockup-main flex-1 flex min-h-0 bg-app-bg">
        {activeMode === 'slides' && (
          <>
            {/* Column 1: Library Accordion (Left ~260px) */}
            <LibraryAccordionPanel
              songs={songLibrary}
              selectedSongId={selectedSongId}
              onSelectSong={handleSelectSongFromLibrary}
              onAddToService={(s) =>
                handleAddToServiceQueue({
                  id: `svc_${s.id}_${Date.now()}`,
                  title: s.title,
                  sub: s.author || 'Song library',
                  type: 'song',
                  slides: [`${s.title}\nVerse 1`, 'Amazing grace how sweet the sound']
                })
              }
              onSendLiveDirect={handleSendSongDirectToLive}
            />

            {/* Column 2: Dual Preview & Live Panels (Center Flex-1) */}
            <OpenLpCenterPanel
              stagedTitle={stagedItem.title}
              stagedSlides={stagedSlides}
              stagedSlideIndex={stagedSlideIndex}
              onSelectStagedSlide={setStagedSlideIndex}
              onSendLive={handleCommitPreviewToLive}
              liveTitle={liveItem.title}
              liveSlides={liveSlides}
              liveSlideIndex={liveSlideIndex}
              isBlanked={isBlanked}
              isCleared={isCleared}
              onSelectLiveSlideDirect={handleSelectLiveSlideDirect}
              onToggleBlank={() => setIsBlanked(!isBlanked)}
              onToggleClear={() => setIsCleared(!isCleared)}
            />

            {/* Column 3: Service Order & Themes (Right ~260px) */}
            <ServiceAndThemesPanel
              queueItems={serviceQueue}
              stagedItemId={stagedItemId}
              onSelectQueueItem={handleStageServiceItem}
              onSaveService={handleSaveServiceFile}
              onOpenService={handleOpenServiceFile}
            />
          </>
        )}

        {/* Dedicated Subsystem Overlays */}
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
                isTranscribing={false}
                transcriberStatus="idle"
                transcriberMsg=""
                transcriptLog={[]}
                onToggleTranscribe={() => {}}
              />
            ) : activeMode === 'themes' ? (
              <ThemeManagerView />
            ) : activeMode === 'settings' ? (
              <SettingsView />
            ) : activeMode === 'custom' ? (
              <CustomSlidesTab
                onAddToService={handleAddToServiceQueue}
                onSendLiveDirect={(item) => {
                  handleAddToServiceQueue(item)
                  handleCommitPreviewToLive()
                }}
              />
            ) : activeMode === 'decks' ? (
              <PresentationsTab
                onAddToService={handleAddToServiceQueue}
                onSendLiveDirect={(item) => {
                  handleAddToServiceQueue(item)
                  handleCommitPreviewToLive()
                }}
              />
            ) : activeMode === 'parallel' ? (
              <ParallelScriptureView
                onProjectBible={handleProjectBible}
                onAddToService={handleAddToServiceQueue}
              />
            ) : activeMode === 'chords' ? (
              <MusicianStageTab />
            ) : null}
          </div>
        )}
      </div>

      {/* 4. Status Bar Footer */}
      <MockupStatusBar audienceOk={true} stageOk={true} foyerOk={true} obsConnected={obsConnected} />
    </div>
  )
}
