class TranscriptionServiceClass {
  private worker: Worker | null = null
  private audioContext: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private stream: MediaStream | null = null
  private statusCallback: ((status: string, text?: string) => void) | null = null

  public start(callback: (status: string, text?: string) => void) {
    this.statusCallback = callback

    if (!this.worker) {
      this.worker = new Worker(
        new URL('../workers/transcription.worker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = (event) => {
        const { status, message, text } = event.data
        if (status === 'loading') {
          this.statusCallback?.('loading', message)
        } else if (status === 'ready') {
          this.statusCallback?.('ready', message)
        } else if (status === 'error') {
          this.statusCallback?.('error', message)
        } else if (status === 'result') {
          this.statusCallback?.('result', text)
        }
      }
    }

    this.worker.postMessage({ type: 'init' })
    this.startAudioCapture()
  }

  private async startAudioCapture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.stream = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()

      const source = this.audioContext.createMediaStreamSource(stream)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

      this.processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0)
        const bufferCopy = new Float32Array(inputBuffer)

        if (this.worker) {
          this.worker.postMessage({
            type: 'audio',
            data: {
              buffer: bufferCopy,
              sampleRate: this.audioContext!.sampleRate
            }
          })
        }
      }

      source.connect(this.processor)
      this.processor.connect(this.audioContext.destination)
    } catch (err: any) {
      console.error('Audio capture failure for Whisper Transcriber:', err)
      this.statusCallback?.('error', 'Microphone capture blocked: ' + err.message)
    }
  }

  public stop() {
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    if (this.worker) {
      this.worker.postMessage({ type: 'reset' })
    }
    this.statusCallback?.('stopped', 'Transcriber stopped.')
  }

  public destroy() {
    this.stop()
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}

export const TranscriptionService = new TranscriptionServiceClass()
export default TranscriptionService
