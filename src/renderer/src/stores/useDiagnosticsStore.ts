import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface DiagnosticsState {
  dbStatus: 'connected' | 'error'
  rendererStatus: 'ready' | 'fallback' | 'context-lost'
  audienceDisplayStatus: 'connected' | 'windowed' | 'disconnected'
  stageDisplayStatus: 'connected' | 'windowed' | 'disconnected'
  autosaveStatus: 'saved' | 'saving' | 'error'
  appVersion: string
}

interface DiagnosticsActions {
  setDbStatus: (status: DiagnosticsState['dbStatus']) => void
  setRendererStatus: (status: DiagnosticsState['rendererStatus']) => void
  setAudienceDisplayStatus: (status: DiagnosticsState['audienceDisplayStatus']) => void
  setStageDisplayStatus: (status: DiagnosticsState['stageDisplayStatus']) => void
  setAutosaveStatus: (status: DiagnosticsState['autosaveStatus']) => void
}

export const useDiagnosticsStore = create<DiagnosticsState & DiagnosticsActions>()(
  immer((set) => ({
    dbStatus: 'connected',
    rendererStatus: 'ready',
    audienceDisplayStatus: 'connected',
    stageDisplayStatus: 'connected',
    autosaveStatus: 'saved',
    appVersion: '5.0.0-hardened',

    setDbStatus: (status) =>
      set((state) => {
        state.dbStatus = status
      }),
    setRendererStatus: (status) =>
      set((state) => {
        state.rendererStatus = status
      }),
    setAudienceDisplayStatus: (status) =>
      set((state) => {
        state.audienceDisplayStatus = status
      }),
    setStageDisplayStatus: (status) =>
      set((state) => {
        state.stageDisplayStatus = status
      }),
    setAutosaveStatus: (status) =>
      set((state) => {
        state.autosaveStatus = status
      })
  }))
)
