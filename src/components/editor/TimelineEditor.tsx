"use client"

import { useCallback } from "react"
import type { Hotspot, Overlay } from "@/types/interactive"

interface TimelineItem {
  readonly id: string
  readonly type: "hotspot" | "overlay"
  readonly label: string
  readonly showAt: number
  readonly hideAt: number | null
  readonly color: string
}

interface TimelineEditorProps {
  readonly hotspots: readonly Hotspot[]
  readonly overlays: readonly Overlay[]
  readonly sceneDuration: number
  readonly currentTime: number
  readonly selectedItemId: string | null
  readonly onSelectItem: (id: string, type: "hotspot" | "overlay") => void
  readonly onTimeChange: (id: string, type: "hotspot" | "overlay", field: "showAt" | "hideAt", value: number | null) => void
}

function toTimelineItems(
  hotspots: readonly Hotspot[],
  overlays: readonly Overlay[]
): readonly TimelineItem[] {
  const hotspotItems: TimelineItem[] = hotspots.map((h) => ({
    id: h.id,
    type: "hotspot",
    label: h.label,
    showAt: h.timing.showAt,
    hideAt: h.timing.hideAt,
    color: "#FFD700",
  }))

  const overlayItems: TimelineItem[] = overlays.map((o) => ({
    id: o.id,
    type: "overlay",
    label: o.content.title,
    showAt: o.timing.showAt,
    hideAt: o.timing.hideAt,
    color: "#4FC3F7",
  }))

  return [...hotspotItems, ...overlayItems].sort((a, b) => a.showAt - b.showAt)
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function TimelineEditor({
  hotspots,
  overlays,
  sceneDuration,
  currentTime,
  selectedItemId,
  onSelectItem,
  onTimeChange,
}: TimelineEditorProps) {
  const items = toTimelineItems(hotspots, overlays)

  const getBarStyle = useCallback(
    (item: TimelineItem): React.CSSProperties => {
      const start = (item.showAt / sceneDuration) * 100
      const end = item.hideAt !== null ? (item.hideAt / sceneDuration) * 100 : 100
      const width = Math.max(end - start, 3)
      return {
        left: `${start}%`,
        width: `${width}%`,
        backgroundColor: item.color,
        opacity: item.id === selectedItemId ? 1 : 0.6,
      }
    },
    [sceneDuration, selectedItemId]
  )

  const playheadPosition = `${Math.min((currentTime / sceneDuration) * 100, 100)}%`

  return (
    <div className="rounded-xl bg-[#0f0f1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">タイムライン</h3>
        <span className="text-xs text-white/50">{formatTime(currentTime)} / {formatTime(sceneDuration)}</span>
      </div>

      {/* Time ruler */}
      <div className="relative mb-1 h-4 select-none">
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 6 }, (_, i) => {
            const time = Math.round((i / 5) * sceneDuration)
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 text-[10px] text-white/30"
                style={{ left: `${(i / 5) * 100}%` }}
              >
                {formatTime(time)}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline tracks */}
      <div className="relative overflow-hidden rounded-lg bg-white/5">
        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 z-10 h-full w-px bg-white/60"
          style={{ left: playheadPosition }}
        />

        {/* Track rows */}
        {items.length === 0 ? (
          <div className="flex h-16 items-center justify-center text-xs text-white/30">
            要素がありません
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative h-8 cursor-pointer rounded"
                onClick={() => onSelectItem(item.id, item.type)}
              >
                {/* Track background */}
                <div className="absolute inset-0 rounded bg-white/5" />

                {/* Duration bar */}
                <div
                  className={`absolute top-1 h-6 rounded transition-opacity ${
                    item.id === selectedItemId ? "ring-1 ring-white/60" : ""
                  }`}
                  style={getBarStyle(item)}
                >
                  <span className="truncate px-1.5 text-[10px] font-medium leading-6 text-black/80">
                    {item.label}
                  </span>
                </div>

                {/* Type badge */}
                <div
                  className="absolute right-1 top-1.5 rounded px-1 py-0.5 text-[9px] font-bold text-black/70"
                  style={{ backgroundColor: item.color }}
                >
                  {item.type === "hotspot" ? "HS" : "OV"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected item timing controls */}
      {selectedItemId && (() => {
        const selected = items.find((i) => i.id === selectedItemId)
        if (!selected) return null
        return (
          <div className="mt-3 rounded-lg bg-white/5 p-3">
            <p className="mb-2 truncate text-xs font-bold text-white">{selected.label}</p>
            <div className="flex gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50">表示開始 (秒)</span>
                <input
                  type="number"
                  min={0}
                  max={sceneDuration}
                  value={selected.showAt}
                  onChange={(e) =>
                    onTimeChange(selected.id, selected.type, "showAt", Number(e.target.value))
                  }
                  className="w-20 rounded bg-white/10 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-[#FFD700]/60"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50">表示終了 (秒)</span>
                <input
                  type="number"
                  min={selected.showAt + 1}
                  max={sceneDuration}
                  value={selected.hideAt ?? sceneDuration}
                  onChange={(e) =>
                    onTimeChange(
                      selected.id,
                      selected.type,
                      "hideAt",
                      Number(e.target.value) >= sceneDuration ? null : Number(e.target.value)
                    )
                  }
                  className="w-20 rounded bg-white/10 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-[#4FC3F7]/60"
                />
              </label>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
