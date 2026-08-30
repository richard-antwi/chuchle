import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface AudioState {
  musicVolume: number
  micVolume: number
  masterVolume: number
  duckingEnabled: boolean
  duckingThreshold: number // in dB (-60 to -10)
  duckingDepth: number     // volume multiplier when ducked (0.0 to 1.0)
  duckingAttack: number    // fader drop ramp time in seconds
  duckingRelease: number   // fader recover ramp time in seconds

  // Real-time visual peak values for rendering VU meters (0.0 to 1.0)
  musicLevel: number
  micLevel: number
  masterLevel: number
}

interface AudioStore extends AudioState {
  setMusicVolume: (vol: number) => void
  setMicVolume: (vol: number) => void
  setMasterVolume: (vol: number) => void
  setDuckingEnabled: (enabled: boolean) => void
  setDuckingThreshold: (db: number) => void
  setDuckingDepth: (depth: number) => void
  setDuckingAttack: (sec: number) => void
  setDuckingRelease: (sec: number) => void
  setLevels: (music: number, mic: number, master: number) => void
}

export const useAudioStore = create<AudioStore>()(
  immer((set) => ({
    musicVolume: 0.8,
    micVolume: 0.7,
    masterVolume: 0.9,
    duckingEnabled: false,
    duckingThreshold: -35,
    duckingDepth: 0.2,
    duckingAttack: 0.05,
    duckingRelease: 1.2,
    musicLevel: 0,
    micLevel: 0,
    masterLevel: 0,

    setMusicVolume: (vol) => {
      set((state) => {
        state.musicVolume = vol
      })
    },
    setMicVolume: (vol) => {
      set((state) => {
        state.micVolume = vol
      })
    },
    setMasterVolume: (vol) => {
      set((state) => {
        state.masterVolume = vol
      })
    },
    setDuckingEnabled: (enabled) => {
      set((state) => {
        state.duckingEnabled = enabled
      })
    },
    setDuckingThreshold: (db) => {
      set((state) => {
        state.duckingThreshold = db
      })
    },
    setDuckingDepth: (depth) => {
      set((state) => {
        state.duckingDepth = depth
      })
    },
    setDuckingAttack: (sec) => {
      set((state) => {
        state.duckingAttack = sec
      })
    },
    setDuckingRelease: (sec) => {
      set((state) => {
        state.duckingRelease = sec
      })
    },
    setLevels: (music, mic, master) => {
      set((state) => {
        state.musicLevel = music
        state.micLevel = mic
        state.masterLevel = master
      })
    }
  }))
)
