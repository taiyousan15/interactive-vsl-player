export type SceneType =
  | "intro"
  | "problem"
  | "fear"
  | "solution"
  | "product"
  | "benefit"
  | "proof"
  | "testimonial"
  | "faq"
  | "cta"
  | "choice"
  | "branch"

export type ChoiceId =
  | "cp1_a"
  | "cp1_b"
  | "cp1_c"

export interface KeyPhrase {
  readonly text: string
  readonly emphasis?: boolean
  readonly startTime?: number
}

export interface Scene {
  readonly id: string
  readonly type: SceneType
  readonly title: string
  readonly narration: string
  readonly duration: number
  readonly imagePrompt: string
  readonly imageCount?: number
  readonly imageInterval?: number
  readonly nextSceneId: string | null
  readonly style: SceneStyle
  readonly mediaType?: "image" | "video"
  readonly keyPhrases?: readonly KeyPhrase[]
}

export interface SceneStyle {
  readonly background: string
  readonly textColor: string
  readonly accentColor: string
  readonly animation: "fade" | "slide" | "zoom" | "glitch" | "particle"
  readonly overlay?: string
}

export interface ChoiceOption {
  readonly id: ChoiceId
  readonly label: string
  readonly description: string
  readonly nextSceneId: string
  readonly icon: string
}

export interface ChoicePoint {
  readonly id: string
  readonly question: string
  readonly options: readonly [ChoiceOption, ChoiceOption, ChoiceOption]
  readonly timeoutSeconds: number
  readonly defaultOptionIndex: number
}

export interface BranchScene extends Scene {
  readonly type: "choice"
  readonly choicePoint: ChoicePoint
}

export interface VideoConfig {
  readonly title: string
  readonly pattern: "06-tech-futuristic"
  readonly format: "9:16"
  readonly resolution: { readonly width: 1080; readonly height: 1920 }
  readonly fps: 30
  readonly tts: TTSConfig
  readonly totalScenes: number
  readonly maxPaths: number
}

export interface TTSConfig {
  readonly engine: "fish-audio"
  readonly voiceId: string
  readonly language: "ja"
  readonly speed: number
  readonly pitch: number
}

export interface BranchStructure {
  readonly config: VideoConfig
  readonly scenes: readonly Scene[]
  readonly branchScenes: readonly BranchScene[]
  readonly sceneGraph: SceneGraph
}

export interface SceneGraph {
  readonly entrySceneId: string
  readonly nodes: Record<string, SceneNode>
}

export interface SceneNode {
  readonly sceneId: string
  readonly next: string | null
  readonly choices?: readonly string[]
}

export interface ViewerPath {
  readonly choices: readonly ChoiceId[]
  readonly sceneIds: readonly string[]
  readonly totalDuration: number
}

export interface AnalyticsEvent {
  readonly timestamp: number
  readonly type: "scene_view" | "choice_made" | "video_complete" | "cta_click"
  readonly sceneId: string
  readonly choiceId?: ChoiceId
  readonly viewerPath: readonly ChoiceId[]
}
