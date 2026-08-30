import { describe, it, expect } from 'vitest'
import { parseAndReflowRawLyrics } from './smartLyricReflow'

describe('parseAndReflowRawLyrics', () => {
  it('should split raw text into structural sections', () => {
    const rawLyrics = `
      [Verse 1]
      Line one of verse one
      Line two of verse one
      Line three of verse one
      Line four of verse one

      [Chorus]
      Line one of chorus
      Line two of chorus

      [Verse 2]
      Line one of verse two
      Line two of verse two
    `

    const sections = parseAndReflowRawLyrics(rawLyrics)

    expect(sections).toHaveLength(3)
    expect(sections[0].type).toBe('VERSE')
    expect(sections[0].label).toBe('Verse 1')
    expect(sections[0].slides).toEqual([
      'Line one of verse one\nLine two of verse one\nLine three of verse one\nLine four of verse one'
    ])

    expect(sections[1].type).toBe('CHORUS')
    expect(sections[1].label).toBe('Chorus')
    expect(sections[1].slides).toEqual([
      'Line one of chorus\nLine two of chorus'
    ])

    expect(sections[2].type).toBe('VERSE')
    expect(sections[2].label).toBe('Verse 2')
  })

  it('should handle un-numbered verse headers and auto-increment them', () => {
    const rawLyrics = `
      [Verse]
      First verse line
      [Verse]
      Second verse line
    `

    const sections = parseAndReflowRawLyrics(rawLyrics)
    expect(sections).toHaveLength(2)
    expect(sections[0].label).toBe('Verse 1')
    expect(sections[1].label).toBe('Verse 2')
  })

  it('should auto-reflow slides based on linesPerSlide parameter', () => {
    const rawLyrics = `
      [Chorus]
      Line 1
      Line 2
      Line 3
      Line 4
      Line 5
    `

    const sections = parseAndReflowRawLyrics(rawLyrics, 2)
    expect(sections).toHaveLength(1)
    expect(sections[0].slides).toHaveLength(3)
    expect(sections[0].slides[0]).toBe('Line 1\nLine 2')
    expect(sections[0].slides[1]).toBe('Line 3\nLine 4')
    expect(sections[0].slides[2]).toBe('Line 5')
  })
})
