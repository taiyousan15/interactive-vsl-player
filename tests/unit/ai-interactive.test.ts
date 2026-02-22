/**
 * @jest-environment node
 */

// NOTE: ModelRouterのインスタンスメソッドをモックするため、
// モジュールレベルでjest.mockを使用する

const mockRoute = jest.fn()
jest.mock('../../src/performance/ModelRouter', () => ({
  ModelRouter: jest.fn().mockImplementation(() => ({
    route: mockRoute,
  })),
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

import { suggestHotspots, suggestBranches, suggestQuiz } from '../../src/services/ai-interactive'
import type { Scene } from '../../src/types/video'

const mockScene: Scene = {
  id: 's01-hook',
  type: 'intro',
  title: 'AIで変わる未来',
  narration: '今や日本のビジネスパーソンの多くがAIを活用しています。あなたはどうですか？',
  duration: 30,
  imagePrompt: 'futuristic office',
  nextSceneId: 's02-problem',
  style: {
    background: '#0a0a0a',
    textColor: '#ffffff',
    accentColor: '#00aaff',
    animation: 'fade',
  },
  keyPhrases: [{ text: 'AI活用' }, { text: 'ビジネスパーソン' }],
}

const anthropicSuccessResponse = (content: string) => ({
  ok: true,
  json: async () => ({
    content: [{ type: 'text', text: content }],
  }),
})

const hotspotsJSON = JSON.stringify({
  hotspots: [
    {
      id: 'hs-s01-hook-1',
      label: 'AI実態を見る',
      position: { x: 60, y: 20, width: 28, height: 10 },
      timing: { showAt: 5, hideAt: 15 },
      action: { type: 'overlay', overlayId: 'ov-s01-hook-1' },
      shape: 'pill',
      rationale: 'ナレーションのAI活用に関連',
      confidence: 0.85,
    },
  ],
  overlays: [
    {
      id: 'ov-s01-hook-1',
      type: 'stat-card',
      content: { title: 'AI活用率', stats: [{ label: '日本企業', value: '45%' }] },
      timing: { showAt: 5, hideAt: null },
      slideFrom: 'right',
      rationale: 'AI活用統計を補完',
      confidence: 0.82,
    },
  ],
})

const branchesJSON = JSON.stringify({
  suggestions: [
    {
      question: 'あなたの状況を教えてください',
      options: [
        {
          id: 'opt_a',
          label: 'AIをすでに使っている',
          description: '活用中だがもっと深めたい',
          intent: '既存ユーザー',
        },
        {
          id: 'opt_b',
          label: 'まだ使っていない',
          description: 'これから始めたい',
          intent: '初心者',
        },
      ],
      showAt: 15,
      rationale: 'AI活用レベルで分岐すると効果的',
      confidence: 0.88,
    },
  ],
})

const quizJSON = JSON.stringify({
  quiz: [
    {
      question: '日本のAI活用率は何%？',
      options: ['45%', '20%', '70%', '10%'],
      correctIndex: 0,
      explanation: 'ナレーションで言及した数値',
      showAt: 25,
    },
  ],
})

beforeEach(() => {
  jest.clearAllMocks()
  mockRoute.mockResolvedValue({
    model: 'claude-haiku',
    provider: 'anthropic-api',
    reason: 'Matched rule for simple complexity',
    estimatedCost: 0.001,
    fallbackAvailable: true,
  })
  process.env.ANTHROPIC_API_KEY = 'test-api-key'
})

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY
})

// ========================
// suggestHotspots
// ========================

describe('suggestHotspots', () => {
  test('returns hotspots and overlays from Anthropic API', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${hotspotsJSON}\n\`\`\``)
    )

    const result = await suggestHotspots(mockScene)

    expect(result.sceneId).toBe('s01-hook')
    expect(result.hotspots).toHaveLength(1)
    expect(result.overlays).toHaveLength(1)
    expect(result.model).toBe('claude-haiku')
    expect(typeof result.generatedAt).toBe('number')
  })

  test('calls Anthropic API with correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${hotspotsJSON}\n\`\`\``)
    )

    await suggestHotspots(mockScene)

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toMatchObject({
      model: 'claude-haiku-4-5-20251001',
    })
  })

  test('includes scene narration in prompt', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${hotspotsJSON}\n\`\`\``)
    )

    await suggestHotspots(mockScene)

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      messages: { content: string }[]
    }
    expect(body.messages[0].content).toContain(mockScene.narration)
  })

  test('returns empty arrays when LLM returns empty collections', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse('```json\n{"hotspots":[],"overlays":[]}\n```')
    )

    const result = await suggestHotspots(mockScene)
    expect(result.hotspots).toHaveLength(0)
    expect(result.overlays).toHaveLength(0)
  })

  test('throws when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY

    await expect(suggestHotspots(mockScene)).rejects.toThrow('ANTHROPIC_API_KEY')
  })

  test('throws when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Too Many Requests',
    })

    await expect(suggestHotspots(mockScene)).rejects.toThrow('429')
  })

  test('throws when Anthropic response has no text content block', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'tool_use', text: undefined }],
      }),
    })

    await expect(suggestHotspots(mockScene)).rejects.toThrow('No text content')
  })

  test('extracts JSON from raw JSON without code block', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(hotspotsJSON)
    )

    const result = await suggestHotspots(mockScene)
    expect(result.hotspots).toHaveLength(1)
  })

  test('extracts JSON from plain code block without language specifier', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`\n${hotspotsJSON}\n\`\`\``)
    )

    const result = await suggestHotspots(mockScene)
    expect(result.hotspots).toHaveLength(1)
  })

  test('throws when LLM returns no JSON', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse('すみません、JSONは提供できません。')
    )

    await expect(suggestHotspots(mockScene)).rejects.toThrow('JSON')
  })

  test('Ollama error path throws on non-ok response', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'ollama-qwen3-coder',
      provider: 'ollama',
      reason: 'Budget exceeded',
      estimatedCost: 0,
      fallbackAvailable: false,
    })

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    })

    await expect(suggestHotspots(mockScene)).rejects.toThrow('Ollama error: 503')
  })

  test('uses Ollama when model is ollama-qwen3-coder', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'ollama-qwen3-coder',
      provider: 'ollama',
      reason: 'Budget exceeded',
      estimatedCost: 0,
      fallbackAvailable: false,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: `\`\`\`json\n${hotspotsJSON}\n\`\`\`` },
      }),
    })

    const result = await suggestHotspots(mockScene)

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('11434')
    expect(result.model).toBe('ollama-qwen3-coder')
  })
})

// ========================
// suggestBranches
// ========================

describe('suggestBranches', () => {
  test('returns branch suggestions', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'claude-sonnet',
      provider: 'anthropic-api',
      reason: 'Matched rule for moderate complexity',
      estimatedCost: 0.01,
      fallbackAvailable: true,
    })
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${branchesJSON}\n\`\`\``)
    )

    const result = await suggestBranches(mockScene)

    expect(result.sceneId).toBe('s01-hook')
    expect(result.suggestions).toHaveLength(1)
    expect(result.suggestions[0].options).toHaveLength(2)
  })

  test('includes context in prompt when provided', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'claude-sonnet',
      provider: 'anthropic-api',
      reason: '',
      estimatedCost: 0,
      fallbackAvailable: false,
    })
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${branchesJSON}\n\`\`\``)
    )

    await suggestBranches(mockScene, {
      viewerEngagementRate: 0.72,
      previousChoices: ['opt_a'],
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      messages: { content: string }[]
    }
    expect(body.messages[0].content).toContain('72%')
    expect(body.messages[0].content).toContain('opt_a')
  })

  test('works without context argument', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'claude-sonnet',
      provider: 'anthropic-api',
      reason: '',
      estimatedCost: 0,
      fallbackAvailable: false,
    })
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${branchesJSON}\n\`\`\``)
    )

    const result = await suggestBranches(mockScene)
    expect(result.suggestions).toHaveLength(1)
  })

  test('routes with moderate complexity', async () => {
    mockRoute.mockResolvedValueOnce({
      model: 'claude-sonnet',
      provider: 'anthropic-api',
      reason: '',
      estimatedCost: 0,
      fallbackAvailable: false,
    })
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${branchesJSON}\n\`\`\``)
    )

    await suggestBranches(mockScene)

    expect(mockRoute).toHaveBeenCalledWith(
      expect.objectContaining({ taskComplexity: 'moderate' })
    )
  })
})

// ========================
// suggestQuiz
// ========================

describe('suggestQuiz', () => {
  test('returns quiz items', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${quizJSON}\n\`\`\``)
    )

    const result = await suggestQuiz(mockScene)

    expect(result.sceneId).toBe('s01-hook')
    expect(result.quiz).toHaveLength(1)
    expect(result.quiz[0].options).toHaveLength(4)
    expect(result.quiz[0].correctIndex).toBe(0)
  })

  test('includes scene narration in quiz prompt', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${quizJSON}\n\`\`\``)
    )

    await suggestQuiz(mockScene)

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      messages: { content: string }[]
    }
    expect(body.messages[0].content).toContain(mockScene.narration)
  })

  test('returns empty quiz when LLM returns empty array', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse('```json\n{"quiz":[]}\n```')
    )

    const result = await suggestQuiz(mockScene)
    expect(result.quiz).toHaveLength(0)
  })

  test('routes with simple complexity', async () => {
    mockFetch.mockResolvedValueOnce(
      anthropicSuccessResponse(`\`\`\`json\n${quizJSON}\n\`\`\``)
    )

    await suggestQuiz(mockScene)

    expect(mockRoute).toHaveBeenCalledWith(
      expect.objectContaining({ taskComplexity: 'simple' })
    )
  })
})
