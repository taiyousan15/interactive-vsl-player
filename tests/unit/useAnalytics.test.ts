/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from '../../src/hooks/useAnalytics'

const STORAGE_KEY = 'interactive-analytics-buffer'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useAnalytics - initial state', () => {
  test('getEventCount returns 0 initially', () => {
    const { result } = renderHook(() => useAnalytics())
    expect(result.current.getEventCount()).toBe(0)
  })
})

describe('useAnalytics - trackEvent', () => {
  test('increments event count after tracking', () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_view', 's01-hook', 'hs-s01-ai-detail')
    })
    expect(result.current.getEventCount()).toBe(1)
  })

  test('accumulates multiple events', () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_view', 's01-hook', 'hs-s01-ai-detail')
      result.current.trackEvent('overlay_view', 's01-hook', 'ov-s01-ai-stats')
      result.current.trackEvent('hotspot_click', 's01-hook', 'hs-s01-ai-detail')
    })
    expect(result.current.getEventCount()).toBe(3)
  })

  test('accepts all valid event types', () => {
    const { result } = renderHook(() => useAnalytics())
    const eventTypes = [
      'hotspot_view',
      'hotspot_click',
      'overlay_view',
      'overlay_dismiss',
      'overlay_cta_click',
      'scene_engagement',
      'poll_answer',
      'quiz_answer',
    ] as const

    act(() => {
      for (const type of eventTypes) {
        result.current.trackEvent(type, 's01-hook', null)
      }
    })
    expect(result.current.getEventCount()).toBe(eventTypes.length)
  })

  test('accepts null elementId', () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('scene_engagement', 's01-hook', null)
    })
    expect(result.current.getEventCount()).toBe(1)
  })

  test('accepts metadata object', () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_click', 's01-hook', 'hs-1', {
        duration: 3.5,
        clicked: true,
        label: 'test',
      })
    })
    expect(result.current.getEventCount()).toBe(1)
  })
})

describe('useAnalytics - flush', () => {
  test('sends events to /api/analytics on flush', async () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_click', 's01-hook', 'hs-s01-ai-detail')
    })

    await act(async () => {
      await result.current.flush()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/analytics',
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('clears buffer after successful flush', async () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('overlay_view', 's01-hook', 'ov-s01-ai-stats')
    })
    expect(result.current.getEventCount()).toBe(1)

    await act(async () => {
      await result.current.flush()
    })

    expect(result.current.getEventCount()).toBe(0)
  })

  test('does not call fetch when buffer is empty', async () => {
    const { result } = renderHook(() => useAnalytics())
    await act(async () => {
      await result.current.flush()
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('sends correct request body', async () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_view', 's02a-wall', 'hs-s02a-cost')
    })

    await act(async () => {
      await result.current.flush()
    })

    const call = mockFetch.mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body).toHaveProperty('sessionId')
    expect(body).toHaveProperty('events')
    expect(body.events).toHaveLength(1)
    expect(body.events[0].type).toBe('hotspot_view')
    expect(body.events[0].sceneId).toBe('s02a-wall')
    expect(body.events[0].elementId).toBe('hs-s02a-cost')
  })

  test('sessionId is consistent within a session', async () => {
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_view', 's01-hook', 'hs-1')
    })
    await act(async () => {
      await result.current.flush()
    })

    act(() => {
      result.current.trackEvent('overlay_view', 's01-hook', 'ov-1')
    })
    await act(async () => {
      await result.current.flush()
    })

    const session1 = JSON.parse(mockFetch.mock.calls[0][1].body).sessionId
    const session2 = JSON.parse(mockFetch.mock.calls[1][1].body).sessionId
    expect(session1).toBe(session2)
  })
})

describe('useAnalytics - localStorage fallback', () => {
  test('saves to localStorage when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_click', 's01-hook', 'hs-1')
    })

    await act(async () => {
      await result.current.flush()
    })

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].type).toBe('hotspot_click')
  })

  test('saves to localStorage when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('scene_engagement', 's01-hook', null)
    })

    await act(async () => {
      await result.current.flush()
    })

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
  })

  test('appends to existing localStorage buffer', async () => {
    const existing = [{ type: 'hotspot_view', sceneId: 's01-hook' }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('overlay_view', 's01-hook', 'ov-1')
    })

    await act(async () => {
      await result.current.flush()
    })

    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(2)
  })
})

describe('useAnalytics - cleanup', () => {
  test('unmounting does not throw', () => {
    const { result, unmount } = renderHook(() => useAnalytics())
    act(() => {
      result.current.trackEvent('hotspot_view', 's01-hook', 'hs-1')
    })
    expect(() => unmount()).not.toThrow()
  })
})
