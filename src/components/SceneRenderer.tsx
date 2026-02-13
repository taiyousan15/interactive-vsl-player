"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Parser, jaModel } from "budoux"
import type { Scene, BranchScene } from "@/types/video"

const budouxParser = new Parser(jaModel)

interface NarrationSegment {
  readonly text: string
  readonly startTime: number
}

/**
 * Split narration text into timed segments using BudouX phrase boundaries.
 * No explicit \n — line wrapping is handled by CSS + BudouX phrase-level spans.
 * Segments are ~26 chars each (roughly 2 visual lines on mobile).
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
  const maxSegmentChars = 26

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

interface SceneRendererProps {
  readonly scene: Scene | BranchScene
  readonly isPlaying: boolean
  readonly onSceneEnd: () => void
}

export function SceneRenderer({
  scene,
  isPlaying,
  onSceneEnd,
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
      }, 250)
    }
  }, [narrationSegments, currentSegmentIndex])

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

    // Preload all images for smooth cycling (used by image scenes and video fallback)
    const count = scene.imageCount ?? 3
    for (let i = 1; i <= count; i++) {
      const img = new Image()
      img.src = `/images/scenes/${scene.id}_${String(i).padStart(2, '0')}.png`
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

  // Multi-image cycling: rotate every 3 seconds with crossfade (image scenes only)
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
        // Video play failed, fall back to images
        setVideoFailed(true)
      })
    } else {
      video.pause()
    }
  }, [isPlaying, useVideo])

  // Audio play/pause with FIXED single fallback timer
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

    // Clear any existing fallback timer before setting a new one
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    audio
      .play()
      .then(() => {
        // Play succeeded: set a generous fallback in case onEnded doesn't fire
        fallbackTimerRef.current = setTimeout(() => {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true
            setProgress(100)
            onSceneEnd()
          }
        }, (scene.duration + 5) * 1000)
      })
      .catch(() => {
        // Play failed (e.g. autoplay blocked): use duration-based fallback
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

      {/* Video or Image background based on mediaType */}
      {useVideo ? (
        <video
          ref={videoRef}
          src={`/video/scenes/${scene.id}.mp4`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.65 }}
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
            opacity: imageFading ? 0 : 0.65,
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

      {scene.style.overlay === "manga-lines" && <MangaLinesOverlay />}
      {scene.style.overlay === "cyber-grid" && <CyberGridOverlay />}

      {/* Scene type label */}
      <div className={`z-10 flex flex-col items-center gap-4 ${animationClass}`}>
        <div
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: scene.style.accentColor }}
        >
          {getSceneTypeLabel(scene.type)}
        </div>
      </div>

      {/* Telop: BudouX phrase-aware narration segments */}
      {currentSegment && (
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center px-4 ${
            segmentAnimation === "in" ? "animate-telop-in" : "animate-telop-out"
          }`}
        >
          <div className="telop-bg">
            <div className="telop-text text-lg text-white md:text-xl">
              {segmentPhrases.map((phrase, i) => (
                <span key={i} style={{ display: "inline-block" }}>
                  {phrase}
                </span>
              ))}
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

function MangaLinesOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-5">
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.1) 3px,
              rgba(255,255,255,0.1) 4px
            )
          `,
        }}
      />
    </div>
  )
}

function CyberGridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-10">
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
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
    intro: "INTRODUCTION",
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
