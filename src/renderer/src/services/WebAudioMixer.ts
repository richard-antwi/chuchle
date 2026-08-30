import { useAudioStore } from '../stores/useAudioStore'

class WebAudioMixerService {
  private context: AudioContext | null = null

  private musicGainNode: GainNode | null = null
  private micGainNode: GainNode | null = null
  private masterGainNode: GainNode | null = null

  private musicAnalyser: AnalyserNode | null = null
  private micAnalyser: AnalyserNode | null = null
  private masterAnalyser: AnalyserNode | null = null

  private micStream: MediaStream | null = null
  private micSource: MediaStreamAudioSourceNode | null = null
  private synthOscillator: OscillatorNode | null = null
  private synthGain: GainNode | null = null

  private micData: Uint8Array<ArrayBuffer> = new Uint8Array(0) as Uint8Array<ArrayBuffer>
  private musicData: Uint8Array<ArrayBuffer> = new Uint8Array(0) as Uint8Array<ArrayBuffer>
  private masterData: Uint8Array<ArrayBuffer> = new Uint8Array(0) as Uint8Array<ArrayBuffer>

  private isDucked = false
  private updateLoopId: number | null = null

  public init() {
    if (this.context) return

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    this.context = new AudioContextClass()

    this.musicGainNode = this.context.createGain()
    this.micGainNode = this.context.createGain()
    this.masterGainNode = this.context.createGain()

    this.musicAnalyser = this.context.createAnalyser()
    this.musicAnalyser.fftSize = 256
    this.musicData = new Uint8Array(this.musicAnalyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

    this.micAnalyser = this.context.createAnalyser()
    this.micAnalyser.fftSize = 256
    this.micData = new Uint8Array(this.micAnalyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

    this.masterAnalyser = this.context.createAnalyser()
    this.masterAnalyser.fftSize = 256
    this.masterData = new Uint8Array(this.masterAnalyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

    this.musicGainNode.connect(this.musicAnalyser)
    this.musicAnalyser.connect(this.masterGainNode)

    this.micGainNode.connect(this.micAnalyser)
    this.micAnalyser.connect(this.masterGainNode)

    this.masterGainNode.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.context.destination)

    const store = useAudioStore.getState()
    this.musicGainNode.gain.value = store.musicVolume
    this.micGainNode.gain.value = store.micVolume
    this.masterGainNode.gain.value = store.masterVolume

    this.startUpdateLoop()
  }

  public async startMicrophone(): Promise<boolean> {
    this.init()
    if (!this.context) return false

    try {
      if (this.micStream) {
        this.stopMicrophone()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.micStream = stream

      if (this.context.state === 'suspended') {
        await this.context.resume()
      }

      this.micSource = this.context.createMediaStreamSource(stream)
      if (this.micSource && this.micGainNode) {
        this.micSource.connect(this.micGainNode)
      }
      return true
    } catch (error) {
      console.error('Failed to start microphone:', error)
      return false
    }
  }

  public stopMicrophone() {
    if (this.micSource) {
      this.micSource.disconnect()
      this.micSource = null
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop())
      this.micStream = null
    }
  }

  public startMockMusic() {
    this.init()
    if (!this.context) return

    if (this.synthOscillator) {
      this.stopMockMusic()
    }

    const osc = this.context.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 220

    const gain = this.context.createGain()
    gain.gain.value = 0.3

    osc.connect(gain)
    gain.connect(this.musicGainNode!)

    osc.start()
    this.synthOscillator = osc
    this.synthGain = gain
  }

  public stopMockMusic() {
    if (this.synthOscillator) {
      try {
        this.synthOscillator.stop()
      } catch (e) {}
      this.synthOscillator.disconnect()
      this.synthOscillator = null
    }
    if (this.synthGain) {
      this.synthGain.disconnect()
      this.synthGain = null
    }
  }

  public setMusicGain(vol: number) {
    if (this.musicGainNode && this.context) {
      const store = useAudioStore.getState()
      const actualVolume = this.isDucked ? vol * store.duckingDepth : vol
      this.musicGainNode.gain.setValueAtTime(actualVolume, this.context.currentTime)
    }
  }

  public setMicGain(vol: number) {
    if (this.micGainNode && this.context) {
      this.micGainNode.gain.setValueAtTime(vol, this.context.currentTime)
    }
  }

  public setMasterGain(vol: number) {
    if (this.masterGainNode && this.context) {
      this.masterGainNode.gain.setValueAtTime(vol, this.context.currentTime)
    }
  }

  private startUpdateLoop() {
    const tick = () => {
      this.processAudioMetrics()
      this.updateLoopId = requestAnimationFrame(tick)
    }
    this.updateLoopId = requestAnimationFrame(tick)
  }

  private processAudioMetrics() {
    if (
      !this.context ||
      !this.musicAnalyser ||
      !this.micAnalyser ||
      !this.masterAnalyser ||
      !this.musicGainNode
    )
      return

    const musicPeak = this.getPeak(this.musicAnalyser, this.musicData)
    const micPeak = this.getPeak(this.micAnalyser, this.micData)
    const masterPeak = this.getPeak(this.masterAnalyser, this.masterData)

    useAudioStore.getState().setLevels(musicPeak, micPeak, masterPeak)

    const store = useAudioStore.getState()
    if (store.duckingEnabled) {
      this.micAnalyser.getByteTimeDomainData(this.micData)
      let sum = 0
      for (let i = 0; i < this.micData.length; i++) {
        const val = (this.micData[i] - 128) / 128
        sum += val * val
      }
      const rms = Math.sqrt(sum / this.micData.length)
      const micDb = rms > 0 ? 20 * Math.log10(rms) : -100

      if (micDb > store.duckingThreshold) {
        if (!this.isDucked) {
          this.isDucked = true
          const targetVol = store.musicVolume * store.duckingDepth
          this.musicGainNode.gain.setTargetAtTime(
            targetVol,
            this.context.currentTime,
            store.duckingAttack
          )
        }
      } else {
        if (this.isDucked) {
          this.isDucked = false
          this.musicGainNode.gain.setTargetAtTime(
            store.musicVolume,
            this.context.currentTime,
            store.duckingRelease
          )
        }
      }
    } else {
      if (this.isDucked) {
        this.isDucked = false
        this.musicGainNode.gain.setValueAtTime(store.musicVolume, this.context.currentTime)
      }
    }
  }

  private getPeak(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>): number {
    analyser.getByteTimeDomainData(buffer)
    let max = 0
    for (let i = 0; i < buffer.length; i++) {
      const val = Math.abs(buffer[i] - 128)
      if (val > max) max = val
    }
    return max / 128
  }

  public cleanup() {
    if (this.updateLoopId) {
      cancelAnimationFrame(this.updateLoopId)
      this.updateLoopId = null
    }
    this.stopMicrophone()
    this.stopMockMusic()
    if (this.context) {
      this.context.close()
      this.context = null
    }
  }
}

export const WebAudioMixer = new WebAudioMixerService()
export default WebAudioMixer
