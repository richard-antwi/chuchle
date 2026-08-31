import { useState } from 'react'
import { ReflowedSection, parseAndReflowRawLyrics } from '../../utils/smartLyricReflow'
import { SlideImporter } from '../../services/SlideImporter'

interface SlidesTabProps {
  onProjectSlide: (section: ReflowedSection, slideText: string) => void
  onProjectPdfSlide: (target: { slideNumber: number; imageUrl: string }) => void
}

export default function SlidesTab({ onProjectSlide, onProjectPdfSlide }: SlidesTabProps) {
  const [mode, setMode] = useState<'reflow' | 'pdf'>('reflow')
  const [inputText, setInputText] = useState<string>(
    `[Verse 1]\nAmazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\n[Chorus]\nTwas grace that taught my heart to fear\nAnd grace my fears relieved`
  )
  const [reflowed, setReflowed] = useState<ReflowedSection[]>([])
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<{ sectionIdx: number; slideIdx: number } | null>(null)

  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractingPdf, setExtractingPdf] = useState(false)
  const [pdfSlides, setPdfSlides] = useState<{ slideNumber: number; imageUrl: string }[]>([])
  const [selectedPdfSlideIndex, setSelectedPdfSlideIndex] = useState<number | null>(null)

  const handleReflow = () => {
    const res = parseAndReflowRawLyrics(inputText, 2)
    setReflowed(res)
    setSelectedSlideIndex(null)
  }

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPdfFile(file)
      setExtractingPdf(true)
      try {
        const slides = await SlideImporter.extractSlidesFromPdf(file)
        setPdfSlides(slides)
      } catch (err) {
        console.error('Failed to extract PDF:', err)
      } finally {
        setExtractingPdf(false)
      }
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Mode Switcher */}
      <div className="flex justify-between items-center bg-app-panel p-2 border border-app-border rounded-xl shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('reflow')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
              mode === 'reflow'
                ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent shadow-sm'
                : 'text-app-text-2 hover:text-app-text'
            }`}
          >
            Lyrics Reflow Sandbox
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
              mode === 'pdf'
                ? 'bg-app-accent-bg border border-app-accent/30 text-app-accent shadow-sm'
                : 'text-app-text-2 hover:text-app-text'
            }`}
          >
            PDF Slide Importer
          </button>
        </div>
        <span className="text-[11px] text-app-text-3 font-mono">PRIMARY PRESENTATION DECK</span>
      </div>

      {/* Mode 1: Reflow Sandbox */}
      {mode === 'reflow' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
          {/* Left Column: Input */}
          <div className="md:col-span-1 bg-app-panel border border-app-border p-4 rounded-xl shadow-sm flex flex-col space-y-3">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">Raw Song Input</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full min-h-[240px] bg-app-toolbar border border-app-border rounded-lg p-3 text-xs text-app-text font-mono focus:outline-none focus:border-app-accent resize-none"
              placeholder="Paste song lyrics here..."
            />
            <button
              onClick={handleReflow}
              className="w-full py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer shadow-sm"
            >
              Parse & Reflow Stanzas
            </button>
          </div>

          {/* Right Column: Reflowed Slide Grid */}
          <div className="md:col-span-2 bg-app-panel border border-app-border p-4 rounded-xl shadow-sm flex flex-col space-y-3 overflow-y-auto max-h-[550px]">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">
              Slide Deck ({reflowed.reduce((acc, s) => acc + s.slides.length, 0)} Slides)
            </h3>
            {reflowed.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-app-text-3 text-xs italic">
                Click "Parse & Reflow Stanzas" to generate live slides
              </div>
            ) : (
              <div className="space-y-4">
                {reflowed.map((sec, secIdx) => (
                  <div key={secIdx} className="space-y-2">
                    <span className="text-[10px] font-extrabold text-app-text-3 uppercase tracking-widest bg-app-toolbar px-2 py-0.5 rounded border border-app-border">
                      {sec.label}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {sec.slides.map((slideText, sIdx) => {
                        const isSelected = selectedSlideIndex?.sectionIdx === secIdx && selectedSlideIndex?.slideIdx === sIdx
                        return (
                          <div
                            key={sIdx}
                            onClick={() => {
                              setSelectedSlideIndex({ sectionIdx: secIdx, slideIdx: sIdx })
                              onProjectSlide(sec, slideText)
                            }}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition duration-150 text-xs font-semibold leading-relaxed whitespace-pre-line ${
                              isSelected
                                ? 'bg-app-accent-bg border-app-accent text-app-accent shadow-sm'
                                : 'bg-app-toolbar border-app-border text-app-text hover:border-app-border-strong'
                            }`}
                          >
                            {slideText}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: PDF Importer */}
      {mode === 'pdf' && (
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-app-border pb-3">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider">PDF Presentation Deck</h3>
            <label className="px-4 py-2 bg-app-accent hover:opacity-90 text-white font-bold text-xs rounded-lg cursor-pointer transition duration-150 shadow-sm">
              <span>{extractingPdf ? 'Extracting...' : 'Upload PDF File'}</span>
              <input type="file" accept="application/pdf" onChange={handlePdfFileChange} className="hidden" disabled={extractingPdf} />
            </label>
          </div>

          {pdfFile && <div className="text-xs text-app-text-2 font-mono">Loaded File: {pdfFile.name}</div>}

          {/* Thumbnails Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-app-toolbar border border-app-border rounded-lg max-h-[480px]">
            {pdfSlides.length === 0 ? (
              <div className="col-span-full flex items-center justify-center text-app-text-3 text-xs italic py-12">
                No PDF slides uploaded yet. Choose a PDF file above to extract presentation slides.
              </div>
            ) : (
              pdfSlides.map((slide, idx) => {
                const isSelected = selectedPdfSlideIndex === idx
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPdfSlideIndex(idx)
                      onProjectPdfSlide(slide)
                    }}
                    className={`p-2 rounded-lg border cursor-pointer transition duration-150 flex flex-col items-center space-y-2 ${
                      isSelected
                        ? 'bg-app-accent-bg border-app-accent'
                        : 'bg-app-panel border-app-border hover:border-app-border-strong'
                    }`}
                  >
                    <img src={slide.imageUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-32 object-contain rounded bg-black" />
                    <span className="text-[10px] font-bold text-app-text-2">Slide {slide.slideNumber}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
