import { useState } from 'react'
import { ServiceQueueItem } from '../../components/dashboard/OrderOfServicePanel'

interface CustomSlidesTabProps {
  onAddToService?: (item: ServiceQueueItem) => void
  onSendLiveDirect?: (item: ServiceQueueItem) => void
}

export default function CustomSlidesTab({ onAddToService, onSendLiveDirect }: CustomSlidesTabProps) {
  const [slideTemplate, setSlideTemplate] = useState<'announcement' | 'sermon' | 'offertory' | 'banner' | 'quote'>('announcement')
  const [slideTitle, setSlideTitle] = useState('SUNDAY MORNING ANNOUNCEMENTS')
  const [slideSub, setSlideSub] = useState('Welcome to our Service')
  const [slideBody, setSlideBody] = useState(
    '1. Mid-Week Prayer Service — Wednesday @ 6:30 PM\n2. Youth Fellowship Meeting — Friday @ 5:00 PM\n3. Monthly Financial Thanksgiving — Next Sunday'
  )
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center')
  const [bgStyle, setBgStyle] = useState('blue_gradient')

  const bgStylesMap: Record<string, { name: string; bg: string }> = {
    dark_solid: { name: 'Dark Solid', bg: '#121212' },
    blue_gradient: { name: 'Royal Blue Gradient', bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    purple_deep: { name: 'Deep Purple Velvet', bg: 'linear-gradient(135deg, #302b63 0%, #24243e 100%)' },
    gold_metallic: { name: 'Warm Gold Metallic', bg: 'linear-gradient(135deg, #485563 0%, #29323c 100%)' },
    emerald_glass: { name: 'Emerald Sanctuary', bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' }
  }

  const handleApplyTemplate = (type: 'announcement' | 'sermon' | 'offertory' | 'banner' | 'quote') => {
    setSlideTemplate(type)
    if (type === 'announcement') {
      setSlideTitle('CHURCH ANNOUNCEMENTS')
      setSlideSub('Notice Board')
      setSlideBody('• Bible Study: Wednesdays at 6:00 PM\n• Choir Rehearsal: Saturdays at 4:00 PM\n• Youth Service: Sundays at 8:00 AM')
      setAlignment('left')
      setBgStyle('blue_gradient')
    } else if (type === 'sermon') {
      setSlideTitle('SERMON MAIN POINT #1')
      setSlideSub('The Power of Faith in Action')
      setSlideBody('"For we walk by faith, not by sight." — 2 Corinthians 5:7\n\n1. Faith transforms your mindset\n2. Faith overcomes obstacles')
      setAlignment('center')
      setBgStyle('purple_deep')
    } else if (type === 'offertory') {
      setSlideTitle('TITHE & OFFERING')
      setSlideSub('Honoring God with our Substance')
      setSlideBody('Bank Name: Kingdom Grace Chapel\nAccount Number: 1234567890\nMobile Money: *920*123#\n\n"God loves a cheerful giver." — 2 Cor 9:7')
      setAlignment('center')
      setBgStyle('emerald_glass')
    } else if (type === 'banner') {
      setSlideTitle('WELCOME TO OUR SERVICE')
      setSlideSub('We are blessed to worship with you')
      setSlideBody('Connect with us on Social Media @ChurchleOfficial\nFree Wi-Fi: Churchle_Guest (Pass: PraiseGod)')
      setAlignment('center')
      setBgStyle('blue_gradient')
    } else if (type === 'quote') {
      setSlideTitle('SCRIPTURE OF THE WEEK')
      setSlideSub('Psalm 23:1')
      setSlideBody('"The LORD is my shepherd; I shall not want."')
      setAlignment('center')
      setBgStyle('gold_metallic')
    }
  }

  const buildQueueItem = (): ServiceQueueItem => {
    const fullContent = `${slideTitle}\n${slideSub}\n${slideBody}`
    return {
      id: `svc_custom_${Date.now()}`,
      title: slideTitle || 'Custom Slide',
      sub: slideSub || 'Custom announcement',
      type: 'song',
      slides: [fullContent]
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <h2 className="text-sm font-black text-app-text uppercase tracking-wider flex items-center gap-2">
          <span>📝</span>
          Custom Slide Builder & Announcement Creator
        </h2>

        {/* Template Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-app-text-3 font-semibold mr-1">Templates:</span>
          {(['announcement', 'sermon', 'offertory', 'banner', 'quote'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleApplyTemplate(t)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition cursor-pointer ${
                slideTemplate === t ? 'bg-app-accent text-white' : 'bg-app-toolbar border border-app-border text-app-text-2 hover:text-app-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Form Controls */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Slide Main Title</label>
              <input
                type="text"
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
                placeholder="e.g. SUNDAY MORNING ANNOUNCEMENTS"
                className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-xs font-bold text-app-text focus:outline-none focus:border-app-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Subtitle / Header Tag</label>
              <input
                type="text"
                value={slideSub}
                onChange={(e) => setSlideSub(e.target.value)}
                placeholder="e.g. Notice Board / Speaker Name"
                className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-2 text-xs text-app-text focus:outline-none focus:border-app-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-app-text-3 uppercase font-bold">Slide Content / Body Text</label>
              <textarea
                rows={5}
                value={slideBody}
                onChange={(e) => setSlideBody(e.target.value)}
                placeholder="Enter slide lines..."
                className="w-full bg-app-toolbar border border-app-border rounded-lg p-3 text-xs text-app-text font-mono focus:outline-none focus:border-app-accent leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Text Alignment */}
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Text Alignment</label>
                <div className="flex items-center gap-1 bg-app-toolbar border border-app-border p-1 rounded-lg">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlignment(a)}
                      className={`flex-1 py-1 rounded text-xs font-bold capitalize transition cursor-pointer ${
                        alignment === a ? 'bg-app-accent text-white' : 'text-app-text-2 hover:text-app-text'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme Style */}
              <div className="space-y-1">
                <label className="text-[10px] text-app-text-3 uppercase font-bold">Background Canvas Theme</label>
                <select
                  value={bgStyle}
                  onChange={(e) => setBgStyle(e.target.value)}
                  className="w-full bg-app-toolbar border border-app-border rounded-lg px-3 py-1.5 text-xs text-app-text font-semibold focus:outline-none"
                >
                  {Object.keys(bgStylesMap).map((k) => (
                    <option key={k} value={k}>
                      {bgStylesMap[k].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-app-border">
            {onAddToService && (
              <button
                onClick={() => onAddToService(buildQueueItem())}
                className="flex-1 py-2.5 bg-app-toolbar border border-app-border hover:bg-app-bg text-app-text font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>➕</span>
                <span>Add to Service Queue</span>
              </button>
            )}

            {onSendLiveDirect && (
              <button
                onClick={() => onSendLiveDirect(buildQueueItem())}
                className="flex-1 py-2.5 bg-app-accent hover:opacity-90 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>▶</span>
                <span>Send Live Direct</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Slide Canvas Preview */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
          <span className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center gap-1.5">
            <span>👁️</span>
            <span>Live Output Slide Canvas Preview</span>
          </span>

          <div
            className="w-full aspect-video rounded-xl border border-app-border flex flex-col justify-between p-6 text-white shadow-lg overflow-hidden relative"
            style={{ background: bgStylesMap[bgStyle]?.bg || '#121212' }}
          >
            {/* Header Title */}
            <div className={`space-y-0.5 text-${alignment}`}>
              <div className="text-sm font-extrabold uppercase tracking-widest text-blue-200">{slideTitle}</div>
              <div className="text-[11px] font-medium text-gray-300 italic">{slideSub}</div>
            </div>

            {/* Body Text */}
            <div className={`text-base md:text-lg font-bold leading-relaxed whitespace-pre-line my-auto text-${alignment}`}>
              {slideBody}
            </div>

            {/* Footer Watermark */}
            <div className="text-[10px] opacity-50 font-mono flex items-center justify-between">
              <span>Churchle Custom Slide Builder</span>
              <span>16:9 HD Projection</span>
            </div>
          </div>

          <div className="text-[11px] text-app-text-3 italic bg-app-toolbar p-3 rounded border border-app-border">
            Pro-Tip: Click &quot;Add to Service Queue&quot; to stage this slide for worship or &quot;Send Live Direct&quot; to project immediately.
          </div>
        </div>
      </div>
    </div>
  )
}
