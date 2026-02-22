import { useCallback, useReducer } from 'react'
import type { Scene } from '@/types/video'
import type {
  AISuggestionState,
  AIHotspotSuggestionResult,
  AIBranchSuggestionResult,
  AIQuizSuggestionResult,
  BranchRequestContext,
} from '@/types/ai-suggestions'

// --- State ---

interface AISuggestionsState {
  readonly hotspots: AISuggestionState<AIHotspotSuggestionResult>
  readonly branches: AISuggestionState<AIBranchSuggestionResult>
  readonly quiz: AISuggestionState<AIQuizSuggestionResult>
}

const initialSlot = <T>(): AISuggestionState<T> => ({
  data: null,
  status: 'idle',
  error: null,
})

const initialState: AISuggestionsState = {
  hotspots: initialSlot(),
  branches: initialSlot(),
  quiz: initialSlot(),
}

// --- Actions ---

type SuggestionKey = 'hotspots' | 'branches' | 'quiz'

type Action =
  | { type: 'LOADING'; key: SuggestionKey }
  | { type: 'SUCCESS'; key: 'hotspots'; data: AIHotspotSuggestionResult }
  | { type: 'SUCCESS'; key: 'branches'; data: AIBranchSuggestionResult }
  | { type: 'SUCCESS'; key: 'quiz'; data: AIQuizSuggestionResult }
  | { type: 'ERROR'; key: SuggestionKey; error: string }
  | { type: 'DISMISS'; key: SuggestionKey }

function reducer(state: AISuggestionsState, action: Action): AISuggestionsState {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        [action.key]: { data: null, status: 'loading', error: null },
      }
    case 'SUCCESS':
      return {
        ...state,
        [action.key]: { data: action.data, status: 'success', error: null },
      }
    case 'ERROR':
      return {
        ...state,
        [action.key]: { data: null, status: 'error', error: action.error },
      }
    case 'DISMISS':
      return {
        ...state,
        [action.key]: initialSlot(),
      }
    default:
      return state
  }
}

// --- API fetch helpers ---

async function fetchAISuggestion<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = (await response.json()) as { success: boolean; data?: T; error?: string }

  if (!json.success || !json.data) {
    throw new Error(json.error ?? `${endpoint} からのレスポンスが不正です`)
  }

  return json.data
}

// --- Hook ---

export interface UseAISuggestionsReturn {
  readonly hotspots: AISuggestionState<AIHotspotSuggestionResult>
  readonly branches: AISuggestionState<AIBranchSuggestionResult>
  readonly quiz: AISuggestionState<AIQuizSuggestionResult>
  readonly requestHotspots: (scene: Scene) => Promise<void>
  readonly requestBranches: (scene: Scene, context?: BranchRequestContext) => Promise<void>
  readonly requestQuiz: (scene: Scene) => Promise<void>
  readonly dismissSuggestion: (key: SuggestionKey) => void
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [state, dispatch] = useReducer(reducer, initialState)

  const requestHotspots = useCallback(async (scene: Scene): Promise<void> => {
    dispatch({ type: 'LOADING', key: 'hotspots' })
    try {
      const data = await fetchAISuggestion<AIHotspotSuggestionResult>(
        '/api/ai/suggest-hotspots',
        { scene }
      )
      dispatch({ type: 'SUCCESS', key: 'hotspots', data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ホットスポット提案の取得に失敗しました'
      dispatch({ type: 'ERROR', key: 'hotspots', error: message })
    }
  }, [])

  const requestBranches = useCallback(
    async (scene: Scene, context: BranchRequestContext = {}): Promise<void> => {
      dispatch({ type: 'LOADING', key: 'branches' })
      try {
        const data = await fetchAISuggestion<AIBranchSuggestionResult>(
          '/api/ai/suggest-branches',
          { scene, context }
        )
        dispatch({ type: 'SUCCESS', key: 'branches', data })
      } catch (error) {
        const message = error instanceof Error ? error.message : '分岐提案の取得に失敗しました'
        dispatch({ type: 'ERROR', key: 'branches', error: message })
      }
    },
    []
  )

  const requestQuiz = useCallback(async (scene: Scene): Promise<void> => {
    dispatch({ type: 'LOADING', key: 'quiz' })
    try {
      const data = await fetchAISuggestion<AIQuizSuggestionResult>(
        '/api/ai/suggest-quiz',
        { scene }
      )
      dispatch({ type: 'SUCCESS', key: 'quiz', data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'クイズ提案の取得に失敗しました'
      dispatch({ type: 'ERROR', key: 'quiz', error: message })
    }
  }, [])

  const dismissSuggestion = useCallback((key: SuggestionKey): void => {
    dispatch({ type: 'DISMISS', key })
  }, [])

  return {
    hotspots: state.hotspots,
    branches: state.branches,
    quiz: state.quiz,
    requestHotspots,
    requestBranches,
    requestQuiz,
    dismissSuggestion,
  }
}
