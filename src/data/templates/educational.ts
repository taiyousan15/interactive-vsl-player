// ==========================================
// 教育用テンプレート
// Educational Interactive Template
// ==========================================

import type { InteractiveSceneData } from "@/types/interactive"
import type { PollSceneData } from "@/types/poll"

// --- Interactive Elements ---

export const educationalInteractiveData: Readonly<Record<string, InteractiveSceneData>> = {
  "lesson-intro": {
    sceneId: "lesson-intro",
    hotspots: [
      {
        id: "hs-lesson-objectives",
        sceneId: "lesson-intro",
        label: "学習目標",
        position: { x: 10, y: 15, width: 35, height: 12 },
        timing: { showAt: 2, hideAt: 10 },
        action: { type: "overlay", overlayId: "ov-lesson-objectives" },
        shape: "pill",
        style: {
          borderColor: "#4FC3F7",
          backgroundColor: "rgba(79, 195, 247, 0.15)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.9,
        },
      },
    ],
    overlays: [
      {
        id: "ov-lesson-objectives",
        sceneId: "lesson-intro",
        type: "info-panel",
        content: {
          title: "今回の学習目標",
          description: "このレッスンを終えると...",
          stats: [
            { label: "理解", value: "基礎概念" },
            { label: "実践", value: "演習3問" },
            { label: "習得", value: "スキル2つ" },
          ],
        },
        timing: { showAt: 2, hideAt: null },
        slideFrom: "top",
        dismissible: true,
        autoHideAfterSeconds: 8,
      },
    ],
  },
  "concept-explanation": {
    sceneId: "concept-explanation",
    hotspots: [
      {
        id: "hs-concept-detail",
        sceneId: "concept-explanation",
        label: "詳細を確認",
        position: { x: 55, y: 40, width: 32, height: 12 },
        timing: { showAt: 8, hideAt: null },
        action: { type: "overlay", overlayId: "ov-concept-detail" },
        shape: "pill",
        style: {
          borderColor: "#FFD700",
          backgroundColor: "rgba(255, 215, 0, 0.15)",
          textColor: "#FFFFFF",
          pulseAnimation: false,
          opacity: 0.85,
        },
      },
    ],
    overlays: [
      {
        id: "ov-concept-detail",
        sceneId: "concept-explanation",
        type: "stat-card",
        content: {
          title: "重要ポイント",
          stats: [
            { label: "キーワード", value: "3つ" },
            { label: "応用例", value: "5件" },
            { label: "演習", value: "次のセクション" },
          ],
        },
        timing: { showAt: 8, hideAt: null },
        slideFrom: "right",
        dismissible: true,
        autoHideAfterSeconds: 10,
      },
    ],
  },
  "practice": {
    sceneId: "practice",
    hotspots: [],
    overlays: [],
  },
  "summary": {
    sceneId: "summary",
    hotspots: [
      {
        id: "hs-summary-review",
        sceneId: "summary",
        label: "復習する",
        position: { x: 30, y: 70, width: 40, height: 13 },
        timing: { showAt: 5, hideAt: null },
        action: { type: "overlay", overlayId: "ov-summary-review" },
        shape: "pill",
        style: {
          borderColor: "#4FC3F7",
          backgroundColor: "rgba(79, 195, 247, 0.15)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.9,
        },
      },
    ],
    overlays: [
      {
        id: "ov-summary-review",
        sceneId: "summary",
        type: "info-panel",
        content: {
          title: "レッスンまとめ",
          description: "学んだことを振り返りましょう",
          stats: [
            { label: "学習時間", value: "約10分" },
            { label: "達成度", value: "確認中..." },
          ],
          ctaLabel: "テストで確認する",
          ctaUrl: "#quiz",
        },
        timing: { showAt: 5, hideAt: null },
        slideFrom: "bottom",
        dismissible: true,
        autoHideAfterSeconds: null,
      },
    ],
  },
}

// --- Poll/Quiz Data ---

export const educationalPollData: Readonly<Record<string, PollSceneData>> = {
  "lesson-intro": {
    sceneId: "lesson-intro",
    polls: [
      {
        id: "poll-prior-knowledge",
        sceneId: "lesson-intro",
        question: "このトピックについて、現在の理解度は？",
        options: [
          { id: "opt_beginner", label: "初めて聞く", emoji: "🌱" },
          { id: "opt_basic", label: "少し知っている", emoji: "📖" },
          { id: "opt_intermediate", label: "ある程度理解", emoji: "💡" },
          { id: "opt_advanced", label: "詳しく知っている", emoji: "🎓" },
        ],
        showAt: 3,
        hideAt: null,
        allowMultiple: false,
        showResultsAfterVote: true,
      },
    ],
    quizzes: [],
  },
  "practice": {
    sceneId: "practice",
    polls: [],
    quizzes: [
      {
        id: "quiz-comprehension-check",
        sceneId: "practice",
        questions: [
          {
            id: "q1",
            text: "学習した概念の主な特徴はどれですか？",
            options: [
              "高速処理が主な特徴",
              "シンプルな構造と拡張性",
              "コストが低いことが特徴",
              "特定の業界のみで使用可能",
            ],
            correctIndex: 1,
            explanation: "正解です！シンプルな構造と高い拡張性が最大の特徴です。これにより様々な用途に応用できます。",
            points: 10,
          },
          {
            id: "q2",
            text: "この技術を実際に適用する際の最初のステップは？",
            options: [
              "すぐに本番環境で試す",
              "要件定義と設計から始める",
              "コードを書き始める",
              "ドキュメントを作成する",
            ],
            correctIndex: 1,
            explanation: "要件定義と設計が最初のステップです。これにより手戻りを防ぎ、効率的に進められます。",
            points: 10,
          },
        ],
        showAt: 5,
        passingScore: 70,
        showExplanationAfterAnswer: true,
      },
    ],
  },
}

// --- Template Metadata ---

export const educationalTemplate = {
  id: "educational",
  name: "教育・学習",
  description: "知識の習得と理解度確認に特化した教育用テンプレート",
  category: "education" as const,
  recommendedScenes: ["lesson-intro", "concept-explanation", "practice", "summary"],
  getInteractiveData: (sceneId: string): InteractiveSceneData =>
    educationalInteractiveData[sceneId] ?? {
      sceneId,
      hotspots: [],
      overlays: [],
    },
  getPollData: (sceneId: string): PollSceneData =>
    educationalPollData[sceneId] ?? {
      sceneId,
      polls: [],
      quizzes: [],
    },
}
