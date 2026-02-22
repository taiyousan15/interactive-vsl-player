import type {
  InteractiveSceneData,
  Hotspot,
  Overlay,
  HotspotStyle,
} from "@/types/interactive"

// ==========================================
// インタラクティブ要素データ - AI四次元ポケットシステム VSL
// branch-structure-4dpocket.ts を変更せず、sceneId別マップで管理
// ==========================================

const goldHotspotStyle: HotspotStyle = {
  borderColor: "#FFD700",
  backgroundColor: "rgba(255, 215, 0, 0.15)",
  textColor: "#FFFFFF",
  pulseAnimation: true,
  opacity: 0.9,
}

const cyanHotspotStyle: HotspotStyle = {
  borderColor: "#00BFFF",
  backgroundColor: "rgba(0, 191, 255, 0.15)",
  textColor: "#FFFFFF",
  pulseAnimation: true,
  opacity: 0.9,
}

const lineHotspotStyle: HotspotStyle = {
  borderColor: "#06C755",
  backgroundColor: "rgba(6, 199, 85, 0.2)",
  textColor: "#FFFFFF",
  pulseAnimation: true,
  opacity: 0.95,
}

// --- Scene: s01-hook ---
const s01Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s01-stats",
    sceneId: "s01-hook",
    label: "0.5%の実態を見る",
    position: { x: 55, y: 20, width: 38, height: 10 },
    timing: { showAt: 6, hideAt: 14 },
    action: { type: "overlay", overlayId: "ov-s01-ai-stats" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s01Overlays: readonly Overlay[] = [
  {
    id: "ov-s01-ai-stats",
    sceneId: "s01-hook",
    type: "stat-card",
    content: {
      title: "第二次AIバブルの現実",
      stats: [
        { label: "AI先行活用者", value: "0.5%" },
        { label: "AIの年間進化速度", value: "1,000倍" },
        { label: "8年後の到達倍率", value: "1万倍" },
      ],
    },
    timing: { showAt: 6, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 8,
  },
]

// --- Scene: s02-wall ---
const s02Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s02-costs",
    sceneId: "s02-wall",
    label: "マーケティングコストの現実",
    position: { x: 10, y: 58, width: 40, height: 10 },
    timing: { showAt: 12, hideAt: null },
    action: { type: "overlay", overlayId: "ov-s02-costs" },
    shape: "pill",
    style: cyanHotspotStyle,
  },
]

const s02Overlays: readonly Overlay[] = [
  {
    id: "ov-s02-costs",
    sceneId: "s02-wall",
    type: "product-card",
    content: {
      title: "マーケティング費用の現実",
      description: "多くの人が毎月これだけ費やしている",
      stats: [
        { label: "高額塾・コンサル", value: "月30〜100万" },
        { label: "LP制作外注", value: "50万円〜" },
        { label: "ツール月額費用", value: "数万円/月" },
      ],
    },
    timing: { showAt: 12, hideAt: null },
    slideFrom: "bottom",
    dismissible: true,
    autoHideAfterSeconds: 10,
  },
]

// --- Scene: s03-pocket ---
const s03Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s03-comparison",
    sceneId: "s03-pocket",
    label: "コスト革命を見る",
    position: { x: 55, y: 30, width: 38, height: 10 },
    timing: { showAt: 8, hideAt: 16 },
    action: { type: "overlay", overlayId: "ov-s03-comparison" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s03Overlays: readonly Overlay[] = [
  {
    id: "ov-s03-comparison",
    sceneId: "s03-pocket",
    type: "stat-card",
    content: {
      title: "四次元ポケットの力",
      stats: [
        { label: "PC作業の代替率", value: "95%" },
        { label: "LP制作 従来費", value: "50万円" },
        { label: "LP制作 AIコスト", value: "1,000円" },
      ],
    },
    timing: { showAt: 8, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 8,
  },
]

// --- Scene: s04a-marketing ---
const s04aHotspots: readonly Hotspot[] = [
  {
    id: "hs-s04a-lp",
    sceneId: "s04a-marketing",
    label: "LP自動化の詳細",
    position: { x: 10, y: 55, width: 38, height: 10 },
    timing: { showAt: 7, hideAt: 14 },
    action: { type: "overlay", overlayId: "ov-s04a-lp" },
    shape: "pill",
    style: cyanHotspotStyle,
  },
]

const s04aOverlays: readonly Overlay[] = [
  {
    id: "ov-s04a-lp",
    sceneId: "s04a-marketing",
    type: "product-card",
    content: {
      title: "LP制作コスト革命",
      description: "AIが1日でプロ品質のLPを制作",
      stats: [
        { label: "従来LP制作費", value: "50万円" },
        { label: "AI制作コスト", value: "1,000円以下" },
        { label: "制作期間", value: "1日" },
      ],
    },
    timing: { showAt: 7, hideAt: null },
    slideFrom: "bottom",
    dismissible: true,
    autoHideAfterSeconds: 10,
  },
]

// --- Scene: s05a-results / s05b-results ---
const s05Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s05-proof",
    sceneId: "s05a-results",
    label: "先行者の実績",
    position: { x: 55, y: 25, width: 38, height: 10 },
    timing: { showAt: 4, hideAt: 12 },
    action: { type: "overlay", overlayId: "ov-s05-proof" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s05Overlays: readonly Overlay[] = [
  {
    id: "ov-s05-proof",
    sceneId: "s05a-results",
    type: "stat-card",
    content: {
      title: "先行ユーザーの実績",
      stats: [
        { label: "初心者の1ヶ月受注", value: "400万円" },
        { label: "制作コスト→販売価格", value: "1千→100万" },
        { label: "継続サポート契約", value: "月5万円" },
      ],
    },
    timing: { showAt: 4, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 9,
  },
]

const s05bHotspots: readonly Hotspot[] = [
  {
    id: "hs-s05b-proof",
    sceneId: "s05b-results",
    label: "先行者の実績",
    position: { x: 55, y: 25, width: 38, height: 10 },
    timing: { showAt: 4, hideAt: 12 },
    action: { type: "overlay", overlayId: "ov-s05b-proof" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s05bOverlays: readonly Overlay[] = [
  {
    id: "ov-s05b-proof",
    sceneId: "s05b-results",
    type: "stat-card",
    content: {
      title: "コンテンツ先行者の実績",
      stats: [
        { label: "コスト1,000円の販売価格", value: "100万円" },
        { label: "継続サポート", value: "月5万円" },
        { label: "動画量産数/日", value: "10〜30本" },
      ],
    },
    timing: { showAt: 4, hideAt: null },
    slideFrom: "right",
    dismissible: true,
    autoHideAfterSeconds: 9,
  },
]

// --- Scene: s04c-authority ---
const s04cHotspots: readonly Hotspot[] = [
  {
    id: "hs-s04c-investment",
    sceneId: "s04c-authority",
    label: "開発への投資額",
    position: { x: 10, y: 50, width: 42, height: 10 },
    timing: { showAt: 14, hideAt: 22 },
    action: { type: "overlay", overlayId: "ov-s04c-investment" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s04cOverlays: readonly Overlay[] = [
  {
    id: "ov-s04c-investment",
    sceneId: "s04c-authority",
    type: "stat-card",
    content: {
      title: "システム開発への投資",
      stats: [
        { label: "開発期間", value: "3ヶ月以上" },
        { label: "月額コンサル費", value: "300万円以上" },
        { label: "総開発費", value: "1,000万円以上" },
      ],
    },
    timing: { showAt: 14, hideAt: null },
    slideFrom: "bottom",
    dismissible: true,
    autoHideAfterSeconds: 8,
  },
]

// --- Scene: s07-seminar ---
const s07Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s07-lineup",
    sceneId: "s07-seminar",
    label: "公開内容14項目",
    position: { x: 10, y: 18, width: 42, height: 10 },
    timing: { showAt: 5, hideAt: 14 },
    action: { type: "overlay", overlayId: "ov-s07-lineup" },
    shape: "pill",
    style: cyanHotspotStyle,
  },
]

const s07Overlays: readonly Overlay[] = [
  {
    id: "ov-s07-lineup",
    sceneId: "s07-seminar",
    type: "info-panel",
    content: {
      title: "無料セミナー公開内容",
      description: "120〜180分で全貌を公開",
      stats: [
        { label: "AI集客", value: "広告費ゼロ" },
        { label: "Kindle複利出版", value: "無限積み上げ" },
        { label: "マルチエージェント", value: "開発費1,000万相当" },
      ],
    },
    timing: { showAt: 5, hideAt: null },
    slideFrom: "left",
    dismissible: true,
    autoHideAfterSeconds: 12,
  },
]

// --- Scene: s08-tokuten ---
const s08Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s08-bonus",
    sceneId: "s08-tokuten",
    label: "特典の詳細を見る",
    position: { x: 10, y: 48, width: 38, height: 10 },
    timing: { showAt: 8, hideAt: null },
    action: { type: "overlay", overlayId: "ov-s08-bonus" },
    shape: "pill",
    style: goldHotspotStyle,
  },
]

const s08Overlays: readonly Overlay[] = [
  {
    id: "ov-s08-bonus",
    sceneId: "s08-tokuten",
    type: "info-panel",
    content: {
      title: "参加特典",
      description: "セミナー参加者全員にプレゼント",
      stats: [
        { label: "Gemini専用Gem", value: "20個無料" },
        { label: "VIP優先案内", value: "限定権利" },
        { label: "参加費", value: "完全無料" },
      ],
      ctaLabel: "セミナーに申し込む",
      ctaUrl: "https://line.me/",
    },
    timing: { showAt: 8, hideAt: null },
    slideFrom: "left",
    dismissible: true,
    autoHideAfterSeconds: 14,
  },
]

// --- Scene: s10-final-cta ---
const s10Hotspots: readonly Hotspot[] = [
  {
    id: "hs-s10-line",
    sceneId: "s10-final-cta",
    label: "LINE友だち追加で先行案内を受け取る",
    position: { x: 10, y: 38, width: 80, height: 14 },
    timing: { showAt: 16, hideAt: null },
    action: { type: "url", url: "https://line.me/" },
    shape: "rectangle",
    style: lineHotspotStyle,
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
  "s02-wall": {
    sceneId: "s02-wall",
    hotspots: s02Hotspots,
    overlays: s02Overlays,
  },
  "s03-pocket": {
    sceneId: "s03-pocket",
    hotspots: s03Hotspots,
    overlays: s03Overlays,
  },
  "s04a-marketing": {
    sceneId: "s04a-marketing",
    hotspots: s04aHotspots,
    overlays: s04aOverlays,
  },
  "s05a-results": {
    sceneId: "s05a-results",
    hotspots: s05Hotspots,
    overlays: s05Overlays,
  },
  "s05b-results": {
    sceneId: "s05b-results",
    hotspots: s05bHotspots,
    overlays: s05bOverlays,
  },
  "s04c-authority": {
    sceneId: "s04c-authority",
    hotspots: s04cHotspots,
    overlays: s04cOverlays,
  },
  "s07-seminar": {
    sceneId: "s07-seminar",
    hotspots: s07Hotspots,
    overlays: s07Overlays,
  },
  "s08-tokuten": {
    sceneId: "s08-tokuten",
    hotspots: s08Hotspots,
    overlays: s08Overlays,
  },
  "s10-final-cta": {
    sceneId: "s10-final-cta",
    hotspots: s10Hotspots,
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
