/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useInteractiveElements } from '../../src/hooks/useInteractiveElements'

describe('useInteractiveElements - initial state', () => {
  test('starts with empty visible hotspots', () => {
    const { result } = renderHook(() => useInteractiveElements())
    expect(result.current.visibleHotspots).toHaveLength(0)
  })

  test('starts with empty visible overlays', () => {
    const { result } = renderHook(() => useInteractiveElements())
    expect(result.current.visibleOverlays).toHaveLength(0)
  })

  test('starts with null activeOverlayId', () => {
    const { result } = renderHook(() => useInteractiveElements())
    expect(result.current.activeOverlayId).toBeNull()
  })
})

describe('useInteractiveElements - updateVisibility', () => {
  test('shows hotspot when currentTime >= showAt', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      // s01-hook hotspot showAt: 5
      result.current.updateVisibility('s01-hook', 6)
    })
    expect(result.current.visibleHotspots.length).toBeGreaterThan(0)
  })

  test('does not show hotspot when currentTime < showAt', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      // s01-hook hotspot showAt: 5
      result.current.updateVisibility('s01-hook', 3)
    })
    expect(result.current.visibleHotspots).toHaveLength(0)
  })

  test('hides hotspot when currentTime > hideAt', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      // s01-hook hotspot hideAt: 12
      result.current.updateVisibility('s01-hook', 15)
    })
    expect(result.current.visibleHotspots).toHaveLength(0)
  })

  test('shows hotspot exactly at showAt boundary', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 5)
    })
    expect(result.current.visibleHotspots.length).toBeGreaterThan(0)
  })

  test('shows hotspot when hideAt is null (no end time)', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      // s02a-wall hotspot hideAt: null, showAt: 14
      result.current.updateVisibility('s02a-wall', 999)
    })
    expect(result.current.visibleHotspots.length).toBeGreaterThan(0)
  })

  test('shows overlay when currentTime >= showAt', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      // s01-hook overlay showAt: 5
      result.current.updateVisibility('s01-hook', 6)
    })
    expect(result.current.visibleOverlays.length).toBeGreaterThan(0)
  })

  test('does not show overlay for unknown scene', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('nonexistent-scene', 100)
    })
    expect(result.current.visibleHotspots).toHaveLength(0)
    expect(result.current.visibleOverlays).toHaveLength(0)
  })

  test('correct hotspot id returned for s01-hook', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    const hotspot = result.current.visibleHotspots[0]
    expect(hotspot.id).toBe('hs-s01-ai-detail')
  })
})

describe('useInteractiveElements - dismissOverlay', () => {
  test('removes overlay from visibleOverlays', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    const overlayId = result.current.visibleOverlays[0]?.id
    expect(overlayId).toBeDefined()

    act(() => {
      result.current.dismissOverlay(overlayId!)
    })
    expect(result.current.visibleOverlays.find((o) => o.id === overlayId)).toBeUndefined()
  })

  test('sets activeOverlayId to null when dismissed overlay was active', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    act(() => {
      result.current.dismissOverlay('ov-s01-ai-stats')
    })
    expect(result.current.activeOverlayId).toBeNull()
  })

  test('keeps other overlay active when different overlay dismissed', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    act(() => {
      result.current.dismissOverlay('some-other-overlay')
    })
    expect(result.current.activeOverlayId).toBe('ov-s01-ai-stats')
  })

  test('dismissed overlay does not reappear on updateVisibility', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    const overlayId = result.current.visibleOverlays[0]?.id
    act(() => {
      result.current.dismissOverlay(overlayId!)
    })
    act(() => {
      result.current.updateVisibility('s01-hook', 7)
    })
    expect(result.current.visibleOverlays.find((o) => o.id === overlayId)).toBeUndefined()
  })
})

describe('useInteractiveElements - openOverlay', () => {
  test('adds overlay to visibleOverlays', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    expect(result.current.visibleOverlays.some((o) => o.id === 'ov-s01-ai-stats')).toBe(true)
  })

  test('sets activeOverlayId', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    expect(result.current.activeOverlayId).toBe('ov-s01-ai-stats')
  })

  test('does nothing for nonexistent overlay', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'nonexistent-overlay')
    })
    expect(result.current.visibleOverlays).toHaveLength(0)
    expect(result.current.activeOverlayId).toBeNull()
  })

  test('does not duplicate overlay if already visible', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    const count = result.current.visibleOverlays.filter((o) => o.id === 'ov-s01-ai-stats').length
    expect(count).toBe(1)
  })
})

describe('useInteractiveElements - resetForScene', () => {
  test('clears all visible hotspots', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    act(() => {
      result.current.resetForScene('s02a-wall')
    })
    expect(result.current.visibleHotspots).toHaveLength(0)
  })

  test('clears all visible overlays', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    act(() => {
      result.current.resetForScene('s02a-wall')
    })
    expect(result.current.visibleOverlays).toHaveLength(0)
  })

  test('sets activeOverlayId to null', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.openOverlay('s01-hook', 'ov-s01-ai-stats')
    })
    act(() => {
      result.current.resetForScene('s02a-wall')
    })
    expect(result.current.activeOverlayId).toBeNull()
  })

  test('clears dismissed set (overlays reappear in new scene)', () => {
    const { result } = renderHook(() => useInteractiveElements())
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    const overlayId = result.current.visibleOverlays[0]?.id
    act(() => {
      result.current.dismissOverlay(overlayId!)
    })
    act(() => {
      result.current.resetForScene('s01-hook')
    })
    // After reset, dismissed set is cleared — overlay reappears
    act(() => {
      result.current.updateVisibility('s01-hook', 6)
    })
    expect(result.current.visibleOverlays.some((o) => o.id === overlayId)).toBe(true)
  })
})
