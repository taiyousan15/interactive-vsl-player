// ==========================================
// インタラクティブ機能 型定義
// 既存 video.ts を変更せず、新ファイルで管理
// ==========================================

// --- Hotspot ---

export type HotspotShape = "rectangle" | "circle" | "pill"

export type HotspotActionType = "url" | "overlay" | "scene"

export interface HotspotAction {
  readonly type: HotspotActionType
  readonly url?: string
  readonly overlayId?: string
  readonly sceneId?: string
}

export interface HotspotPosition {
  readonly x: number      // % (0-100)
  readonly y: number      // % (0-100)
  readonly width: number   // % (0-100)
  readonly height: number  // % (0-100)
}

export interface HotspotTiming {
  readonly showAt: number       // seconds
  readonly hideAt: number | null // seconds, null = until scene ends
}

export interface HotspotStyle {
  readonly borderColor: string
  readonly backgroundColor: string
  readonly textColor: string
  readonly pulseAnimation: boolean
  readonly opacity: number // 0-1
}

export interface Hotspot {
  readonly id: string
  readonly sceneId: string
  readonly label: string
  readonly position: HotspotPosition
  readonly timing: HotspotTiming
  readonly action: HotspotAction
  readonly shape: HotspotShape
  readonly style: HotspotStyle
}

// --- Overlay ---

export type OverlayType = "product-card" | "info-panel" | "stat-card"
export type SlideDirection = "left" | "right" | "bottom" | "top"

export interface OverlayContent {
  readonly title: string
  readonly description?: string
  readonly imageUrl?: string
  readonly stats?: readonly OverlayStat[]
  readonly ctaLabel?: string
  readonly ctaUrl?: string
}

export interface OverlayStat {
  readonly label: string
  readonly value: string
}

export interface OverlayTiming {
  readonly showAt: number
  readonly hideAt: number | null
}

export interface Overlay {
  readonly id: string
  readonly sceneId: string
  readonly type: OverlayType
  readonly content: OverlayContent
  readonly timing: OverlayTiming
  readonly slideFrom: SlideDirection
  readonly dismissible: boolean
  readonly autoHideAfterSeconds: number | null
}

// --- Analytics ---

export type InteractiveEventType =
  | "hotspot_view"
  | "hotspot_click"
  | "overlay_view"
  | "overlay_dismiss"
  | "overlay_cta_click"
  | "scene_engagement"
  | "poll_answer"
  | "quiz_answer"

export interface InteractiveAnalyticsEvent {
  readonly timestamp: number
  readonly sessionId: string
  readonly type: InteractiveEventType
  readonly sceneId: string
  readonly elementId: string | null
  readonly metadata: Record<string, string | number | boolean>
}

// --- Scene Extension (composition, existing Scene unchanged) ---

export interface InteractiveSceneData {
  readonly sceneId: string
  readonly hotspots: readonly Hotspot[]
  readonly overlays: readonly Overlay[]
}
