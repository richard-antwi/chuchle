import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface ProjectionState {
  currentLyrics: string[]
  activeBackground: {
    type: 'color' | 'image' | 'video'
    value: string
  }
  activeTheme: {
    textColor: string
    fontFamily: string
    fontSize: number
  }
  stageInfo: {
    currentVerse: string
    nextVerse: string
    chords: string
  }
  activeCameraDeviceId: string
  colorGrading: {
    brightness: number
    contrast: number
    saturation: number
  }
  chromaKey: {
    enabled: boolean
    color: string
    similarity: number
    smoothness: number
  }
  uiThemeMode: 'dark' | 'light'
}

interface DisplayStore extends ProjectionState {
  setLyrics: (lyrics: string[]) => void
  setBackground: (bg: ProjectionState['activeBackground']) => void
  setStageInfo: (info: Partial<ProjectionState['stageInfo']>) => void
  setTheme: (theme: Partial<ProjectionState['activeTheme']>) => void
  setCameraDeviceId: (id: string) => void
  setColorGrading: (grading: Partial<ProjectionState['colorGrading']>) => void
  setChromaKey: (keying: Partial<ProjectionState['chromaKey']>) => void
  setUiThemeMode: (mode: 'dark' | 'light') => void
  toggleUiThemeMode: () => void
  updateState: (newState: Partial<ProjectionState>) => void
}

export const useDisplayStore = create<DisplayStore>()(
  immer((set, get) => ({
    currentLyrics: ['Welcome to Churchle'],
    activeBackground: { type: 'color', value: '#0a0f1d' },
    activeTheme: { textColor: '#ffffff', fontFamily: 'Arial', fontSize: 48 },
    stageInfo: { currentVerse: 'Welcome to Churchle', nextVerse: '', chords: '' },
    activeCameraDeviceId: '',
    colorGrading: { brightness: 1.0, contrast: 1.0, saturation: 1.0 },
    chromaKey: { enabled: false, color: '#00ff00', similarity: 0.4, smoothness: 0.1 },

    uiThemeMode: 'dark',

    setLyrics: (lyrics) => {
      set((state) => {
        state.currentLyrics = lyrics
      })
      syncStateToMain(get())
    },
    setBackground: (bg) => {
      set((state) => {
        state.activeBackground = bg
      })
      syncStateToMain(get())
    },
    setStageInfo: (info) => {
      set((state) => {
        state.stageInfo = { ...state.stageInfo, ...info }
      })
      syncStateToMain(get())
    },
    setTheme: (theme) => {
      set((state) => {
        state.activeTheme = { ...state.activeTheme, ...theme }
      })
      syncStateToMain(get())
    },
    setCameraDeviceId: (id) => {
      set((state) => {
        state.activeCameraDeviceId = id
      })
      syncStateToMain(get())
    },
    setColorGrading: (grading) => {
      set((state) => {
        state.colorGrading = { ...state.colorGrading, ...grading }
      })
      syncStateToMain(get())
    },
    setChromaKey: (keying) => {
      set((state) => {
        state.chromaKey = { ...state.chromaKey, ...keying }
      })
      syncStateToMain(get())
    },
    setUiThemeMode: (mode) => {
      set((state) => {
        state.uiThemeMode = mode
      })
    },
    toggleUiThemeMode: () => {
      set((state) => {
        state.uiThemeMode = state.uiThemeMode === 'dark' ? 'light' : 'dark'
      })
    },
    updateState: (newState) => {
      set((state) => {
        if (newState.currentLyrics !== undefined) state.currentLyrics = newState.currentLyrics
        if (newState.activeBackground !== undefined) state.activeBackground = newState.activeBackground
        if (newState.activeTheme !== undefined) state.activeTheme = newState.activeTheme
        if (newState.stageInfo !== undefined) state.stageInfo = newState.stageInfo
        if (newState.activeCameraDeviceId !== undefined) state.activeCameraDeviceId = newState.activeCameraDeviceId
        if (newState.colorGrading !== undefined) state.colorGrading = newState.colorGrading
        if (newState.chromaKey !== undefined) state.chromaKey = newState.chromaKey
      })
    }
  }))
)

function syncStateToMain(state: ProjectionState): void {
  if (window.electron && window.electron.ipcRenderer) {
    const rawState = {
      currentLyrics: state.currentLyrics,
      activeBackground: state.activeBackground,
      activeTheme: state.activeTheme,
      stageInfo: state.stageInfo,
      activeCameraDeviceId: state.activeCameraDeviceId,
      colorGrading: state.colorGrading,
      chromaKey: state.chromaKey
    }
    window.electron.ipcRenderer.send('update-projection-state', rawState)
  }
}

if (window.electron && window.electron.ipcRenderer) {
  window.electron.ipcRenderer.on('projection-state-updated', (_event, newState) => {
    useDisplayStore.getState().updateState(newState)
  })
}
