"use client"

import { useState, useCallback, useRef } from "react"
import type { Scene, BranchScene, ChoiceId, AnalyticsEvent } from "@/types/video"
import { branchStructure, getSceneById, getNextScene } from "@/data/branch-structure"

interface VideoPlayerState {
  readonly currentScene: Scene | BranchScene
  readonly history: readonly string[]
  readonly choices: readonly ChoiceId[]
  readonly isPlaying: boolean
  readonly isChoiceVisible: boolean
  readonly progress: number
  readonly totalDuration: number
  readonly elapsedTime: number
}

interface VideoPlayerActions {
  readonly play: () => void
  readonly pause: () => void
  readonly makeChoice: (choiceId: ChoiceId, nextSceneId: string) => void
  readonly advanceScene: () => void
  readonly restart: () => void
  readonly showChoices: () => void
}

export function useVideoPlayer(): VideoPlayerState & VideoPlayerActions {
  const entryScene = getSceneById(branchStructure.sceneGraph.entrySceneId)!
  const analyticsRef = useRef<AnalyticsEvent[]>([])

  const [currentScene, setCurrentScene] = useState<Scene | BranchScene>(entryScene)
  const [history, setHistory] = useState<readonly string[]>([entryScene.id])
  const [choices, setChoices] = useState<readonly ChoiceId[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isChoiceVisible, setIsChoiceVisible] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const totalDuration = history.reduce((sum, id) => {
    const scene = getSceneById(id)
    return sum + (scene?.duration ?? 0)
  }, 0)

  const progress =
    totalDuration > 0 ? (elapsedTime / currentScene.duration) * 100 : 0

  const trackEvent = useCallback(
    (type: AnalyticsEvent["type"], choiceId?: ChoiceId) => {
      const event: AnalyticsEvent = {
        timestamp: Date.now(),
        type,
        sceneId: currentScene.id,
        choiceId,
        viewerPath: choices,
      }
      analyticsRef.current = [...analyticsRef.current, event]
    },
    [currentScene.id, choices]
  )

  const play = useCallback(() => {
    setIsPlaying(true)
    trackEvent("scene_view")
  }, [trackEvent])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const showChoices = useCallback(() => {
    setIsChoiceVisible(true)
    setIsPlaying(false)
  }, [])

  const makeChoice = useCallback(
    (choiceId: ChoiceId, nextSceneId: string) => {
      const nextScene = getSceneById(nextSceneId)
      if (!nextScene) return

      trackEvent("choice_made", choiceId)
      setChoices((prev) => [...prev, choiceId])
      setCurrentScene(nextScene)
      setHistory((prev) => [...prev, nextSceneId])
      setIsChoiceVisible(false)
      setElapsedTime(0)
      setIsPlaying(true)
    },
    [trackEvent]
  )

  const advanceScene = useCallback(() => {
    if (currentScene.type === "choice") {
      showChoices()
      return
    }

    const nextScene = getNextScene(currentScene.id)
    if (!nextScene) {
      trackEvent("video_complete")
      setIsPlaying(false)
      return
    }

    setCurrentScene(nextScene)
    setHistory((prev) => [...prev, nextScene.id])
    setElapsedTime(0)

    if (nextScene.type === "choice") {
      setIsPlaying(false)
      setIsChoiceVisible(true)
    }
  }, [currentScene, showChoices, trackEvent])

  const restart = useCallback(() => {
    setCurrentScene(entryScene)
    setHistory([entryScene.id])
    setChoices([])
    setIsPlaying(false)
    setIsChoiceVisible(false)
    setElapsedTime(0)
    analyticsRef.current = []
  }, [entryScene])

  return {
    currentScene,
    history,
    choices,
    isPlaying,
    isChoiceVisible,
    progress,
    totalDuration,
    elapsedTime,
    play,
    pause,
    makeChoice,
    advanceScene,
    restart,
    showChoices,
  }
}
