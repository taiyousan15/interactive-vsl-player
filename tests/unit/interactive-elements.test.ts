import {
  getInteractiveData,
  getOverlayById,
} from '../../src/data/interactive-elements'

describe('getInteractiveData', () => {
  test('returns data for s01-hook', () => {
    const data = getInteractiveData('s01-hook')
    expect(data.sceneId).toBe('s01-hook')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('returns data for s02a-wall', () => {
    const data = getInteractiveData('s02a-wall')
    expect(data.sceneId).toBe('s02a-wall')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('returns data for s03a-proof', () => {
    const data = getInteractiveData('s03a-proof')
    expect(data.sceneId).toBe('s03a-proof')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('returns data for s04b-seminar', () => {
    const data = getInteractiveData('s04b-seminar')
    expect(data.sceneId).toBe('s04b-seminar')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('returns data for s05-cta-line', () => {
    const data = getInteractiveData('s05-cta-line')
    expect(data.sceneId).toBe('s05-cta-line')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays).toHaveLength(0)
  })

  test('returns empty data for unknown sceneId', () => {
    const data = getInteractiveData('unknown-scene')
    expect(data.sceneId).toBe('unknown-scene')
    expect(data.hotspots).toHaveLength(0)
    expect(data.overlays).toHaveLength(0)
  })

  test('returns empty data for empty string sceneId', () => {
    const data = getInteractiveData('')
    expect(data.hotspots).toHaveLength(0)
    expect(data.overlays).toHaveLength(0)
  })

  test('hotspot has required fields', () => {
    const data = getInteractiveData('s01-hook')
    const hotspot = data.hotspots[0]
    expect(hotspot).toHaveProperty('id')
    expect(hotspot).toHaveProperty('sceneId', 's01-hook')
    expect(hotspot).toHaveProperty('label')
    expect(hotspot).toHaveProperty('position')
    expect(hotspot).toHaveProperty('timing')
    expect(hotspot).toHaveProperty('action')
    expect(hotspot).toHaveProperty('shape')
    expect(hotspot).toHaveProperty('style')
  })

  test('hotspot position values are valid percentages (0-100)', () => {
    const data = getInteractiveData('s01-hook')
    const { position } = data.hotspots[0]
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.x).toBeLessThanOrEqual(100)
    expect(position.y).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeLessThanOrEqual(100)
    expect(position.width).toBeGreaterThan(0)
    expect(position.height).toBeGreaterThan(0)
  })

  test('hotspot timing has showAt', () => {
    const data = getInteractiveData('s01-hook')
    const { timing } = data.hotspots[0]
    expect(typeof timing.showAt).toBe('number')
    expect(timing.showAt).toBeGreaterThanOrEqual(0)
  })

  test('hotspot timing hideAt is number or null', () => {
    const data = getInteractiveData('s01-hook')
    const { timing } = data.hotspots[0]
    expect(timing.hideAt === null || typeof timing.hideAt === 'number').toBe(true)
  })

  test('overlay has required fields', () => {
    const data = getInteractiveData('s01-hook')
    const overlay = data.overlays[0]
    expect(overlay).toHaveProperty('id')
    expect(overlay).toHaveProperty('sceneId', 's01-hook')
    expect(overlay).toHaveProperty('type')
    expect(overlay).toHaveProperty('content')
    expect(overlay).toHaveProperty('timing')
    expect(overlay).toHaveProperty('slideFrom')
    expect(overlay).toHaveProperty('dismissible')
    expect(overlay).toHaveProperty('autoHideAfterSeconds')
  })

  test('overlay content has title', () => {
    const data = getInteractiveData('s01-hook')
    const overlay = data.overlays[0]
    expect(typeof overlay.content.title).toBe('string')
    expect(overlay.content.title.length).toBeGreaterThan(0)
  })

  test('stat-card overlay has stats array', () => {
    const data = getInteractiveData('s01-hook')
    const overlay = data.overlays[0]
    expect(overlay.type).toBe('stat-card')
    expect(Array.isArray(overlay.content.stats)).toBe(true)
    expect(overlay.content.stats!.length).toBeGreaterThan(0)
  })

  test('all stats have label and value strings', () => {
    const data = getInteractiveData('s01-hook')
    const overlay = data.overlays[0]
    for (const stat of overlay.content.stats!) {
      expect(typeof stat.label).toBe('string')
      expect(typeof stat.value).toBe('string')
    }
  })

  test('info-panel overlay has ctaLabel', () => {
    const data = getInteractiveData('s04b-seminar')
    const overlay = data.overlays[0]
    expect(overlay.type).toBe('info-panel')
    expect(overlay.content.ctaLabel).toBeTruthy()
    expect(overlay.content.ctaUrl).toBeTruthy()
  })

  test('hotspot action type is valid', () => {
    const data = getInteractiveData('s01-hook')
    const { action } = data.hotspots[0]
    expect(['url', 'overlay', 'scene']).toContain(action.type)
  })

  test('overlay action hotspot links to overlay id', () => {
    const data = getInteractiveData('s01-hook')
    const hotspot = data.hotspots[0]
    expect(hotspot.action.type).toBe('overlay')
    expect(hotspot.action.overlayId).toBe('ov-s01-ai-stats')
  })

  test('url action hotspot has url', () => {
    const data = getInteractiveData('s05-cta-line')
    const hotspot = data.hotspots[0]
    expect(hotspot.action.type).toBe('url')
    expect(hotspot.action.url).toBeTruthy()
  })

  test('hotspot shape is valid', () => {
    const data = getInteractiveData('s01-hook')
    const { shape } = data.hotspots[0]
    expect(['rectangle', 'circle', 'pill']).toContain(shape)
  })

  test('slide direction is valid', () => {
    const data = getInteractiveData('s01-hook')
    const overlay = data.overlays[0]
    expect(['left', 'right', 'top', 'bottom']).toContain(overlay.slideFrom)
  })
})

describe('getOverlayById', () => {
  test('returns overlay for valid sceneId and overlayId', () => {
    const overlay = getOverlayById('s01-hook', 'ov-s01-ai-stats')
    expect(overlay).toBeDefined()
    expect(overlay?.id).toBe('ov-s01-ai-stats')
    expect(overlay?.sceneId).toBe('s01-hook')
  })

  test('returns undefined for nonexistent overlayId', () => {
    const overlay = getOverlayById('s01-hook', 'nonexistent-overlay')
    expect(overlay).toBeUndefined()
  })

  test('returns undefined for unknown sceneId', () => {
    const overlay = getOverlayById('unknown-scene', 'ov-s01-ai-stats')
    expect(overlay).toBeUndefined()
  })

  test('returns undefined for empty strings', () => {
    const overlay = getOverlayById('', '')
    expect(overlay).toBeUndefined()
  })

  test('returns correct overlay for s02a-wall', () => {
    const overlay = getOverlayById('s02a-wall', 'ov-s02a-cost')
    expect(overlay).toBeDefined()
    expect(overlay?.type).toBe('product-card')
  })

  test('returns correct overlay for s04b-seminar', () => {
    const overlay = getOverlayById('s04b-seminar', 'ov-s04b-benefits')
    expect(overlay).toBeDefined()
    expect(overlay?.type).toBe('info-panel')
  })
})
