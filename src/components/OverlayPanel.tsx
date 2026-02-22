"use client"

import { useState, useEffect, useCallback } from "react"
import type { Overlay, SlideDirection } from "@/types/interactive"

interface OverlayPanelProps {
  readonly overlay: Overlay
  readonly isActive: boolean
  readonly onDismiss: (overlayId: string) => void
  readonly onCtaClick?: (overlay: Overlay) => void
}

function getSlideTransform(direction: SlideDirection, visible: boolean): string {
  if (visible) return "translate(0, 0)"
  switch (direction) {
    case "left":
      return "translate(-110%, 0)"
    case "right":
      return "translate(110%, 0)"
    case "top":
      return "translate(0, -110%)"
    case "bottom":
      return "translate(0, 110%)"
    default:
      return "translate(110%, 0)"
  }
}

function getPositionClasses(direction: SlideDirection): string {
  switch (direction) {
    case "left":
      return "left-2 top-1/2 -translate-y-1/2 max-w-[75%]"
    case "right":
      return "right-2 top-1/2 -translate-y-1/2 max-w-[75%]"
    case "top":
      return "top-12 left-1/2 -translate-x-1/2 max-w-[90%]"
    case "bottom":
      return "bottom-24 left-1/2 -translate-x-1/2 max-w-[90%]"
    default:
      return "right-2 top-1/2 -translate-y-1/2 max-w-[75%]"
  }
}

function getTypeIcon(type: Overlay["type"]): string {
  switch (type) {
    case "product-card":
      return "\u{1F4E6}"
    case "info-panel":
      return "\u{2139}\u{FE0F}"
    case "stat-card":
      return "\u{1F4CA}"
    default:
      return "\u{2139}\u{FE0F}"
  }
}

export function OverlayPanel({
  overlay,
  isActive,
  onDismiss,
  onCtaClick,
}: OverlayPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    }
    setIsVisible(false)
    return undefined
  }, [isActive])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onDismiss(overlay.id), 300)
  }, [onDismiss, overlay.id])

  const handleCtaClick = useCallback(() => {
    if (onCtaClick) {
      onCtaClick(overlay)
    } else if (overlay.content.ctaUrl) {
      window.open(overlay.content.ctaUrl, "_blank", "noopener,noreferrer")
    }
  }, [onCtaClick, overlay])

  return (
    <div
      className={`absolute z-[16] ${getPositionClasses(overlay.slideFrom)}`}
      style={{
        transform: getSlideTransform(overlay.slideFrom, isVisible),
        transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black/85 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(overlay.type)}</span>
            <h3 className="text-sm font-bold text-white">
              {overlay.content.title}
            </h3>
          </div>
          {overlay.dismissible && (
            <button
              onClick={handleDismiss}
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="閉じる"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.5 1.5L1.5 10.5M1.5 1.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {overlay.content.description && (
            <p className="mb-3 text-xs leading-relaxed text-white/70">
              {overlay.content.description}
            </p>
          )}

          {overlay.content.imageUrl && (
            <img
              src={overlay.content.imageUrl}
              alt=""
              className="mb-3 h-24 w-full rounded-lg object-cover"
            />
          )}

          {overlay.content.stats && overlay.content.stats.length > 0 && (
            <div className="mb-3 space-y-2">
              {overlay.content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                >
                  <span className="text-xs text-white/60">{stat.label}</span>
                  <span className="text-sm font-bold text-[#FFD700]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {overlay.content.ctaLabel && (
            <button
              onClick={handleCtaClick}
              className="w-full rounded-lg bg-[#FF6347] px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-[#FF6347]/30 transition-all hover:bg-[#FF5236] hover:scale-[1.02] active:scale-[0.98]"
            >
              {overlay.content.ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
