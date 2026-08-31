import { useState } from 'react'
import { useDisplayStore } from '../../stores/useDisplayStore'

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export default function MusicianStageTab() {
  const [songTitle, setSongTitle] = useState('Amazing Grace (My Chains Are Gone)')
  const [originalKey, setOriginalKey] = useState('G')
  const [targetKey, setTargetKey] = useState('G')

  const [rawChordLines, setRawChordLines] = useState(
    '[G] Amazing grace how [C] sweet the [G] sound\nThat [G] saved a wretch like [D] me\nI [G] once was lost but [C] now am [G] found\nWas [G] blind but [D] now I [G] see'
  )

  const setStageInfo = useDisplayStore((state) => state.setStageInfo)

  const transposeChord = (chord: string, semitones: number): string => {
    const root = chord.replace(/m|maj7|7|sus4|add9|dim|aug/g, '')
    const suffix = chord.substring(root.length)
    const idx = CHROMATIC_SCALE.indexOf(root)
    if (idx === -1) return chord
    const newIdx = (idx + semitones + 12) % 12
    return CHROMATIC_SCALE[newIdx] + suffix
  }

  const getSemitoneOffset = (fromKey: string, toKey: string): number => {
    const fromIdx = CHROMATIC_SCALE.indexOf(fromKey)
    const toIdx = CHROMATIC_SCALE.indexOf(toKey)
    if (fromIdx === -1 || toIdx === -1) return 0
    return toIdx - fromIdx
  }

  const semitoneOffset = getSemitoneOffset(originalKey, targetKey)

  const renderTransposedContent = (): string => {
    return rawChordLines.replace(/\[([A-G][b#]?[^\]]*)\]/g, (_match, chord) => {
      const transposed = transposeChord(chord, semitoneOffset)
      return `[${transposed}]`
    })
  }

  const transposedText = renderTransposedContent()

  const handleBroadcastToStage = () => {
    setStageInfo({
      chords: `Key: ${targetKey} (${semitoneOffset >= 0 ? `+${semitoneOffset}` : semitoneOffset} semitones)\n${transposedText}`
    })
    alert(`Broadcast key of ${targetKey} chords to Musician Stage Monitor!`)
  }

  const handleStepKey = (delta: number) => {
    const curIdx = CHROMATIC_SCALE.indexOf(targetKey)
    if (curIdx === -1) return
    const newIdx = (curIdx + delta + 12) % 12
    setTargetKey(CHROMATIC_SCALE[newIdx])
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
          <span>🎸</span>
          Musician Stage Display Chord Transposition Engine
        </h2>

        <button
          onClick={handleBroadcastToStage}
          className="px-4 py-1.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          <span>📡</span>
          <span>Broadcast Chords to Musician Stage Monitor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Transposition Controls */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Song Title</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-xs font-bold text-app-text focus:outline-none"
              />
            </div>

            {/* Key Selector & Stepper */}
            <div className="grid grid-cols-2 gap-4 bg-app-toolbar border border-app-border p-4 rounded-xl">
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Original Key</label>
                <select
                  value={originalKey}
                  onChange={(e) => setOriginalKey(e.target.value)}
                  className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-1.5 text-xs text-app-text font-bold focus:outline-none"
                >
                  {CHROMATIC_SCALE.map((k) => (
                    <option key={k} value={k}>
                      Key of {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-app-accent uppercase font-bold">Target Transposed Key</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStepKey(-1)}
                    className="px-2 py-1 bg-app-panel border border-app-border rounded text-xs font-extrabold hover:border-app-accent cursor-pointer"
                  >
                    -1
                  </button>
                  <select
                    value={targetKey}
                    onChange={(e) => setTargetKey(e.target.value)}
                    className="flex-1 bg-app-panel border border-app-border rounded-lg px-2 py-1.5 text-xs text-app-accent font-extrabold focus:outline-none text-center"
                  >
                    {CHROMATIC_SCALE.map((k) => (
                      <option key={k} value={k}>
                        Key of {k}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStepKey(1)}
                    className="px-2 py-1 bg-app-panel border border-app-border rounded text-xs font-extrabold hover:border-app-accent cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Raw Chord Text Input */}
            <div className="space-y-1">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Raw Chord Lyric Chart (brackets [G] mark chords)</label>
              <textarea
                rows={6}
                value={rawChordLines}
                onChange={(e) => setRawChordLines(e.target.value)}
                className="w-full bg-app-toolbar border border-app-border rounded-lg p-3 text-xs text-app-text font-mono focus:outline-none leading-relaxed resize-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-app-text-3 italic bg-app-toolbar p-3 rounded border border-app-border">
            Semitone Offset: <span className="font-bold text-app-accent">{semitoneOffset >= 0 ? `+${semitoneOffset}` : semitoneOffset} semitones</span>.
          </div>
        </div>

        {/* Right Column: Live Transposed Musician Display Preview */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center gap-1.5">
              <span>🖥️</span>
              <span>Musician Stage Confidence Monitor Preview</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-app-accent text-white text-[10px] font-black uppercase">
              KEY: {targetKey}
            </span>
          </div>

          <div className="flex-1 bg-[#10141d] rounded-xl border border-app-border p-5 font-mono text-xs text-white space-y-4 overflow-y-auto shadow-inner">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="font-bold text-blue-300">{songTitle}</span>
              <span className="text-[10px] text-gray-400">Transposed: {targetKey}</span>
            </div>

            <div className="whitespace-pre-line leading-loose text-yellow-300 font-bold">
              {transposedText}
            </div>
          </div>

          <div className="text-[11px] text-app-text-3 italic bg-app-toolbar p-3 rounded border border-app-border">
            Chords update automatically for all stage displays bound to route <span className="font-mono text-app-accent font-bold">/#/stage</span>.
          </div>
        </div>
      </div>
    </div>
  )
}
