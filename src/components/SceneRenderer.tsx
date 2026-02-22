"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Parser, jaModel } from "budoux"
import type { Scene, BranchScene } from "@/types/video"
import type { Hotspot, Overlay } from "@/types/interactive"
import { HotspotLayer } from "@/components/HotspotLayer"
import { OverlayPanel } from "@/components/OverlayPanel"

const budouxParser = new Parser(jaModel)

interface NarrationSegment {
  readonly text: string
  readonly startTime: number
}

/**
 * Split narration text into timed segments using BudouX phrase boundaries.
 * Segments are ~22 chars each for the bar-style telop.
 */
function splitNarrationIntoSegments(
  narration: string,
  duration: number
): NarrationSegment[] {
  if (!narration || duration <= 0) return []

  const sentences = narration
    .split(/(?<=[。！？])/)
    .filter((s) => s.trim())

  const segments: string[] = []
  const maxSegmentChars = 22

  for (const sentence of sentences) {
    const phrases = budouxParser.parse(sentence.trim())
    let current = ""

    for (const phrase of phrases) {
      if (current.length + phrase.length > maxSegmentChars && current !== "") {
        segments.push(current)
        current = phrase
      } else {
        current += phrase
      }
    }

    if (current) {
      segments.push(current)
    }
  }

  if (segments.length === 0) return []

  const totalChars = segments.reduce((sum, s) => sum + s.length, 0)
  let charsSoFar = 0
  return segments.map((text) => {
    const startTime = (charsSoFar / totalChars) * duration
    charsSoFar += text.length
    return { text, startTime }
  })
}

/**
 * Determine telop bar color based on scene type.
 * Red for hook/cta/problem, blue for solution/benefit/proof, gold for bonus.
 */
function getTelopBarClass(sceneType: string): string {
  switch (sceneType) {
    case "intro":
    case "cta":
    case "problem":
    case "fear":
      return "telop-bar--red"
    case "solution":
    case "benefit":
    case "proof":
    case "testimonial":
    case "product":
      return "telop-bar--blue"
    default:
      return "telop-bar--red"
  }
}

interface SceneRendererProps {
  readonly scene: Scene | BranchScene
  readonly isPlaying: boolean
  readonly onSceneEnd: () => void
  readonly hotspots?: readonly Hotspot[]
  readonly overlays?: readonly Overlay[]
  readonly activeOverlayId?: string | null
  readonly onHotspotClick?: (hotspot: Hotspot) => void
  readonly onOverlayDismiss?: (overlayId: string) => void
  readonly onOverlayCtaClick?: (overlay: Overlay) => void
  readonly onTimeUpdate?: (currentTime: number) => void
}

export function SceneRenderer({
  scene,
  isPlaying,
  onSceneEnd,
  hotspots,
  overlays,
  activeOverlayId,
  onHotspotClick,
  onOverlayDismiss,
  onOverlayCtaClick,
  onTimeUpdate,
}: SceneRendererProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [segmentAnimation, setSegmentAnimation] = useState<"in" | "out">("in")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageFading, setImageFading] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const hasEndedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastInteractiveUpdateRef = useRef(0)

  const imageCount = scene.imageCount ?? 3
  const imageInterval = scene.imageInterval ?? 3000
  const useVideo = scene.mediaType === "video" && !videoFailed

  const narrationSegments = useMemo(
    () => splitNarrationIntoSegments(scene.narration, scene.duration),
    [scene.narration, scene.duration]
  )

  const handleAudioEnded = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    setProgress(100)
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    onSceneEnd()
  }, [onSceneEnd])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.duration || !isFinite(audio.duration)) return
    const pct = (audio.currentTime / audio.duration) * 100
    setProgress(pct)

    const now = Date.now()
    if (onTimeUpdate && now - lastInteractiveUpdateRef.current >= 100) {
      lastInteractiveUpdateRef.current = now
      onTimeUpdate(audio.currentTime)
    }

    if (narrationSegments.length === 0) return
    const currentTime = audio.currentTime
    let idx = -1
    for (let i = narrationSegments.length - 1; i >= 0; i--) {
      if (narrationSegments[i].startTime <= currentTime) {
        idx = i
        break
      }
    }
    if (idx >= 0 && idx !== currentSegmentIndex) {
      setSegmentAnimation("out")
      setTimeout(() => {
        setCurrentSegmentIndex(idx)
        setSegmentAnimation("in")
      }, 200)
    }
  }, [narrationSegments, currentSegmentIndex, onTimeUpdate])

  // Reset state and load audio when scene changes
  useEffect(() => {
    setProgress(0)
    setIsVisible(false)
    setCurrentSegmentIndex(0)
    setSegmentAnimation("in")
    setCurrentImageIndex(0)
    setImageFading(false)
    setVideoFailed(false)
    hasEndedRef.current = false

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    if (imageTimerRef.current) {
      clearInterval(imageTimerRef.current)
      imageTimerRef.current = null
    }

    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.src = `/audio/scenes/${scene.id}.mp3`
      audio.load()
    }

    // Preload all images for smooth cycling (skip for video scenes)
    if (scene.mediaType !== "video") {
      const count = scene.imageCount ?? 3
      for (let i = 1; i <= count; i++) {
        const img = new Image()
        img.src = `/images/scenes/${scene.id}_${String(i).padStart(2, '0')}.png`
      }
    }

    // Preload next scene's audio for gapless transitions
    if (scene.nextSceneId) {
      const preloadAudio = new Audio()
      preloadAudio.preload = "auto"
      preloadAudio.src = `/audio/scenes/${scene.nextSceneId}.mp3`
    }

    const fadeTimer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(fadeTimer)
  }, [scene.id, scene.nextSceneId])

  // Multi-image cycling with crossfade
  useEffect(() => {
    if (useVideo) return
    if (!isPlaying) {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current)
        imageTimerRef.current = null
      }
      return
    }

    imageTimerRef.current = setInterval(() => {
      setImageFading(true)
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageCount)
        setImageFading(false)
      }, 500)
    }, imageInterval)

    return () => {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current)
        imageTimerRef.current = null
      }
    }
  }, [isPlaying, scene.id, useVideo, imageCount, imageInterval])

  // Video play/pause sync
  useEffect(() => {
    const video = videoRef.current
    if (!video || !useVideo) return

    if (isPlaying) {
      video.play().catch(() => {
        setVideoFailed(true)
      })
    } else {
      video.pause()
    }
  }, [isPlaying, useVideo])

  // Audio play/pause with fallback timer
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!isPlaying) {
      audio.pause()
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      return
    }

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    audio
      .play()
      .then(() => {
        fallbackTimerRef.current = setTimeout(() => {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true
            setProgress(100)
            onSceneEnd()
          }
        }, (scene.duration + 5) * 1000)
      })
      .catch(() => {
        if (hasEndedRef.current) return
        fallbackTimerRef.current = setTimeout(() => {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true
            setProgress(100)
            onSceneEnd()
          }
        }, (scene.duration + 1) * 1000)
      })

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    }
  }, [isPlaying, scene.duration, scene.id, onSceneEnd])

  const animationClass = getAnimationClass(scene.style.animation)
  const imagePath = `/images/scenes/${scene.id}_${String(currentImageIndex + 1).padStart(2, '0')}.png`
  const currentSegment = narrationSegments[currentSegmentIndex]
  const telopBarClass = getTelopBarClass(scene.type)

  // BudouX phrase-level splitting for natural line wrapping
  const segmentPhrases = useMemo(
    () => (currentSegment ? budouxParser.parse(currentSegment.text) : []),
    [currentSegment]
  )

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: scene.style.background }}
    >
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Video or Image background */}
      {useVideo ? (
        <video
          ref={videoRef}
          src={`/video/scenes/${scene.id}.mp4`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.92 }}
          muted
          playsInline
          loop
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <img
          src={imagePath}
          alt=""
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: imageFading ? 0 : 0.92,
            transition: "opacity 500ms ease-in-out",
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement
            if (!img.src.endsWith("_01.png")) {
              img.src = `/images/scenes/${scene.id}_01.png`
            } else {
              img.style.display = "none"
            }
          }}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* Clay texture overlay */}
      {scene.style.overlay === "clay-texture" && <ClayTextureOverlay />}

      {/* Interactive: Hotspots */}
      {hotspots && hotspots.length > 0 && onHotspotClick && (
        <HotspotLayer hotspots={hotspots} onHotspotClick={onHotspotClick} />
      )}

      {/* Interactive: Overlays */}
      {overlays?.map((overlay) => (
        <OverlayPanel
          key={overlay.id}
          overlay={overlay}
          isActive={activeOverlayId === overlay.id || overlays.length > 0}
          onDismiss={onOverlayDismiss ?? (() => {})}
          onCtaClick={onOverlayCtaClick}
        />
      ))}

      {/* Scene type label */}
      <div className={`z-10 flex flex-col items-center gap-4 ${animationClass}`}>
        <div
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: scene.style.accentColor }}
        >
          {getSceneTypeLabel(scene.type)}
        </div>
      </div>

      {/* Telop: 赤/青帯 + 白文字 + 黒アウトライン - 中央配置 */}
      {currentSegment && (
        <div
          className={`absolute bottom-20 left-0 right-0 z-10 ${
            segmentAnimation === "in" ? "animate-telop-in" : "animate-telop-out"
          }`}
        >
          <div className="telop-container">
            <div className={`telop-bar ${telopBarClass}`}>
              <div className="telop-text">
                {segmentPhrases.map((phrase, i) => (
                  <span key={i} style={{ display: "inline-block" }}>
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback: show title if no narration */}
      {narrationSegments.length === 0 && (
        <div className={`z-10 px-6 text-center ${animationClass}`}>
          <h2
            className="telop-text text-2xl text-white md:text-3xl"
            style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}
          >
            {scene.title}
          </h2>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-white/10">
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: scene.style.accentColor,
          }}
        />
      </div>
    </div>
  )
}

function ClayTextureOverlay() {
  return (
    <div className="clay-texture-overlay pointer-events-none absolute inset-0 opacity-30" />
  )
}

function getAnimationClass(
  animation: "fade" | "slide" | "zoom" | "glitch" | "particle"
): string {
  switch (animation) {
    case "fade":
      return "animate-fade-in"
    case "slide":
      return "animate-slide-up"
    case "zoom":
      return "animate-zoom-in"
    case "glitch":
      return "animate-glitch-in"
    case "particle":
      return "animate-particle-in"
    default:
      return "animate-fade-in"
  }
}

function getSceneTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    intro: "BREAKING NEWS",
    problem: "PROBLEM",
    fear: "WARNING",
    solution: "SOLUTION",
    product: "SYSTEM",
    benefit: "BENEFITS",
    proof: "EVIDENCE",
    testimonial: "TESTIMONIALS",
    faq: "Q&A",
    cta: "NEXT STEP",
    choice: "YOUR CHOICE",
    branch: "YOUR PATH",
  }
  return labels[type] ?? type.toUpperCase()
}
