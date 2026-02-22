"use client"

import { useState, useRef, useCallback } from "react"
import type { Hotspot, HotspotShape } from "@/types/interactive"

interface DragState {
  readonly isDragging: boolean
  readonly startX: number
  readonly startY: number
  readonly currentX: number
  readonly currentY: number
}

const INITIAL_DRAG: DragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
}

interface HotspotPlacerProps {
  readonly hotspots: readonly Hotspot[]
  readonly selectedHotspotId: string | null
  readonly sceneImageUrl?: string
  readonly onAddHotspot: (position: { x: number; y: number; width: number; height: number }) => void
  readonly onSelectHotspot: (id: string | null) => void
  readonly onMoveHotspot: (id: string, position: { x: number; y: number }) => void
}

function getPercentPosition(
  event: React.MouseEvent,
  container: HTMLDivElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect()
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
  return { x, y }
}

function ShapeLabel({ shape }: { shape: HotspotShape }) {
  const labels: Record<HotspotShape, string> = {
    rectangle: "四角",
    circle: "丸",
    pill: "ピル",
  }
  return <span>{labels[shape]}</span>
}

export function HotspotPlacer({
  hotspots,
  selectedHotspotId,
  sceneImageUrl,
  onAddHotspot,
  onSelectHotspot,
  onMoveHotspot,
}: HotspotPlacerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState>(INITIAL_DRAG)
  const [mode, setMode] = useState<"select" | "add">("select")

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || mode !== "add") return
      e.preventDefault()
      const pos = getPercentPosition(e, containerRef.current)
      setDrag({
        isDragging: true,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
      })
    },
    [mode]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drag.isDragging || !containerRef.current) return
      const pos = getPercentPosition(e, containerRef.current)
      setDrag((prev) => ({ ...prev, currentX: pos.x, currentY: pos.y }))
    },
    [drag.isDragging]
  )

  const handleMouseUp = useCallback(() => {
    if (!drag.isDragging) return

    const x = Math.min(drag.startX, drag.currentX)
    const y = Math.min(drag.startY, drag.currentY)
    const width = Math.max(Math.abs(drag.currentX - drag.startX), 5)
    const height = Math.max(Math.abs(drag.currentY - drag.startY), 5)

    if (width >= 3 && height >= 3) {
      onAddHotspot({ x, y, width, height })
    }

    setDrag(INITIAL_DRAG)
    setMode("select")
  }, [drag, onAddHotspot])

  const getDragPreviewStyle = (): React.CSSProperties => {
    if (!drag.isDragging) return { display: "none" }
    const x = Math.min(drag.startX, drag.currentX)
    const y = Math.min(drag.startY, drag.currentY)
    const width = Math.abs(drag.currentX - drag.startX)
    const height = Math.abs(drag.currentY - drag.startY)
    return {
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
      position: "absolute",
      border: "2px dashed #FFD700",
      backgroundColor: "rgba(255, 215, 0, 0.15)",
      pointerEvents: "none",
    }
  }

  return (
    <div className="rounded-xl bg-[#0f0f1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">ホットスポット配置</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("select")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              mode === "select" ? "bg-[#FFD700] text-black" : "bg-white/10 text-white"
            }`}
          >
            選択
          </button>
          <button
            onClick={() => setMode("add")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              mode === "add" ? "bg-[#FFD700] text-black" : "bg-white/10 text-white"
            }`}
          >
            + 追加
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-black ${
          mode === "add" ? "cursor-crosshair" : "cursor-default"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        {sceneImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sceneImageUrl}
            alt="シーン背景"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <span className="text-xs text-white/20">シーンプレビュー</span>
          </div>
        )}

        {/* Existing hotspots */}
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelectHotspot(hotspot.id === selectedHotspotId ? null : hotspot.id)
            }}
            className="absolute transition-all"
            style={{
              left: `${hotspot.position.x}%`,
              top: `${hotspot.position.y}%`,
              width: `${hotspot.position.width}%`,
              height: `${hotspot.position.height}%`,
              border: `2px solid ${hotspot.style.borderColor}`,
              backgroundColor: hotspot.style.backgroundColor,
              borderRadius:
                hotspot.shape === "circle"
                  ? "50%"
                  : hotspot.shape === "pill"
                    ? "9999px"
                    : "4px",
              outline:
                hotspot.id === selectedHotspotId ? "2px solid white" : "none",
              outlineOffset: "2px",
            }}
          >
            <span
              className="flex h-full items-center justify-center truncate px-1 text-[10px] font-bold"
              style={{ color: hotspot.style.textColor }}
            >
              {hotspot.label}
            </span>
          </button>
        ))}

        {/* Drag preview */}
        <div style={getDragPreviewStyle()} />

        {/* Mode hint */}
        {mode === "add" && (
          <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white/70">
              ドラッグして配置
            </span>
          </div>
        )}
      </div>

      {/* Selected hotspot info */}
      {selectedHotspotId && (() => {
        const hs = hotspots.find((h) => h.id === selectedHotspotId)
        if (!hs) return null
        return (
          <div className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/70">
            <p className="mb-1 font-bold text-white">{hs.label}</p>
            <div className="grid grid-cols-2 gap-1">
              <span>X: {Math.round(hs.position.x)}%</span>
              <span>Y: {Math.round(hs.position.y)}%</span>
              <span>幅: {Math.round(hs.position.width)}%</span>
              <span>高さ: {Math.round(hs.position.height)}%</span>
              <span>形状: <ShapeLabel shape={hs.shape} /></span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
