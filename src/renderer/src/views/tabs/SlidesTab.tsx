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
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      {/* Mode Switcher */}
      <div className="flex justify-between items-center bg-[#141922] p-2 border border-[#232B38] rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('reflow')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 cursor-pointer ${
              mode === 'reflow' ? 'bg-[#F5A623] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lyrics Reflow Sandbox
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 cursor-pointer ${
              mode === 'pdf' ? 'bg-[#F5A623] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF Slide Importer
          </button>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">PRIMARY PRESENTATION DECK</span>
      </div>

      {/* Mode 1: Reflow Sandbox */}
      {mode === 'reflow' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {/* Left Column: Input */}
          <div className="md:col-span-1 bg-[#141922] border border-[#232B38] p-4 rounded-lg flex flex-col space-y-3">
            <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">Raw Song Input</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full min-h-[240px] bg-[#0B0E14] border border-[#232B38] rounded-md p-3 text-xs text-[#E8EAED] font-mono focus:outline-none focus:border-[#F5A623]/60 resize-none"
              placeholder="Paste song lyrics here..."
            />
            <button
              onClick={handleReflow}
              className="w-full py-2 bg-[#F5A623] hover:bg-[#d98f19] text-slate-950 font-black rounded-md text-xs uppercase tracking-wider transition duration-150 cursor-pointer"
            >
              Parse & Reflow Stanzas
            </button>
          </div>

          {/* Right Column: Reflowed Slide Grid */}
          <div className="md:col-span-2 bg-[#141922] border border-[#232B38] p-4 rounded-lg flex flex-col space-y-3 overflow-y-auto max-h-[550px]">
            <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider">
              Slide Deck ({reflowed.reduce((acc, s) => acc + s.slides.length, 0)} Slides)
            </h3>
            {reflowed.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-xs italic">
                Click "Parse & Reflow Stanzas" to generate live slides
              </div>
            ) : (
              <div className="space-y-4">
                {reflowed.map((sec, secIdx) => (
                  <div key={secIdx} className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-[#0B0E14] px-2 py-0.5 rounded border border-[#232B38]">
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
                                ? 'bg-[#F5A623]/10 border-[#F5A623] text-[#E8EAED] shadow-md shadow-[#F5A623]/10'
                                : 'bg-[#0B0E14] border-[#232B38] text-slate-300 hover:border-slate-700'
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
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">PDF Presentation Deck</h3>
            <label className="px-4 py-2 bg-[#F5A623] hover:bg-[#d98f19] text-slate-950 font-bold text-xs rounded-md cursor-pointer transition duration-150">
              <span>{extractingPdf ? 'Extracting...' : 'Upload PDF File'}</span>
              <input type="file" accept="application/pdf" onChange={handlePdfFileChange} className="hidden" disabled={extractingPdf} />
            </label>
          </div>

          {pdfFile && <div className="text-xs text-slate-400 font-mono">Loaded File: {pdfFile.name}</div>}

          {/* Thumbnails Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-[#0B0E14] border border-[#232B38] rounded-md max-h-[480px]">
            {pdfSlides.length === 0 ? (
              <div className="col-span-full flex items-center justify-center text-slate-600 text-xs italic py-12">
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
                        ? 'bg-[#F5A623]/10 border-[#F5A623]'
                        : 'bg-[#141922] border-[#232B38] hover:border-slate-700'
                    }`}
                  >
                    <img src={slide.imageUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-32 object-contain rounded bg-black" />
                    <span className="text-[10px] font-bold text-slate-400">Slide {slide.slideNumber}</span>
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
