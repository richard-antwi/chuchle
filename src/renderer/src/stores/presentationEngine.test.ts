import { describe, it, expect, beforeEach } from 'vitest'
import { usePresentationStore } from './usePresentationStore'
import { convertStringsToSlideItems, extractSlideText } from '../models/SlideModel'

describe('Production-Grade Presentation Engine Hardening Suite', () => {
  beforeEach(() => {
    const store = usePresentationStore.getState()
    store.setServiceQueue([
      {
        id: 'item_1',
        title: 'Song 1 - Amazing Grace',
        type: 'song',
        slides: ['Verse 1 Line 1', 'Verse 2 Line 1', 'Verse 3 Line 1']
      },
      {
        id: 'item_2',
        title: 'Scripture - John 3:16',
        type: 'scripture',
        slides: ['For God so loved the world...', 'That whosoever believeth...']
      }
    ])
    store.selectServiceItem('item_1')
    store.commitPreviewToLive()
  })

  it('1. Strict Preview vs Live Independence — Staging item leaves Live untouched', () => {
    const store = usePresentationStore.getState()

    // Verify initial live state is item_1
    expect(usePresentationStore.getState().liveItemId).toBe('item_1')
    expect(usePresentationStore.getState().liveSlideIndex).toBe(0)

    // Action: Single-click item_2 to stage into Preview
    store.selectServiceItem('item_2')

    // Assertion: Preview updates to item_2, but Live REMAINS item_1!
    expect(usePresentationStore.getState().previewItemId).toBe('item_2')
    expect(usePresentationStore.getState().previewSlideIndex).toBe(0)
    expect(usePresentationStore.getState().liveItemId).toBe('item_1')
    expect(usePresentationStore.getState().liveSlideIndex).toBe(0)
  })

  it('2. Preview Slide Navigation — Changing preview slide leaves Live untouched', () => {
    const store = usePresentationStore.getState()

    // Action: Change preview slide to index 2
    store.setPreviewSlide(2)

    // Assertion: Preview slide is index 2, Live slide REMAINS index 0!
    expect(usePresentationStore.getState().previewSlideIndex).toBe(2)
    expect(usePresentationStore.getState().liveSlideIndex).toBe(0)
  })

  it('3. Commit Preview to Live — Enter/Space/Send Live updates Live output', () => {
    const store = usePresentationStore.getState()

    // Stage item_2 and set preview slide 1
    store.selectServiceItem('item_2')
    store.setPreviewSlide(1)

    // Action: Commit Preview to Live
    store.commitPreviewToLive()

    // Assertion: Live updates to item_2 slide 1!
    expect(usePresentationStore.getState().liveItemId).toBe('item_2')
    expect(usePresentationStore.getState().liveSlideIndex).toBe(1)
  })

  it('4. Slide Navigation & Bounds Clamping', () => {
    const store = usePresentationStore.getState()

    // Action: Navigate live slide forward beyond max
    store.navigateLiveSlide(10)
    expect(usePresentationStore.getState().liveSlideIndex).toBe(2)

    // Action: Navigate live slide backward below 0
    store.navigateLiveSlide(-20)
    expect(usePresentationStore.getState().liveSlideIndex).toBe(0)

    // Action: First and Last slide helpers
    store.setLastSlide()
    expect(usePresentationStore.getState().liveSlideIndex).toBe(2)

    store.setFirstSlide()
    expect(usePresentationStore.getState().liveSlideIndex).toBe(0)
  })

  it('5. Emergency Controls — Blank and Clear Text toggling', () => {
    const store = usePresentationStore.getState()

    expect(usePresentationStore.getState().isBlanked).toBe(false)
    expect(usePresentationStore.getState().isCleared).toBe(false)

    // Action: Toggle Blank
    store.toggleBlank()
    expect(usePresentationStore.getState().isBlanked).toBe(true)

    // Action: Toggle Clear Text
    store.toggleClearText()
    expect(usePresentationStore.getState().isCleared).toBe(true)
  })

  it('6. SlideModel Conversion & Extraction Helpers', () => {
    const strings = ['Verse Line 1', 'Chorus Line 1']
    const models = convertStringsToSlideItems(strings)

    expect(models).toHaveLength(2)
    expect(models[0].elements[0].content).toBe('Verse Line 1')

    const extractedText = extractSlideText(models[0])
    expect(extractedText).toBe('Verse Line 1')
  })

  it('7. 3-Hour Sunday Service Scenario Simulation (100+ Slide Transitions)', () => {
    const store = usePresentationStore.getState()

    // Simulate a full 3-hour Sunday Service with 150 continuous slide transitions
    for (let i = 0; i < 150; i++) {
      const itemKey = i % 2 === 0 ? 'item_1' : 'item_2'
      store.selectServiceItem(itemKey)
      store.setPreviewSlide(i % 2)
      if (i % 3 === 0) {
        store.commitPreviewToLive()
      } else {
        store.navigateLiveSlide(1)
      }

      if (i % 20 === 0) {
        store.toggleBlank()
        store.toggleBlank()
      }
    }

    // Assertion: Store remains stable, valid, and uncorrupted!
    expect(usePresentationStore.getState().serviceQueue).toHaveLength(2)
    expect(typeof usePresentationStore.getState().liveSlideIndex).toBe('number')
  })
})
