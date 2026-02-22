"use client"

import type { Hotspot } from "@/types/interactive"

interface HotspotLayerProps {
  readonly hotspots: readonly Hotspot[]
  readonly onHotspotClick: (hotspot: Hotspot) => void
}

function getShapeClasses(shape: Hotspot["shape"]): string {
  switch (shape) {
    case "circle":
      return "rounded-full"
    case "pill":
      return "rounded-full"
    case "rectangle":
      return "rounded-lg"
    default:
      return "rounded-lg"
  }
}

export function HotspotLayer({ hotspots, onHotspotClick }: HotspotLayerProps) {
  if (hotspots.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]">
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={() => onHotspotClick(hotspot)}
          className={`pointer-events-auto absolute flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 ${getShapeClasses(hotspot.shape)} ${
            hotspot.style.pulseAnimation ? "animate-hotspot-pulse" : ""
          }`}
          style={{
            left: `${hotspot.position.x}%`,
            top: `${hotspot.position.y}%`,
            width: `max(${hotspot.position.width}%, 44px)`,
            height: `max(${hotspot.position.height}%, 44px)`,
            minWidth: "44px",
            minHeight: "44px",
            borderColor: hotspot.style.borderColor,
            backgroundColor: hotspot.style.backgroundColor,
            opacity: hotspot.style.opacity,
          }}
          aria-label={hotspot.label}
        >
          <span
            className="px-2 text-center text-xs font-bold leading-tight"
            style={{
              color: hotspot.style.textColor,
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}
          >
            {hotspot.label}
          </span>
        </button>
      ))}
    </div>
  )
}
