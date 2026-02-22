import type {
  InteractiveSceneData,
  Hotspot,
  Overlay,
  HotspotStyle,
} from "@/types/interactive"

// ==========================================
// インタラクティブ要素データ
// branch-structure-lp5.ts を変更せず、sceneId別マップで管理
// ==========================================

const defaultHotspotStyle: HotspotStyle = {
  borderColor: "#FFD700",
  backgroundColor: "rgba(255, 215, 0, 0.15)",
  textColor: "#FFFFFF",
  pulseAnimation: true,
  opacity: 0.9,
}

const blueHotspotStyle: HotspotStyle = {
  borderColor: "#4FC3F7",
  backgroundColor: "rgba(79, 195, 247, 0.15)",
  textColor: "#FFFFFF",
  pulseAnimation: true,
  opacity: 0.9,
}

// --- Scene: s01-hook ---
const s01Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s01-ai-detail",
    sceneId: "s01-hook",
    label: "AI活用の実態を見る",
    position: { x: 60, y: 25, width: 30, height: 12 },
    timing: { showAt: 5, hideAt: 12 },
    action: { type: "overlay", overlayId: "ov-s01-ai-stats" },
    shape: "pill",
    style: defaultHotspotStyle,
  },
]

const s01Overlays: readonly Overlay[] = [
  {
    id: "ov-s01-ai-stats",
    sceneId: "s01-hook",
    type: "stat-card",
    content: {
      title: "AI活用の現実",
      stats: [
        { label: "AI活用企業", value: "0.5%" },
        { label: "自動化可能業務", value: "95%" },
        { label: "LP制作コスト削減", value: "99.8%" },
      ],
    },
    timing: { showAt: 5, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 8,
  },
]

// --- Scene: s02a-wall ---
const s02aHotspots: readonly Hotspot[] = [
  {
    id: "hs-s02a-cost",
    sceneId: "s02a-wall",
    label: "コスト比較を見る",
    position: { x: 10, y: 60, width: 35, height: 10 },
    timing: { showAt: 14, hideAt: null },
    action: { type: "overlay", overlayId: "ov-s02a-cost" },
    shape: "pill",
    style: blueHotspotStyle,
  },
]

const s02aOverlays: readonly Overlay[] = [
  {
    id: "ov-s02a-cost",
    sceneId: "s02a-wall",
    type: "product-card",
    content: {
      title: "LP制作コスト革命",
      description: "従来の外注費用と比較して圧倒的なコスト削減を実現",
      stats: [
        { label: "従来LP制作費", value: "50万円" },
        { label: "AIシステム", value: "1,000円以下" },
        { label: "削減率", value: "99.8%" },
      ],
    },
    timing: { showAt: 14, hideAt: null },
    slideFrom: "bottom",
    dismissible: true,
    autoHideAfterSeconds: 10,
  },
]

// --- Scene: s03a-proof ---
const s03aHotspots: readonly Hotspot[] = [
  {
    id: "hs-s03a-results",
    sceneId: "s03a-proof",
    label: "実績の詳細",
    position: { x: 55, y: 35, width: 35, height: 10 },
    timing: { showAt: 3, hideAt: 10 },
    action: { type: "overlay", overlayId: "ov-s03a-results" },
    shape: "pill",
    style: defaultHotspotStyle,
  },
]

const s03aOverlays: readonly Overlay[] = [
  {
    id: "ov-s03a-results",
    sceneId: "s03a-proof",
    type: "stat-card",
    content: {
      title: "先行ユーザーの実績",
      stats: [
        { label: "初心者1ヶ月受注", value: "400万円" },
        { label: "システム販売価格", value: "100万円" },
        { label: "制作コスト", value: "1,000円" },
      ],
    },
    timing: { showAt: 3, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 8,
  },
]

// --- Scene: s04b-seminar ---
const s04bHotspots: readonly Hotspot[] = [
  {
    id: "hs-s04b-benefits",
    sceneId: "s04b-seminar",
    label: "特典一覧",
    position: { x: 10, y: 50, width: 30, height: 10 },
    timing: { showAt: 10, hideAt: null },
    action: { type: "overlay", overlayId: "ov-s04b-benefits" },
    shape: "pill",
    style: defaultHotspotStyle,
  },
]

const s04bOverlays: readonly Overlay[] = [
  {
    id: "ov-s04b-benefits",
    sceneId: "s04b-seminar",
    type: "info-panel",
    content: {
      title: "無料セミナー特典",
      description: "参加者全員にプレゼント",
      stats: [
        { label: "Gemini専用Gem", value: "20個" },
        { label: "VIP優先案内", value: "あり" },
        { label: "参加費", value: "無料" },
      ],
      ctaLabel: "セミナーに申し込む",
      ctaUrl: "https://line.me/",
    },
    timing: { showAt: 10, hideAt: null },
    slideFrom: "left",
    dismissible: true,
    autoHideAfterSeconds: 12,
  },
]

// --- Scene: s05-cta-line ---
const s05Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s05-line",
    sceneId: "s05-cta-line",
    label: "LINE友だち追加",
    position: { x: 20, y: 40, width: 60, height: 15 },
    timing: { showAt: 14, hideAt: null },
    action: { type: "url", url: "https://line.me/" },
    shape: "rectangle",
    style: {
      borderColor: "#06C755",
      backgroundColor: "rgba(6, 199, 85, 0.2)",
      textColor: "#FFFFFF",
      pulseAnimation: true,
      opacity: 0.95,
    },
  },
]

// ==========================================
// sceneId -> InteractiveSceneData マッピング
// ==========================================
const interactiveDataMap: Readonly<Record<string, InteractiveSceneData>> = {
  "s01-hook": {
    sceneId: "s01-hook",
    hotspots: s01Hotspots,
    overlays: s01Overlays,
  },
  "s02a-wall": {
    sceneId: "s02a-wall",
    hotspots: s02aHotspots,
    overlays: s02aOverlays,
  },
  "s03a-proof": {
    sceneId: "s03a-proof",
    hotspots: s03aHotspots,
    overlays: s03aOverlays,
  },
  "s04b-seminar": {
    sceneId: "s04b-seminar",
    hotspots: s04bHotspots,
    overlays: s04bOverlays,
  },
  "s05-cta-line": {
    sceneId: "s05-cta-line",
    hotspots: s05Hotspots,
    overlays: [],
  },
}

const emptySceneData = (sceneId: string): InteractiveSceneData => ({
  sceneId,
  hotspots: [],
  overlays: [],
})

export function getInteractiveData(sceneId: string): InteractiveSceneData {
  return interactiveDataMap[sceneId] ?? emptySceneData(sceneId)
}

export function getOverlayById(
  sceneId: string,
  overlayId: string
): Overlay | undefined {
  const data = getInteractiveData(sceneId)
  return data.overlays.find((o) => o.id === overlayId)
}
