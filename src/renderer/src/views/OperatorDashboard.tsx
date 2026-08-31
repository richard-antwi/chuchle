import { useState, useEffect } from 'react'
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
import { usePresentationStore } from '../stores/usePresentationStore'
import { AutosaveService } from '../services/AutosaveService'
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

  // CENTRALIZED PRESENTATION STORE HOOKS
  const serviceQueue = usePresentationStore((state) => state.serviceQueue)
  const stagedItemId = usePresentationStore((state) => state.previewItemId) || 'svc_apostles_creed'
  const stagedSlideIndex = usePresentationStore((state) => state.previewSlideIndex)
  const liveItemId = usePresentationStore((state) => state.liveItemId) || 'svc_apostles_creed'
  const liveSlideIndex = usePresentationStore((state) => state.liveSlideIndex)
  const isBlanked = usePresentationStore((state) => state.isBlanked)
  const isCleared = usePresentationStore((state) => state.isCleared)

  const selectServiceItem = usePresentationStore((state) => state.selectServiceItem)
  const setPreviewSlide = usePresentationStore((state) => state.setPreviewSlide)
  const commitPreviewToLive = usePresentationStore((state) => state.commitPreviewToLive)
  const setLiveSlideDirect = usePresentationStore((state) => state.setLiveSlideDirect)
  const toggleBlank = usePresentationStore((state) => state.toggleBlank)
  const toggleClearText = usePresentationStore((state) => state.toggleClearText)
  const addServiceItem = usePresentationStore((state) => state.addServiceItem)
  const setServiceQueue = usePresentationStore((state) => state.setServiceQueue)
  const navigateLiveSlide = usePresentationStore((state) => state.navigateLiveSlide)
  const setFirstSlide = usePresentationStore((state) => state.setFirstSlide)
  const setLastSlide = usePresentationStore((state) => state.setLastSlide)

  const [obsConnected, setObsConnected] = useState(false)
  const [remoteUrl, setRemoteUrl] = useState('')

  // Derived Items
  const stagedItem = serviceQueue.find((i) => i.id === stagedItemId) || serviceQueue[0]
  const stagedSlides = (stagedItem ? stagedItem.slides || [] : []) as string[]

  const liveItem = serviceQueue.find((i) => i.id === liveItemId) || serviceQueue[0]
  const liveSlides = (liveItem ? liveItem.slides || [] : []) as string[]

  const uiThemeMode = useDisplayStore((state) => state.uiThemeMode)

  useEffect(() => {
    // Initialize Autosave Engine on mount
    AutosaveService.init()
  }, [])

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

  // Queue Item Stage Action
  const handleStageServiceItem = (item: any) => {
    selectServiceItem(item.id)
  }

  const handleAddToServiceQueue = (item: any) => {
    addServiceItem(item)
  }

  const handleSelectSongFromLibrary = (song: SongItem) => {
    setSelectedSongId(song.id)
    const existing = serviceQueue.find((i) => i.title.toLowerCase().includes(song.title.toLowerCase()))
    if (existing) {
      selectServiceItem(existing.id)
    }
  }

  const handleSendSongDirectToLive = (song: SongItem) => {
    setSelectedSongId(song.id)
    const newQueueItem: any = {
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
    addServiceItem(newQueueItem)
    commitPreviewToLive()
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
          selectServiceItem(loaded[0].id)
        }
      }
    }
  }

  // Production Emergency Keyboard Controls & Typing Focus Safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard against typing in form inputs, textareas, selects, or editable elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        const currentIdx = serviceQueue.findIndex((i) => i.id === stagedItemId)
        if (currentIdx > 0) {
          selectServiceItem(serviceQueue[currentIdx - 1].id)
        }
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        const currentIdx = serviceQueue.findIndex((i) => i.id === stagedItemId)
        if (currentIdx !== -1 && currentIdx < serviceQueue.length - 1) {
          selectServiceItem(serviceQueue[currentIdx + 1].id)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateLiveSlide(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateLiveSlide(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setFirstSlide()
      } else if (e.key === 'End') {
        e.preventDefault()
        setLastSlide()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        commitPreviewToLive()
      } else if (e.key === 'Escape' || e.code === 'KeyB') {
        e.preventDefault()
        toggleBlank()
      } else if (e.code === 'KeyC') {
        e.preventDefault()
        toggleClearText()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    serviceQueue,
    stagedItemId,
    selectServiceItem,
    navigateLiveSlide,
    setFirstSlide,
    setLastSlide,
    commitPreviewToLive,
    toggleBlank,
    toggleClearText
  ])

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
              stagedTitle={stagedItem?.title || 'No item staged'}
              stagedSlides={stagedSlides}
              stagedSlideIndex={stagedSlideIndex}
              onSelectStagedSlide={setPreviewSlide}
              onSendLive={commitPreviewToLive}
              liveTitle={liveItem?.title || 'No item live'}
              liveSlides={liveSlides}
              liveSlideIndex={liveSlideIndex}
              isBlanked={isBlanked}
              isCleared={isCleared}
              onSelectLiveSlideDirect={setLiveSlideDirect}
              onToggleBlank={toggleBlank}
              onToggleClear={toggleClearText}
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
                  commitPreviewToLive()
                }}
              />
            ) : activeMode === 'decks' ? (
              <PresentationsTab
                onAddToService={handleAddToServiceQueue}
                onSendLiveDirect={(item) => {
                  handleAddToServiceQueue(item)
                  commitPreviewToLive()
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
