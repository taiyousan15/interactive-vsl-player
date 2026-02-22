"use client"

import { useCallback, useEffect, useRef } from "react"
import type {
  InteractiveAnalyticsEvent,
  InteractiveEventType,
} from "@/types/interactive"

const FLUSH_THRESHOLD = 10     // Batch size before auto-flush
const FLUSH_INTERVAL_MS = 30_000 // 30s periodic flush
const STORAGE_KEY = "interactive-analytics-buffer"
const MAX_STORAGE_EVENTS = 1000  // Cap localStorage buffer

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

interface UseAnalyticsReturn {
  readonly trackEvent: (
    type: InteractiveEventType,
    sceneId: string,
    elementId: string | null,
    metadata?: Record<string, string | number | boolean>
  ) => void
  readonly flush: () => Promise<void>
  readonly getEventCount: () => number
}

export function useAnalytics(): UseAnalyticsReturn {
  const sessionIdRef = useRef(generateSessionId())
  const bufferRef = useRef<InteractiveAnalyticsEvent[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startFlushTimer = useCallback(() => {
    if (flushTimerRef.current) return
    flushTimerRef.current = setInterval(() => {
      void flushEvents(bufferRef, sessionIdRef.current)
    }, FLUSH_INTERVAL_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current)
        flushTimerRef.current = null
      }
    }
  }, [])

  const trackEvent = useCallback(
    (
      type: InteractiveEventType,
      sceneId: string,
      elementId: string | null,
      metadata: Record<string, string | number | boolean> = {}
    ) => {
      const event: InteractiveAnalyticsEvent = {
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
        type,
        sceneId,
        elementId,
        metadata,
      }

      bufferRef.current = [...bufferRef.current, event]
      startFlushTimer()

      if (bufferRef.current.length >= FLUSH_THRESHOLD) {
        void flushEvents(bufferRef, sessionIdRef.current)
      }
    },
    [startFlushTimer]
  )

  const flush = useCallback(async () => {
    await flushEvents(bufferRef, sessionIdRef.current)
  }, [])

  const getEventCount = useCallback(() => {
    return bufferRef.current.length
  }, [])

  return { trackEvent, flush, getEventCount }
}

async function flushEvents(
  bufferRef: React.MutableRefObject<InteractiveAnalyticsEvent[]>,
  sessionId: string
): Promise<void> {
  const events = bufferRef.current
  if (events.length === 0) return

  bufferRef.current = []

  try {
    const response = await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, events }),
    })

    if (!response.ok) {
      saveToLocalStorage(events)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.debug("Analytics flush failed, saving locally:", error.message)
    }
    saveToLocalStorage(events)
  }
}

function saveToLocalStorage(events: readonly InteractiveAnalyticsEvent[]): void {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    const parsed: InteractiveAnalyticsEvent[] = existing
      ? JSON.parse(existing)
      : []
    const merged = [...parsed, ...events]
    const capped = merged.length > MAX_STORAGE_EVENTS
      ? merged.slice(merged.length - MAX_STORAGE_EVENTS)
      : merged
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped))
  } catch (error) {
    if (error instanceof Error) {
      console.debug("localStorage fallback failed:", error.message)
    }
  }
}
