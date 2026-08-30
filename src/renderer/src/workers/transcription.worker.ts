import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false

let transcriber: any = null
let audioChunks: Float32Array[] = []
let totalSamples = 0
const TARGET_SAMPLE_RATE = 16000

async function getTranscriber() {
  if (!transcriber) {
    postMessage({ status: 'loading', message: 'Downloading local Whisper AI model (~75MB)...' })
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en')
    postMessage({ status: 'ready', message: 'Whisper AI Transcriber is ready!' })
  }
  return transcriber
}

self.onmessage = async (event: MessageEvent) => {
  const { type, data } = event.data

  if (type === 'init') {
    try {
      await getTranscriber()
    } catch (err: any) {
      postMessage({ status: 'error', message: err.message || 'Failed to load model.' })
    }
  } else if (type === 'audio') {
    const rawBuffer = data.buffer as Float32Array
    const sampleRate = data.sampleRate as number

    const downsampled = downsample(rawBuffer, sampleRate, TARGET_SAMPLE_RATE)
    audioChunks.push(downsampled)
    totalSamples += downsampled.length

    // Run inference every 4 seconds of audio (64,000 samples)
    if (totalSamples >= TARGET_SAMPLE_RATE * 4) {
      try {
        const activeTranscriber = await getTranscriber()

        const mergedBuffer = new Float32Array(totalSamples)
        let offset = 0
        for (const chunk of audioChunks) {
          mergedBuffer.set(chunk, offset)
          offset += chunk.length
        }

        const response = await activeTranscriber(mergedBuffer, {
          chunk_length_s: 30,
          stride_length_s: 5,
          language: 'english',
          task: 'transcribe'
        })

        if (response && response.text) {
          postMessage({ status: 'result', text: response.text })
        }

        // Carry over overlapping context for Whisper speech stitching
        const overlapSamples = TARGET_SAMPLE_RATE * 1.5
        if (totalSamples > overlapSamples) {
          const overlapBuffer = mergedBuffer.slice(totalSamples - overlapSamples)
          audioChunks = [overlapBuffer]
          totalSamples = overlapBuffer.length
        } else {
          audioChunks = []
          totalSamples = 0
        }
      } catch (err: any) {
        console.error('Inference error in Web Worker:', err)
        postMessage({ status: 'error', message: err.message || 'Transcription error.' })
      }
    }
  } else if (type === 'reset') {
    audioChunks = []
    totalSamples = 0
  }
}

function downsample(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (inputRate === outputRate) return buffer
  const ratio = inputRate / outputRate
  const length = Math.round(buffer.length / ratio)
  const result = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const start = Math.round(i * ratio)
    const end = Math.round((i + 1) * ratio)
    let sum = 0
    let count = 0
    for (let j = start; j < end && j < buffer.length; j++) {
      sum += buffer[j]
      count++
    }
    result[i] = count > 0 ? sum / count : 0
  }
  return result
}
