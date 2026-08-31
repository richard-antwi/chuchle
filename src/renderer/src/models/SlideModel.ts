export interface SlideElement {
  id: string
  type: 'text' | 'image' | 'video' | 'scripture' | 'lyric' | 'chords'
  content: string
  style?: Record<string, any>
}

export interface SlideBackground {
  type: 'color' | 'image' | 'video'
  value: string
}

export interface SlideItem {
  id: string
  title?: string
  elements: SlideElement[]
  background?: SlideBackground
  notes?: string
}

export interface ServiceItem {
  id: string
  title: string
  sub?: string
  type: 'song' | 'scripture' | 'hymnal' | 'custom' | 'deck'
  slides: SlideItem[] | string[]
  isCurrent?: boolean
}

/**
 * Converts legacy string array slides into structured SlideItem models
 */
export function convertStringsToSlideItems(slides: (SlideItem | string)[]): SlideItem[] {
  return slides.map((slide, idx) => {
    if (typeof slide !== 'string') {
      return slide
    }
    return {
      id: `slide_${idx}_${Date.now()}`,
      title: `Slide ${idx + 1}`,
      elements: [
        {
          id: `elem_${idx}`,
          type: 'text',
          content: slide
        }
      ]
    }
  })
}

/**
 * Safely extracts raw display text from a SlideItem or string
 */
export function extractSlideText(slide: SlideItem | string | undefined | null): string {
  if (!slide) return ''
  if (typeof slide === 'string') return slide
  if (Array.isArray(slide.elements) && slide.elements.length > 0) {
    return slide.elements.map((e) => e.content).join('\n')
  }
  return ''
}
