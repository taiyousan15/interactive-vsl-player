// ==========================================
// 商品デモ用テンプレート
// Product Demo Interactive Template
// ==========================================

import type { InteractiveSceneData } from "@/types/interactive"
import type { PollSceneData } from "@/types/poll"

// --- Interactive Elements (Hotspot/Overlay) ---

export const productDemoInteractiveData: Readonly<Record<string, InteractiveSceneData>> = {
  "intro": {
    sceneId: "intro",
    hotspots: [
      {
        id: "hs-intro-overview",
        sceneId: "intro",
        label: "製品概要を見る",
        position: { x: 60, y: 20, width: 30, height: 12 },
        timing: { showAt: 3, hideAt: 12 },
        action: { type: "overlay", overlayId: "ov-intro-overview" },
        shape: "pill",
        style: {
          borderColor: "#FFD700",
          backgroundColor: "rgba(255, 215, 0, 0.15)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.9,
        },
      },
    ],
    overlays: [
      {
        id: "ov-intro-overview",
        sceneId: "intro",
        type: "product-card",
        content: {
          title: "製品ハイライト",
          description: "業界最高水準の機能を搭載",
          stats: [
            { label: "処理速度", value: "10倍" },
            { label: "コスト削減", value: "60%" },
            { label: "導入実績", value: "500社+" },
          ],
          ctaLabel: "詳細を見る",
          ctaUrl: "#",
        },
        timing: { showAt: 3, hideAt: null },
        slideFrom: "right",
        dismissible: true,
        autoHideAfterSeconds: 10,
      },
    ],
  },
  "features": {
    sceneId: "features",
    hotspots: [
      {
        id: "hs-features-demo",
        sceneId: "features",
        label: "デモを見る",
        position: { x: 10, y: 45, width: 35, height: 12 },
        timing: { showAt: 5, hideAt: null },
        action: { type: "overlay", overlayId: "ov-features-demo" },
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
        id: "ov-features-demo",
        sceneId: "features",
        type: "info-panel",
        content: {
          title: "主要機能",
          description: "3つの強力な機能で業務を革新",
          stats: [
            { label: "自動化", value: "95%" },
            { label: "精度", value: "99.9%" },
            { label: "設定時間", value: "5分" },
          ],
        },
        timing: { showAt: 5, hideAt: null },
        slideFrom: "left",
        dismissible: true,
        autoHideAfterSeconds: 12,
      },
    ],
  },
  "pricing": {
    sceneId: "pricing",
    hotspots: [
      {
        id: "hs-pricing-offer",
        sceneId: "pricing",
        label: "特別価格を確認",
        position: { x: 20, y: 35, width: 60, height: 14 },
        timing: { showAt: 8, hideAt: null },
        action: { type: "overlay", overlayId: "ov-pricing-offer" },
        shape: "rectangle",
        style: {
          borderColor: "#FF6347",
          backgroundColor: "rgba(255, 99, 71, 0.2)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.95,
        },
      },
    ],
    overlays: [
      {
        id: "ov-pricing-offer",
        sceneId: "pricing",
        type: "product-card",
        content: {
          title: "限定オファー",
          description: "今なら初月50%オフ",
          stats: [
            { label: "通常価格", value: "¥9,800/月" },
            { label: "特別価格", value: "¥4,900/月" },
            { label: "残り", value: "3日間" },
          ],
          ctaLabel: "今すぐ申し込む",
          ctaUrl: "#",
        },
        timing: { showAt: 8, hideAt: null },
        slideFrom: "bottom",
        dismissible: true,
        autoHideAfterSeconds: null,
      },
    ],
  },
}

// --- Poll/Quiz Data ---

export const productDemoPollData: Readonly<Record<string, PollSceneData>> = {
  "features": {
    sceneId: "features",
    polls: [
      {
        id: "poll-features-interest",
        sceneId: "features",
        question: "どの機能が最も気になりますか？",
        options: [
          { id: "opt_automation", label: "自動化機能", emoji: "🤖" },
          { id: "opt_analytics", label: "分析ダッシュボード", emoji: "📊" },
          { id: "opt_integration", label: "外部連携", emoji: "🔗" },
          { id: "opt_ai", label: "AI補助機能", emoji: "✨" },
        ],
        showAt: 15,
        hideAt: null,
        allowMultiple: false,
        showResultsAfterVote: true,
      },
    ],
    quizzes: [],
  },
  "knowledge-check": {
    sceneId: "knowledge-check",
    polls: [],
    quizzes: [
      {
        id: "quiz-product-knowledge",
        sceneId: "knowledge-check",
        questions: [
          {
            id: "q1",
            text: "当製品のコスト削減効果はどのくらいですか？",
            options: ["20%", "40%", "60%", "80%"],
            correctIndex: 2,
            explanation: "業界平均と比較して60%のコスト削減を実現しています。",
            points: 10,
          },
        ],
        showAt: 5,
        passingScore: 80,
        showExplanationAfterAnswer: true,
      },
    ],
  },
}

// --- Template Metadata ---

export const productDemoTemplate = {
  id: "product-demo",
  name: "商品デモ",
  description: "製品の機能・価格・メリットを効果的に伝えるテンプレート",
  category: "sales" as const,
  recommendedScenes: ["intro", "features", "pricing", "testimonials", "cta"],
  getInteractiveData: (sceneId: string): InteractiveSceneData =>
    productDemoInteractiveData[sceneId] ?? {
      sceneId,
      hotspots: [],
      overlays: [],
    },
  getPollData: (sceneId: string): PollSceneData =>
    productDemoPollData[sceneId] ?? {
      sceneId,
      polls: [],
      quizzes: [],
    },
}
