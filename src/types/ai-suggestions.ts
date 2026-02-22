// ==========================================
// AI提案機能 型定義
// Phase 2: AI-powered interactive suggestions
// ==========================================

import type { HotspotShape, OverlayType, SlideDirection } from './interactive'

// --- 共通 ---

export type AISuggestionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AISuggestionState<T> {
  readonly data: T | null
  readonly status: AISuggestionStatus
  readonly error: string | null
}

// --- ホットスポット提案 ---

export interface AIHotspotPosition {
  readonly x: number      // % (0-100)
  readonly y: number      // % (0-100)
  readonly width: number   // % (0-100)
  readonly height: number  // % (0-100)
}

export interface AIHotspotAction {
  readonly type: 'url' | 'overlay' | 'scene'
  readonly overlayId?: string
  readonly url?: string
  readonly sceneId?: string
}

export interface AIHotspotSuggestion {
  readonly id: string
  readonly label: string
  readonly position: AIHotspotPosition
  readonly timing: {
    readonly showAt: number
    readonly hideAt: number | null
  }
  readonly action: AIHotspotAction
  readonly shape: HotspotShape
  readonly rationale: string
  readonly confidence: number // 0-1
}

export interface AIOverlayStat {
  readonly label: string
  readonly value: string
}

export interface AIOverlayContent {
  readonly title: string
  readonly description?: string
  readonly stats?: readonly AIOverlayStat[]
  readonly ctaLabel?: string
  readonly ctaUrl?: string
}

export interface AIOverlaySuggestion {
  readonly id: string
  readonly type: OverlayType
  readonly content: AIOverlayContent
  readonly timing: {
    readonly showAt: number
    readonly hideAt: number | null
  }
  readonly slideFrom: SlideDirection
  readonly rationale: string
  readonly confidence: number // 0-1
}

export interface AIHotspotSuggestionResult {
  readonly sceneId: string
  readonly hotspots: readonly AIHotspotSuggestion[]
  readonly overlays: readonly AIOverlaySuggestion[]
  readonly model: string
  readonly generatedAt: number
}

// --- 分岐選択肢提案 ---

export interface AIBranchOption {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly intent: string // 対象視聴者セグメントの説明
}

export interface AIBranchSuggestion {
  readonly question: string
  readonly options: readonly AIBranchOption[]
  readonly showAt: number // seconds into scene
  readonly rationale: string
  readonly confidence: number // 0-1
}

export interface AIBranchSuggestionResult {
  readonly sceneId: string
  readonly suggestions: readonly AIBranchSuggestion[]
  readonly model: string
  readonly generatedAt: number
}

export interface BranchRequestContext {
  readonly viewerEngagementRate?: number  // 0-1
  readonly previousChoices?: readonly string[]
}

// --- クイズ提案 ---

export interface AIQuizItem {
  readonly question: string
  readonly options: readonly string[]
  readonly correctIndex: number
  readonly explanation: string
  readonly showAt: number // seconds into scene
}

export interface AIQuizSuggestionResult {
  readonly sceneId: string
  readonly quiz: readonly AIQuizItem[]
  readonly model: string
  readonly generatedAt: number
}
