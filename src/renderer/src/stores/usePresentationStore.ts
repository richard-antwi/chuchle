import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { ServiceItem, convertStringsToSlideItems, extractSlideText } from '../models/SlideModel'
import { useDisplayStore } from './useDisplayStore'

export interface PresentationStoreState {
  serviceQueue: ServiceItem[]
  selectedServiceItemId: string | null
  previewItemId: string | null
  previewSlideIndex: number
  liveItemId: string | null
  liveSlideIndex: number
  isBlanked: boolean
  isCleared: boolean
  uiThemeMode: 'dark' | 'light'
}

interface PresentationStoreActions {
  setServiceQueue: (queue: ServiceItem[]) => void
  addServiceItem: (item: ServiceItem) => void
  removeServiceItem: (id: string) => void
  reorderServiceQueue: (newQueue: ServiceItem[]) => void

  // PREVIEW ACTIONS (Never touch Live Output!)
  selectServiceItem: (id: string) => void
  setPreviewSlide: (index: number) => void
  navigatePreviewSlide: (delta: number) => void

  // LIVE COMMIT ACTIONS (Updates Audience Output)
  commitPreviewToLive: () => void
  setLiveSlideDirect: (index: number) => void
  navigateLiveSlide: (delta: number) => void
  setFirstSlide: () => void
  setLastSlide: () => void

  // EMERGENCY TOGGLES
  toggleBlank: () => void
  toggleClearText: () => void
  setUiThemeMode: (mode: 'dark' | 'light') => void
  toggleUiThemeMode: () => void
}

export type PresentationStore = PresentationStoreState & PresentationStoreActions

const initialDefaultQueue: ServiceItem[] = [
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
]

export const usePresentationStore = create<PresentationStore>()(
  immer((set, get) => ({
    serviceQueue: initialDefaultQueue,
    selectedServiceItemId: 'svc_apostles_creed',
    previewItemId: 'svc_apostles_creed',
    previewSlideIndex: 0,
    liveItemId: 'svc_apostles_creed',
    liveSlideIndex: 0,
    isBlanked: false,
    isCleared: false,
    uiThemeMode: 'dark',

    setServiceQueue: (queue) => {
      set((state) => {
        state.serviceQueue = queue
      })
    },

    addServiceItem: (item) => {
      set((state) => {
        state.serviceQueue.push(item)
        state.selectedServiceItemId = item.id
        state.previewItemId = item.id
        state.previewSlideIndex = 0
      })
    },

    removeServiceItem: (id) => {
      set((state) => {
        state.serviceQueue = state.serviceQueue.filter((i) => i.id !== id)
        if (state.previewItemId === id) {
          state.previewItemId = state.serviceQueue[0]?.id || null
          state.previewSlideIndex = 0
        }
      })
    },

    reorderServiceQueue: (newQueue) => {
      set((state) => {
        state.serviceQueue = newQueue
      })
    },

    // STAGING / PREVIEW SELECTION: Strictly leaves Live output untouched!
    selectServiceItem: (id) => {
      set((state) => {
        state.selectedServiceItemId = id
        state.previewItemId = id
        state.previewSlideIndex = 0
      })
    },

    setPreviewSlide: (index) => {
      set((state) => {
        const item = state.serviceQueue.find((i) => i.id === state.previewItemId)
        if (!item) return
        const slides = item.slides || []
        const clamped = Math.max(0, Math.min(index, slides.length - 1))
        state.previewSlideIndex = clamped
      })
    },

    navigatePreviewSlide: (delta) => {
      set((state) => {
        const item = state.serviceQueue.find((i) => i.id === state.previewItemId)
        if (!item) return
        const slides = item.slides || []
        const clamped = Math.max(0, Math.min(state.previewSlideIndex + delta, slides.length - 1))
        state.previewSlideIndex = clamped
      })
    },

    // LIVE COMMIT: Broadcasts to Audience & Stage Displays
    commitPreviewToLive: () => {
      set((state) => {
        state.liveItemId = state.previewItemId
        state.liveSlideIndex = state.previewSlideIndex
        state.isBlanked = false
        state.serviceQueue.forEach((i) => {
          i.isCurrent = i.id === state.previewItemId
        })
      })
      broadcastCurrentLiveState(get())
    },

    setLiveSlideDirect: (index) => {
      set((state) => {
        const item = state.serviceQueue.find((i) => i.id === state.liveItemId)
        if (!item) return
        const slides = item.slides || []
        const clamped = Math.max(0, Math.min(index, slides.length - 1))
        state.liveSlideIndex = clamped
        state.isBlanked = false
      })
      broadcastCurrentLiveState(get())
    },

    navigateLiveSlide: (delta) => {
      set((state) => {
        const item = state.serviceQueue.find((i) => i.id === state.liveItemId)
        if (!item) return
        const slides = item.slides || []
        const clamped = Math.max(0, Math.min(state.liveSlideIndex + delta, slides.length - 1))
        state.liveSlideIndex = clamped
        state.isBlanked = false
      })
      broadcastCurrentLiveState(get())
    },

    setFirstSlide: () => {
      set((state) => {
        state.liveSlideIndex = 0
        state.isBlanked = false
      })
      broadcastCurrentLiveState(get())
    },

    setLastSlide: () => {
      set((state) => {
        const item = state.serviceQueue.find((i) => i.id === state.liveItemId)
        if (!item) return
        const slides = item.slides || []
        state.liveSlideIndex = Math.max(0, slides.length - 1)
        state.isBlanked = false
      })
      broadcastCurrentLiveState(get())
    },

    toggleBlank: () => {
      set((state) => {
        state.isBlanked = !state.isBlanked
      })
      broadcastCurrentLiveState(get())
    },

    toggleClearText: () => {
      set((state) => {
        state.isCleared = !state.isCleared
      })
      broadcastCurrentLiveState(get())
    },

    setUiThemeMode: (mode) => {
      set((state) => {
        state.uiThemeMode = mode
      })
      useDisplayStore.getState().setUiThemeMode(mode)
    },

    toggleUiThemeMode: () => {
      set((state) => {
        const next = state.uiThemeMode === 'dark' ? 'light' : 'dark'
        state.uiThemeMode = next
        useDisplayStore.getState().setUiThemeMode(next)
      })
    }
  }))
)

function broadcastCurrentLiveState(state: PresentationStoreState): void {
  const liveItem = state.serviceQueue.find((i) => i.id === state.liveItemId)
  if (!liveItem) return

  const slides = convertStringsToSlideItems(liveItem.slides || [])
  const currentSlide = slides[state.liveSlideIndex]
  const nextSlide = slides[state.liveSlideIndex + 1]

  const liveText = state.isBlanked ? '' : state.isCleared ? '' : extractSlideText(currentSlide)
  const nextText = extractSlideText(nextSlide) || 'End of item'

  // Update Zustand Display Store
  useDisplayStore.getState().setLyrics([liveText])
  useDisplayStore.getState().setStageInfo({
    currentVerse: liveText,
    nextVerse: nextText
  })

  // Broadcast IPC to auxiliary window renderers
  if (typeof window !== 'undefined' && window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('update-projection-state', {
      currentLyrics: [liveText],
      stageInfo: { currentVerse: liveText, nextVerse: nextText }
    })
  }
}
