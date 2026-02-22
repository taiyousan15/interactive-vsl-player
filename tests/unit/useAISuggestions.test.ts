/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useAISuggestions } from '../../src/hooks/useAISuggestions'
import type { Scene } from '../../src/types/video'
import type { AIHotspotSuggestionResult, AIBranchSuggestionResult, AIQuizSuggestionResult } from '../../src/types/ai-suggestions'

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockScene: Scene = {
  id: 's01-hook',
  type: 'intro',
  title: 'AIで変わる未来',
  narration: 'AIを活用する時代が来ました',
  duration: 30,
  imagePrompt: 'futuristic office',
  nextSceneId: 's02',
  style: {
    background: '#0a0a0a',
    textColor: '#ffffff',
    accentColor: '#00aaff',
    animation: 'fade',
  },
}

const mockHotspotsResult: AIHotspotSuggestionResult = {
  sceneId: 's01-hook',
  hotspots: [
    {
      id: 'hs-s01-hook-1',
      label: 'AI実態を見る',
      position: { x: 60, y: 20, width: 28, height: 10 },
      timing: { showAt: 5, hideAt: 15 },
      action: { type: 'overlay', overlayId: 'ov-1' },
      shape: 'pill',
      rationale: 'test',
      confidence: 0.85,
    },
  ],
  overlays: [],
  model: 'claude-haiku',
  generatedAt: 1700000000000,
}

const mockBranchesResult: AIBranchSuggestionResult = {
  sceneId: 's01-hook',
  suggestions: [
    {
      question: 'あなたの状況は？',
      options: [
        { id: 'opt_a', label: 'AI使用中', description: '既に活用', intent: '経験者' },
        { id: 'opt_b', label: 'まだ未使用', description: 'これから', intent: '初心者' },
      ],
      showAt: 15,
      rationale: 'test',
      confidence: 0.8,
    },
  ],
  model: 'claude-sonnet',
  generatedAt: 1700000000000,
}

const mockQuizResult: AIQuizSuggestionResult = {
  sceneId: 's01-hook',
  quiz: [
    {
      question: 'AIを活用しているビジネスパーソンの割合は？',
      options: ['45%', '20%', '70%', '10%'],
      correctIndex: 0,
      explanation: 'ナレーション参照',
      showAt: 25,
    },
  ],
  model: 'claude-haiku',
  generatedAt: 1700000000000,
}

function mockSuccessResponse<T>(data: T) {
  return {
    ok: true,
    json: async () => ({ success: true, data }),
  }
}

function mockErrorResponse(error: string, status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, error }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ========================
// initial state
// ========================

describe('useAISuggestions - initial state', () => {
  test('all slots start as idle', () => {
    const { result } = renderHook(() => useAISuggestions())
    expect(result.current.hotspots.status).toBe('idle')
    expect(result.current.branches.status).toBe('idle')
    expect(result.current.quiz.status).toBe('idle')
  })

  test('all slots start with null data', () => {
    const { result } = renderHook(() => useAISuggestions())
    expect(result.current.hotspots.data).toBeNull()
    expect(result.current.branches.data).toBeNull()
    expect(result.current.quiz.data).toBeNull()
  })

  test('all slots start with null error', () => {
    const { result } = renderHook(() => useAISuggestions())
    expect(result.current.hotspots.error).toBeNull()
    expect(result.current.branches.error).toBeNull()
    expect(result.current.quiz.error).toBeNull()
  })
})

// ========================
// requestHotspots
// ========================

describe('useAISuggestions - requestHotspots', () => {
  test('transitions to success with data', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    expect(result.current.hotspots.status).toBe('success')
    expect(result.current.hotspots.data).toEqual(mockHotspotsResult)
    expect(result.current.hotspots.error).toBeNull()
  })

  test('calls /api/ai/suggest-hotspots', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/suggest-hotspots',
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('sends scene in request body', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as { scene: Scene }
    expect(body.scene.id).toBe('s01-hook')
  })

  test('transitions to error state on API failure', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse('AI service unavailable'))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    expect(result.current.hotspots.status).toBe('error')
    expect(result.current.hotspots.error).toContain('AI service unavailable')
    expect(result.current.hotspots.data).toBeNull()
  })

  test('transitions to error state on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    expect(result.current.hotspots.status).toBe('error')
    expect(result.current.hotspots.error).toBe('Network error')
  })

  test('does not affect branches or quiz state', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })

    expect(result.current.branches.status).toBe('idle')
    expect(result.current.quiz.status).toBe('idle')
  })
})

// ========================
// requestBranches
// ========================

describe('useAISuggestions - requestBranches', () => {
  test('transitions to success with suggestions data', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockBranchesResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestBranches(mockScene)
    })

    expect(result.current.branches.status).toBe('success')
    expect(result.current.branches.data).toEqual(mockBranchesResult)
  })

  test('calls /api/ai/suggest-branches', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockBranchesResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestBranches(mockScene)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/suggest-branches',
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('sends context in request body', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockBranchesResult))
    const { result } = renderHook(() => useAISuggestions())
    const context = { viewerEngagementRate: 0.75, previousChoices: ['opt_a'] }

    await act(async () => {
      await result.current.requestBranches(mockScene, context)
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      context: typeof context
    }
    expect(body.context).toEqual(context)
  })

  test('sends empty context when not provided', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockBranchesResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestBranches(mockScene)
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      context: unknown
    }
    expect(body.context).toEqual({})
  })
})

// ========================
// requestQuiz
// ========================

describe('useAISuggestions - requestQuiz', () => {
  test('transitions to success with quiz data', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockQuizResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestQuiz(mockScene)
    })

    expect(result.current.quiz.status).toBe('success')
    expect(result.current.quiz.data?.quiz).toHaveLength(1)
  })

  test('calls /api/ai/suggest-quiz', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockQuizResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestQuiz(mockScene)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/suggest-quiz',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

// ========================
// dismissSuggestion
// ========================

describe('useAISuggestions - dismissSuggestion', () => {
  test('resets hotspots to idle', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })
    expect(result.current.hotspots.status).toBe('success')

    act(() => {
      result.current.dismissSuggestion('hotspots')
    })

    expect(result.current.hotspots.status).toBe('idle')
    expect(result.current.hotspots.data).toBeNull()
  })

  test('resets branches to idle', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockBranchesResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestBranches(mockScene)
    })
    expect(result.current.branches.status).toBe('success')

    act(() => {
      result.current.dismissSuggestion('branches')
    })

    expect(result.current.branches.status).toBe('idle')
  })

  test('resets quiz to idle', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockQuizResult))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestQuiz(mockScene)
    })

    act(() => {
      result.current.dismissSuggestion('quiz')
    })

    expect(result.current.quiz.status).toBe('idle')
  })

  test('dismissing one slot does not affect others', async () => {
    mockFetch
      .mockResolvedValueOnce(mockSuccessResponse(mockHotspotsResult))
      .mockResolvedValueOnce(mockSuccessResponse(mockQuizResult))

    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })
    await act(async () => {
      await result.current.requestQuiz(mockScene)
    })

    act(() => {
      result.current.dismissSuggestion('hotspots')
    })

    expect(result.current.hotspots.status).toBe('idle')
    expect(result.current.quiz.status).toBe('success')
  })

  test('dismissing error state also resets to idle', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useAISuggestions())

    await act(async () => {
      await result.current.requestHotspots(mockScene)
    })
    expect(result.current.hotspots.status).toBe('error')

    act(() => {
      result.current.dismissSuggestion('hotspots')
    })

    expect(result.current.hotspots.status).toBe('idle')
    expect(result.current.hotspots.error).toBeNull()
  })
})
