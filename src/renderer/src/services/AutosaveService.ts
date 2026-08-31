import { usePresentationStore, PresentationStoreState } from '../stores/usePresentationStore'
import { useDiagnosticsStore } from '../stores/useDiagnosticsStore'

let autosaveTimer: any = null

export class AutosaveService {
  public static init(): void {
    // Subscribe to store changes and save state gracefully
    usePresentationStore.subscribe((state) => {
      this.scheduleAutosave(state)
    })

    // Attempt automatic state restoration on launch
    this.restoreAutosaveState()
  }

  private static scheduleAutosave(state: PresentationStoreState): void {
    if (autosaveTimer) clearTimeout(autosaveTimer)

    autosaveTimer = setTimeout(() => {
      this.performAutosave(state)
    }, 3000)
  }

  public static async performAutosave(state: PresentationStoreState): Promise<boolean> {
    try {
      useDiagnosticsStore.getState().setAutosaveStatus('saving')
      const payload = {
        timestamp: new Date().toISOString(),
        serviceQueue: state.serviceQueue,
        selectedServiceItemId: state.selectedServiceItemId,
        previewItemId: state.previewItemId,
        previewSlideIndex: state.previewSlideIndex,
        liveItemId: state.liveItemId,
        liveSlideIndex: state.liveSlideIndex,
        isBlanked: state.isBlanked,
        isCleared: state.isCleared,
        uiThemeMode: state.uiThemeMode
      }

      if (window.electron && window.electron.ipcRenderer) {
        const ok = await window.electron.ipcRenderer.invoke('save-autosave-state', payload)
        if (ok) {
          useDiagnosticsStore.getState().setAutosaveStatus('saved')
          return true
        }
      }
      useDiagnosticsStore.getState().setAutosaveStatus('saved')
      return true
    } catch (err) {
      console.warn('Autosave failed:', err)
      useDiagnosticsStore.getState().setAutosaveStatus('error')
      return false
    }
  }

  public static async restoreAutosaveState(): Promise<boolean> {
    try {
      if (window.electron && window.electron.ipcRenderer) {
        const restored = await window.electron.ipcRenderer.invoke('load-autosave-state')
        if (restored && Array.isArray(restored.serviceQueue) && restored.serviceQueue.length > 0) {
          const store = usePresentationStore.getState()
          store.setServiceQueue(restored.serviceQueue)
          if (restored.previewItemId) store.selectServiceItem(restored.previewItemId)
          if (typeof restored.previewSlideIndex === 'number') store.setPreviewSlide(restored.previewSlideIndex)
          if (restored.liveItemId) {
            store.selectServiceItem(restored.liveItemId)
            store.commitPreviewToLive()
          }
          if (typeof restored.liveSlideIndex === 'number') store.setLiveSlideDirect(restored.liveSlideIndex)
          if (restored.uiThemeMode) store.setUiThemeMode(restored.uiThemeMode)

          useDiagnosticsStore.getState().setAutosaveStatus('saved')
          return true
        }
      }
      return false
    } catch (err) {
      console.warn('Autosave restoration error:', err)
      useDiagnosticsStore.getState().setAutosaveStatus('error')
      return false
    }
  }
}
