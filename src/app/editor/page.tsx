"use client"

import { useState, useCallback, useReducer } from "react"
import { TimelineEditor } from "@/components/editor/TimelineEditor"
import { HotspotPlacer } from "@/components/editor/HotspotPlacer"
import { OverlayConfigurator } from "@/components/editor/OverlayConfigurator"
import { productDemoTemplate } from "@/data/templates/product-demo"
import { educationalTemplate } from "@/data/templates/educational"
import { salesFunnelTemplate } from "@/data/templates/sales-funnel"
import type { Hotspot, Overlay } from "@/types/interactive"

// --- Types ---

interface EditorState {
  readonly hotspots: readonly Hotspot[]
  readonly overlays: readonly Overlay[]
  readonly selectedItemId: string | null
  readonly selectedItemType: "hotspot" | "overlay" | null
  readonly currentTime: number
  readonly sceneDuration: number
  readonly activeSceneId: string
}

type EditorAction =
  | { type: "SELECT_ITEM"; id: string; itemType: "hotspot" | "overlay" }
  | { type: "DESELECT" }
  | { type: "ADD_HOTSPOT"; hotspot: Hotspot }
  | { type: "UPDATE_OVERLAY"; overlay: Overlay }
  | { type: "UPDATE_TIMING"; id: string; itemType: "hotspot" | "overlay"; field: "showAt" | "hideAt"; value: number | null }
  | { type: "SET_TIME"; time: number }
  | { type: "LOAD_TEMPLATE"; sceneId: string; hotspots: readonly Hotspot[]; overlays: readonly Overlay[] }

const AVAILABLE_TEMPLATES = [
  { ...productDemoTemplate, label: "商品デモ" },
  { ...educationalTemplate, label: "教育・学習" },
  { ...salesFunnelTemplate, label: "セールスファネル" },
]

const DEMO_SCENES = ["intro", "features", "pricing", "awareness", "interest"]

function buildInitialState(): EditorState {
  const sceneId = "intro"
  const data = productDemoTemplate.getInteractiveData(sceneId)
  return {
    hotspots: data.hotspots,
    overlays: data.overlays,
    selectedItemId: null,
    selectedItemType: null,
    currentTime: 0,
    sceneDuration: 30,
    activeSceneId: sceneId,
  }
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SELECT_ITEM":
      return {
        ...state,
        selectedItemId: action.id,
        selectedItemType: action.itemType,
      }
    case "DESELECT":
      return { ...state, selectedItemId: null, selectedItemType: null }
    case "ADD_HOTSPOT":
      return { ...state, hotspots: [...state.hotspots, action.hotspot] }
    case "UPDATE_OVERLAY":
      return {
        ...state,
        overlays: state.overlays.map((o) =>
          o.id === action.overlay.id ? action.overlay : o
        ),
      }
    case "UPDATE_TIMING": {
      if (action.itemType === "hotspot") {
        return {
          ...state,
          hotspots: state.hotspots.map((h) => {
            if (h.id !== action.id) return h
            const timing =
              action.field === "showAt"
                ? { ...h.timing, showAt: action.value as number }
                : { ...h.timing, hideAt: action.value }
            return { ...h, timing }
          }),
        }
      }
      return {
        ...state,
        overlays: state.overlays.map((o) => {
          if (o.id !== action.id) return o
          const timing =
            action.field === "showAt"
              ? { ...o.timing, showAt: action.value as number }
              : { ...o.timing, hideAt: action.value }
          return { ...o, timing }
        }),
      }
    }
    case "SET_TIME":
      return { ...state, currentTime: action.time }
    case "LOAD_TEMPLATE":
      return {
        ...state,
        hotspots: action.hotspots,
        overlays: action.overlays,
        activeSceneId: action.sceneId,
        selectedItemId: null,
        selectedItemType: null,
        currentTime: 0,
      }
    default:
      return state
  }
}

let hotspotCounter = 1

function createNewHotspot(
  sceneId: string,
  position: { x: number; y: number; width: number; height: number }
): Hotspot {
  const id = `hs-new-${hotspotCounter++}`
  return {
    id,
    sceneId,
    label: "新しいホットスポット",
    position,
    timing: { showAt: 0, hideAt: null },
    action: { type: "overlay", overlayId: "" },
    shape: "pill",
    style: {
      borderColor: "#FFD700",
      backgroundColor: "rgba(255, 215, 0, 0.15)",
      textColor: "#FFFFFF",
      pulseAnimation: true,
      opacity: 0.9,
    },
  }
}

// --- Component ---

export default function EditorPage() {
  const [state, dispatch] = useReducer(editorReducer, undefined, buildInitialState)
  const [activeTab, setActiveTab] = useState<"hotspots" | "overlays">("hotspots")

  const handleSelectItem = useCallback(
    (id: string, itemType: "hotspot" | "overlay") => {
      dispatch({ type: "SELECT_ITEM", id, itemType })
      setActiveTab(itemType === "hotspot" ? "hotspots" : "overlays")
    },
    []
  )

  const handleAddHotspot = useCallback(
    (position: { x: number; y: number; width: number; height: number }) => {
      const hotspot = createNewHotspot(state.activeSceneId, position)
      dispatch({ type: "ADD_HOTSPOT", hotspot })
      dispatch({ type: "SELECT_ITEM", id: hotspot.id, itemType: "hotspot" })
    },
    [state.activeSceneId]
  )

  const handleUpdateOverlay = useCallback((overlay: Overlay) => {
    dispatch({ type: "UPDATE_OVERLAY", overlay })
  }, [])

  const handleTimeChange = useCallback(
    (
      id: string,
      itemType: "hotspot" | "overlay",
      field: "showAt" | "hideAt",
      value: number | null
    ) => {
      dispatch({ type: "UPDATE_TIMING", id, itemType, field, value })
    },
    []
  )

  const handleLoadTemplate = useCallback(
    (templateIndex: number, sceneId: string) => {
      const tmpl = AVAILABLE_TEMPLATES[templateIndex]
      if (!tmpl) return
      const data = tmpl.getInteractiveData(sceneId)
      dispatch({
        type: "LOAD_TEMPLATE",
        sceneId,
        hotspots: data.hotspots,
        overlays: data.overlays,
      })
    },
    []
  )

  const selectedOverlay =
    state.selectedItemType === "overlay"
      ? state.overlays.find((o) => o.id === state.selectedItemId) ?? null
      : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f1a] px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-base font-bold">インタラクティブ エディター</h1>
            <p className="text-xs text-white/40">Phase 3 - Visual Editor</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
              {state.hotspots.length} HS · {state.overlays.length} OV
            </span>
            <button className="rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#FFD700]/90">
              保存
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr]">

          {/* Left panel: Template & Scene selector */}
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0f0f1a] p-4">
              <h2 className="mb-3 text-sm font-bold text-white">テンプレート</h2>
              <div className="space-y-2">
                {AVAILABLE_TEMPLATES.map((tmpl, i) => (
                  <div key={tmpl.id} className="rounded-lg bg-white/5 p-3">
                    <p className="mb-1 text-xs font-bold text-white">{tmpl.label}</p>
                    <p className="mb-2 text-[10px] text-white/50">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {tmpl.recommendedScenes.map((sceneId) => (
                        <button
                          key={sceneId}
                          onClick={() => handleLoadTemplate(i, sceneId)}
                          className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                            state.activeSceneId === sceneId
                              ? "bg-[#FFD700] font-bold text-black"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {sceneId}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scene list */}
            <div className="rounded-xl bg-[#0f0f1a] p-4">
              <h2 className="mb-3 text-sm font-bold text-white">シーン一覧</h2>
              <div className="space-y-1">
                {DEMO_SCENES.map((sceneId) => (
                  <button
                    key={sceneId}
                    onClick={() => handleLoadTemplate(0, sceneId)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      state.activeSceneId === sceneId
                        ? "bg-[#FFD700]/20 text-[#FFD700]"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {sceneId}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: HotspotPlacer + Timeline */}
          <div className="space-y-4">
            <HotspotPlacer
              hotspots={state.hotspots}
              selectedHotspotId={
                state.selectedItemType === "hotspot" ? state.selectedItemId : null
              }
              onAddHotspot={handleAddHotspot}
              onSelectHotspot={(id) =>
                id
                  ? dispatch({ type: "SELECT_ITEM", id, itemType: "hotspot" })
                  : dispatch({ type: "DESELECT" })
              }
              onMoveHotspot={(id, position) => {
                dispatch({
                  type: "UPDATE_TIMING",
                  id,
                  itemType: "hotspot",
                  field: "showAt",
                  value: state.hotspots.find((h) => h.id === id)?.timing.showAt ?? 0,
                })
              }}
            />

            <TimelineEditor
              hotspots={state.hotspots}
              overlays={state.overlays}
              sceneDuration={state.sceneDuration}
              currentTime={state.currentTime}
              selectedItemId={state.selectedItemId}
              onSelectItem={handleSelectItem}
              onTimeChange={handleTimeChange}
            />

            {/* Current time scrubber */}
            <div className="rounded-xl bg-[#0f0f1a] p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs text-white/60">プレビュー時間</label>
                <span className="text-xs text-white/60">{state.currentTime}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={state.sceneDuration}
                value={state.currentTime}
                onChange={(e) =>
                  dispatch({ type: "SET_TIME", time: Number(e.target.value) })
                }
                className="w-full accent-[#FFD700]"
              />
            </div>
          </div>

          {/* Right panel: Config tabs */}
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0f0f1a] p-4">
              <div className="mb-3 flex gap-1">
                <button
                  onClick={() => setActiveTab("hotspots")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "hotspots"
                      ? "bg-[#FFD700] text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  ホットスポット ({state.hotspots.length})
                </button>
                <button
                  onClick={() => setActiveTab("overlays")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "overlays"
                      ? "bg-[#4FC3F7] text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  オーバーレイ ({state.overlays.length})
                </button>
              </div>

              {activeTab === "hotspots" && (
                <div className="space-y-2">
                  {state.hotspots.length === 0 ? (
                    <p className="py-4 text-center text-xs text-white/30">
                      左のキャンバスでホットスポットを追加
                    </p>
                  ) : (
                    state.hotspots.map((hs) => (
                      <button
                        key={hs.id}
                        onClick={() => dispatch({ type: "SELECT_ITEM", id: hs.id, itemType: "hotspot" })}
                        className={`w-full rounded-lg p-2 text-left text-xs transition-colors ${
                          state.selectedItemId === hs.id
                            ? "bg-[#FFD700]/20 ring-1 ring-[#FFD700]/40"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-medium text-white">{hs.label}</p>
                        <p className="text-white/40">
                          {hs.timing.showAt}s → {hs.timing.hideAt ?? "終了まで"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeTab === "overlays" && (
                <div className="space-y-2">
                  {state.overlays.length === 0 ? (
                    <p className="py-4 text-center text-xs text-white/30">
                      オーバーレイがありません
                    </p>
                  ) : (
                    state.overlays.map((ov) => (
                      <button
                        key={ov.id}
                        onClick={() => dispatch({ type: "SELECT_ITEM", id: ov.id, itemType: "overlay" })}
                        className={`w-full rounded-lg p-2 text-left text-xs transition-colors ${
                          state.selectedItemId === ov.id
                            ? "bg-[#4FC3F7]/20 ring-1 ring-[#4FC3F7]/40"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-medium text-white">{ov.content.title}</p>
                        <p className="text-white/40">
                          {ov.type} · {ov.slideFrom}から
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Overlay configurator */}
            {selectedOverlay && (
              <OverlayConfigurator
                overlay={selectedOverlay}
                onUpdate={handleUpdateOverlay}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
