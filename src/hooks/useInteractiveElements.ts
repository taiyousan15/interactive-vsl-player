"use client"

import { useState, useCallback, useRef } from "react"
import type { Hotspot, Overlay } from "@/types/interactive"
import { getInteractiveData, getOverlayById } from "@/data/interactive-elements"

interface UseInteractiveElementsReturn {
  readonly visibleHotspots: readonly Hotspot[]
  readonly visibleOverlays: readonly Overlay[]
  readonly activeOverlayId: string | null
  readonly updateVisibility: (sceneId: string, currentTime: number) => void
  readonly openOverlay: (sceneId: string, overlayId: string) => void
  readonly dismissOverlay: (overlayId: string) => void
  readonly resetForScene: (sceneId: string) => void
}

function isTimingVisible(
  showAt: number,
  hideAt: number | null,
  currentTime: number
): boolean {
  if (currentTime < showAt) return false
  if (hideAt !== null && currentTime > hideAt) return false
  return true
}

export function useInteractiveElements(): UseInteractiveElementsReturn {
  const [visibleHotspots, setVisibleHotspots] = useState<readonly Hotspot[]>([])
  const [visibleOverlays, setVisibleOverlays] = useState<readonly Overlay[]>([])
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null)
  const dismissedRef = useRef<ReadonlySet<string>>(new Set())
  const autoHideTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const updateVisibility = useCallback(
    (sceneId: string, currentTime: number) => {
      const data = getInteractiveData(sceneId)

      const newHotspots = data.hotspots.filter((h) =>
        isTimingVisible(h.timing.showAt, h.timing.hideAt, currentTime)
      )

      const newOverlays = data.overlays.filter(
        (o) =>
          isTimingVisible(o.timing.showAt, o.timing.hideAt, currentTime) &&
          !dismissedRef.current.has(o.id)
      )

      setVisibleHotspots(newHotspots)
      setVisibleOverlays(newOverlays)
    },
    []
  )

  const openOverlay = useCallback(
    (sceneId: string, overlayId: string) => {
      const overlay = getOverlayById(sceneId, overlayId)
      if (!overlay) return

      setActiveOverlayId(overlayId)

      setVisibleOverlays((prev) => {
        if (prev.some((o) => o.id === overlayId)) return prev
        return [...prev, overlay]
      })

      if (overlay.autoHideAfterSeconds !== null) {
        const existing = autoHideTimersRef.current.get(overlayId)
        if (existing) clearTimeout(existing)

        const timer = setTimeout(() => {
          setActiveOverlayId((prev) => (prev === overlayId ? null : prev))
          dismissedRef.current = new Set([...dismissedRef.current, overlayId])
          setVisibleOverlays((prev) => prev.filter((o) => o.id !== overlayId))
          autoHideTimersRef.current.delete(overlayId)
        }, overlay.autoHideAfterSeconds * 1000)

        autoHideTimersRef.current.set(overlayId, timer)
      }
    },
    []
  )

  const dismissOverlay = useCallback((overlayId: string) => {
    setActiveOverlayId((prev) => (prev === overlayId ? null : prev))
    dismissedRef.current = new Set([...dismissedRef.current, overlayId])
    setVisibleOverlays((prev) => prev.filter((o) => o.id !== overlayId))

    const timer = autoHideTimersRef.current.get(overlayId)
    if (timer) {
      clearTimeout(timer)
      autoHideTimersRef.current.delete(overlayId)
    }
  }, [])

  const resetForScene = useCallback((_sceneId: string) => {
    setVisibleHotspots([])
    setVisibleOverlays([])
    setActiveOverlayId(null)
    dismissedRef.current = new Set()

    for (const timer of autoHideTimersRef.current.values()) {
      clearTimeout(timer)
    }
    autoHideTimersRef.current.clear()
  }, [])

  return {
    visibleHotspots,
    visibleOverlays,
    activeOverlayId,
    updateVisibility,
    openOverlay,
    dismissOverlay,
    resetForScene,
  }
}
