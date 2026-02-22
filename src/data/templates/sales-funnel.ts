// ==========================================
// セールスファネル用テンプレート
// Sales Funnel Interactive Template
// ==========================================

import type { InteractiveSceneData } from "@/types/interactive"
import type { PollSceneData } from "@/types/poll"

// --- Interactive Elements ---

export const salesFunnelInteractiveData: Readonly<Record<string, InteractiveSceneData>> = {
  "awareness": {
    sceneId: "awareness",
    hotspots: [
      {
        id: "hs-awareness-problem",
        sceneId: "awareness",
        label: "あなたの課題は？",
        position: { x: 10, y: 30, width: 40, height: 12 },
        timing: { showAt: 4, hideAt: 15 },
        action: { type: "overlay", overlayId: "ov-awareness-problem" },
        shape: "pill",
        style: {
          borderColor: "#FF6347",
          backgroundColor: "rgba(255, 99, 71, 0.15)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.9,
        },
      },
    ],
    overlays: [
      {
        id: "ov-awareness-problem",
        sceneId: "awareness",
        type: "stat-card",
        content: {
          title: "多くの人が抱える問題",
          stats: [
            { label: "時間の無駄", value: "週10時間" },
            { label: "機会損失", value: "月50万円" },
            { label: "解決できる方", value: "97%" },
          ],
        },
        timing: { showAt: 4, hideAt: null },
        slideFrom: "left",
        dismissible: true,
        autoHideAfterSeconds: 8,
      },
    ],
  },
  "interest": {
    sceneId: "interest",
    hotspots: [
      {
        id: "hs-interest-proof",
        sceneId: "interest",
        label: "成果実績を見る",
        position: { x: 55, y: 25, width: 35, height: 12 },
        timing: { showAt: 6, hideAt: null },
        action: { type: "overlay", overlayId: "ov-interest-proof" },
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
        id: "ov-interest-proof",
        sceneId: "interest",
        type: "product-card",
        content: {
          title: "導入企業の成果",
          description: "90日以内に成果を実感",
          stats: [
            { label: "売上増加", value: "平均 +185%" },
            { label: "工数削減", value: "60%" },
            { label: "顧客満足度", value: "98%" },
          ],
        },
        timing: { showAt: 6, hideAt: null },
        slideFrom: "right",
        dismissible: true,
        autoHideAfterSeconds: 10,
      },
    ],
  },
  "desire": {
    sceneId: "desire",
    hotspots: [
      {
        id: "hs-desire-offer",
        sceneId: "desire",
        label: "特典内容を確認",
        position: { x: 10, y: 55, width: 38, height: 12 },
        timing: { showAt: 10, hideAt: null },
        action: { type: "overlay", overlayId: "ov-desire-offer" },
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
        id: "ov-desire-offer",
        sceneId: "desire",
        type: "info-panel",
        content: {
          title: "今だけの特別特典",
          description: "期間限定・数量限定",
          stats: [
            { label: "特典1", value: "個別コンサル（90分）" },
            { label: "特典2", value: "テンプレート集" },
            { label: "特典3", value: "30日間サポート" },
          ],
          ctaLabel: "特典を受け取る",
          ctaUrl: "#",
        },
        timing: { showAt: 10, hideAt: null },
        slideFrom: "left",
        dismissible: true,
        autoHideAfterSeconds: null,
      },
    ],
  },
  "action": {
    sceneId: "action",
    hotspots: [
      {
        id: "hs-action-cta",
        sceneId: "action",
        label: "今すぐ申し込む",
        position: { x: 15, y: 40, width: 70, height: 16 },
        timing: { showAt: 5, hideAt: null },
        action: { type: "url", url: "#signup" },
        shape: "rectangle",
        style: {
          borderColor: "#06C755",
          backgroundColor: "rgba(6, 199, 85, 0.25)",
          textColor: "#FFFFFF",
          pulseAnimation: true,
          opacity: 0.95,
        },
      },
    ],
    overlays: [],
  },
}

// --- Poll/Quiz Data ---

export const salesFunnelPollData: Readonly<Record<string, PollSceneData>> = {
  "awareness": {
    sceneId: "awareness",
    polls: [
      {
        id: "poll-pain-point",
        sceneId: "awareness",
        question: "現在最も困っていることは何ですか？",
        options: [
          { id: "opt_time", label: "時間が足りない", emoji: "⏰" },
          { id: "opt_money", label: "コストが高い", emoji: "💸" },
          { id: "opt_skills", label: "スキルが不足", emoji: "📚" },
          { id: "opt_results", label: "成果が出ない", emoji: "😤" },
        ],
        showAt: 8,
        hideAt: null,
        allowMultiple: false,
        showResultsAfterVote: true,
      },
    ],
    quizzes: [],
  },
  "interest": {
    sceneId: "interest",
    polls: [
      {
        id: "poll-readiness",
        sceneId: "interest",
        question: "解決策を試す準備はできていますか？",
        options: [
          { id: "opt_ready_now", label: "今すぐ始めたい", emoji: "🔥" },
          { id: "opt_ready_soon", label: "1ヶ月以内に", emoji: "📅" },
          { id: "opt_considering", label: "検討中", emoji: "🤔" },
        ],
        showAt: 12,
        hideAt: null,
        allowMultiple: false,
        showResultsAfterVote: false,
      },
    ],
    quizzes: [],
  },
}

// --- Template Metadata ---

export const salesFunnelTemplate = {
  id: "sales-funnel",
  name: "セールスファネル",
  description: "AIDA（認知→関心→欲求→行動）フレームワークに沿ったセールス特化テンプレート",
  category: "sales" as const,
  recommendedScenes: ["awareness", "interest", "desire", "action"],
  getInteractiveData: (sceneId: string): InteractiveSceneData =>
    salesFunnelInteractiveData[sceneId] ?? {
      sceneId,
      hotspots: [],
      overlays: [],
    },
  getPollData: (sceneId: string): PollSceneData =>
    salesFunnelPollData[sceneId] ?? {
      sceneId,
      polls: [],
      quizzes: [],
    },
}
