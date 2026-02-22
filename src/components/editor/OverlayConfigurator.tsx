"use client"

import { useCallback } from "react"
import type { Overlay, OverlayType, SlideDirection } from "@/types/interactive"

interface OverlayConfiguratorProps {
  readonly overlay: Overlay
  readonly onUpdate: (updated: Overlay) => void
}

type OverlayField =
  | { field: "type"; value: OverlayType }
  | { field: "slideFrom"; value: SlideDirection }
  | { field: "dismissible"; value: boolean }
  | { field: "autoHideAfterSeconds"; value: number | null }
  | { field: "title"; value: string }
  | { field: "description"; value: string }
  | { field: "ctaLabel"; value: string }
  | { field: "ctaUrl"; value: string }

const OVERLAY_TYPES: { value: OverlayType; label: string }[] = [
  { value: "product-card", label: "商品カード" },
  { value: "info-panel", label: "情報パネル" },
  { value: "stat-card", label: "統計カード" },
]

const SLIDE_DIRECTIONS: { value: SlideDirection; label: string }[] = [
  { value: "right", label: "右から" },
  { value: "left", label: "左から" },
  { value: "bottom", label: "下から" },
  { value: "top", label: "上から" },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
      {children}
    </p>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-white/60">{label}</label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#4FC3F7]/60"
    />
  )
}

export function OverlayConfigurator({ overlay, onUpdate }: OverlayConfiguratorProps) {
  const applyUpdate = useCallback(
    (change: OverlayField) => {
      switch (change.field) {
        case "type":
          onUpdate({ ...overlay, type: change.value })
          break
        case "slideFrom":
          onUpdate({ ...overlay, slideFrom: change.value })
          break
        case "dismissible":
          onUpdate({ ...overlay, dismissible: change.value })
          break
        case "autoHideAfterSeconds":
          onUpdate({ ...overlay, autoHideAfterSeconds: change.value })
          break
        case "title":
          onUpdate({ ...overlay, content: { ...overlay.content, title: change.value } })
          break
        case "description":
          onUpdate({ ...overlay, content: { ...overlay.content, description: change.value } })
          break
        case "ctaLabel":
          onUpdate({ ...overlay, content: { ...overlay.content, ctaLabel: change.value } })
          break
        case "ctaUrl":
          onUpdate({ ...overlay, content: { ...overlay.content, ctaUrl: change.value } })
          break
      }
    },
    [overlay, onUpdate]
  )

  return (
    <div className="rounded-xl bg-[#0f0f1a] p-4">
      <h3 className="mb-4 text-sm font-bold text-white">オーバーレイ設定</h3>

      {/* Type & Direction */}
      <SectionLabel>表示設定</SectionLabel>

      <FieldRow label="タイプ">
        <div className="flex flex-wrap gap-1">
          {OVERLAY_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyUpdate({ field: "type", value: opt.value })}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                overlay.type === opt.value
                  ? "bg-[#4FC3F7] text-black"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="スライド方向">
        <div className="flex flex-wrap gap-1">
          {SLIDE_DIRECTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyUpdate({ field: "slideFrom", value: opt.value })}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                overlay.slideFrom === opt.value
                  ? "bg-[#FFD700] text-black"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FieldRow>

      {/* Content */}
      <SectionLabel>コンテンツ</SectionLabel>

      <FieldRow label="タイトル">
        <TextInput
          value={overlay.content.title}
          onChange={(v) => applyUpdate({ field: "title", value: v })}
          placeholder="オーバーレイのタイトル"
        />
      </FieldRow>

      <FieldRow label="説明文">
        <TextInput
          value={overlay.content.description ?? ""}
          onChange={(v) => applyUpdate({ field: "description", value: v })}
          placeholder="（任意）説明文"
        />
      </FieldRow>

      {/* CTA */}
      <SectionLabel>CTAボタン</SectionLabel>

      <FieldRow label="ボタンテキスト">
        <TextInput
          value={overlay.content.ctaLabel ?? ""}
          onChange={(v) => applyUpdate({ field: "ctaLabel", value: v })}
          placeholder="例: 今すぐ申し込む"
        />
      </FieldRow>

      <FieldRow label="リンク先URL">
        <TextInput
          value={overlay.content.ctaUrl ?? ""}
          onChange={(v) => applyUpdate({ field: "ctaUrl", value: v })}
          placeholder="https://..."
        />
      </FieldRow>

      {/* Behavior */}
      <SectionLabel>動作設定</SectionLabel>

      <FieldRow label="閉じるボタン">
        <button
          onClick={() => applyUpdate({ field: "dismissible", value: !overlay.dismissible })}
          className={`flex h-6 w-10 items-center rounded-full transition-colors ${
            overlay.dismissible ? "bg-[#4FC3F7]" : "bg-white/20"
          }`}
          role="switch"
          aria-checked={overlay.dismissible}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
              overlay.dismissible ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </FieldRow>

      <FieldRow label="自動非表示 (秒、0=無効)">
        <input
          type="number"
          min={0}
          value={overlay.autoHideAfterSeconds ?? 0}
          onChange={(e) => {
            const v = Number(e.target.value)
            applyUpdate({ field: "autoHideAfterSeconds", value: v === 0 ? null : v })
          }}
          className="w-20 rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#FFD700]/60"
        />
      </FieldRow>
    </div>
  )
}
